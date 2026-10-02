from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.comprobante import Comprobante, ComprobanteRenglon
from app.models.cuenta import CuentaContable
from app.models.usuario import Usuario
from app.schemas.comprobante import (
    ComprobanteCreate, ComprobanteOut, ComprobanteListOut
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/empresas/{empresa_id}", response_model=List[ComprobanteListOut])
async def list_comprobantes(
    empresa_id: UUID,
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(Comprobante).where(Comprobante.empresa_id == empresa_id)
    if estado:
        stmt = stmt.where(Comprobante.estado == estado)
    if tipo:
        stmt = stmt.where(Comprobante.tipo == tipo)
    if fecha_desde:
        stmt = stmt.where(Comprobante.fecha >= fecha_desde)
    if fecha_hasta:
        stmt = stmt.where(Comprobante.fecha <= fecha_hasta)
        
    stmt = stmt.order_by(Comprobante.fecha.desc(), Comprobante.numero.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{comprobante_id}", response_model=ComprobanteOut)
async def get_comprobante(
    comprobante_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = (
        select(Comprobante)
        .options(selectinload(Comprobante.renglones))
        .where(Comprobante.id == comprobante_id)
    )
    result = await db.execute(stmt)
    comp = result.scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")
    return comp

@router.post("/empresas/{empresa_id}", response_model=ComprobanteOut, status_code=status.HTTP_201_CREATED)
async def create_comprobante(
    empresa_id: UUID,
    comp_in: ComprobanteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validar permiso de escritura: Auditores externos solo pueden leer
    if current_user.rol == "AUDITOR_EXTERNO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Los auditores externos tienen perfil estricto de solo lectura. No pueden asentar comprobantes."
        )

    # Validar que el número no esté duplicado
    stmt_num = select(Comprobante).where(
        Comprobante.empresa_id == empresa_id,
        Comprobante.numero == comp_in.numero
    )
    if (await db.execute(stmt_num)).scalars().first():
        raise HTTPException(status_code=400, detail=f"Ya existe un comprobante con el número {comp_in.numero}.")

    # Validar que las cuentas involucradas permitan movimiento
    cuenta_ids = [r.cuenta_id for r in comp_in.renglones]
    stmt_cuentas = select(CuentaContable).where(
        CuentaContable.id.in_(cuenta_ids),
        CuentaContable.empresa_id == empresa_id
    )
    cuentas_db = (await db.execute(stmt_cuentas)).scalars().all()
    cuentas_dict = {c.id: c for c in cuentas_db}

    if len(cuentas_dict) != len(set(cuenta_ids)):
        raise HTTPException(status_code=400, detail="Una o más cuentas contables no pertenecen a esta empresa.")

    for r in comp_in.renglones:
        cuenta = cuentas_dict[r.cuenta_id]
        if not cuenta.permite_movimiento:
            raise HTTPException(
                status_code=400,
                detail=f"La cuenta {cuenta.codigo} - {cuenta.descripcion} es totalizadora y no permite movimientos directos."
            )

    # Calcular totales
    total_deb_base = sum(r.monto_debito_base for r in comp_in.renglones)
    total_cre_base = sum(r.monto_credito_base for r in comp_in.renglones)
    total_deb_div = sum(r.monto_debito_divisa for r in comp_in.renglones)
    total_cre_div = sum(r.monto_credito_divisa for r in comp_in.renglones)

    comprobante = Comprobante(
        empresa_id=empresa_id,
        numero=comp_in.numero,
        fecha=comp_in.fecha,
        tipo=comp_in.tipo,
        concepto=comp_in.concepto,
        tasa_cambio=comp_in.tasa_cambio,
        estado=comp_in.estado,
        total_debito_base=total_deb_base,
        total_credito_base=total_cre_base,
        total_debito_divisa=total_deb_div,
        total_credito_divisa=total_cre_div,
        creado_por_usuario_id=current_user.id,
        creado_tipo_usuario=current_user.tipo_usuario,
        estudio_id=current_user.estudio_id,
        asentado_at=datetime.utcnow() if comp_in.estado == "ASENTADO" else None
    )
    db.add(comprobante)
    await db.flush()

    for r in comp_in.renglones:
        renglon = ComprobanteRenglon(
            comprobante_id=comprobante.id,
            empresa_id=empresa_id,
            numero_linea=r.numero_linea,
            cuenta_id=r.cuenta_id,
            descripcion=r.descripcion,
            auxiliar_id=r.auxiliar_id,
            centro_costo_id=r.centro_costo_id,
            tipo_documento=r.tipo_documento,
            numero_documento=r.numero_documento,
            monto_debito_base=r.monto_debito_base,
            monto_credito_base=r.monto_credito_base,
            monto_debito_divisa=r.monto_debito_divisa,
            monto_credito_divisa=r.monto_credito_divisa
        )
        db.add(renglon)

    await db.commit()
    
    # Recargar con relaciones
    stmt_full = (
        select(Comprobante)
        .options(selectinload(Comprobante.renglones))
        .where(Comprobante.id == comprobante.id)
    )
    return (await db.execute(stmt_full)).scalars().first()

@router.post("/{comprobante_id}/asentar", response_model=ComprobanteOut)
async def asentar_comprobante(
    comprobante_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Finaliza y sella un comprobante en borrador verificando cuadre estricto de partida doble.
    """
    if current_user.rol == "AUDITOR_EXTERNO":
        raise HTTPException(status_code=403, detail="Los auditores externos no pueden asentar comprobantes.")

    stmt = select(Comprobante).options(selectinload(Comprobante.renglones)).where(Comprobante.id == comprobante_id)
    comp = (await db.execute(stmt)).scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")

    if comp.estado == "ASENTADO":
        raise HTTPException(status_code=400, detail="El comprobante ya se encuentra asentado.")
    if comp.estado == "ANULADO":
        raise HTTPException(status_code=400, detail="No se puede asentar un comprobante anulado.")

    # Validar cuadre estricto
    dif_base = round(abs(comp.total_debito_base - comp.total_credito_base), 2)
    if dif_base > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede asentar: Descuadre en Moneda Base (Diferencia: {dif_base})"
        )

    dif_divisa = round(abs(comp.total_debito_divisa - comp.total_credito_divisa), 2)
    if dif_divisa > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede asentar: Descuadre en Divisa (Diferencia: {dif_divisa})"
        )

    comp.estado = "ASENTADO"
    comp.asentado_at = datetime.utcnow()
    await db.commit()
    await db.refresh(comp)
    return comp

@router.put("/{comprobante_id}", response_model=ComprobanteOut)
async def update_comprobante(
    comprobante_id: UUID,
    comp_in: ComprobanteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol == "AUDITOR_EXTERNO":
        raise HTTPException(status_code=403, detail="Los auditores externos no pueden modificar comprobantes.")

    stmt = select(Comprobante).options(selectinload(Comprobante.renglones)).where(Comprobante.id == comprobante_id)
    comp = (await db.execute(stmt)).scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")

    if comp.estado == "ASENTADO":
        raise HTTPException(status_code=400, detail="No se puede modificar un comprobante ya ASENTADO. Debe crear un asiento de ajuste o reversión.")
    if comp.estado == "ANULADO":
        raise HTTPException(status_code=400, detail="No se puede modificar un comprobante ANULADO.")

    # Actualizar cabecera
    comp.numero = comp_in.numero
    comp.fecha = comp_in.fecha
    comp.tipo = comp_in.tipo
    comp.concepto = comp_in.concepto
    comp.tasa_cambio = comp_in.tasa_cambio
    comp.estado = comp_in.estado

    # Calcular totales
    comp.total_debito_base = sum(r.monto_debito_base for r in comp_in.renglones)
    comp.total_credito_base = sum(r.monto_credito_base for r in comp_in.renglones)
    comp.total_debito_divisa = sum(r.monto_debito_divisa for r in comp_in.renglones)
    comp.total_credito_divisa = sum(r.monto_credito_divisa for r in comp_in.renglones)

    # Reemplazar renglones
    comp.renglones.clear()
    await db.flush()

    for r in comp_in.renglones:
        renglon = ComprobanteRenglon(
            comprobante_id=comp.id,
            empresa_id=comp.empresa_id,
            numero_linea=r.numero_linea,
            cuenta_id=r.cuenta_id,
            descripcion=r.descripcion,
            auxiliar_id=r.auxiliar_id,
            centro_costo_id=r.centro_costo_id,
            tipo_documento=r.tipo_documento,
            numero_documento=r.numero_documento,
            monto_debito_base=r.monto_debito_base,
            monto_credito_base=r.monto_credito_base,
            monto_debito_divisa=r.monto_debito_divisa,
            monto_credito_divisa=r.monto_credito_divisa
        )
        db.add(renglon)

    await db.commit()
    await db.refresh(comp)
    return comp

@router.post("/{comprobante_id}/anular", response_model=ComprobanteOut)
async def anular_comprobante(
    comprobante_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol in ["AUDITOR_EXTERNO", "ASISTENTE_CONTABLE"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para anular comprobantes contables.")

    stmt = select(Comprobante).options(selectinload(Comprobante.renglones)).where(Comprobante.id == comprobante_id)
    comp = (await db.execute(stmt)).scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")

    comp.estado = "ANULADO"
    await db.commit()
    await db.refresh(comp)
    return comp

@router.delete("/{comprobante_id}", status_code=status.HTTP_200_OK)
async def delete_comprobante(
    comprobante_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol in ["AUDITOR_EXTERNO", "ASISTENTE_CONTABLE"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para eliminar comprobantes.")

    stmt = select(Comprobante).where(Comprobante.id == comprobante_id)
    comp = (await db.execute(stmt)).scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")

    if comp.estado == "ASENTADO":
        raise HTTPException(status_code=400, detail="Por normas VEN-NIF y trazabilidad fiscal, un comprobante ASENTADO no puede ser eliminado físicamente. Debe ser ANULADO.")

    await db.delete(comp)
    await db.commit()
    return {"status": "success", "message": "Comprobante eliminado con éxito.", "id": str(comprobante_id)}

@router.post("/empresas/{empresa_id}/procesar-lote")
async def procesar_lote_comprobantes(
    empresa_id: UUID,
    operacion: str = Query(..., pattern="^(PROCESAR|REVERSAR)$"),
    desde: date = Query(...),
    hasta: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Procesar comprobantes en lote (Profit Plus Contabilidad 013).
    - PROCESAR: Pasa comprobantes BORRADOR/REVISADO a ASENTADO verificando cuadre.
    - REVERSAR: Pasa comprobantes ASENTADO a BORRADOR para permitir correcciones (si el periodo no está cerrado).
    """
    if current_user.rol in ["AUDITOR_EXTERNO", "ASISTENTE_CONTABLE"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para procesar o reversar comprobantes en lote.")

    stmt = (
        select(Comprobante)
        .options(selectinload(Comprobante.renglones))
        .where(
            Comprobante.empresa_id == empresa_id,
            Comprobante.fecha >= desde,
            Comprobante.fecha <= hasta
        )
    )
    result = await db.execute(stmt)
    comprobantes = result.scalars().all()

    procesados = 0
    errores = []

    for comp in comprobantes:
        if operacion == "PROCESAR" and comp.estado in ["BORRADOR", "REVISADO"]:
            dif_base = round(abs(comp.total_debito_base - comp.total_credito_base), 2)
            dif_divisa = round(abs(comp.total_debito_divisa - comp.total_credito_divisa), 2)
            if dif_base > 0.01 or dif_divisa > 0.01:
                errores.append(f"Comprobante #{comp.numero} descuadrado (dif: {dif_base})")
                continue
            comp.estado = "ASENTADO"
            comp.asentado_at = datetime.utcnow()
            procesados += 1
        elif operacion == "REVERSAR" and comp.estado == "ASENTADO":
            comp.estado = "BORRADOR"
            comp.asentado_at = None
            procesados += 1

    await db.commit()
    return {
        "status": "success",
        "operacion": operacion,
        "total_encontrados": len(comprobantes),
        "total_procesados": procesados,
        "errores": errores
    }


