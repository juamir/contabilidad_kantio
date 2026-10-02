import pytest
import uuid
from httpx import AsyncClient
from app.services.fiscal_engine import calcular_retenciones, generar_txt_seniat_retenciones_iva
from app.services.ocr_service import parse_factura_text
from app.models.empresa import Empresa
from app.models.usuario import Usuario
from app.core.security import get_password_hash, create_access_token

def test_calculo_retenciones_iva_75_percent():
    base = 1000.00
    iva = 160.00  # 16%
    res = calcular_retenciones(base_imponible=base, monto_iva=iva, porcentaje_ret_iva=75.0, porcentaje_ret_islr=2.0)
    
    assert res["monto_retencion_iva"] == 120.00  # 75% de 160
    assert res["monto_retencion_islr"] == 20.00   # 2% de 1000
    assert res["monto_neto_a_pagar"] == 1020.00  # 1160 - 120 - 20

def test_parse_factura_regex_heuristics():
    sample_text = """
    INVERSIONES Y SERVICIOS TECNOLOGICOS C.A.
    RIF: J-30456789-1
    FACTURA Nº 0001245
    NUMERO CONTROL: 00-008912
    FECHA: 01/10/2026
    
    DESCRIPCION: Servicios de Mantenimiento Servidor
    BASE IMPONIBLE: 500,00
    IVA (16%): 80,00
    TOTAL A PAGAR: 580,00 Bs.
    """
    parsed = parse_factura_text(sample_text)
    assert parsed["rif_emisor"] == "J-30456789-1"
    assert parsed["numero_factura"] == "0001245"
    assert parsed["numero_control"] == "00-008912"
    assert parsed["base_imponible"] == 500.00
    assert parsed["monto_iva"] == 80.00
    assert parsed["monto_total"] == 580.00

def test_generador_txt_seniat_format():
    rif_agente = "J-12345678-0"
    periodo = "202610"
    comprobantes = [
        {
            "rif_proveedor": "J-30456789-1",
            "fecha_factura": "2026-10-01",
            "numero_factura": "0001245",
            "numero_control": "00-008912",
            "monto_total": 580.00,
            "base_imponible": 500.00,
            "monto_iva": 80.00,
            "numero_comprobante": "20261000000001",
            "monto_retenido": 60.00,
            "monto_exento": 0.00,
            "alicuota": 16.00
        }
    ]
    txt = generar_txt_seniat_retenciones_iva(rif_agente, periodo, comprobantes)
    assert "J123456780\t202610\t2026-10-01\tC\t01\tJ304567891\t0001245" in txt
    assert "20261000000001\t60.00" in txt

@pytest.mark.asyncio
async def test_api_registrar_factura_and_txt_export(client: AsyncClient, db_session):
    empresa_id = uuid.uuid4()
    empresa = Empresa(
        id=empresa_id,
        codigo="EMP-FISCAL-01",
        razon_social="Distribuidora Fiscal C.A.",
        rif="J-40987654-2",
        activo=True
    )
    db_session.add(empresa)

    user = Usuario(
        id=uuid.uuid4(),
        email="fiscal@empresa.com",
        hashed_password=get_password_hash("FiscalPass1!"),
        nombre_completo="Analista Tributario",
        tipo_usuario="EMPRESA_INTERNO",
        rol="ADMIN_EMPRESA",
        empresa_id=empresa_id,
        activo=True
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(subject=str(user.id), extra_claims={"empresa_id": str(empresa_id), "rol": user.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # Registrar factura con retención
    payload = {
        "tipo_operacion": "COMPRA",
        "fecha_emision": "2026-10-01",
        "rif_tercero": "J-11223344-5",
        "nombre_tercero": "Papelería & Suministros C.A.",
        "numero_factura": "0005432",
        "numero_control": "00-001234",
        "monto_exento": 0.0,
        "base_imponible": 2000.0,
        "alicuota_iva": 16.0,
        "porcentaje_retencion_iva": 75.0,
        "porcentaje_retencion_islr": 2.0
    }
    res = await client.post(f"/api/v1/fiscal/empresas/{empresa_id}/facturas", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    fact_data = res.json()
    assert fact_data["monto_iva"] == 320.0
    assert fact_data["monto_retencion_iva"] == 240.0  # 75% de 320

    # Descargar TXT del SENIAT
    res_txt = await client.get(f"/api/v1/fiscal/empresas/{empresa_id}/retenciones-txt?periodo=202610", headers=headers)
    assert res_txt.status_code == 200
    assert "J409876542\t202610" in res_txt.text
    assert "240.00" in res_txt.text
