from typing import Dict, Any, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.comprobante import Comprobante, ComprobanteRenglon
from app.models.cuenta import CuentaContable

async def calcular_balance_comprobacion(db: AsyncSession, empresa_id: UUID) -> Dict[str, Any]:
    """
    Calcula el balance de sumas y saldos para todas las cuentas con movimiento en comprobantes asentados.
    """
    stmt = (
        select(
            CuentaContable.id,
            CuentaContable.codigo,
            CuentaContable.descripcion,
            CuentaContable.naturaleza,
            func.coalesce(func.sum(ComprobanteRenglon.monto_debito_base), 0).label("total_debito"),
            func.coalesce(func.sum(ComprobanteRenglon.monto_credito_base), 0).label("total_credito")
        )
        .join(ComprobanteRenglon, ComprobanteRenglon.cuenta_id == CuentaContable.id)
        .join(Comprobante, Comprobante.id == ComprobanteRenglon.comprobante_id)
        .where(
            CuentaContable.empresa_id == empresa_id,
            Comprobante.estado == "ASENTADO"
        )
        .group_by(CuentaContable.id, CuentaContable.codigo, CuentaContable.descripcion, CuentaContable.naturaleza)
        .order_by(CuentaContable.codigo.asc())
    )
    rows = (await db.execute(stmt)).all()

    cuentas_reporte = []
    gran_total_debito = 0.0
    gran_total_credito = 0.0
    gran_total_saldo_deudor = 0.0
    gran_total_saldo_acreedor = 0.0

    for r in rows:
        deb = float(r.total_debito)
        cre = float(r.total_credito)
        gran_total_debito += deb
        gran_total_credito += cre

        if r.naturaleza == "DEUDORA":
            saldo_deudor = deb - cre
            saldo_acreedor = 0.0
        else:
            saldo_acreedor = cre - deb
            saldo_deudor = 0.0

        gran_total_saldo_deudor += saldo_deudor
        gran_total_saldo_acreedor += saldo_acreedor

        cuentas_reporte.append({
            "cuenta_id": str(r.id),
            "codigo": r.codigo,
            "descripcion": r.descripcion,
            "naturaleza": r.naturaleza,
            "total_debito": deb,
            "total_credito": cre,
            "saldo_deudor": saldo_deudor,
            "saldo_acreedor": saldo_acreedor
        })

    return {
        "cuentas": cuentas_reporte,
        "gran_total_debito": round(gran_total_debito, 2),
        "gran_total_credito": round(gran_total_credito, 2),
        "gran_total_saldo_deudor": round(gran_total_saldo_deudor, 2),
        "gran_total_saldo_acreedor": round(gran_total_saldo_acreedor, 2),
        "esta_cuadrado": abs(gran_total_saldo_deudor - gran_total_saldo_acreedor) < 0.01
    }

async def calcular_estado_resultados_niif18(db: AsyncSession, empresa_id: UUID) -> Dict[str, Any]:
    """
    Genera el Estado de Resultados según la nueva NIIF 18:
    Ingresos Operativos - Costos = Margen Bruto
    Margen Bruto - Gastos Operativos = Resultado Operativo
    Resultado Operativo + Financieros/Diferencial Cambiario - Egresos/IGTF = Resultado Neto
    """
    bal = await calcular_balance_comprobacion(db, empresa_id)
    cuentas = bal["cuentas"]

    ingresos_operativos = 0.0
    costos_ventas = 0.0
    gastos_operativos = 0.0
    otros_ingresos = 0.0
    otros_egresos = 0.0

    detalle_ingresos = []
    detalle_costos = []
    detalle_gastos = []
    detalle_otros_ingresos = []
    detalle_otros_egresos = []

    for c in cuentas:
        cod = c["codigo"]
        saldo = c["saldo_acreedor"] if c["naturaleza"] == "ACREEDORA" else c["saldo_deudor"]
        
        if cod.startswith("4"):
            ingresos_operativos += saldo
            detalle_ingresos.append(c)
        elif cod.startswith("5"):
            costos_ventas += saldo
            detalle_costos.append(c)
        elif cod.startswith("6"):
            gastos_operativos += saldo
            detalle_gastos.append(c)
        elif cod.startswith("7"):
            otros_ingresos += saldo
            detalle_otros_ingresos.append(c)
        elif cod.startswith("8"):
            otros_egresos += saldo
            detalle_otros_egresos.append(c)

    margen_bruto = ingresos_operativos - costos_ventas
    resultado_operativo = margen_bruto - gastos_operativos
    resultado_neto = resultado_operativo + otros_ingresos - otros_egresos

    return {
        "ingresos_operativos": round(ingresos_operativos, 2),
        "costos_ventas": round(costos_ventas, 2),
        "margen_bruto": round(margen_bruto, 2),
        "gastos_operativos": round(gastos_operativos, 2),
        "resultado_operativo": round(resultado_operativo, 2),
        "otros_ingresos": round(otros_ingresos, 2),
        "otros_egresos": round(otros_egresos, 2),
        "resultado_neto_ejercicio": round(resultado_neto, 2),
        "detalles": {
            "ingresos": detalle_ingresos,
            "costos": detalle_costos,
            "gastos": detalle_gastos,
            "otros_ingresos": detalle_otros_ingresos,
            "otros_egresos": detalle_otros_egresos
        }
    }

async def calcular_balance_general(db: AsyncSession, empresa_id: UUID) -> Dict[str, Any]:
    """
    Calcula el Balance General (Estado de Situación Financiera):
    Activos = Pasivos + Patrimonio + Resultado del Ejercicio
    """
    bal = await calcular_balance_comprobacion(db, empresa_id)
    pyg = await calcular_estado_resultados_niif18(db, empresa_id)
    cuentas = bal["cuentas"]

    total_activo = 0.0
    total_pasivo = 0.0
    total_patrimonio = 0.0

    activos_detalle = []
    pasivos_detalle = []
    patrimonio_detalle = []

    for c in cuentas:
        cod = c["codigo"]
        saldo = c["saldo_deudor"] if c["naturaleza"] == "DEUDORA" else c["saldo_acreedor"]
        
        if cod.startswith("1"):
            total_activo += saldo
            activos_detalle.append(c)
        elif cod.startswith("2"):
            total_pasivo += saldo
            pasivos_detalle.append(c)
        elif cod.startswith("3"):
            total_patrimonio += saldo
            patrimonio_detalle.append(c)

    resultado_ejercicio = pyg["resultado_neto_ejercicio"]
    total_pasivo_y_patrimonio = total_pasivo + total_patrimonio + resultado_ejercicio

    return {
        "total_activo": round(total_activo, 2),
        "total_pasivo": round(total_pasivo, 2),
        "total_patrimonio_social": round(total_patrimonio, 2),
        "resultado_ejercicio": round(resultado_ejercicio, 2),
        "total_patrimonio_total": round(total_patrimonio + resultado_ejercicio, 2),
        "total_pasivo_y_patrimonio": round(total_pasivo_y_patrimonio, 2),
        "diferencia_cuadre": round(abs(total_activo - total_pasivo_y_patrimonio), 2),
        "detalles": {
            "activos": activos_detalle,
            "pasivos": pasivos_detalle,
            "patrimonio": patrimonio_detalle
        }
    }
