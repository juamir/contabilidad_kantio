import re
import io
from typing import Dict, Any, Optional
from PIL import Image

def parse_factura_text(raw_text: str) -> Dict[str, Any]:
    """
    Aplica heurísticas de expresiones regulares sobre el texto extraído por OCR
    para obtener los campos fiscales venezolanos.
    """
    resultado = {
        "rif_emisor": None,
        "numero_factura": None,
        "numero_control": None,
        "base_imponible": 0.0,
        "alicuota_iva": 16.0,
        "monto_iva": 0.0,
        "monto_total": 0.0,
        "monto_exento": 0.0,
        "confianza": "ALTA"
    }

    # 1. Extraer RIF (ej. J-12345678-9, J123456789, V-14234567-0)
    rif_match = re.search(r'\b([J|V|G|E|j|v|g|e][\-]?[0-9]{7,9}[\-]?[0-9])\b', raw_text)
    if rif_match:
        resultado["rif_emisor"] = rif_match.group(1).upper()

    # 2. Extraer Número de Factura
    fac_match = re.search(r'(?:factura|fact|fac|nro|nº|numero)[\s\:\.\#\º]*([0-9]{3,15})', raw_text, re.IGNORECASE)
    if fac_match:
        resultado["numero_factura"] = fac_match.group(1)

    # 3. Extraer Número de Control (ej. 00-12345 o 0012345)
    ctrl_match = re.search(r'(?:control|ctrl|nro\.?\s*control)[\s\:\.\#\º]*([0-9]{2}[\-]?[0-9]{4,10})', raw_text, re.IGNORECASE)
    if ctrl_match:
        resultado["numero_control"] = ctrl_match.group(1)

    # Función auxiliar para convertir texto monetario a float
    def parse_monto(val_str: str) -> float:
        clean = val_str.replace("Bs.", "").replace("Bs", "").replace("$", "").strip()
        # Normalizar separador de miles y decimales
        if "," in clean and "." in clean:
            if clean.rfind(",") > clean.rfind("."):
                # Formato europeo/latam: 1.250,50
                clean = clean.replace(".", "").replace(",", ".")
            else:
                # Formato US: 1,250.50
                clean = clean.replace(",", "")
        elif "," in clean:
            clean = clean.replace(",", ".")
        try:
            return float(clean)
        except ValueError:
            return 0.0

    # 4. Extraer Base Imponible / Subtotal
    sub_match = re.search(r'(?:subtotal|base|imponible|gravable)[\s\:\$Bs\.]*([0-9\.\,]+)', raw_text, re.IGNORECASE)
    if sub_match:
        resultado["base_imponible"] = parse_monto(sub_match.group(1))

    # 5. Extraer IVA (ej. IVA: 80, IVA (16%): 80,00, IVA 16%: 80.00)
    iva_match = re.search(r'(?:i\.?v\.?a\.?(?:\s*\([^\)]*\))?|impuesto)[\s\:\$Bs\.\=\-]*([0-9\.\,]+)', raw_text, re.IGNORECASE)
    if iva_match:
        resultado["monto_iva"] = parse_monto(iva_match.group(1))

    # 6. Extraer Total
    tot_match = re.search(r'(?:total|monto total|total a pagar)[\s\:\$Bs\.]*([0-9\.\,]+)', raw_text, re.IGNORECASE)
    if tot_match:
        resultado["monto_total"] = parse_monto(tot_match.group(1))

    # Coherencia matemática: Si tenemos base e IVA pero no total
    if resultado["base_imponible"] > 0 and resultado["monto_total"] == 0:
        if resultado["monto_iva"] == 0:
            resultado["monto_iva"] = round(resultado["base_imponible"] * 0.16, 2)
        resultado["monto_total"] = round(resultado["base_imponible"] + resultado["monto_iva"], 2)

    return resultado

def extraer_datos_factura_ocr(image_bytes: bytes) -> Dict[str, Any]:
    """
    Ejecuta Tesseract OCR sobre la imagen suministrada y parsea los campos fiscales.
    Cero costos externos.
    """
    try:
        import pytesseract
        image = Image.open(io.BytesIO(image_bytes))
        raw_text = pytesseract.image_to_string(image, lang='spa')
    except Exception as e:
        # Si Tesseract no está instalado en el SO local, retorna fallback
        raw_text = ""

    parsed = parse_factura_text(raw_text)
    parsed["raw_ocr_text"] = raw_text[:500] if raw_text else None
    return parsed
