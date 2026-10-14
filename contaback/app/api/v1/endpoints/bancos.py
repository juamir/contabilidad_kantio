from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.banco import CuentaBancaria
from app.models.usuario import Usuario
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class CuentaBancariaCreate(BaseModel):
    codigo: str
    banco: str
    numero_cuenta: str
    tipo: str = "CORRIENTE VES"
    moneda: str = "VES"
    saldo_libros_ves: float = 0.0
    saldo_banco_ves: float = 0.0
    saldo_usd: float = 0.0
    estado_conciliacion: str = "CONCILIADO"
    cuenta_contable_id: Optional[UUID] = None

class CuentaBancariaUpdate(BaseModel):
    codigo: Optional[str] = None
    banco: Optional[str] = None
    numero_cuenta: Optional[str] = None
    tipo: Optional[str] = None
    moneda: Optional[str] = None
    saldo_libros_ves: Optional[float] = None
    saldo_banco_ves: Optional[float] = None
    saldo_usd: Optional[float] = None
    estado_conciliacion: Optional[str] = None
    cuenta_contable_id: Optional[UUID] = None

class CuentaBancariaOut(BaseModel):
    id: UUID
    empresa_id: UUID
    codigo: str
    banco: str
    numero_cuenta: str
    tipo: str
    moneda: str
    saldo_libros_ves: float
    saldo_banco_ves: float
    saldo_usd: float
    estado_conciliacion: str
    cuenta_contable_id: Optional[UUID] = None
    activo: bool

    class Config:
        from_attributes = True

@router.get("/empresas/{empresa_id}", response_model=List[CuentaBancariaOut])
async def list_cuentas_bancarias(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = (
        select(CuentaBancaria)
        .where(CuentaBancaria.empresa_id == empresa_id, CuentaBancaria.activo == True)
        .order_by(CuentaBancaria.codigo.asc())
    )
    result = await db.execute(stmt)
    cuentas = result.scalars().all()
    
    # Si no existen cuentas para esta empresa, sembrar las cuentas bancarias predeterminadas
    if not cuentas:
        default_bancos = [
            {
                "codigo": "BAN-001",
                "banco": "BANCO MERCANTIL C.A.",
                "numero_cuenta": "0105-0024-81-1024567890",
                "tipo": "CORRIENTE VES",
                "moneda": "VES",
                "saldo_libros_ves": 284500.50,
                "saldo_banco_ves": 284500.50,
                "saldo_usd": 0.0,
                "estado_conciliacion": "CONCILIADO"
            },
            {
                "codigo": "BAN-002",
                "banco": "BANCO DE VENEZUELA S.A.",
                "numero_cuenta": "0102-0111-42-0001234567",
                "tipo": "CORRIENTE VES (PAGO SENIAT)",
                "moneda": "VES",
                "saldo_libros_ves": 142300.00,
                "saldo_banco_ves": 142300.00,
                "saldo_usd": 0.0,
                "estado_conciliacion": "CONCILIADO"
            },
            {
                "codigo": "BAN-003",
                "banco": "BANESCO BANCO UNIVERSAL",
                "numero_cuenta": "0134-0865-19-8650012345",
                "tipo": "CORRIENTE VES",
                "moneda": "VES",
                "saldo_libros_ves": 89600.00,
                "saldo_banco_ves": 89600.00,
                "saldo_usd": 0.0,
                "estado_conciliacion": "CONCILIADO"
            },
            {
                "codigo": "BAN-004",
                "banco": "BBVA BANCO PROVINCIAL",
                "numero_cuenta": "0108-0012-33-0100456789",
                "tipo": "CORRIENTE VES",
                "moneda": "VES",
                "saldo_libros_ves": 65120.80,
                "saldo_banco_ves": 65120.80,
                "saldo_usd": 0.0,
                "estado_conciliacion": "CONCILIADO"
            },
            {
                "codigo": "BAN-005",
                "banco": "BANCAMIGA / MERCANTIL DIVISAS",
                "numero_cuenta": "0105-0999-01-9999123456",
                "tipo": "CUSTODIA ESPECIAL USD",
                "moneda": "USD",
                "saldo_libros_ves": 340000.00,
                "saldo_banco_ves": 340000.00,
                "saldo_usd": 8500.00,
                "estado_conciliacion": "CONCILIADO"
            }
        ]
        for b in default_bancos:
            item = CuentaBancaria(
                empresa_id=empresa_id,
                codigo=b["codigo"],
                banco=b["banco"],
                numero_cuenta=b["numero_cuenta"],
                tipo=b["tipo"],
                moneda=b["moneda"],
                saldo_libros_ves=b["saldo_libros_ves"],
                saldo_banco_ves=b["saldo_banco_ves"],
                saldo_usd=b["saldo_usd"],
                estado_conciliacion=b["estado_conciliacion"],
                activo=True
            )
            db.add(item)
        await db.commit()
        stmt = (
            select(CuentaBancaria)
            .where(CuentaBancaria.empresa_id == empresa_id, CuentaBancaria.activo == True)
            .order_by(CuentaBancaria.codigo.asc())
        )
        cuentas = (await db.execute(stmt)).scalars().all()

    return cuentas

@router.post("/empresas/{empresa_id}", response_model=CuentaBancariaOut, status_code=status.HTTP_201_CREATED)
async def create_cuenta_bancaria(
    empresa_id: UUID,
    banco_in: CuentaBancariaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(CuentaBancaria).where(
        CuentaBancaria.empresa_id == empresa_id,
        CuentaBancaria.codigo == banco_in.codigo
    )
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe una cuenta bancaria con este código para esta empresa.")

    cuenta = CuentaBancaria(
        empresa_id=empresa_id,
        codigo=banco_in.codigo,
        banco=banco_in.banco,
        numero_cuenta=banco_in.numero_cuenta,
        tipo=banco_in.tipo,
        moneda=banco_in.moneda,
        saldo_libros_ves=banco_in.saldo_libros_ves,
        saldo_banco_ves=banco_in.saldo_banco_ves,
        saldo_usd=banco_in.saldo_usd,
        estado_conciliacion=banco_in.estado_conciliacion,
        cuenta_contable_id=banco_in.cuenta_contable_id,
        activo=True
    )
    db.add(cuenta)
    await db.commit()
    await db.refresh(cuenta)
    return cuenta

@router.put("/{banco_id}", response_model=CuentaBancariaOut)
async def update_cuenta_bancaria(
    banco_id: UUID,
    banco_in: CuentaBancariaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = await db.get(CuentaBancaria, banco_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada.")

    data = banco_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(cuenta, k, v)

    await db.commit()
    await db.refresh(cuenta)
    return cuenta

@router.delete("/{banco_id}", status_code=status.HTTP_200_OK)
async def delete_cuenta_bancaria(
    banco_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = await db.get(CuentaBancaria, banco_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada.")

    cuenta.activo = False
    await db.commit()
    return {"status": "success", "message": "Cuenta bancaria desactivada con éxito.", "id": str(banco_id)}
