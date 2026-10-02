import pytest
import uuid
from httpx import AsyncClient
from app.core.security import get_password_hash, create_access_token
from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.services.puc_seed import seed_puc_ven_nif
from sqlalchemy import select
from app.models.cuenta import CuentaContable

@pytest.mark.asyncio
async def test_motor_asientos_partida_doble_and_bimoneda(client: AsyncClient, db_session):
    # 1. Crear Empresa con PUC
    empresa_id = uuid.uuid4()
    empresa = Empresa(
        id=empresa_id,
        codigo="EMP-VOUCHERS",
        razon_social="Comercializadora Kantio C.A.",
        rif="J-30111222-3",
        activo=True
    )
    db_session.add(empresa)
    await db_session.commit()
    await seed_puc_ven_nif(db_session, empresa_id)

    # 2. Crear Contador y generar token
    contador = Usuario(
        id=uuid.uuid4(),
        email="contador@kantio.online",
        hashed_password=get_password_hash("Password123!"),
        nombre_completo="Lic. Juan Contador",
        tipo_usuario="EMPRESA_INTERNO",
        rol="CONTADOR_SENIOR",
        empresa_id=empresa_id,
        activo=True
    )
    db_session.add(contador)
    await db_session.commit()

    token = create_access_token(
        subject=str(contador.id),
        extra_claims={"empresa_id": str(empresa_id), "rol": contador.rol, "tipo_usuario": contador.tipo_usuario}
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Obtener cuentas operativas para el asiento: Caja (1.1.01.001) y Ventas (4.1.01.001)
    caja = (await db_session.execute(
        select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == "1.1.01.001")
    )).scalars().first()
    
    ventas = (await db_session.execute(
        select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == "4.1.01.001")
    )).scalars().first()

    # 3. Test Asiento Cuadrado en VES y USD (Tasa BCV 40.00)
    tasa_bcv = 40.00
    monto_usd = 100.00
    monto_ves = monto_usd * tasa_bcv  # 4000.00

    payload_valido = {
        "numero": "2026-10-001",
        "fecha": "2026-10-01",
        "tipo": "DIARIO",
        "concepto": "Venta de contado del día según factura #001",
        "tasa_cambio": tasa_bcv,
        "estado": "ASENTADO",
        "renglones": [
            {
                "numero_linea": 1,
                "cuenta_id": str(caja.id),
                "descripcion": "Ingreso a Caja Principal por venta",
                "monto_debito_base": monto_ves,
                "monto_credito_base": 0.0,
                "monto_debito_divisa": monto_usd,
                "monto_credito_divisa": 0.0
            },
            {
                "numero_linea": 2,
                "cuenta_id": str(ventas.id),
                "descripcion": "Ingreso por ventas de contado",
                "monto_debito_base": 0.0,
                "monto_credito_base": monto_ves,
                "monto_debito_divisa": 0.0,
                "monto_credito_divisa": monto_usd
            }
        ]
    }

    res_valido = await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=payload_valido, headers=headers)
    assert res_valido.status_code == 201, res_valido.text
    comp_data = res_valido.json()
    assert comp_data["estado"] == "ASENTADO"
    assert comp_data["total_debito_base"] == 4000.00
    assert comp_data["total_credito_base"] == 4000.00
    assert comp_data["total_debito_divisa"] == 100.00
    assert comp_data["total_credito_divisa"] == 100.00
    assert len(comp_data["renglones"]) == 2

    # 4. Test Descuadre Contable en Asentado (Debe Fallar con Error 422)
    payload_descuadrado = {
        "numero": "2026-10-002",
        "fecha": "2026-10-01",
        "concepto": "Asiento con descuadre intencional",
        "tasa_cambio": 40.0,
        "estado": "ASENTADO",
        "renglones": [
            {
                "numero_linea": 1,
                "cuenta_id": str(caja.id),
                "descripcion": "Caja",
                "monto_debito_base": 100.0,
                "monto_credito_base": 0.0,
                "monto_debito_divisa": 2.5,
                "monto_credito_divisa": 0.0
            },
            {
                "numero_linea": 2,
                "cuenta_id": str(ventas.id),
                "descripcion": "Venta",
                "monto_debito_base": 0.0,
                "monto_credito_base": 80.0,  # Descuadrado por 20 Bs
                "monto_debito_divisa": 0.0,
                "monto_credito_divisa": 2.0   # Descuadrado por 0.5 USD
            }
        ]
    }
    res_invalido = await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=payload_descuadrado, headers=headers)
    assert res_invalido.status_code == 422, "Un asiento descuadrado en estado ASENTADO debe ser rechazado"

    # 5. Test Bloqueo de Auditor Externo (Read-Only)
    auditor = Usuario(
        id=uuid.uuid4(),
        email="auditor@firmakpmg.com",
        hashed_password=get_password_hash("AuditSecret!"),
        nombre_completo="Lic. Auditor Externo",
        tipo_usuario="ESTUDIO_MIEMBRO",
        rol="AUDITOR_EXTERNO",
        activo=True
    )
    db_session.add(auditor)
    await db_session.commit()

    token_auditor = create_access_token(
        subject=str(auditor.id),
        extra_claims={"empresa_id": str(empresa_id), "rol": auditor.rol, "tipo_usuario": auditor.tipo_usuario}
    )
    headers_auditor = {"Authorization": f"Bearer {token_auditor}"}

    payload_auditor = payload_valido.copy()
    payload_auditor["numero"] = "2026-10-AUDIT"
    res_audit = await client.post(f"/api/v1/asientos/empresas/{empresa_id}", json=payload_auditor, headers=headers_auditor)
    assert res_audit.status_code == 403, "Los auditores externos no pueden crear asientos"
