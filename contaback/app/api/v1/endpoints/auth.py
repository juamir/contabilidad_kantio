from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.estudio import EmpresaEstudioDelegacion
from app.schemas.usuario import LoginRequest, UsuarioCreate, UsuarioOut
from app.schemas.token import Token
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Usuario).where(Usuario.email == req.email, Usuario.activo == True)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso incorrectas o usuario inactivo."
        )
    
    empresa_activa_id = user.empresa_id
    
    # Si el usuario es de un Estudio Contable y especifica contexto de empresa cliente
    if user.tipo_usuario == "ESTUDIO_MIEMBRO":
        if req.empresa_contexto_id:
            # Validar si el estudio tiene delegación activa sobre esta empresa
            del_stmt = select(EmpresaEstudioDelegacion).where(
                EmpresaEstudioDelegacion.estudio_id == user.estudio_id,
                EmpresaEstudioDelegacion.empresa_id == req.empresa_contexto_id,
                EmpresaEstudioDelegacion.estado == "ACTIVA"
            )
            del_res = await db.execute(del_stmt)
            delegacion = del_res.scalars().first()
            if not delegacion:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="El estudio contable no tiene autorización activa para acceder a esta empresa."
                )
            empresa_activa_id = req.empresa_contexto_id
            
    token_claims = {
        "empresa_id": str(empresa_activa_id) if empresa_activa_id else None,
        "rol": user.rol,
        "tipo_usuario": user.tipo_usuario,
        "estudio_id": str(user.estudio_id) if user.estudio_id else None
    }
    
    token = create_access_token(subject=str(user.id), extra_claims=token_claims)
    
    return Token(
        access_token=token,
        token_type="bearer",
        usuario_id=user.id,
        email=user.email,
        nombre_completo=user.nombre_completo,
        tipo_usuario=user.tipo_usuario,
        rol=user.rol,
        empresa_activa_id=empresa_activa_id
    )

@router.post("/register-admin", response_model=UsuarioOut)
async def register_admin(user_in: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    # Para registrar superadmin o administrador inicial
    stmt = select(Usuario).where(Usuario.email == user_in.email)
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado.")
    
    user = Usuario(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        nombre_completo=user_in.nombre_completo,
        telefono=user_in.telefono,
        tipo_usuario=user_in.tipo_usuario,
        empresa_id=user_in.empresa_id,
        estudio_id=user_in.estudio_id,
        rol=user_in.rol,
        activo=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
