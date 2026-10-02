from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class EmpresaBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    razon_social: str = Field(..., max_length=255)
    nombre_comercial: Optional[str] = Field(None, max_length=255)
    rif: str = Field(..., max_length=20)
    es_grupo_holding: bool = False
    grupo_id: Optional[UUID] = None
    plan_suscripcion: str = "ESTANDAR"

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    rif: Optional[str] = None
    plan_suscripcion: Optional[str] = None
    activo: Optional[bool] = None

class EmpresaOut(EmpresaBase):
    id: UUID
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GrupoEmpresarialBase(BaseModel):
    codigo: str
    nombre: str

class GrupoEmpresarialCreate(GrupoEmpresarialBase):
    pass

class GrupoEmpresarialOut(GrupoEmpresarialBase):
    id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
