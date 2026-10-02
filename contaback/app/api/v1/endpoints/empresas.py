from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.empresa import Empresa, GrupoEmpresarial
from app.models.usuario import Usuario
from app.schemas.empresa import (
    EmpresaCreate, EmpresaOut, EmpresaUpdate,
    GrupoEmpresarialCreate, GrupoEmpresarialOut
)
from app.api.deps import get_current_user, require_role
from app.services.puc_seed import seed_puc_ven_nif

router = APIRouter()

@router.get("/", response_model=List[EmpresaOut])
async def list_empresas(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.tipo_usuario == "KANTIO_ADMIN":
        stmt = select(Empresa)
    elif current_user.tipo_usuario == "EMPRESA_INTERNO":
        stmt = select(Empresa).where(Empresa.id == current_user.empresa_id)
    else:
        # Miembro de estudio contable: listar empresas que tengan delegación activa con su estudio
        from app.models.estudio import EmpresaEstudioDelegacion
        stmt = (
            select(Empresa)
            .join(EmpresaEstudioDelegacion, EmpresaEstudioDelegacion.empresa_id == Empresa.id)
            .where(
                EmpresaEstudioDelegacion.estudio_id == current_user.estudio_id,
                EmpresaEstudioDelegacion.estado == "ACTIVA"
            )
        )
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=EmpresaOut, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    empresa_in: EmpresaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validar unicidad de código y RIF
    stmt = select(Empresa).where((Empresa.codigo == empresa_in.codigo) | (Empresa.rif == empresa_in.rif))
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una empresa con ese código o RIF.")
    
    # Validar suscripción de grupo si intenta asociarse a un grupo empresarial
    if empresa_in.grupo_id:
        grupo = await db.get(GrupoEmpresarial, empresa_in.grupo_id)
        if not grupo:
            raise HTTPException(status_code=404, detail="El grupo empresarial especificado no existe.")
        if empresa_in.plan_suscripcion != "CORPORATIVO":
            raise HTTPException(
                status_code=403,
                detail="Se requiere un plan de suscripción CORPORATIVO para pertenecer a un Grupo Empresarial y consolidar balances."
            )
            
    empresa = Empresa(
        codigo=empresa_in.codigo,
        razon_social=empresa_in.razon_social,
        nombre_comercial=empresa_in.nombre_comercial,
        rif=empresa_in.rif,
        es_grupo_holding=empresa_in.es_grupo_holding,
        grupo_id=empresa_in.grupo_id,
        plan_suscripcion=empresa_in.plan_suscripcion,
        activo=True
    )
    db.add(empresa)
    await db.commit()
    await db.refresh(empresa)
    
    # Auto-semilla del PUC VEN-NIF
    await seed_puc_ven_nif(db, empresa.id)
    
    return empresa

@router.get("/{empresa_id}", response_model=EmpresaOut)
async def get_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    return empresa

@router.put("/{empresa_id}", response_model=EmpresaOut)
async def update_empresa(
    empresa_id: UUID,
    empresa_in: EmpresaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    data = empresa_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(empresa, field, val)

    await db.commit()
    await db.refresh(empresa)
    return empresa

@router.delete("/{empresa_id}", status_code=status.HTTP_200_OK)
async def delete_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    empresa.activo = False
    await db.commit()
    return {"status": "success", "message": "Empresa desactivada.", "id": str(empresa_id)}

@router.get("/grupos/todos", response_model=List[GrupoEmpresarialOut])
async def list_grupos_empresariales(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoEmpresarial).where(GrupoEmpresarial.activo == True)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/grupos/", response_model=GrupoEmpresarialOut, status_code=status.HTTP_201_CREATED)
async def create_grupo_empresarial(
    grupo_in: GrupoEmpresarialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoEmpresarial).where(GrupoEmpresarial.codigo == grupo_in.codigo)
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe un grupo empresarial con este código.")

    grupo = GrupoEmpresarial(
        codigo=grupo_in.codigo,
        nombre=grupo_in.nombre,
        activo=True
    )
    db.add(grupo)
    await db.commit()
    await db.refresh(grupo)
    return grupo

