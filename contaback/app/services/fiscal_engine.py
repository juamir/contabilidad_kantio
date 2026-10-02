from typing import List, Dict, Any
from datetime import date

def calcular_retenciones(
    base_imponible: float,
    monto_iva: float,
    porcentaje_ret_iva: float = 75.0,
    porcentaje_ret_islr: float = 2.0,
    sustraendo_islr: float = 0.0
) -> Dict[str, float]:
    """
    Calcula automáticamente los montos de retención de IVA e ISLR.
    """
    monto_ret_iva = round(monto_iva * (porcentaje_ret_iva / 100.0), 2)
    monto_ret_islr = round(max(0.0, (base_imponible * (porcentaje_ret_islr / 100.0)) - sustraendo_islr), 2)
    monto_neto_pagar = round((base_imponible + monto_iva) - monto_ret_iva - monto_ret_islr, 2)

    return {
        "monto_retencion_iva": monto_ret_iva,
        "monto_retencion_islr": monto_ret_islr,
        "monto_neto_a_pagar": monto_neto_pagar
    }

def generar_txt_seniat_retenciones_iva(
    rif_agente: str,
    periodo_fiscal: str,  # AAAAMM
    comprobantes: List[Dict[str, Any]]
) -> str:
    """
    Genera el archivo TXT para el portal del SENIAT según especificación técnica oficial:
    Campos separados por tabulador (\t):
    1. RIF del Agente de Retención (sin guiones)
    2. Período impositivo (AAAAMM)
    3. Fecha de la Factura (AAAA-MM-DD)
    4. Tipo de Operación (C)
    5. Tipo de Documento (01=Factura, 02=Nota Débito, 03=Nota Crédito)
    6. RIF del Proveedor Retenido
    7. Número de Factura
    8. Número de Control
    9. Monto Total de la Factura
    10. Base Imponible
    11. Monto del IVA
    12. Número del Comprobante de Retención (14 dígitos)
    13. Monto del IVA Retenido
    14. Número de Expediente o 0
    15. Monto Exento
    16. Alícuota impositiva (16.00)
    """
    lineas = []
    rif_agente_clean = rif_agente.replace("-", "").strip().upper()

    for c in comprobantes:
        rif_prov_clean = c["rif_proveedor"].replace("-", "").strip().upper()
        fecha_str = c["fecha_factura"] if isinstance(c["fecha_factura"], str) else c["fecha_factura"].strftime("%Y-%m-%d")
        
        linea = (
            f"{rif_agente_clean}\t"
            f"{periodo_fiscal}\t"
            f"{fecha_str}\t"
            f"C\t"
            f"01\t"
            f"{rif_prov_clean}\t"
            f"{c['numero_factura']}\t"
            f"{c['numero_control']}\t"
            f"{c['monto_total']:.2f}\t"
            f"{c['base_imponible']:.2f}\t"
            f"{c['monto_iva']:.2f}\t"
            f"{c['numero_comprobante']}\t"
            f"{c['monto_retenido']:.2f}\t"
            f"0\t"
            f"{c.get('monto_exento', 0.0):.2f}\t"
            f"{c.get('alicuota', 16.0):.2f}"
        )
        lineas.append(linea)

    return "\r\n".join(lineas)
