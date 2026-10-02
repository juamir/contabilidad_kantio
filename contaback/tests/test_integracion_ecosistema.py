import pytest
import uuid
from httpx import AsyncClient
from app.models.empresa import Empresa
from app.models.usuario import Usuario
from app.services.puc_seed import seed_puc_ven_nif
from app.core.security import get_password_hash, create_access_token
from sqlalchemy import select
from app.models.comprobante import Comprobante

@pytest.mark.asyncio
async def test_integracion_automatica_nomina_and_pos(client: AsyncClient, db_session):
    empresa_id = uuid.uuid4()
    empresa = Empresa(
        id=empresa_id,
        codigo="EMP-INTEGRADA",
        razon_social="Holding Comercial Ecosistema C.A.",
        rif="J-12998877-4",
        activo=True
    )
    db_session.add(empresa)
    await db_session.commit()
    await seed_puc_ven_nif(db_session, empresa_id)

    user = Usuario(
        id=uuid.uuid4(),
        email="api@kantio.online",
        hashed_password=get_password_hash("ApiPass123!"),
        nombre_completo="Sistema Automatizado",
        tipo_usuario="KANTIO_ADMIN",
        rol="ADMIN_EMPRESA",
        empresa_id=empresa_id,
        activo=True
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(subject=str(user.id), extra_claims={"empresa_id": str(empresa_id), "rol": user.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Contabilizar Nómina Quincenal desde Kantio Nómina
    # Sueldos: 5,000 | Cestaticket: 2,000 | Retenciones: 500 | Neto Pagado: 6,500 (Total = 7,000)
    payload_nomina = {
        "numero_comprobante": "NOM-2026-Q1",
        "fecha": "2026-10-15",
        "concepto": "Nómina 1ra Quincena Octubre 2026",
        "tasa_cambio": 40.0,
        "total_sueldos": 5000.0,
        "total_cestaticket": 2000.0,
        "total_retenciones_ley": 500.0,
        "total_neto_pagado": 6500.0
    }
    res_nom = await client.post(f"/api/v1/integracion/empresas/{empresa_id}/nomina", json=payload_nomina, headers=headers)
    assert res_nom.status_code == 201, res_nom.text
    assert res_nom.json()["status"] == "success"

    # Verificar que el comprobante quedó asentado en la BD
    comp_nom = (await db_session.execute(
        select(Comprobante).where(Comprobante.empresa_id == empresa_id, Comprobante.numero == "NOM-2026-Q1")
    )).scalars().first()
    assert comp_nom is not None
    assert comp_nom.estado == "ASENTADO"
    assert comp_nom.total_debito_base == 7000.0
    assert comp_nom.total_credito_base == 7000.0

    # 2. Contabilizar Cierre Z de Ventas desde FastPOS
    # Efectivo: 1,160 | Tarjetas: 2,320 (Total Cobrado = 3,480)
    # Ventas: 3,000 | IVA 16%: 480 (Total Ventas = 3,480)
    payload_pos = {
        "numero_comprobante": "POS-2026-Z01",
        "fecha": "2026-10-01",
        "concepto": "Cierre Z Diario #01 FastPOS",
        "tasa_cambio": 40.0,
        "total_efectivo": 1160.0,
        "total_punto_de_venta": 2320.0,
        "base_imponible_ventas": 3000.0,
        "debito_fiscal_iva": 480.0
    }
    res_pos = await client.post(f"/api/v1/integracion/empresas/{empresa_id}/pos", json=payload_pos, headers=headers)
    assert res_pos.status_code == 201, res_pos.text
    assert res_pos.json()["status"] == "success"

    comp_pos = (await db_session.execute(
        select(Comprobante).where(Comprobante.empresa_id == empresa_id, Comprobante.numero == "POS-2026-Z01")
    )).scalars().first()
    assert comp_pos is not None
    assert comp_pos.estado == "ASENTADO"
    assert comp_pos.total_debito_base == 3480.0
    assert comp_pos.total_credito_base == 3480.0
