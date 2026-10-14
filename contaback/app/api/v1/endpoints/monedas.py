from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.moneda import Moneda, TasaCambio
from app.models.usuario import Usuario
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class MonedaCreate(BaseModel):
    codigo: str
    nombre: str
    simbolo: str
    es_moneda_nacional: bool = False

class MonedaUpdate(BaseModel):
    nombre: Optional[str] = None
    simbolo: Optional[str] = None
    es_moneda_nacional: Optional[bool] = None
    activa: Optional[bool] = None

class MonedaOut(BaseModel):
    id: UUID
    codigo: str
    nombre: str
    simbolo: str
    es_moneda_nacional: bool
    activa: bool

    class Config:
        from_attributes = True

class TasaCambioCreate(BaseModel):
    moneda_origen_id: Optional[UUID] = None
    moneda_destino_id: Optional[UUID] = None
    fecha: date = date.today()
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
    stmt = select(Moneda).where(Moneda.activa == True).order_by(Moneda.codigo.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/", response_model=MonedaOut, status_code=status.HTTP_201_CREATED)
async def create_moneda(
    mon_in: MonedaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(Moneda).where(Moneda.codigo == mon_in.codigo.upper().strip())
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe una moneda con este código.")

    moneda = Moneda(
        codigo=mon_in.codigo.upper().strip(),
        nombre=mon_in.nombre.strip(),
        simbolo=mon_in.simbolo.strip(),
        es_moneda_nacional=mon_in.es_moneda_nacional,
        activa=True
    )
    db.add(moneda)
    await db.commit()
    await db.refresh(moneda)
    return moneda

@router.put("/{moneda_id}", response_model=MonedaOut)
async def update_moneda(
    moneda_id: UUID,
    mon_in: MonedaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    moneda = await db.get(Moneda, moneda_id)
    if not moneda:
        raise HTTPException(status_code=404, detail="Moneda no encontrada.")

    data = mon_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(moneda, k, v)

    await db.commit()
    await db.refresh(moneda)
    return moneda

@router.delete("/{moneda_id}", status_code=status.HTTP_200_OK)
async def delete_moneda(
    moneda_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    moneda = await db.get(Moneda, moneda_id)
    if not moneda:
        raise HTTPException(status_code=404, detail="Moneda no encontrada.")

    moneda.activa = False
    await db.commit()
    return {"status": "success", "message": "Moneda desactivada con éxito.", "id": str(moneda_id)}

@router.get("/tasas", response_model=List[TasaCambioOut])
async def list_tasas(
    fecha: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(TasaCambio)
    if fecha:
        stmt = stmt.where(TasaCambio.fecha == fecha)
    else:
        stmt = stmt.order_by(desc(TasaCambio.fecha)).limit(30)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/tasas/actual")
async def get_tasa_actual(db: AsyncSession = Depends(get_db)):
    """
    Obtiene la tasa de cambio vigente más reciente USD -> VES.
    """
    stmt = (
        select(TasaCambio)
        .order_by(desc(TasaCambio.fecha), desc(TasaCambio.created_at))
        .limit(1)
    )
    res = await db.execute(stmt)
    tasa_obj = res.scalars().first()
    if not tasa_obj:
        return {"tasa": 40.0, "fecha": str(date.today()), "tipo": "BCV_OFICIAL"}
    return {
        "id": str(tasa_obj.id),
        "tasa": float(tasa_obj.tasa),
        "fecha": str(tasa_obj.fecha),
        "tipo_tasa": tasa_obj.tipo_tasa,
        "fuente": tasa_obj.fuente
    }

@router.post("/tasas", response_model=TasaCambioOut, status_code=status.HTTP_201_CREATED)
async def registrar_tasa(
    tasa_in: TasaCambioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Si no se suministran IDs de moneda, resolver automáticamente USD -> VES
    mon_origen_id = tasa_in.moneda_origen_id
    mon_destino_id = tasa_in.moneda_destino_id

    if not mon_origen_id or not mon_destino_id:
        stmt_usd = select(Moneda).where(Moneda.codigo == "USD")
        stmt_ves = select(Moneda).where(Moneda.codigo == "VES")
        usd = (await db.execute(stmt_usd)).scalars().first()
        ves = (await db.execute(stmt_ves)).scalars().first()
        if usd and ves:
            mon_origen_id = usd.id
            mon_destino_id = ves.id
        else:
            raise HTTPException(status_code=400, detail="No se encontraron las monedas USD y VES configuradas.")

    # Buscar si ya existe para hacer UPSERT
    stmt_existente = select(TasaCambio).where(
        TasaCambio.moneda_origen_id == mon_origen_id,
        TasaCambio.moneda_destino_id == mon_destino_id,
        TasaCambio.fecha == tasa_in.fecha,
        TasaCambio.tipo_tasa == tasa_in.tipo_tasa
    )
    tasa = (await db.execute(stmt_existente)).scalars().first()

    if tasa:
        tasa.tasa = tasa_in.tasa
        tasa.fuente = tasa_in.fuente
    else:
        tasa = TasaCambio(
            moneda_origen_id=mon_origen_id,
            moneda_destino_id=mon_destino_id,
            fecha=tasa_in.fecha,
            tipo_tasa=tasa_in.tipo_tasa,
            tasa=tasa_in.tasa,
            fuente=tasa_in.fuente
        )
        db.add(tasa)

    await db.commit()
    await db.refresh(tasa)
    return tasa
