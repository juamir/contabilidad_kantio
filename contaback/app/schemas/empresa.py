from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, Field

class ParametrosEmpresaBase(BaseModel):
    niveles: int = Field(default=4, ge=1, le=6)
    nivel_1: int = Field(default=1, ge=1, le=9)
    nivel_2: int = Field(default=1, ge=1, le=9)
    nivel_3: int = Field(default=2, ge=1, le=9)
    nivel_4: int = Field(default=3, ge=1, le=9)
    nivel_5: int = Field(default=0, ge=0, le=9)
    nivel_6: int = Field(default=0, ge=0, le=9)
    longitud_total: int = Field(default=7, ge=1, le=30)
    caracter_separacion: str = Field(default=".", max_length=5)
    mascara_formato: str = Field(default="X.X.XX.XXX", max_length=50)

    consecutivo_contabilizacion: int = 1
    consecutivo_depreciacion: int = 1
    consecutivo_comprobante_cierre: int = 1

    inicio_ejercicio: date = date(2026, 1, 1)
    fin_ejercicio: date = date(2026, 12, 31)
    inicio_contabilidad: date = date(2026, 1, 1)

class ParametrosEmpresaCreate(ParametrosEmpresaBase):
    pass

class ParametrosEmpresaUpdate(BaseModel):
    niveles: Optional[int] = None
    nivel_1: Optional[int] = None
    nivel_2: Optional[int] = None
    nivel_3: Optional[int] = None
    nivel_4: Optional[int] = None
    nivel_5: Optional[int] = None
    nivel_6: Optional[int] = None
    longitud_total: Optional[int] = None
    caracter_separacion: Optional[str] = None
    mascara_formato: Optional[str] = None

    consecutivo_contabilizacion: Optional[int] = None
    consecutivo_depreciacion: Optional[int] = None
    consecutivo_comprobante_cierre: Optional[int] = None

    inicio_ejercicio: Optional[date] = None
    fin_ejercicio: Optional[date] = None
    inicio_contabilidad: Optional[date] = None

class ParametrosEmpresaOut(ParametrosEmpresaBase):
    id: UUID
    empresa_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UsuarioEmpresaAccesoBase(BaseModel):
    usuario_id: UUID
    rol: str = "CONTADOR_SENIOR"

class UsuarioEmpresaAccesoCreate(UsuarioEmpresaAccesoBase):
    pass

class UsuarioEmpresaAccesoOut(UsuarioEmpresaAccesoBase):
    id: UUID
    empresa_id: UUID
    activo: bool
    created_at: datetime
    # Info enriquecida del usuario si se une
    usuario_email: Optional[str] = None
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True

class EmpresaBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    razon_social: str = Field(..., max_length=255)
    nombre_comercial: Optional[str] = Field(None, max_length=255)
    rif: str = Field(..., max_length=20)
    nit: Optional[str] = Field(None, max_length=50)
    prioridad: int = 0
    es_grupo_holding: bool = False
    grupo_id: Optional[UUID] = None
    plan_suscripcion: str = "ESTANDAR"

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    rif: Optional[str] = None
    nit: Optional[str] = None
    prioridad: Optional[int] = None
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
