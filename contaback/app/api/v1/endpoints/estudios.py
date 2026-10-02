from typing import List
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
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[EstudioContableOut])
async def list_estudios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(EstudioContable).where(EstudioContable.activo == True)
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

# --- GOBERNANZA Y PORTABILIDAD DE ESTUDIOS ---

@router.post("/empresas/{empresa_id}/delegar", response_model=DelegacionOut, status_code=status.HTTP_201_CREATED)
async def delegar_empresa_a_estudio(
    empresa_id: UUID,
    del_in: DelegacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    La empresa titular autoriza a un estudio contable (Outsourcing) o firma de auditoría.
    """
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
        
    # Verificar si ya existe una delegación activa
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
    """
    Portabilidad Instantánea: La empresa desautoriza al estudio contable con 1 clic.
    Los miembros del estudio pierden inmediatamente el acceso a la empresa.
    """
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
