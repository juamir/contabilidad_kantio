from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.fiscal import FacturaFiscal, ComprobanteRetencionIva
from app.models.empresa import Empresa
from app.models.auxiliar import Auxiliar
from app.models.usuario import Usuario
from app.services.ocr_service import extraer_datos_factura_ocr, parse_factura_text
from app.services.fiscal_engine import calcular_retenciones, generar_txt_seniat_retenciones_iva
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class FacturaFiscalCreate(BaseModel):
    tipo_operacion: str = "COMPRA"  # COMPRA, VENTA
    fecha_emision: date = date.today()
    rif_tercero: str
    nombre_tercero: str
    numero_factura: str
    numero_control: str
    monto_exento: float = 0.0
    base_imponible: float
    alicuota_iva: float = 16.0
    porcentaje_retencion_iva: float = 75.0
    porcentaje_retencion_islr: float = 0.0

class FacturaFiscalOut(BaseModel):
    id: UUID
    empresa_id: UUID
    tipo_operacion: str
    fecha_emision: date
    numero_factura: str
    numero_control: str
    base_imponible: float
    monto_iva: float
    monto_total: float
    monto_retencion_iva: float
    monto_retencion_islr: float

    class Config:
        from_attributes = True

@router.post("/facturas/ocr-extraer")
async def ocr_extraer_factura(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Escanea la factura usando Tesseract OCR Open Source y heurísticas Regex.
    Cero costos en licencias de IA.
    """
    contents = await file.read()
    datos = extraer_datos_factura_ocr(contents)
    return {
        "status": "success",
        "datos_extraidos": datos,
        "mensaje": "Factura analizada con éxito. Verifique los campos antes de asentar."
    }

@router.post("/empresas/{empresa_id}/facturas", response_model=FacturaFiscalOut, status_code=status.HTTP_201_CREATED)
async def registrar_factura_fiscal(
    empresa_id: UUID,
    fact_in: FacturaFiscalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Registra una factura de compra o venta, calcula automáticamente las retenciones de IVA e ISLR,
    y genera el comprobante de retención.
    """
    monto_iva = round(fact_in.base_imponible * (fact_in.alicuota_iva / 100.0), 2)
    monto_total = round(fact_in.base_imponible + monto_iva + fact_in.monto_exento, 2)

    retenciones = calcular_retenciones(
        base_imponible=fact_in.base_imponible,
        monto_iva=monto_iva,
        porcentaje_ret_iva=fact_in.porcentaje_retencion_iva,
        porcentaje_ret_islr=fact_in.porcentaje_retencion_islr
    )

    # Buscar o crear Auxiliar (Tercero)
    stmt_aux = select(Auxiliar).where(
        Auxiliar.empresa_id == empresa_id,
        Auxiliar.rif_cedula == fact_in.rif_tercero.upper()
    )
    aux = (await db.execute(stmt_aux)).scalars().first()
    if not aux:
        aux = Auxiliar(
            empresa_id=empresa_id,
            codigo=fact_in.rif_tercero.upper(),
            nombre_razon_social=fact_in.nombre_tercero,
            rif_cedula=fact_in.rif_tercero.upper(),
            tipo_auxiliar="PROVEEDOR" if fact_in.tipo_operacion == "COMPRA" else "CLIENTE"
        )
        db.add(aux)
        await db.flush()

    factura = FacturaFiscal(
        empresa_id=empresa_id,
        tipo_operacion=fact_in.tipo_operacion,
        fecha_emision=fact_in.fecha_emision,
        auxiliar_id=aux.id,
        numero_factura=fact_in.numero_factura,
        numero_control=fact_in.numero_control,
        monto_exento=fact_in.monto_exento,
        base_imponible=fact_in.base_imponible,
        alicuota_iva=fact_in.alicuota_iva,
        monto_iva=monto_iva,
        monto_total=monto_total,
        porcentaje_retencion_iva=fact_in.porcentaje_retencion_iva,
        monto_retencion_iva=retenciones["monto_retencion_iva"],
        porcentaje_retencion_islr=fact_in.porcentaje_retencion_islr,
        monto_retencion_islr=retenciones["monto_retencion_islr"]
    )
    db.add(factura)
    await db.flush()

    # Si hubo retención de IVA, generar comprobante oficial
    if retenciones["monto_retencion_iva"] > 0:
        periodo_str = fact_in.fecha_emision.strftime("%Y%m")
        # Generar número de comprobante tipo AAAAMM00000001
        num_comp = f"{periodo_str}00000001"
        comprobante_ret = ComprobanteRetencionIva(
            empresa_id=empresa_id,
            numero_comprobante=num_comp,
            periodo_fiscal=periodo_str,
            fecha=fact_in.fecha_emision,
            factura_id=factura.id,
            monto_retenido=retenciones["monto_retencion_iva"],
            declarado_seniat=False
        )
        db.add(comprobante_ret)

    await db.commit()
    await db.refresh(factura)
    return factura

@router.get("/empresas/{empresa_id}/retenciones-txt")
async def descargar_txt_seniat(
    empresa_id: UUID,
    periodo: str,  # AAAAMM
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera y descarga el archivo TXT para el portal del SENIAT con todas las retenciones del periodo.
    """
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    stmt = (
        select(ComprobanteRetencionIva, FacturaFiscal, Auxiliar)
        .join(FacturaFiscal, ComprobanteRetencionIva.factura_id == FacturaFiscal.id)
        .join(Auxiliar, FacturaFiscal.auxiliar_id == Auxiliar.id)
        .where(
            ComprobanteRetencionIva.empresa_id == empresa_id,
            ComprobanteRetencionIva.periodo_fiscal == periodo
        )
    )
    rows = (await db.execute(stmt)).all()

    items = []
    for ret, fact, aux in rows:
        items.append({
            "rif_proveedor": aux.rif_cedula,
            "fecha_factura": fact.fecha_emision,
            "numero_factura": fact.numero_factura,
            "numero_control": fact.numero_control,
            "monto_total": float(fact.monto_total),
            "base_imponible": float(fact.base_imponible),
            "monto_iva": float(fact.monto_iva),
            "numero_comprobante": ret.numero_comprobante,
            "monto_retenido": float(ret.monto_retenido),
            "monto_exento": float(fact.monto_exento),
            "alicuota": float(fact.alicuota_iva)
        })

    txt_content = generar_txt_seniat_retenciones_iva(
        rif_agente=empresa.rif,
        periodo_fiscal=periodo,
        comprobantes=items
    )

    return Response(
        content=txt_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=SENIAT_RET_{empresa.rif}_{periodo}.txt"}
    )
