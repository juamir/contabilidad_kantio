from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario
from app.schemas.tipo_documento import (
    TipoDocumentoCreate, TipoDocumentoOut, TipoDocumentoUpdate
)
from app.api.deps import get_current_user

router = APIRouter()

DOCUMENTOS_BASE = [
    {"codigo": "FACT", "descripcion": "FACTURA DE VENTA / COMPRA"},
    {"codigo": "DEPC", "descripcion": "DEPÓSITOS DE CAJA / BANCARIOS"},
    {"codigo": "DEVC", "descripcion": "DEVOLUCIONES DE CLIENTES"},
    {"codigo": "DEVP", "descripcion": "DEVOLUCIONES DE PROVEEDORES"},
    {"codigo": "GIRO", "descripcion": "GIROS / EFECTOS COMERCIALES"},
    {"codigo": "NC", "descripcion": "NOTA DE CRÉDITO"},
    {"codigo": "ND", "descripcion": "NOTA DE DÉBITO"},
    {"codigo": "CHQ", "descripcion": "CHEQUES EMITIDOS / RECIBIDOS"},
    {"codigo": "TRANSF", "descripcion": "TRANSFERENCIA BANCARIA ELECTRÓNICA"},
    {"codigo": "RETIVA", "descripcion": "COMPROBANTE DE RETENCIÓN IVA"},
    {"codigo": "RETISLR", "descripcion": "COMPROBANTE DE RETENCIÓN ISLR"},
    {"codigo": "AJUC", "descripcion": "AJUSTES DE CLIENTES"},
    {"codigo": "AJUP", "descripcion": "AJUSTES DE PROVEEDORES"},
]

@router.get("/empresas/{empresa_id}", response_model=List[TipoDocumentoOut])
async def list_tipos_documento(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(TipoDocumento).where(
        TipoDocumento.empresa_id == empresa_id,
        TipoDocumento.activo == True
    ).order_by(TipoDocumento.codigo.asc())
    result = await db.execute(stmt)
    docs = result.scalars().all()

    # Si la empresa no tiene tipos de documento, auto-sembrar los base de Profit
    if not docs:
        for d in DOCUMENTOS_BASE:
            nuevo = TipoDocumento(
                empresa_id=empresa_id,
                codigo=d["codigo"],
                descripcion=d["descripcion"],
                activo=True
            )
            db.add(nuevo)
        await db.commit()
        stmt = select(TipoDocumento).where(
            TipoDocumento.empresa_id == empresa_id,
            TipoDocumento.activo == True
        ).order_by(TipoDocumento.codigo.asc())
        result = await db.execute(stmt)
        docs = result.scalars().all()

    return docs

@router.post("/empresas/{empresa_id}", response_model=TipoDocumentoOut, status_code=status.HTTP_201_CREATED)
async def create_tipo_documento(
    empresa_id: UUID,
    doc_in: TipoDocumentoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(TipoDocumento).where(
        TipoDocumento.empresa_id == empresa_id,
        TipoDocumento.codigo == doc_in.codigo.upper()
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        if not existing.activo:
            existing.activo = True
            existing.descripcion = doc_in.descripcion
            await db.commit()
            await db.refresh(existing)
            return existing
        raise HTTPException(status_code=400, detail="Ya existe un tipo de documento con este código.")

    doc = TipoDocumento(
        empresa_id=empresa_id,
        codigo=doc_in.codigo.upper(),
        descripcion=doc_in.descripcion,
        activo=True
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

@router.put("/{doc_id}", response_model=TipoDocumentoOut)
async def update_tipo_documento(
    doc_id: UUID,
    doc_in: TipoDocumentoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    doc = await db.get(TipoDocumento, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Tipo de documento no encontrado.")

    if doc_in.codigo:
        doc.codigo = doc_in.codigo.upper()
    if doc_in.descripcion:
        doc.descripcion = doc_in.descripcion
    if doc_in.activo is not None:
        doc.activo = doc_in.activo

    await db.commit()
    await db.refresh(doc)
    return doc

@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
async def delete_tipo_documento(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    doc = await db.get(TipoDocumento, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Tipo de documento no encontrado.")

    doc.activo = False
    await db.commit()
    return {"status": "success", "message": "Tipo de documento desactivado.", "id": str(doc_id)}
