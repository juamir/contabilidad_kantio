import pytest
import uuid
from sqlalchemy import select
from app.models.empresa import Empresa
from app.models.cuenta import CuentaContable
from app.services.puc_seed import seed_puc_ven_nif

@pytest.mark.asyncio
async def test_seed_puc_ven_nif_creates_accounts(db_session):
    # 1. Crear empresa de prueba
    empresa_id = uuid.uuid4()
    empresa = Empresa(
        id=empresa_id,
        codigo="EMP-TEST-01",
        razon_social="Inversiones Kantio C.A.",
        rif="J-12345678-9",
        activo=True
    )
    db_session.add(empresa)
    await db_session.commit()

    # 2. Ejecutar seeding de PUC VEN-NIF
    count = await seed_puc_ven_nif(db_session, empresa_id)
    assert count > 40, f"Se esperaban más de 40 cuentas contables estándar, se crearon {count}"

    # 3. Validar cuentas críticas requeridas por la normativa
    stmt = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.codigo == "1.1.01.001"
    )
    caja = (await db_session.execute(stmt)).scalars().first()
    assert caja is not None
    assert caja.descripcion == "CAJA GENERAL"
    assert caja.naturaleza == "DEUDORA"
    assert caja.permite_movimiento is True

    # Validar IGTF
    stmt_igtf = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.codigo == "8.1.01.002"
    )
    igtf = (await db_session.execute(stmt_igtf)).scalars().first()
    assert igtf is not None
    assert "IGTF" in igtf.descripcion
    assert igtf.naturaleza == "DEUDORA"

    # Validar Diferencial Cambiario
    stmt_dif = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.codigo == "7.1.01.002"
    )
    dif = (await db_session.execute(stmt_dif)).scalars().first()
    assert dif is not None
    assert "DIFERENCIAL CAMBIARIO" in dif.descripcion
    assert dif.naturaleza == "ACREEDORA"

    # 4. Validar que no se duplica si se vuelve a llamar
    re_count = await seed_puc_ven_nif(db_session, empresa_id)
    assert re_count == 0
