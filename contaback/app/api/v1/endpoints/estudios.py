from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.estudio import EstudioContable, EmpresaEstudioDelegacion
from app.models.empresa import Empresa
from app.models.usuario import Usuario
from app.schemas.estudio import (
    EstudioContableCreate, EstudioContableOut,
    DelegacionCreate, DelegacionOut
)
from app.schemas.empresa import EmpresaOut
from app.schemas.usuario import UsuarioOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[EstudioContableOut])
async def list_estudios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(EstudioContable).where(EstudioContable.activo == True).order_by(EstudioContable.codigo.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=EstudioContableOut, status_code=status.HTTP_201_CREATED)
async def create_estudio(
    estudio_in: EstudioContableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(EstudioContable).where(
        (EstudioContable.codigo == estudio_in.codigo) | (EstudioContable.rif == estudio_in.rif)
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un estudio con ese código o RIF.")
        
    estudio = EstudioContable(
        codigo=estudio_in.codigo,
        nombre=estudio_in.nombre,
        rif=estudio_in.rif,
        email_contacto=estudio_in.email_contacto,
        telefono=estudio_in.telefono,
        activo=True
    )
    db.add(estudio)
    await db.commit()
    await db.refresh(estudio)
    return estudio

@router.put("/{estudio_id}", response_model=EstudioContableOut)
async def update_estudio(
    estudio_id: UUID,
    estudio_in: EstudioContableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    estudio = await db.get(EstudioContable, estudio_id)
    if not estudio:
        raise HTTPException(status_code=404, detail="Estudio contable no encontrado.")

    estudio.nombre = estudio_in.nombre
    estudio.rif = estudio_in.rif
    estudio.email_contacto = estudio_in.email_contacto
    estudio.telefono = estudio_in.telefono

    await db.commit()
    await db.refresh(estudio)
    return estudio

@router.delete("/{estudio_id}", status_code=status.HTTP_200_OK)
async def delete_estudio(
    estudio_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    estudio = await db.get(EstudioContable, estudio_id)
    if not estudio:
        raise HTTPException(status_code=404, detail="Estudio contable no encontrado.")

    estudio.activo = False
    await db.commit()
    return {"status": "success", "message": "Estudio contable desactivado.", "id": str(estudio_id)}

# --- HUB DEL ESTUDIO CONTABLE: CLIENTES AUTORIZADOS & USUARIOS ---

@router.get("/{estudio_id}/empresas-autorizadas", response_model=List[EmpresaOut])
async def list_empresas_autorizadas_estudio(
    estudio_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Permite al estudio contable ver el listado de empresas donde tiene autorización activa.
    """
    stmt = (
        select(Empresa)
        .join(EmpresaEstudioDelegacion, EmpresaEstudioDelegacion.empresa_id == Empresa.id)
        .where(
            EmpresaEstudioDelegacion.estudio_id == estudio_id,
            EmpresaEstudioDelegacion.estado == "ACTIVA",
            Empresa.activo == True
        )
        .order_by(Empresa.razon_social.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{estudio_id}/usuarios", response_model=List[UsuarioOut])
async def list_usuarios_estudio(
    estudio_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista el equipo de contadores y asistentes que pertenecen a la firma.
    """
    stmt = select(Usuario).where(
        Usuario.estudio_id == estudio_id,
        Usuario.activo == True
    ).order_by(Usuario.nombre_completo.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

# --- GOBERNANZA Y PORTABILIDAD DE ESTUDIOS ---

@router.post("/empresas/{empresa_id}/delegar", response_model=DelegacionOut, status_code=status.HTTP_201_CREATED)
async def delegar_empresa_a_estudio(
    empresa_id: UUID,
    del_in: DelegacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
        
    stmt = select(EmpresaEstudioDelegacion).where(
        EmpresaEstudioDelegacion.empresa_id == empresa_id,
        EmpresaEstudioDelegacion.estudio_id == del_in.estudio_id,
        EmpresaEstudioDelegacion.estado == "ACTIVA"
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Este estudio contable ya tiene autorización activa para esta empresa.")
        
    delegacion = EmpresaEstudioDelegacion(
        empresa_id=empresa_id,
        estudio_id=del_in.estudio_id,
        tipo_delegacion=del_in.tipo_delegacion,
        fecha_inicio=date.today(),
        fecha_fin=del_in.fecha_fin,
        estado="ACTIVA"
    )
    db.add(delegacion)
    await db.commit()
    await db.refresh(delegacion)
    return delegacion

@router.post("/delegaciones/{delegacion_id}/revocar", response_model=DelegacionOut)
async def revocar_delegacion_estudio(
    delegacion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    delegacion = await db.get(EmpresaEstudioDelegacion, delegacion_id)
    if not delegacion:
        raise HTTPException(status_code=404, detail="Delegación no encontrada.")
        
    if delegacion.estado == "REVOCADA":
        raise HTTPException(status_code=400, detail="La delegación ya se encuentra revocada.")
        
    delegacion.estado = "REVOCADA"
    delegacion.revocado_por_usuario_id = current_user.id
    delegacion.revocado_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(delegacion)
    return delegacion

@router.get("/empresas/{empresa_id}/delegaciones", response_model=List[DelegacionOut])
async def list_delegaciones_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(EmpresaEstudioDelegacion).where(EmpresaEstudioDelegacion.empresa_id == empresa_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/delegaciones/{delegacion_id}", status_code=status.HTTP_200_OK)
async def delete_delegacion(
    delegacion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    delegacion = await db.get(EmpresaEstudioDelegacion, delegacion_id)
    if not delegacion:
        raise HTTPException(status_code=404, detail="Delegación no encontrada.")

    await db.delete(delegacion)
    await db.commit()
    return {"status": "success", "message": "Delegación eliminada.", "id": str(delegacion_id)}
