# 📐 ESPECIFICACIÓN TÉCNICA 03: AUTOMATIZACIÓN FISCAL, RETENCIONES Y OCR OPEN SOURCE

> **Módulo:** Contabilidad Fiscal / SENIAT & Captura Inteligente  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 3  

---

## 1. 🎯 Objetivo
Automatizar el registro y liquidación tributaria en Venezuela (Retenciones de IVA e ISLR en compras y ventas, Libros Fiscales de IVA, exportación en formato TXT del SENIAT) e incorporar el servicio de escaneo de facturas mediante **Tesseract OCR (Open Source)** sin costos de suscripción a APIs externas.

---

## 2. 🗃️ Modelo de Datos

### 2.1. `facturas_fiscales` (Compras y Ventas)
- `id`: UUID (PK)
- `empresa_id`: UUID (FK con RLS)
- `tipo_operacion`: VARCHAR(10) NOT NULL -- 'COMPRA', 'VENTA'
- `fecha_emision`: DATE NOT NULL
- `auxiliar_id`: UUID (FK a `auxiliares.id` NOT NULL - Proveedor o Cliente)
- `numero_factura`: VARCHAR(50) NOT NULL
- `numero_control`: VARCHAR(50) NOT NULL
- `monto_exento`: NUMERIC(18, 2) DEFAULT 0.00
- `base_imponible`: NUMERIC(18, 2) NOT NULL
- `alicuota_iva`: NUMERIC(5, 2) DEFAULT 16.00  -- 16%, 8%, 31%
- `monto_iva`: NUMERIC(18, 2) NOT NULL
- `monto_total`: NUMERIC(18, 2) NOT NULL
- `porcentaje_retencion_iva`: NUMERIC(5, 2) DEFAULT 75.00  -- 75% o 100% para Sujetos Pasivos Especiales
- `monto_retencion_iva`: NUMERIC(18, 2) DEFAULT 0.00
- `codigo_concepto_islr`: VARCHAR(20) (Nullable)
- `porcentaje_retencion_islr`: NUMERIC(5, 2) DEFAULT 0.00
- `sustraendo_islr`: NUMERIC(18, 2) DEFAULT 0.00
- `monto_retencion_islr`: NUMERIC(18, 2) DEFAULT 0.00
- `comprobante_contable_id`: UUID (FK a `comprobantes.id` autogenerado)
- `imagen_url`: TEXT (Nullable, imagen de la factura escaneada)
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.2. `comprobantes_retencion_iva`
- `id`: UUID (PK)
- `empresa_id`: UUID (FK con RLS)
- `numero_comprobante`: VARCHAR(14) NOT NULL -- Formato SENIAT: AAAAMMNº (ej: 20261000000001)
- `periodo_fiscal`: VARCHAR(6) NOT NULL -- AAAAMM
- `fecha`: DATE NOT NULL
- `factura_id`: UUID (FK a `facturas_fiscales.id`)
- `monto_retenido`: NUMERIC(18, 2) NOT NULL
- `declarado_seniat`: BOOLEAN DEFAULT FALSE

---

## 3. 🔍 Algoritmo de Extracción OCR (Tesseract + Heurísticas Regex)

Al recibir una imagen (JPG/PNG) o PDF:
1. **Pre-procesamiento:** Conversión a escala de grises y binarización Otsu para optimizar contraste.
2. **Extracción Tesseract:** Idioma español (`spa`) con `pytesseract`.
3. **Expresiones Regulares Heurísticas:**
   - **RIF:** `[J|V|G|E|j|v|g|e][\-]?[0-9]{8,9}[\-]?[0-9]`
   - **Número de Factura:** `(?:factura|fact|fac|nro|nº|numero)[\s\:\.\#]*([0-9]{4,15})`
   - **Número de Control:** `(?:control|ctrl|nro\.?\s*control)[\s\:\.\#]*([0-9]{2}[\-0-9]{4,15})`
   - **Base Imponible / Subtotal:** `(?:subtotal|base|imponible|gravable)[\s\:\$Bs\.]*([0-9\.\,]+)`
   - **Total:** `(?:total|monto total|total a pagar)[\s\:\$Bs\.]*([0-9\.\,]+)`
4. Retorna propuesta estructurada para validación humana en pantalla con 1 clic.

---

## 4. 📄 Generación del Archivo TXT de Retenciones (SENIAT)

Estructura posicional obligatoria separada por tabulador o pipe según formato estándar del portal fiscal:
`RIF_AGENTE\tPERIODO\tFECHA_FACTURA\tTIPO_OP\tTIPO_DOC\tRIF_PROVEEDOR\tNUM_FACTURA\tNUM_CONTROL\tTOTAL\tBASE\tIVA\tNUM_COMPROBANTE\tRETENIDO\t0\tEXENTO\tALICUOTA`
