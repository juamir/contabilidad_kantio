import pytest
import uuid
from httpx import AsyncClient
from app.core.security import get_password_hash
from app.models.usuario import Usuario

@pytest.mark.asyncio
async def test_parametros_and_profit_tables_flow(client: AsyncClient, db_session):
    # 1. Registrar usuario
    user = Usuario(
        id=uuid.uuid4(),
        email="profit.tester@kantio.online",
        hashed_password=get_password_hash("Secret123!"),
        nombre_completo="Tester Profit",
        tipo_usuario="KANTIO_ADMIN",
        rol="ADMIN_EMPRESA",
        activo=True
    )
    db_session.add(user)
    await db_session.commit()

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "profit.tester@kantio.online",
        "password": "Secret123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Crear Empresa
    emp_res = await client.post("/api/v1/empresas/", json={
        "codigo": "EMP-PROFIT",
        "razon_social": "Profit Simulation C.A.",
        "rif": "J-99887766-5",
        "nit": "00123456",
        "plan_suscripcion": "ESTANDAR"
    }, headers=headers)
    assert emp_res.status_code == 201
    empresa_id = emp_res.json()["id"]

    # 3. Consultar y actualizar parámetros de empresa (002 Profit)
    param_res = await client.get(f"/api/v1/empresas/{empresa_id}/parametros", headers=headers)
    assert param_res.status_code == 200
    pdata = param_res.json()
    assert pdata["niveles"] == 4
    assert pdata["mascara_formato"] == "X.X.XX.XXX"

    upd_param = await client.put(f"/api/v1/empresas/{empresa_id}/parametros", json={
        "caracter_separacion": "-",
        "consecutivo_contabilizacion": 50
    }, headers=headers)
    assert upd_param.status_code == 200
    assert upd_param.json()["mascara_formato"] == "X-X-XX-XXX"
    assert upd_param.json()["consecutivo_contabilizacion"] == 50

    # 4. Tipos de Documento (007 Profit) - auto-seed
    doc_res = await client.get(f"/api/v1/tipos-documento/empresas/{empresa_id}", headers=headers)
    assert doc_res.status_code == 200
    docs = doc_res.json()
    assert len(docs) >= 10
    assert any(d["codigo"] == "FACT" for d in docs)

    # 5. Activos Fijos (008, 009, 010 Profit)
    grupos_res = await client.get(f"/api/v1/activos-fijos/empresas/{empresa_id}/grupos", headers=headers)
    assert grupos_res.status_code == 200
    assert len(grupos_res.json()) >= 4

    ubics_res = await client.get(f"/api/v1/activos-fijos/empresas/{empresa_id}/ubicaciones", headers=headers)
    assert ubics_res.status_code == 200
    assert len(ubics_res.json()) >= 4

    # Crear activo fijo
    af_res = await client.post(f"/api/v1/activos-fijos/empresas/{empresa_id}", json={
        "codigo": "AF-001",
        "descripcion": "COMP. PENTIUM 64 MB DD 4GB",
        "serial": "XX-0001",
        "vida_util_anos": 3,
        "valor_adquisicion": 1200.0,
        "depreciacion_acumulada": 200.0
    }, headers=headers)
    assert af_res.status_code == 201
    af_data = af_res.json()
    assert float(af_data["valor_contable"]) == 1000.0

    # 6. Auto-inferencia de nueva cuenta contable sin necesidad de clase manual
    cuenta_res = await client.post(f"/api/v1/cuentas/empresas/{empresa_id}", json={
        "codigo": "1.1.09.001",
        "descripcion": "CUENTA DE PRUEBA INFERIDA",
        "permite_movimiento": True
    }, headers=headers)
    assert cuenta_res.status_code == 201
    cdata = cuenta_res.json()
    assert cdata["tipo_cuenta"] == "ACTIVO"
    assert cdata["naturaleza"] == "DEUDORA"
    assert cdata["nivel"] == 4
