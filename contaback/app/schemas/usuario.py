from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_completo: str
    telefono: Optional[str] = None
    tipo_usuario: str  # KANTIO_ADMIN, EMPRESA_INTERNO, ESTUDIO_MIEMBRO
    rol: str

class UsuarioCreate(UsuarioBase):
    password: str
    empresa_id: Optional[UUID] = None
    estudio_id: Optional[UUID] = None

class UsuarioOut(UsuarioBase):
    id: UUID
    empresa_id: Optional[UUID] = None
    estudio_id: Optional[UUID] = None
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    empresa_contexto_id: Optional[UUID] = None  # Si es miembro de estudio y quiere iniciar en una empresa
