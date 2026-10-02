from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.cuenta import CuentaContable
from app.models.comprobante import ComprobanteRenglon, Comprobante
from app.models.usuario import Usuario
from app.schemas.cuenta import (
    CuentaContableCreate, CuentaContableOut, CuentaContableUpdate, CuentaTreeNode
)
from app.api.deps import get_current_user

router = APIRouter()

def inferir_clasificacion_contable(codigo: str):
    """
    Infiere automáticamente la naturaleza y el tipo de cuenta según el primer dígito (Estándar VEN-NIF / Profit Plus).
    1: ACTIVO (DEUDORA)
    2: PASIVO (ACREEDORA)
    3: PATRIMONIO (ACREEDORA)
    4: INGRESO (ACREEDORA)
    5: COSTO (DEUDORA)
    6: GASTO (DEUDORA)
    7: OTRO_INGRESO (ACREEDORA)
    8: OTRO_EGRESO (DEUDORA)
    9: ORDEN (DEUDORA)
    """
    primer_char = codigo.strip()[0] if codigo and len(codigo.strip()) > 0 else "1"
    mapping = {
        "1": ("ACTIVO", "DEUDORA"),
        "2": ("PASIVO", "ACREEDORA"),
        "3": ("PATRIMONIO", "ACREEDORA"),
        "4": ("INGRESO", "ACREEDORA"),
        "5": ("COSTO", "DEUDORA"),
        "6": ("GASTO", "DEUDORA"),
        "7": ("OTRO_INGRESO", "ACREEDORA"),
        "8": ("OTRO_EGRESO", "DEUDORA"),
        "9": ("ORDEN", "DEUDORA"),
    }
    return mapping.get(primer_char, ("ACTIVO", "DEUDORA"))

def calcular_nivel_cuenta(codigo: str, separador: str = ".") -> int:
    """Calcula el nivel en función de las partes separadas por punto u otro separador."""
    if separador in codigo:
        partes = [p for p in codigo.split(separador) if p]
        return min(len(partes), 6)
    return 1

@router.get("/empresas/{empresa_id}", response_model=List[CuentaContableOut])
async def list_cuentas_by_empresa(
    empresa_id: UUID,
    tipo_cuenta: Optional[str] = None,
    solo_movimiento: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.activa == True
    )
    if tipo_cuenta:
        stmt = stmt.where(CuentaContable.tipo_cuenta == tipo_cuenta)
    if solo_movimiento is not None:
        stmt = stmt.where(CuentaContable.permite_movimiento == solo_movimiento)
        
    stmt = stmt.order_by(CuentaContable.codigo.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/empresas/{empresa_id}/buscar", response_model=List[CuentaContableOut])
async def search_cuentas(
    empresa_id: UUID,
    q: str = Query(..., min_length=1, description="Código o descripción de la cuenta"),
    limit: int = 25,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    search_term = f"%{q}%"
    stmt = (
        select(CuentaContable)
        .where(
            CuentaContable.empresa_id == empresa_id,
            CuentaContable.activa == True,
            (CuentaContable.codigo.ilike(search_term) | CuentaContable.descripcion.ilike(search_term))
        )
        .order_by(CuentaContable.codigo.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{cuenta_id}/movimientos")
async def list_movimientos_cuenta(
    cuenta_id: UUID,
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna la ficha de movimientos históricos de la cuenta (Profit Plus Contabilidad 003).
    """
    cuenta = await db.get(CuentaContable, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta contable no encontrada.")

    stmt = (
        select(
            ComprobanteRenglon.numero_linea,
            ComprobanteRenglon.descripcion,
            ComprobanteRenglon.monto_debito_base,
            ComprobanteRenglon.monto_credito_base,
            ComprobanteRenglon.tipo_documento,
            ComprobanteRenglon.numero_documento,
            Comprobante.numero.label("comprobante_numero"),
            Comprobante.fecha.label("comprobante_fecha"),
            Comprobante.concepto.label("comprobante_concepto")
        )
        .join(Comprobante, Comprobante.id == ComprobanteRenglon.comprobante_id)
        .where(
            ComprobanteRenglon.cuenta_id == cuenta_id,
            Comprobante.estado.in_(["ASENTADO", "BORRADOR", "REVISADO"])
        )
    )
    if desde:
        stmt = stmt.where(Comprobante.fecha >= desde)
    if hasta:
        stmt = stmt.where(Comprobante.fecha <= hasta)

    stmt = stmt.order_by(Comprobante.fecha.desc(), Comprobante.numero.desc())
    result = await db.execute(stmt)
    movimientos = []
    total_debe = 0.0
    total_haber = 0.0
    for row in result.all():
        deb = float(row.monto_debito_base or 0.0)
        cred = float(row.monto_credito_base or 0.0)
        total_debe += deb
        total_haber += cred
        movimientos.append({
            "numero_linea": row.numero_linea,
            "comprobante_numero": row.comprobante_numero,
            "fecha": str(row.comprobante_fecha),
            "concepto": row.comprobante_concepto,
            "descripcion": row.descripcion,
            "tipo_documento": row.tipo_documento,
            "numero_documento": row.numero_documento,
            "debe": deb,
            "haber": cred
        })

    saldo = total_debe - total_haber if cuenta.naturaleza == "DEUDORA" else total_haber - total_debe

    return {
        "cuenta_id": str(cuenta.id),
        "codigo": cuenta.codigo,
        "descripcion": cuenta.descripcion,
        "naturaleza": cuenta.naturaleza,
        "total_debe": total_debe,
        "total_haber": total_haber,
        "saldo_actual": saldo,
        "movimientos": movimientos
    }

@router.post("/empresas/{empresa_id}", response_model=CuentaContableOut, status_code=status.HTTP_201_CREATED)
async def create_cuenta(
    empresa_id: UUID,
    cuenta_in: CuentaContableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.codigo == cuenta_in.codigo
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        if not existing.activa:
            existing.activa = True
            existing.descripcion = cuenta_in.descripcion
            await db.commit()
            await db.refresh(existing)
            return existing
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este código contable en la empresa.")
        
    # Auto-inferir tipo_cuenta y naturaleza si no vienen dados
    auto_tipo, auto_nat = inferir_clasificacion_contable(cuenta_in.codigo)
    tipo_cuenta = cuenta_in.tipo_cuenta if cuenta_in.tipo_cuenta else auto_tipo
    naturaleza = cuenta_in.naturaleza if cuenta_in.naturaleza else auto_nat
    nivel = cuenta_in.nivel if cuenta_in.nivel else calcular_nivel_cuenta(cuenta_in.codigo)

    if cuenta_in.parent_id:
        parent = await db.get(CuentaContable, cuenta_in.parent_id)
        if not parent or parent.empresa_id != empresa_id:
            raise HTTPException(status_code=400, detail="La cuenta padre especificada no existe en esta empresa.")
        if parent.permite_movimiento:
            raise HTTPException(status_code=400, detail="No se pueden crear subcuentas bajo una cuenta que permite movimiento directo.")
            
    cuenta = CuentaContable(
        empresa_id=empresa_id,
        codigo=cuenta_in.codigo,
        descripcion=cuenta_in.descripcion,
        nivel=nivel,
        naturaleza=naturaleza,
        tipo_cuenta=tipo_cuenta,
        permite_movimiento=cuenta_in.permite_movimiento,
        parent_id=cuenta_in.parent_id,
        requiere_auxiliar=cuenta_in.requiere_auxiliar,
        requiere_centro_costo=cuenta_in.requiere_centro_costo,
        requiere_documento=cuenta_in.requiere_documento,
        moneda_restringida_id=cuenta_in.moneda_restringida_id,
        activa=True
    )
    db.add(cuenta)
    await db.commit()
    await db.refresh(cuenta)
    return cuenta

@router.put("/{cuenta_id}", response_model=CuentaContableOut)
async def update_cuenta(
    cuenta_id: UUID,
    cuenta_in: CuentaContableUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = await db.get(CuentaContable, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta contable no encontrada.")

    update_data = cuenta_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(cuenta, field, val)

    await db.commit()
    await db.refresh(cuenta)
    return cuenta

@router.delete("/{cuenta_id}", status_code=status.HTTP_200_OK)
async def delete_cuenta(
    cuenta_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = await db.get(CuentaContable, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta contable no encontrada.")

    cuenta.activa = False
    await db.commit()
    return {"status": "success", "message": "Cuenta desactivada correctamente.", "id": str(cuenta_id)}
