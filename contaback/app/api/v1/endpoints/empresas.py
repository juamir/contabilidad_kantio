from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.empresa import Empresa, GrupoEmpresarial, ParametrosEmpresa, UsuarioEmpresaAcceso
from app.models.usuario import Usuario
from app.schemas.empresa import (
    EmpresaCreate, EmpresaOut, EmpresaUpdate,
    GrupoEmpresarialCreate, GrupoEmpresarialOut,
    ParametrosEmpresaBase, ParametrosEmpresaCreate, ParametrosEmpresaUpdate, ParametrosEmpresaOut,
    UsuarioEmpresaAccesoCreate, UsuarioEmpresaAccesoOut
)
from app.api.deps import get_current_user
from app.services.puc_seed import seed_puc_ven_nif

router = APIRouter()

@router.get("/", response_model=List[EmpresaOut])
async def list_empresas(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.tipo_usuario == "KANTIO_ADMIN":
        stmt = select(Empresa).where(Empresa.activo == True).order_by(Empresa.codigo.asc())
    elif current_user.tipo_usuario == "EMPRESA_INTERNO":
        # Empresa propia + empresas donde tenga acceso por UsuarioEmpresaAcceso
        stmt = (
            select(Empresa)
            .outerjoin(UsuarioEmpresaAcceso, UsuarioEmpresaAcceso.empresa_id == Empresa.id)
            .where(
                Empresa.activo == True,
                (Empresa.id == current_user.empresa_id) | (UsuarioEmpresaAcceso.usuario_id == current_user.id)
            )
            .distinct()
            .order_by(Empresa.codigo.asc())
        )
    else:
        # Miembro de estudio contable: listar empresas que tengan delegación activa con su estudio
        from app.models.estudio import EmpresaEstudioDelegacion
        stmt = (
            select(Empresa)
            .join(EmpresaEstudioDelegacion, EmpresaEstudioDelegacion.empresa_id == Empresa.id)
            .where(
                Empresa.activo == True,
                EmpresaEstudioDelegacion.estudio_id == current_user.estudio_id,
                EmpresaEstudioDelegacion.estado == "ACTIVA"
            )
            .order_by(Empresa.codigo.asc())
        )
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=EmpresaOut, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    empresa_in: EmpresaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(Empresa).where((Empresa.codigo == empresa_in.codigo) | (Empresa.rif == empresa_in.rif))
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una empresa con ese código o RIF.")
    
    if empresa_in.grupo_id:
        grupo = await db.get(GrupoEmpresarial, empresa_in.grupo_id)
        if not grupo:
            raise HTTPException(status_code=404, detail="El grupo empresarial especificado no existe.")
        if empresa_in.plan_suscripcion != "CORPORATIVO":
            raise HTTPException(
                status_code=403,
                detail="Se requiere un plan de suscripción CORPORATIVO para pertenecer a un Grupo Empresarial y consolidar balances."
            )
            
    empresa = Empresa(
        codigo=empresa_in.codigo,
        razon_social=empresa_in.razon_social,
        nombre_comercial=empresa_in.nombre_comercial,
        rif=empresa_in.rif,
        nit=empresa_in.nit,
        prioridad=empresa_in.prioridad,
        es_grupo_holding=empresa_in.es_grupo_holding,
        grupo_id=empresa_in.grupo_id,
        plan_suscripcion=empresa_in.plan_suscripcion,
        activo=True
    )
    db.add(empresa)
    await db.commit()
    await db.refresh(empresa)

    # Crear parámetros iniciales automáticos
    params = ParametrosEmpresa(
        empresa_id=empresa.id,
        niveles=4,
        nivel_1=1,
        nivel_2=1,
        nivel_3=2,
        nivel_4=3,
        longitud_total=7,
        caracter_separacion=".",
        mascara_formato="X.X.XX.XXX",
        consecutivo_contabilizacion=1,
        consecutivo_depreciacion=1,
        consecutivo_comprobante_cierre=1
    )
    db.add(params)

    # Dar acceso al usuario creador
    acceso = UsuarioEmpresaAcceso(
        usuario_id=current_user.id,
        empresa_id=empresa.id,
        rol="ADMIN_EMPRESA",
        activo=True
    )
    db.add(acceso)

    await db.commit()
    await db.refresh(empresa)
    
    # Auto-semilla del PUC VEN-NIF
    await seed_puc_ven_nif(db, empresa.id)
    
    return empresa

@router.get("/{empresa_id}", response_model=EmpresaOut)
async def get_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    return empresa

@router.put("/{empresa_id}", response_model=EmpresaOut)
async def update_empresa(
    empresa_id: UUID,
    empresa_in: EmpresaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    data = empresa_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(empresa, field, val)

    await db.commit()
    await db.refresh(empresa)
    return empresa

@router.delete("/{empresa_id}", status_code=status.HTTP_200_OK)
async def delete_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = await db.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    empresa.activo = False
    await db.commit()
    return {"status": "success", "message": "Empresa desactivada.", "id": str(empresa_id)}

# --- PARAMETRIZACIÓN DE EMPRESA (Niveles, Máscara y Consecutivos) ---
@router.get("/{empresa_id}/parametros", response_model=ParametrosEmpresaOut)
async def get_parametros_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(ParametrosEmpresa).where(ParametrosEmpresa.empresa_id == empresa_id)
    result = await db.execute(stmt)
    params = result.scalars().first()
    if not params:
        # Generar por defecto si no existe
        params = ParametrosEmpresa(
            empresa_id=empresa_id,
            niveles=4,
            nivel_1=1,
            nivel_2=1,
            nivel_3=2,
            nivel_4=3,
            longitud_total=7,
            caracter_separacion=".",
            mascara_formato="X.X.XX.XXX",
            consecutivo_contabilizacion=1,
            consecutivo_depreciacion=1,
            consecutivo_comprobante_cierre=1
        )
        db.add(params)
        await db.commit()
        await db.refresh(params)
    return params

@router.put("/{empresa_id}/parametros", response_model=ParametrosEmpresaOut)
async def update_parametros_empresa(
    empresa_id: UUID,
    params_in: ParametrosEmpresaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(ParametrosEmpresa).where(ParametrosEmpresa.empresa_id == empresa_id)
    params = (await db.execute(stmt)).scalars().first()
    if not params:
        params = ParametrosEmpresa(empresa_id=empresa_id)
        db.add(params)

    data = params_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(params, field, val)

    # Recalcular máscara si cambiaron niveles o separador
    sep = params.caracter_separacion or "."
    mask_parts = []
    tot = 0
    niveles_lens = [params.nivel_1, params.nivel_2, params.nivel_3, params.nivel_4, params.nivel_5, params.nivel_6]
    for i in range(params.niveles):
        l = niveles_lens[i] if i < len(niveles_lens) else 0
        if l > 0:
            mask_parts.append("X" * l)
            tot += l
    params.mascara_formato = sep.join(mask_parts)
    params.longitud_total = tot

    await db.commit()
    await db.refresh(params)
    return params

# --- GESTIÓN DE ACCESOS DE USUARIOS A LA EMPRESA ---
@router.get("/{empresa_id}/usuarios", response_model=List[UsuarioEmpresaAccesoOut])
async def list_usuarios_empresa(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = (
        select(UsuarioEmpresaAcceso, Usuario.email, Usuario.nombre_completo)
        .join(Usuario, Usuario.id == UsuarioEmpresaAcceso.usuario_id)
        .where(
            UsuarioEmpresaAcceso.empresa_id == empresa_id,
            UsuarioEmpresaAcceso.activo == True
        )
    )
    result = await db.execute(stmt)
    records = []
    for acceso, email, nombre in result.all():
        out = UsuarioEmpresaAccesoOut(
            id=acceso.id,
            empresa_id=acceso.empresa_id,
            usuario_id=acceso.usuario_id,
            rol=acceso.rol,
            activo=acceso.activo,
            created_at=acceso.created_at,
            usuario_email=email,
            usuario_nombre=nombre
        )
        records.append(out)
    return records

@router.post("/{empresa_id}/usuarios", response_model=UsuarioEmpresaAccesoOut, status_code=status.HTTP_201_CREATED)
async def add_usuario_to_empresa(
    empresa_id: UUID,
    acceso_in: UsuarioEmpresaAccesoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validar que el usuario exista
    user = await db.get(Usuario, acceso_in.usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    stmt = select(UsuarioEmpresaAcceso).where(
        UsuarioEmpresaAcceso.empresa_id == empresa_id,
        UsuarioEmpresaAcceso.usuario_id == acceso_in.usuario_id
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        existing.rol = acceso_in.rol
        existing.activo = True
        await db.commit()
        await db.refresh(existing)
        return UsuarioEmpresaAccesoOut(
            id=existing.id,
            empresa_id=existing.empresa_id,
            usuario_id=existing.usuario_id,
            rol=existing.rol,
            activo=existing.activo,
            created_at=existing.created_at,
            usuario_email=user.email,
            usuario_nombre=user.nombre_completo
        )

    acceso = UsuarioEmpresaAcceso(
        empresa_id=empresa_id,
        usuario_id=acceso_in.usuario_id,
        rol=acceso_in.rol,
        activo=True
    )
    db.add(acceso)
    await db.commit()
    await db.refresh(acceso)
    return UsuarioEmpresaAccesoOut(
        id=acceso.id,
        empresa_id=acceso.empresa_id,
        usuario_id=acceso.usuario_id,
        rol=acceso.rol,
        activo=acceso.activo,
        created_at=acceso.created_at,
        usuario_email=user.email,
        usuario_nombre=user.nombre_completo
    )

@router.delete("/{empresa_id}/usuarios/{usuario_id}", status_code=status.HTTP_200_OK)
async def remove_usuario_from_empresa(
    empresa_id: UUID,
    usuario_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(UsuarioEmpresaAcceso).where(
        UsuarioEmpresaAcceso.empresa_id == empresa_id,
        UsuarioEmpresaAcceso.usuario_id == usuario_id
    )
    acceso = (await db.execute(stmt)).scalars().first()
    if not acceso:
        raise HTTPException(status_code=404, detail="Acceso no encontrado.")

    acceso.activo = False
    await db.commit()
    return {"status": "success", "message": "Acceso revocado a la empresa.", "usuario_id": str(usuario_id)}

# --- GRUPOS EMPRESARIALES ---
@router.get("/grupos/todos", response_model=List[GrupoEmpresarialOut])
async def list_grupos_empresariales(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoEmpresarial).where(GrupoEmpresarial.activo == True)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/grupos/", response_model=GrupoEmpresarialOut, status_code=status.HTTP_201_CREATED)
async def create_grupo_empresarial(
    grupo_in: GrupoEmpresarialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoEmpresarial).where(GrupoEmpresarial.codigo == grupo_in.codigo)
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe un grupo empresarial con este código.")

    grupo = GrupoEmpresarial(
        codigo=grupo_in.codigo,
        nombre=grupo_in.nombre,
        activo=True
    )
    db.add(grupo)
    await db.commit()
    await db.refresh(grupo)
    return grupo
