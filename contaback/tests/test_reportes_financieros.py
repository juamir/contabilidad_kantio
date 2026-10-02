import pytest
import uuid
from httpx import AsyncClient
from app.models.empresa import Empresa
from app.models.usuario import Usuario
from app.models.cuenta import CuentaContable
from app.services.puc_seed import seed_puc_ven_nif
from app.core.security import get_password_hash, create_access_token
from sqlalchemy import select

@pytest.mark.asyncio
async def test_estados_financieros_niif18_and_balance_general(client: AsyncClient, db_session):
    empresa_id = uuid.uuid4()
    empresa = Empresa(
        id=empresa_id,
        codigo="EMP-REPORTES-01",
        razon_social="Corporación Financiera Kantio C.A.",
        rif="J-33445566-7",
        activo=True
    )
    db_session.add(empresa)
    await db_session.commit()
    await seed_puc_ven_nif(db_session, empresa_id)

    user = Usuario(
        id=uuid.uuid4(),
        email="gerente@empresa.com",
        hashed_password=get_password_hash("GerentePass1!"),
        nombre_completo="Gerente de Finanzas",
        tipo_usuario="EMPRESA_INTERNO",
        rol="ADMIN_EMPRESA",
        empresa_id=empresa_id,
        activo=True
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(subject=str(user.id), extra_claims={"empresa_id": str(empresa_id), "rol": user.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # Obtener cuentas
    async def get_cuenta(cod):
        stmt = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == cod)
        return (await db_session.execute(stmt)).scalars().first()

    caja = await get_cuenta("1.1.01.001")
    ventas = await get_cuenta("4.1.01.001")
    costo = await get_cuenta("5.1.01.001")
    inventario = await get_cuenta("1.1.03.001")
    alquiler = await get_cuenta("6.2.01.001")
    bancos = await get_cuenta("1.1.01.002")
    igtf = await get_cuenta("8.1.01.002")

    # 1. Asiento de Venta (Venta 10,000 Bs)
    asiento_venta = {
        "numero": "2026-001",
        "fecha": "2026-10-01",
        "concepto": "Ventas de mercancía",
        "tasa_cambio": 40.0,
        "estado": "ASENTADO",
        "renglones": [
            {"numero_linea": 1, "cuenta_id": str(caja.id), "descripcion": "Caja", "monto_debito_base": 10000.0, "monto_debito_divisa": 250.0},
            {"numero_linea": 2, "cuenta_id": str(ventas.id), "descripcion": "Ventas", "monto_credito_base": 10000.0, "monto_credito_divisa": 250.0}
        ]
    }
    await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=asiento_venta, headers=headers)

    # 2. Asiento de Costo de Ventas (Costo 4,000 Bs)
    asiento_costo = {
        "numero": "2026-002",
        "fecha": "2026-10-01",
        "concepto": "Costo de ventas e inventario",
        "tasa_cambio": 40.0,
        "estado": "ASENTADO",
        "renglones": [
            {"numero_linea": 1, "cuenta_id": str(costo.id), "descripcion": "Costo de ventas", "monto_debito_base": 4000.0, "monto_debito_divisa": 100.0},
            {"numero_linea": 2, "cuenta_id": str(inventario.id), "descripcion": "Inventario", "monto_credito_base": 4000.0, "monto_credito_divisa": 100.0}
        ]
    }
    await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=asiento_costo, headers=headers)

    # 3. Asiento de Gasto de Alquiler e IGTF (Gasto 2,000 Bs + IGTF 60 Bs)
    asiento_gasto = {
        "numero": "2026-003",
        "fecha": "2026-10-01",
        "concepto": "Pago de alquiler con IGTF bancario",
        "tasa_cambio": 40.0,
        "estado": "ASENTADO",
        "renglones": [
            {"numero_linea": 1, "cuenta_id": str(alquiler.id), "descripcion": "Alquiler oficina", "monto_debito_base": 2000.0, "monto_debito_divisa": 50.0},
            {"numero_linea": 2, "cuenta_id": str(igtf.id), "descripcion": "Impuesto IGTF", "monto_debito_base": 60.0, "monto_debito_divisa": 1.5},
            {"numero_linea": 3, "cuenta_id": str(bancos.id), "descripcion": "Salida Banco", "monto_credito_base": 2060.0, "monto_credito_divisa": 51.5}
        ]
    }
    await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=asiento_gasto, headers=headers)

    # 4. Verificar Balance de Comprobación
    res_bal = await client.get(f"/api/v1/reportes/empresas/{empresa_id}/balance-comprobacion", headers=headers)
    assert res_bal.status_code == 200
    bal_data = res_bal.json()
    assert bal_data["esta_cuadrado"] is True
    assert bal_data["gran_total_debito"] == 16060.00
    assert bal_data["gran_total_credito"] == 16060.00

    # 5. Verificar Estado de Resultados NIIF 18
    # Ingresos: 10,000 | Costos: 4,000 | Margen Bruto: 6,000
    # Gastos Op: 2,000 | Resultado Op: 4,000
    # IGTF (Otros Egresos): 60 | Resultado Neto: 3,940
    res_pyg = await client.get(f"/api/v1/reportes/empresas/{empresa_id}/estado-resultados", headers=headers)
    assert res_pyg.status_code == 200
    pyg_data = res_pyg.json()
    assert pyg_data["ingresos_operativos"] == 10000.00
    assert pyg_data["costos_ventas"] == 4000.00
    assert pyg_data["margen_bruto"] == 6000.00
    assert pyg_data["gastos_operativos"] == 2000.00
    assert pyg_data["resultado_operativo"] == 4000.00
    assert pyg_data["otros_egresos"] == 60.00
    assert pyg_data["resultado_neto_ejercicio"] == 3940.00

    # 6. Verificar Balance General
    # Activos Netos = Caja (10,000) - Inventario (4,000) - Banco (2,060) = 3,940
    # Pasivo + Patrimonio + Utilidad = 0 + 0 + 3,940 = 3,940 (Diferencia = 0.00)
    res_bg = await client.get(f"/api/v1/reportes/empresas/{empresa_id}/balance-general", headers=headers)
    assert res_bg.status_code == 200
    bg_data = res_bg.json()
    assert bg_data["total_activo"] == 3940.00
    assert bg_data["resultado_ejercicio"] == 3940.00
    assert bg_data["diferencia_cuadre"] == 0.00
