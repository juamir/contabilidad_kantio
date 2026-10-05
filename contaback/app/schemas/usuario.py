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
    avatar_url: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str
    empresa_id: Optional[UUID] = None
    estudio_id: Optional[UUID] = None

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    tipo_usuario: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None

class UsuarioOut(UsuarioBase):
    id: UUID
    empresa_id: Optional[UUID] = None
    estudio_id: Optional[UUID] = None
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileOut(BaseModel):
    id: UUID
    email: str
    nombre_completo: str
    telefono: Optional[str] = None
    tipo_usuario: str
    rol: str
    avatar_url: Optional[str] = None
    empresa_id: Optional[UUID] = None
    estudio_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class AvatarUploadRequest(BaseModel):
    avatar_data: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    empresa_contexto_id: Optional[UUID] = None  # Si es miembro de estudio y quiere iniciar en una empresa
