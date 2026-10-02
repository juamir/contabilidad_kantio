from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario_id: UUID
    email: str
    nombre_completo: str
    tipo_usuario: str
    rol: str
    empresa_activa_id: Optional[UUID] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    empresa_id: Optional[str] = None
    rol: Optional[str] = None
    tipo_usuario: Optional[str] = None
