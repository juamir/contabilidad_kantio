from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.auxiliar import Auxiliar
from app.models.usuario import Usuario
from app.schemas.auxiliar import AuxiliarCreate, AuxiliarUpdate, AuxiliarOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/empresas/{empresa_id}", response_model=List[AuxiliarOut])
async def list_auxiliares(
    empresa_id: UUID,
    tipo: Optional[str] = None,
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(Auxiliar).where(Auxiliar.empresa_id == empresa_id, Auxiliar.activo == True)
    if tipo:
        stmt = stmt.where(Auxiliar.tipo_auxiliar == tipo)
    if q:
        search = f"%{q}%"
        stmt = stmt.where(
            (Auxiliar.codigo.ilike(search)) |
            (Auxiliar.nombre_razon_social.ilike(search)) |
            (Auxiliar.rif_cedula.ilike(search))
        )
    stmt = stmt.order_by(Auxiliar.nombre_razon_social.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/empresas/{empresa_id}", response_model=AuxiliarOut, status_code=status.HTTP_201_CREATED)
async def create_auxiliar(
    empresa_id: UUID,
    aux_in: AuxiliarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(Auxiliar).where(
        Auxiliar.empresa_id == empresa_id,
        (Auxiliar.codigo == aux_in.codigo) | (Auxiliar.rif_cedula == aux_in.rif_cedula.upper())
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un auxiliar con este código o RIF en la empresa.")

    auxiliar = Auxiliar(
        empresa_id=empresa_id,
        codigo=aux_in.codigo,
        nombre_razon_social=aux_in.nombre_razon_social,
        tipo_identificacion=aux_in.tipo_identificacion,
        rif_cedula=aux_in.rif_cedula.upper(),
        tipo_auxiliar=aux_in.tipo_auxiliar,
        email=aux_in.email,
        telefono=aux_in.telefono,
        activo=aux_in.activo
    )
    db.add(auxiliar)
    await db.commit()
    await db.refresh(auxiliar)
    return auxiliar

@router.put("/{auxiliar_id}", response_model=AuxiliarOut)
async def update_auxiliar(
    auxiliar_id: UUID,
    aux_in: AuxiliarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    auxiliar = await db.get(Auxiliar, auxiliar_id)
    if not auxiliar:
        raise HTTPException(status_code=404, detail="Auxiliar no encontrado.")

    data = aux_in.dict(exclude_unset=True)
    for field, val in data.items():
        if field == "rif_cedula" and val:
            val = val.upper()
        setattr(auxiliar, field, val)

    await db.commit()
    await db.refresh(auxiliar)
    return auxiliar

@router.delete("/{auxiliar_id}", status_code=status.HTTP_200_OK)
async def delete_auxiliar(
    auxiliar_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    auxiliar = await db.get(Auxiliar, auxiliar_id)
    if not auxiliar:
        raise HTTPException(status_code=404, detail="Auxiliar no encontrado.")

    auxiliar.activo = False
    await db.commit()
    return {"status": "success", "message": "Auxiliar desactivado.", "id": str(auxiliar_id)}
