from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.centro_costo import CentroCosto
from app.models.usuario import Usuario
from app.schemas.centro_costo import CentroCostoCreate, CentroCostoUpdate, CentroCostoOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/empresas/{empresa_id}", response_model=List[CentroCostoOut])
async def list_centros_costo(
    empresa_id: UUID,
    solo_activos: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(CentroCosto).where(CentroCosto.empresa_id == empresa_id)
    if solo_activos:
        stmt = stmt.where(CentroCosto.activo == True)
    stmt = stmt.order_by(CentroCosto.codigo.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/empresas/{empresa_id}", response_model=CentroCostoOut, status_code=status.HTTP_201_CREATED)
async def create_centro_costo(
    empresa_id: UUID,
    cc_in: CentroCostoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(CentroCosto).where(
        CentroCosto.empresa_id == empresa_id,
        CentroCosto.codigo == cc_in.codigo
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un centro de costo con este código en la empresa.")

    centro = CentroCosto(
        empresa_id=empresa_id,
        codigo=cc_in.codigo,
        nombre=cc_in.nombre,
        parent_id=cc_in.parent_id,
        activo=cc_in.activo
    )
    db.add(centro)
    await db.commit()
    await db.refresh(centro)
    return centro

@router.put("/{centro_id}", response_model=CentroCostoOut)
async def update_centro_costo(
    centro_id: UUID,
    cc_in: CentroCostoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    centro = await db.get(CentroCosto, centro_id)
    if not centro:
        raise HTTPException(status_code=404, detail="Centro de costo no encontrado.")

    data = cc_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(centro, field, val)

    await db.commit()
    await db.refresh(centro)
    return centro

@router.delete("/{centro_id}", status_code=status.HTTP_200_OK)
async def delete_centro_costo(
    centro_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    centro = await db.get(CentroCosto, centro_id)
    if not centro:
        raise HTTPException(status_code=404, detail="Centro de costo no encontrado.")

    centro.activo = False
    await db.commit()
    return {"status": "success", "message": "Centro de costo desactivado.", "id": str(centro_id)}
