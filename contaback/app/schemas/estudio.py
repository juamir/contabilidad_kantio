from typing import Optional
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, EmailStr

class EstudioContableBase(BaseModel):
    codigo: str
    nombre: str
    rif: str
    email_contacto: EmailStr
    telefono: Optional[str] = None

class EstudioContableCreate(EstudioContableBase):
    pass

class EstudioContableOut(EstudioContableBase):
    id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DelegacionCreate(BaseModel):
    estudio_id: UUID
    tipo_delegacion: str = "OPERATIVO_COMPLETO"  # OPERATIVO_COMPLETO, AUDITORIA_LECTURA
    fecha_fin: Optional[date] = None

class DelegacionOut(BaseModel):
    id: UUID
    empresa_id: UUID
    estudio_id: UUID
    tipo_delegacion: str
    fecha_inicio: date
    fecha_fin: Optional[date]
    estado: str
    created_at: datetime

    class Config:
        from_attributes = True
