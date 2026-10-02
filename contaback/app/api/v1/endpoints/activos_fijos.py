from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.activo_fijo import ActivoFijo, GrupoActivoFijo, UbicacionActivoFijo
from app.models.usuario import Usuario
from app.schemas.activo_fijo import (
    ActivoFijoCreate, ActivoFijoOut, ActivoFijoUpdate,
    GrupoActivoFijoCreate, GrupoActivoFijoOut,
    UbicacionActivoFijoCreate, UbicacionActivoFijoOut
)
from app.api.deps import get_current_user

router = APIRouter()

# GRUPOS DE ACTIVOS FIJOS
@router.get("/empresas/{empresa_id}/grupos", response_model=List[GrupoActivoFijoOut])
async def list_grupos_activos(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoActivoFijo).where(
        GrupoActivoFijo.empresa_id == empresa_id,
        GrupoActivoFijo.activo == True
    ).order_by(GrupoActivoFijo.codigo.asc())
    result = await db.execute(stmt)
    grupos = result.scalars().all()
    if not grupos:
        default_grupos = [
            {"codigo": "0001", "descripcion": "EQUIPOS ELECTRONICOS Y COMPUTACION"},
            {"codigo": "0002", "descripcion": "MOBILIARIO Y ENSERES DE OFICINA"},
            {"codigo": "0003", "descripcion": "VEHICULOS Y TRANSPORTE"},
            {"codigo": "0004", "descripcion": "MAQUINARIA Y HERRAMIENTAS"},
        ]
        for g in default_grupos:
            item = GrupoActivoFijo(empresa_id=empresa_id, codigo=g["codigo"], descripcion=g["descripcion"], activo=True)
            db.add(item)
        await db.commit()
        stmt = select(GrupoActivoFijo).where(
            GrupoActivoFijo.empresa_id == empresa_id,
            GrupoActivoFijo.activo == True
        ).order_by(GrupoActivoFijo.codigo.asc())
        grupos = (await db.execute(stmt)).scalars().all()
    return grupos

@router.post("/empresas/{empresa_id}/grupos", response_model=GrupoActivoFijoOut, status_code=status.HTTP_201_CREATED)
async def create_grupo_activo(
    empresa_id: UUID,
    grupo_in: GrupoActivoFijoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(GrupoActivoFijo).where(
        GrupoActivoFijo.empresa_id == empresa_id,
        GrupoActivoFijo.codigo == grupo_in.codigo
    )
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe un grupo con este código.")

    grupo = GrupoActivoFijo(
        empresa_id=empresa_id,
        codigo=grupo_in.codigo,
        descripcion=grupo_in.descripcion,
        activo=True
    )
    db.add(grupo)
    await db.commit()
    await db.refresh(grupo)
    return grupo

# UBICACIONES DE ACTIVOS FIJOS
@router.get("/empresas/{empresa_id}/ubicaciones", response_model=List[UbicacionActivoFijoOut])
async def list_ubicaciones_activos(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(UbicacionActivoFijo).where(
        UbicacionActivoFijo.empresa_id == empresa_id,
        UbicacionActivoFijo.activo == True
    ).order_by(UbicacionActivoFijo.codigo.asc())
    result = await db.execute(stmt)
    ubicaciones = result.scalars().all()
    if not ubicaciones:
        default_ubicaciones = [
            {"codigo": "OFIC", "descripcion": "OFICINA PRINCIPAL"},
            {"codigo": "PLAN", "descripcion": "PLANTA Y PRODUCCIÓN"},
            {"codigo": "ALMA", "descripcion": "ALMACÉN CENTRAL"},
            {"codigo": "SUCC", "descripcion": "SUCURSAL"},
        ]
        for u in default_ubicaciones:
            item = UbicacionActivoFijo(empresa_id=empresa_id, codigo=u["codigo"], descripcion=u["descripcion"], activo=True)
            db.add(item)
        await db.commit()
        stmt = select(UbicacionActivoFijo).where(
            UbicacionActivoFijo.empresa_id == empresa_id,
            UbicacionActivoFijo.activo == True
        ).order_by(UbicacionActivoFijo.codigo.asc())
        ubicaciones = (await db.execute(stmt)).scalars().all()
    return ubicaciones

@router.post("/empresas/{empresa_id}/ubicaciones", response_model=UbicacionActivoFijoOut, status_code=status.HTTP_201_CREATED)
async def create_ubicacion_activo(
    empresa_id: UUID,
    ubicacion_in: UbicacionActivoFijoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(UbicacionActivoFijo).where(
        UbicacionActivoFijo.empresa_id == empresa_id,
        UbicacionActivoFijo.codigo == ubicacion_in.codigo
    )
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe una ubicación con este código.")

    ubicacion = UbicacionActivoFijo(
        empresa_id=empresa_id,
        codigo=ubicacion_in.codigo,
        descripcion=ubicacion_in.descripcion,
        activo=True
    )
    db.add(ubicacion)
    await db.commit()
    await db.refresh(ubicacion)
    return ubicacion

# ACTIVOS FIJOS GENERAL
@router.get("/empresas/{empresa_id}", response_model=List[ActivoFijoOut])
async def list_activos_fijos(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(ActivoFijo).where(
        ActivoFijo.empresa_id == empresa_id,
        ActivoFijo.activo == True
    ).order_by(ActivoFijo.codigo.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/empresas/{empresa_id}", response_model=ActivoFijoOut, status_code=status.HTTP_201_CREATED)
async def create_activo_fijo(
    empresa_id: UUID,
    activo_in: ActivoFijoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    stmt = select(ActivoFijo).where(
        ActivoFijo.empresa_id == empresa_id,
        ActivoFijo.codigo == activo_in.codigo
    )
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe un activo con este código.")

    valor_contable = activo_in.valor_adquisicion - activo_in.depreciacion_acumulada

    activo = ActivoFijo(
        empresa_id=empresa_id,
        codigo=activo_in.codigo,
        descripcion=activo_in.descripcion,
        serial=activo_in.serial,
        fecha_adquisicion=activo_in.fecha_adquisicion,
        inicio_depreciacion=activo_in.inicio_depreciacion,
        desincorporado=activo_in.desincorporado,
        grupo_id=activo_in.grupo_id,
        ubicacion_id=activo_in.ubicacion_id,
        centro_costo_id=activo_in.centro_costo_id,
        vida_util_anos=activo_in.vida_util_anos,
        vida_util_meses=activo_in.vida_util_meses,
        metodo=activo_in.metodo,
        valor_adquisicion=activo_in.valor_adquisicion,
        valor_salvamento=activo_in.valor_salvamento,
        depreciacion_acumulada=activo_in.depreciacion_acumulada,
        valor_contable=valor_contable,
        monto_ultima_depreciacion=0.0,
        cuenta_activo_id=activo_in.cuenta_activo_id,
        cuenta_depreciacion_acumulada_id=activo_in.cuenta_depreciacion_acumulada_id,
        cuenta_gasto_depreciacion_id=activo_in.cuenta_gasto_depreciacion_id,
        activo=True
    )
    db.add(activo)
    await db.commit()
    await db.refresh(activo)
    return activo

@router.put("/{activo_id}", response_model=ActivoFijoOut)
async def update_activo_fijo(
    activo_id: UUID,
    activo_in: ActivoFijoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    activo = await db.get(ActivoFijo, activo_id)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo fijo no encontrado.")

    data = activo_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(activo, field, val)

    if activo.valor_adquisicion and activo.depreciacion_acumulada is not None:
        activo.valor_contable = activo.valor_adquisicion - activo.depreciacion_acumulada

    await db.commit()
    await db.refresh(activo)
    return activo

@router.delete("/{activo_id}", status_code=status.HTTP_200_OK)
async def delete_activo_fijo(
    activo_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    activo = await db.get(ActivoFijo, activo_id)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo fijo no encontrado.")

    activo.activo = False
    await db.commit()
    return {"status": "success", "message": "Activo fijo desactivado.", "id": str(activo_id)}
