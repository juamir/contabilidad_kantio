from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class CentroCostoBase(BaseModel):
    codigo: str = Field(..., max_length=50)
    nombre: str = Field(..., max_length=255)
    parent_id: Optional[UUID] = None
    activo: bool = True

class CentroCostoCreate(CentroCostoBase):
    pass

class CentroCostoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    parent_id: Optional[UUID] = None
    activo: Optional[bool] = None

class CentroCostoOut(CentroCostoBase):
    id: UUID
    empresa_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
