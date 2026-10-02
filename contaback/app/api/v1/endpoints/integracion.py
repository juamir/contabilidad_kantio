from typing import List, Optional
from uuid import UUID
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.empresa import Empresa
from app.models.cuenta import CuentaContable
from app.models.comprobante import Comprobante, ComprobanteRenglon
from app.models.usuario import Usuario
from app.api.deps import get_current_user
from pydantic import BaseModel, Field

router = APIRouter()

class IntegracionNominaPayload(BaseModel):
    numero_comprobante: str
    fecha: date = date.today()
    concepto: str = "Contabilización automática de nómina quincenal"
    tasa_cambio: float = 40.0
    total_sueldos: float
    total_cestaticket: float
    total_aportes_patronales: float = 0.0
    total_retenciones_ley: float = 0.0
    total_neto_pagado: float

class IntegracionPosPayload(BaseModel):
    numero_comprobante: str
    fecha: date = date.today()
    concepto: str = "Cierre diario de ventas y caja POS"
    tasa_cambio: float = 40.0
    total_efectivo: float
    total_punto_de_venta: float
    base_imponible_ventas: float
    debito_fiscal_iva: float
    costo_de_ventas: float = 0.0

@router.post("/empresas/{empresa_id}/nomina", status_code=status.HTTP_201_CREATED)
async def contabilizar_nomina(
    empresa_id: UUID,
    payload: IntegracionNominaPayload,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Webhook / Endpoint para contabilizar automáticamente nóminas emitidas por Kantio Nómina.
    Genera asiento de diario en estado ASENTADO con partida doble perfecta.
    """
    async def get_cuenta_id(codigo: str) -> UUID:
        stmt = select(CuentaContable.id).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == codigo)
        c_id = (await db.execute(stmt)).scalars().first()
        if not c_id:
            raise HTTPException(status_code=400, detail=f"No se encontró la cuenta contable {codigo} para contabilizar la nómina.")
        return c_id

    cuenta_sueldos = await get_cuenta_id("6.1.01.001")
    cuenta_cesta = await get_cuenta_id("6.1.01.002")
    cuenta_ret = await get_cuenta_id("2.1.04.002")  # Retenciones por enterar
    cuenta_banco = await get_cuenta_id("1.1.01.002")  # Bancos / Pago neto

    total_debito = payload.total_sueldos + payload.total_cestaticket
    total_credito = payload.total_retenciones_ley + payload.total_neto_pagado
    
    # Tolerancia de redondeo
    if round(abs(total_debito - total_credito), 2) > 0.05:
        raise HTTPException(
            status_code=400,
            detail=f"Descuadre en payload de nómina: Débito ({total_debito}) != Crédito ({total_credito})"
        )

    tasa = payload.tasa_cambio
    comp = Comprobante(
        empresa_id=empresa_id,
        numero=payload.numero_comprobante,
        fecha=payload.fecha,
        tipo="INTEGRACION_NOMINA",
        concepto=payload.concepto,
        tasa_cambio=tasa,
        estado="ASENTADO",
        total_debito_base=total_debito,
        total_credito_base=total_credito,
        total_debito_divisa=round(total_debito / tasa, 2),
        total_credito_divisa=round(total_credito / tasa, 2),
        creado_por_usuario_id=current_user.id,
        creado_tipo_usuario="SISTEMA_AUTO",
        asentado_at=datetime.utcnow()
    )
    db.add(comp)
    await db.flush()

    lineas = [
        # Débitos
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=1, cuenta_id=cuenta_sueldos, descripcion="Gasto de Sueldos y Salarios", monto_debito_base=payload.total_sueldos, monto_debito_divisa=round(payload.total_sueldos/tasa, 2)),
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=2, cuenta_id=cuenta_cesta, descripcion="Gasto de Bono de Alimentación Cestaticket", monto_debito_base=payload.total_cestaticket, monto_debito_divisa=round(payload.total_cestaticket/tasa, 2)),
        # Créditos
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=3, cuenta_id=cuenta_ret, descripcion="Retenciones de Ley por Enterar", monto_credito_base=payload.total_retenciones_ley, monto_credito_divisa=round(payload.total_retenciones_ley/tasa, 2)),
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=4, cuenta_id=cuenta_banco, descripcion="Dispersión bancaria nómina neta", monto_credito_base=payload.total_neto_pagado, monto_credito_divisa=round(payload.total_neto_pagado/tasa, 2))
    ]
    db.add_all(lineas)
    await db.commit()

    return {
        "status": "success",
        "comprobante_id": str(comp.id),
        "numero": comp.numero,
        "mensaje": "Nómina contabilizada exitosamente con partida doble bimonetaria."
    }

@router.post("/empresas/{empresa_id}/pos", status_code=status.HTTP_201_CREATED)
async def contabilizar_ventas_pos(
    empresa_id: UUID,
    payload: IntegracionPosPayload,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Webhook para contabilizar cierres de ventas diarios desde Kantio FastPOS.
    """
    async def get_cuenta_id(codigo: str) -> UUID:
        stmt = select(CuentaContable.id).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == codigo)
        c_id = (await db.execute(stmt)).scalars().first()
        if not c_id:
            raise HTTPException(status_code=400, detail=f"No se encontró la cuenta contable {codigo}.")
        return c_id

    cuenta_caja = await get_cuenta_id("1.1.01.001")
    cuenta_banco = await get_cuenta_id("1.1.01.002")
    cuenta_ventas = await get_cuenta_id("4.1.01.001")
    cuenta_iva = await get_cuenta_id("2.1.03.001")

    total_ingreso = payload.total_efectivo + payload.total_punto_de_venta
    total_fiscal = payload.base_imponible_ventas + payload.debito_fiscal_iva

    if round(abs(total_ingreso - total_fiscal), 2) > 0.05:
        raise HTTPException(
            status_code=400,
            detail=f"Descuadre en venta POS: Total Cobrado ({total_ingreso}) != Ventas + IVA ({total_fiscal})"
        )

    tasa = payload.tasa_cambio
    comp = Comprobante(
        empresa_id=empresa_id,
        numero=payload.numero_comprobante,
        fecha=payload.fecha,
        tipo="INTEGRACION_POS",
        concepto=payload.concepto,
        tasa_cambio=tasa,
        estado="ASENTADO",
        total_debito_base=total_ingreso,
        total_credito_base=total_fiscal,
        total_debito_divisa=round(total_ingreso / tasa, 2),
        total_credito_divisa=round(total_fiscal / tasa, 2),
        creado_por_usuario_id=current_user.id,
        creado_tipo_usuario="SISTEMA_AUTO",
        asentado_at=datetime.utcnow()
    )
    db.add(comp)
    await db.flush()

    lineas = [
        # Débitos por forma de cobro
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=1, cuenta_id=cuenta_caja, descripcion="Cobro ventas en Efectivo", monto_debito_base=payload.total_efectivo, monto_debito_divisa=round(payload.total_efectivo/tasa, 2)),
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=2, cuenta_id=cuenta_banco, descripcion="Cobro ventas Punto de Venta / Tarjetas", monto_debito_base=payload.total_punto_de_venta, monto_debito_divisa=round(payload.total_punto_de_venta/tasa, 2)),
        # Créditos fiscales
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=3, cuenta_id=cuenta_ventas, descripcion="Ventas brutas del día", monto_credito_base=payload.base_imponible_ventas, monto_credito_divisa=round(payload.base_imponible_ventas/tasa, 2)),
        ComprobanteRenglon(comprobante_id=comp.id, empresa_id=empresa_id, numero_linea=4, cuenta_id=cuenta_iva, descripcion="Débito Fiscal IVA 16%", monto_credito_base=payload.debito_fiscal_iva, monto_credito_divisa=round(payload.debito_fiscal_iva/tasa, 2))
    ]
    db.add_all(lineas)
    await db.commit()

    return {
        "status": "success",
        "comprobante_id": str(comp.id),
        "numero": comp.numero,
        "mensaje": "Ventas POS contabilizadas exitosamente con IVA desglosado."
    }
