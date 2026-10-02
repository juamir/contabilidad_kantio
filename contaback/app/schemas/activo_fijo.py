from typing import Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, Field

# Grupos
class GrupoActivoFijoBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    descripcion: str = Field(..., max_length=255)

class GrupoActivoFijoCreate(GrupoActivoFijoBase):
    pass

class GrupoActivoFijoOut(GrupoActivoFijoBase):
    id: UUID
    empresa_id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Ubicaciones
class UbicacionActivoFijoBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    descripcion: str = Field(..., max_length=255)

class UbicacionActivoFijoCreate(UbicacionActivoFijoBase):
    pass

class UbicacionActivoFijoOut(UbicacionActivoFijoBase):
    id: UUID
    empresa_id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Activo Fijo
class ActivoFijoBase(BaseModel):
    codigo: str = Field(..., max_length=30)
    descripcion: str = Field(..., max_length=255)
    serial: Optional[str] = None
    fecha_adquisicion: date = date.today()
    inicio_depreciacion: date = date.today()
    desincorporado: bool = False

    grupo_id: Optional[UUID] = None
    ubicacion_id: Optional[UUID] = None
    centro_costo_id: Optional[UUID] = None

    vida_util_anos: int = 5
    vida_util_meses: int = 0
    metodo: str = "LINEA_RECTA"
    valor_adquisicion: Decimal = Decimal("0.00")
    valor_salvamento: Decimal = Decimal("0.00")
    depreciacion_acumulada: Decimal = Decimal("0.00")
    valor_contable: Decimal = Decimal("0.00")

    cuenta_activo_id: Optional[UUID] = None
    cuenta_depreciacion_acumulada_id: Optional[UUID] = None
    cuenta_gasto_depreciacion_id: Optional[UUID] = None

class ActivoFijoCreate(ActivoFijoBase):
    pass

class ActivoFijoUpdate(BaseModel):
    descripcion: Optional[str] = None
    serial: Optional[str] = None
    grupo_id: Optional[UUID] = None
    ubicacion_id: Optional[UUID] = None
    centro_costo_id: Optional[UUID] = None
    vida_util_anos: Optional[int] = None
    vida_util_meses: Optional[int] = None
    valor_adquisicion: Optional[Decimal] = None
    valor_salvamento: Optional[Decimal] = None
    desincorporado: Optional[bool] = None
    activo: Optional[bool] = None

class ActivoFijoOut(ActivoFijoBase):
    id: UUID
    empresa_id: UUID
    monto_ultima_depreciacion: Decimal
    fecha_ultima_depreciacion: Optional[date] = None
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
