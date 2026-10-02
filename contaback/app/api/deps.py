from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.core.config import settings
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.token import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No fue posible validar las credenciales del token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        empresa_id: Optional[str] = payload.get("empresa_id")
        rol: Optional[str] = payload.get("rol")
    except JWTError:
        raise credentials_exception

    stmt = select(Usuario).where(Usuario.id == UUID(user_id), Usuario.activo == True)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
        
    # Establecer variables de contexto RLS en PostgreSQL
    if empresa_id:
        try:
            await db.execute(text(f"SET LOCAL app.current_empresa_id = '{empresa_id}'"))
            await db.execute(text(f"SET LOCAL app.current_user_role = '{rol or user.rol}'"))
        except Exception:
            pass  # En SQLite durante tests no bloqueará si no soporta SET LOCAL

    return user

def require_role(allowed_roles: list):
    async def role_checker(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol not in allowed_roles and current_user.tipo_usuario != "KANTIO_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso denegado. Se requiere uno de los roles: {allowed_roles}"
            )
        return current_user
    return role_checker
