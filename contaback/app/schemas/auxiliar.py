from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class AuxiliarBase(BaseModel):
    codigo: str = Field(..., max_length=50)
    nombre_razon_social: str = Field(..., max_length=255)
    tipo_identificacion: str = Field(default="J", max_length=10)
    rif_cedula: str = Field(..., max_length=20)
    tipo_auxiliar: str = Field(default="PROVEEDOR", max_length=30)
    email: Optional[str] = Field(None, max_length=255)
    telefono: Optional[str] = Field(None, max_length=50)
    activo: bool = True

class AuxiliarCreate(AuxiliarBase):
    pass

class AuxiliarUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre_razon_social: Optional[str] = None
    tipo_identificacion: Optional[str] = None
    rif_cedula: Optional[str] = None
    tipo_auxiliar: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    activo: Optional[bool] = None

class AuxiliarOut(AuxiliarBase):
    id: UUID
    empresa_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
