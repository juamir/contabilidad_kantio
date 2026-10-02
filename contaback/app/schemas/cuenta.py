from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class CuentaContableBase(BaseModel):
    codigo: str = Field(..., max_length=50)
    descripcion: str = Field(..., max_length=255)
    nivel: Optional[int] = Field(None, ge=1, le=6)
    naturaleza: Optional[str] = Field(None, pattern="^(DEUDORA|ACREEDORA)$")
    tipo_cuenta: Optional[str] = Field(None, max_length=20)
    permite_movimiento: bool = False
    parent_id: Optional[UUID] = None
    requiere_auxiliar: bool = False
    requiere_centro_costo: bool = False
    requiere_documento: bool = False
    moneda_restringida_id: Optional[UUID] = None

class CuentaContableCreate(CuentaContableBase):
    pass

class CuentaContableUpdate(BaseModel):
    descripcion: Optional[str] = None
    permite_movimiento: Optional[bool] = None
    naturaleza: Optional[str] = None
    tipo_cuenta: Optional[str] = None
    requiere_auxiliar: Optional[bool] = None
    requiere_centro_costo: Optional[bool] = None
    requiere_documento: Optional[bool] = None
    activa: Optional[bool] = None

class CuentaContableOut(BaseModel):
    id: UUID
    empresa_id: UUID
    codigo: str
    descripcion: str
    nivel: int
    naturaleza: str
    tipo_cuenta: str
    permite_movimiento: bool
    parent_id: Optional[UUID] = None
    requiere_auxiliar: bool
    requiere_centro_costo: bool
    requiere_documento: bool
    moneda_restringida_id: Optional[UUID] = None
    activa: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CuentaTreeNode(CuentaContableOut):
    subcuentas: List['CuentaTreeNode'] = []

CuentaTreeNode.update_forward_refs()
