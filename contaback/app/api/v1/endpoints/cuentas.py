from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.cuenta import CuentaContable
from app.models.usuario import Usuario
from app.schemas.cuenta import (
    CuentaContableCreate, CuentaContableOut, CuentaContableUpdate, CuentaTreeNode
)
from app.api.deps import get_current_user

router = APIRouter()

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
    """
    Endpoint ultra-rápido (<50ms) para autocompletar cuentas en el DataGrid de captura de asientos.
    """
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

@router.post("/empresas/{empresa_id}", response_model=CuentaContableOut, status_code=status.HTTP_201_CREATED)
async def create_cuenta(
    empresa_id: UUID,
    cuenta_in: CuentaContableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificar si el código ya existe para la empresa
    stmt = select(CuentaContable).where(
        CuentaContable.empresa_id == empresa_id,
        CuentaContable.codigo == cuenta_in.codigo
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este código contable en la empresa.")
        
    # Validar que si tiene parent_id, el padre exista
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
        nivel=cuenta_in.nivel,
        naturaleza=cuenta_in.naturaleza,
        tipo_cuenta=cuenta_in.tipo_cuenta,
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
