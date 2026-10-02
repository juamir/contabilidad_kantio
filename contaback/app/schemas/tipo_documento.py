from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class TipoDocumentoBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    descripcion: str = Field(..., max_length=255)

class TipoDocumentoCreate(TipoDocumentoBase):
    pass

class TipoDocumentoUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None

class TipoDocumentoOut(TipoDocumentoBase):
    id: UUID
    empresa_id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
