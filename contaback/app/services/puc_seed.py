import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.cuenta import CuentaContable

PLAN_CUENTAS_VEN_NIF: List[Dict[str, Any]] = [
    # 1. ACTIVOS
    {"codigo": "1", "descripcion": "ACTIVOS", "nivel": 1, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1", "descripcion": "ACTIVOS CORRIENTES", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1.01", "descripcion": "EFECTIVO Y EQUIVALENTES DE EFECTIVO", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1.01.001", "descripcion": "CAJA GENERAL", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.01.002", "descripcion": "BANCOS NACIONALES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.01.003", "descripcion": "BANCOS MONEDA EXTRANJERA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.02", "descripcion": "CUENTAS POR COBRAR COMERCIALES Y OTRAS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1.02.001", "descripcion": "CUENTAS POR COBRAR CLIENTES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True, "requiere_auxiliar": True, "requiere_documento": True},
    {"codigo": "1.1.02.002", "descripcion": "PRESTAMOS A TRABAJADORES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True, "requiere_auxiliar": True},
    {"codigo": "1.1.02.003", "descripcion": "ANTICIPOS A PROVEEDORES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True, "requiere_auxiliar": True},
    {"codigo": "1.1.03", "descripcion": "INVENTARIOS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1.03.001", "descripcion": "INVENTARIO DE MERCANCIA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.03.002", "descripcion": "INVENTARIO DE MATERIALES Y SUMINISTROS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.04", "descripcion": "IMPUESTOS PAGADOS POR ANTICIPADO", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.1.04.001", "descripcion": "CREDITO FISCAL IVA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.04.002", "descripcion": "ANTICIPOS DE ISLR", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.1.04.003", "descripcion": "RETENCIONES DE IVA SOPORTADAS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True, "requiere_auxiliar": True, "requiere_documento": True},
    {"codigo": "1.2", "descripcion": "ACTIVOS NO CORRIENTES", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.2.01", "descripcion": "PROPIEDADES, PLANTA Y EQUIPO", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.2.01.001", "descripcion": "MOBILIARIO Y EQUIPOS DE OFICINA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.01.002", "descripcion": "EQUIPOS DE COMPUTACION", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.01.003", "descripcion": "VEHICULOS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.02", "descripcion": "DEPRECIACION ACUMULADA", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.2.02.001", "descripcion": "DEPREC. ACUM. MOBILIARIO Y EQUIPOS", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.02.002", "descripcion": "DEPREC. ACUM. EQUIPOS DE COMPUTACION", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.02.003", "descripcion": "DEPREC. ACUM. VEHICULOS", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},
    {"codigo": "1.2.03", "descripcion": "ACTIVOS INTANGIBLES", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": False},
    {"codigo": "1.2.03.001", "descripcion": "SOFTWARE Y LICENCIAS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "ACTIVO", "permite_movimiento": True},

    # 2. PASIVOS
    {"codigo": "2", "descripcion": "PASIVOS", "nivel": 1, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1", "descripcion": "PASIVOS CORRIENTES", "nivel": 2, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.01", "descripcion": "CUENTAS POR PAGAR COMERCIALES", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.01.001", "descripcion": "PROVEEDORES NACIONALES", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True, "requiere_auxiliar": True, "requiere_documento": True},
    {"codigo": "2.1.01.002", "descripcion": "PROVEEDORES DEL EXTERIOR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True, "requiere_auxiliar": True, "requiere_documento": True},
    {"codigo": "2.1.02", "descripcion": "OBLIGACIONES FINANCIERAS A CORTO PLAZO", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.02.001", "descripcion": "PRESTAMOS BANCARIOS POR PAGAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.03", "descripcion": "IMPUESTOS Y RETENCIONES POR PAGAR", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.03.001", "descripcion": "DEBITO FISCAL IVA", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.03.002", "descripcion": "RETENCIONES DE IVA POR ENTERAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.03.003", "descripcion": "RETENCIONES DE ISLR POR ENTERAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.04", "descripcion": "OBLIGACIONES LABORALES Y PARAFISCALES", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.04.001", "descripcion": "NOMINA POR PAGAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.04.002", "descripcion": "RETENCIONES SSO POR ENTERAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.04.003", "descripcion": "RETENCIONES RPE POR ENTERAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.04.004", "descripcion": "RETENCIONES FAOV POR ENTERAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.04.005", "ANTECEDENTE": "", "descripcion": "APORTES PATRONALES POR PAGAR", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.05", "descripcion": "PROVISIONES A CORTO PLAZO", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.1.05.001", "descripcion": "PROVISION PARA VACACIONES", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.1.05.002", "descripcion": "PROVISION PARA UTILIDADES", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},
    {"codigo": "2.2", "descripcion": "PASIVOS NO CORRIENTES", "nivel": 2, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.2.01", "descripcion": "PROVISIONES A LARGO PLAZO", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": False},
    {"codigo": "2.2.01.001", "descripcion": "PROVISION PARA PRESTACIONES SOCIALES", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PASIVO", "permite_movimiento": True},

    # 3. PATRIMONIO
    {"codigo": "3", "descripcion": "PATRIMONIO", "nivel": 1, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1", "descripcion": "CAPITAL CONTABLE", "nivel": 2, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1.01", "descripcion": "CAPITAL SOCIAL", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1.01.001", "descripcion": "CAPITAL SOCIAL SUSCRITO Y PAGADO", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": True},
    {"codigo": "3.1.02", "descripcion": "RESERVAS", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1.02.001", "descripcion": "RESERVA LEGAL", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": True},
    {"codigo": "3.1.03", "descripcion": "RESULTADOS ACUMULADOS", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1.03.001", "descripcion": "UTILIDADES NO DISTRIBUIDAS", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": True},
    {"codigo": "3.1.03.002", "descripcion": "DEFICIT ACUMULADO", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": True},
    {"codigo": "3.1.04", "descripcion": "RESULTADOS DEL EJERCICIO", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": False},
    {"codigo": "3.1.04.001", "descripcion": "UTILIDAD O PERDIDA DEL EJERCICIO", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "PATRIMONIO", "permite_movimiento": True},

    # 4. INGRESOS
    {"codigo": "4", "descripcion": "INGRESOS", "nivel": 1, "naturaleza": "ACREEDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": False},
    {"codigo": "4.1", "descripcion": "INGRESOS OPERACIONALES", "nivel": 2, "naturaleza": "ACREEDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": False},
    {"codigo": "4.1.01", "descripcion": "VENTAS", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": False},
    {"codigo": "4.1.01.001", "descripcion": "VENTAS DE ACTIVIDADES ORDINARIAS", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "4.1.02", "descripcion": "DEVOLUCIONES, REBAJAS Y DESCUENTOS EN VENTAS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": False},
    {"codigo": "4.1.02.001", "descripcion": "DEVOLUCIONES EN VENTAS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": True},
    {"codigo": "4.1.02.002", "descripcion": "DESCUENTOS EN VENTAS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "INGRESO", "permite_movimiento": True},

    # 5. COSTOS DE VENTAS
    {"codigo": "5", "descripcion": "COSTOS DE VENTAS", "nivel": 1, "naturaleza": "DEUDORA", "tipo_cuenta": "COSTO", "permite_movimiento": False},
    {"codigo": "5.1", "descripcion": "COSTOS OPERACIONALES", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "COSTO", "permite_movimiento": False},
    {"codigo": "5.1.01", "descripcion": "COSTOS DE VENTAS Y SERVICIOS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "COSTO", "permite_movimiento": False},
    {"codigo": "5.1.01.001", "descripcion": "COSTO DE VENTAS DE MERCANCIA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "COSTO", "permite_movimiento": True, "requiere_centro_costo": True},

    # 6. GASTOS OPERATIVOS
    {"codigo": "6", "descripcion": "GASTOS OPERATIVOS", "nivel": 1, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.1", "descripcion": "GASTOS DE PERSONAL", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.1.01", "descripcion": "SUELDOS, SALARIOS Y BENEFICIOS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.1.01.001", "descripcion": "SUELDOS Y SALARIOS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "6.1.01.002", "descripcion": "BONO DE ALIMENTACION (CESTATICKET)", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "6.1.02", "descripcion": "APORTES PATRONALES", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.1.02.001", "descripcion": "APORTE PATRONAL SSO", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.02.002", "descripcion": "APORTE PATRONAL RPE", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.02.003", "descripcion": "APORTE PATRONAL FAOV", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.02.004", "descripcion": "APORTE PATRONAL INCES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.03", "descripcion": "GASTOS POR PROVISIONES LABORALES", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.1.03.001", "descripcion": "GASTO POR PRESTACIONES SOCIALES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.03.002", "descripcion": "GASTO POR VACACIONES Y BONO VACACIONAL", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.1.03.003", "descripcion": "GASTO POR UTILIDADES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.2", "descripcion": "GASTOS GENERALES Y ADMINISTRATIVOS", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.2.01", "descripcion": "GASTOS DE ADMINISTRACION", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.2.01.001", "descripcion": "ALQUILERES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "6.2.01.002", "descripcion": "HONORARIOS PROFESIONALES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_auxiliar": True, "requiere_centro_costo": True},
    {"codigo": "6.2.01.003", "descripcion": "SERVICIOS BASICOS (AGUA, LUZ, TELEFONO)", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "6.2.01.004", "descripcion": "MATERIALES DE OFICINA", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True, "requiere_centro_costo": True},
    {"codigo": "6.3", "descripcion": "DEPRECIACIONES Y AMORTIZACIONES", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.3.01", "descripcion": "GASTOS DE DEPRECIACION", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": False},
    {"codigo": "6.3.01.001", "descripcion": "DEPRECIACION DE MOBILIARIO Y EQUIPO", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.3.01.002", "descripcion": "DEPRECIACION DE EQUIPO DE COMPUTACION", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},
    {"codigo": "6.3.01.003", "descripcion": "DEPRECIACION DE VEHICULOS", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "GASTO", "permite_movimiento": True},

    # 7. OTROS INGRESOS
    {"codigo": "7", "descripcion": "OTROS INGRESOS", "nivel": 1, "naturaleza": "ACREEDORA", "tipo_cuenta": "OTRO_INGRESO", "permite_movimiento": False},
    {"codigo": "7.1", "descripcion": "INGRESOS NO OPERACIONALES", "nivel": 2, "naturaleza": "ACREEDORA", "tipo_cuenta": "OTRO_INGRESO", "permite_movimiento": False},
    {"codigo": "7.1.01", "descripcion": "INGRESOS FINANCIEROS Y EXTRAORDINARIOS", "nivel": 3, "naturaleza": "ACREEDORA", "tipo_cuenta": "OTRO_INGRESO", "permite_movimiento": False},
    {"codigo": "7.1.01.001", "descripcion": "INGRESOS POR INTERESES BANCARIOS", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "OTRO_INGRESO", "permite_movimiento": True},
    {"codigo": "7.1.01.002", "descripcion": "GANANCIA EN DIFERENCIAL CAMBIARIO", "nivel": 4, "naturaleza": "ACREEDORA", "tipo_cuenta": "OTRO_INGRESO", "permite_movimiento": True},

    # 8. OTROS EGRESOS
    {"codigo": "8", "descripcion": "OTROS EGRESOS", "nivel": 1, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": False},
    {"codigo": "8.1", "descripcion": "EGRESOS NO OPERACIONALES", "nivel": 2, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": False},
    {"codigo": "8.1.01", "descripcion": "GASTOS FINANCIEROS Y EXTRAORDINARIOS", "nivel": 3, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": False},
    {"codigo": "8.1.01.001", "descripcion": "GASTOS BANCARIOS Y COMISIONES", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": True},
    {"codigo": "8.1.01.002", "descripcion": "IMPUESTO A LAS GRANDES TRANSACCIONES (IGTF)", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": True},
    {"codigo": "8.1.01.003", "descripcion": "PERDIDA EN DIFERENCIAL CAMBIARIO", "nivel": 4, "naturaleza": "DEUDORA", "tipo_cuenta": "OTRO_EGRESO", "permite_movimiento": True},
]

async def seed_puc_ven_nif(db: AsyncSession, empresa_id: uuid.UUID) -> int:
    """Inyecta el Plan de Cuentas VEN-NIF para una nueva empresa titular."""
    # Verificar si ya tiene cuentas
    stmt = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id)
    result = await db.execute(stmt)
    if result.scalars().first():
        return 0  # Ya existen cuentas
    
    codigo_to_id: Dict[str, uuid.UUID] = {}
    created_count = 0
    
    # Ordenar por nivel ascendente para garantizar que los padres se creen primero
    cuentas_ordenadas = sorted(PLAN_CUENTAS_VEN_NIF, key=lambda x: x["nivel"])
    
    for item in cuentas_ordenadas:
        codigo = item["codigo"]
        parent_id = None
        
        # Determinar parent_id analizando el código
        if "." in codigo:
            partes = codigo.rsplit(".", 1)
            codigo_padre = partes[0]
            parent_id = codigo_to_id.get(codigo_padre)
        
        cuenta = CuentaContable(
            empresa_id=empresa_id,
            codigo=codigo,
            descripcion=item["descripcion"],
            nivel=item["nivel"],
            naturaleza=item["naturaleza"],
            tipo_cuenta=item["tipo_cuenta"],
            permite_movimiento=item["permite_movimiento"],
            parent_id=parent_id,
            requiere_auxiliar=item.get("requiere_auxiliar", False),
            requiere_centro_costo=item.get("requiere_centro_costo", False),
            requiere_documento=item.get("requiere_documento", False),
            activa=True
        )
        db.add(cuenta)
        await db.flush()
        codigo_to_id[codigo] = cuenta.id
        created_count += 1
        
    await db.commit()
    return created_count
