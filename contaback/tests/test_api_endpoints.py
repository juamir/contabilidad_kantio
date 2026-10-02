import pytest
import uuid
from httpx import AsyncClient
from app.core.security import get_password_hash
from app.models.usuario import Usuario

@pytest.mark.asyncio
async def test_auth_and_empresa_flow(client: AsyncClient, db_session):
    # 1. Registrar usuario admin
    admin_user = Usuario(
        id=uuid.uuid4(),
        email="admin@kantio.online",
        hashed_password=get_password_hash("Secret123!"),
        nombre_completo="Administrador General",
        tipo_usuario="KANTIO_ADMIN",
        rol="ADMIN_EMPRESA",
        activo=True
    )
    db_session.add(admin_user)
    await db_session.commit()

    # 2. Login
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "admin@kantio.online",
        "password": "Secret123!"
    })
    assert login_res.status_code == 200, login_res.text
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Crear Empresa
    empresa_payload = {
        "codigo": "EMP-001",
        "razon_social": "Soluciones Comerciales Kantio C.A.",
        "nombre_comercial": "Kantio Retail",
        "rif": "J-50123456-7",
        "plan_suscripcion": "ESTANDAR"
    }
    emp_res = await client.post("/api/v1/empresas/", json=empresa_payload, headers=headers)
    assert emp_res.status_code == 201, emp_res.text
    emp_data = emp_res.json()
    empresa_id = emp_data["id"]
    assert emp_data["codigo"] == "EMP-001"

    # 4. Verificar que se auto-semilló el PUC VEN-NIF
    cuentas_res = await client.get(f"/api/v1/cuentas/empresas/{empresa_id}", headers=headers)
    assert cuentas_res.status_code == 200
    cuentas = cuentas_res.json()
    assert len(cuentas) > 40, "El PUC no fue sembrado correctamente"

    # 5. Probar búsqueda ultra-rápida de cuentas (para el DataGrid)
    search_res = await client.get(f"/api/v1/cuentas/empresas/{empresa_id}/buscar?q=BANCO", headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data) >= 2
    assert any("BANCOS NACIONALES" in c["descripcion"] for c in search_data)
