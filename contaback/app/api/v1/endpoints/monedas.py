from typing import List
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.moneda import Moneda, TasaCambio
from app.models.usuario import Usuario
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class MonedaOut(BaseModel):
    id: UUID
    codigo: str
    nombre: str
    simbolo: str
    es_moneda_nacional: bool

    class Config:
        from_attributes = True

class TasaCambioCreate(BaseModel):
    moneda_origen_id: UUID
    moneda_destino_id: UUID
    fecha: date
    tipo_tasa: str = "BCV_OFICIAL"
    tasa: float
    fuente: str = "BCV"

class TasaCambioOut(BaseModel):
    id: UUID
    moneda_origen_id: UUID
    moneda_destino_id: UUID
    fecha: date
    tipo_tasa: str
    tasa: float
    fuente: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[MonedaOut])
async def list_monedas(db: AsyncSession = Depends(get_db)):
    stmt = select(Moneda).where(Moneda.activa == True)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/tasas", response_model=List[TasaCambioOut])
async def list_tasas(
    fecha: date = date.today(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(TasaCambio).where(TasaCambio.fecha == fecha)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/tasas", response_model=TasaCambioOut, status_code=status.HTTP_201_CREATED)
async def registrar_tasa(
    tasa_in: TasaCambioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    tasa = TasaCambio(
        moneda_origen_id=tasa_in.moneda_origen_id,
        moneda_destino_id=tasa_in.moneda_destino_id,
        fecha=tasa_in.fecha,
        tipo_tasa=tasa_in.tipo_tasa,
        tasa=tasa_in.tasa,
        fuente=tasa_in.fuente
    )
    db.add(tasa)
    await db.commit()
    await db.refresh(tasa)
    return tasa
