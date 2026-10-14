from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.activo_fijo import ActivoFijo, GrupoActivoFijo, UbicacionActivoFijo
from app.models.usuario import Usuario
from app.models.cuenta import CuentaContable
from app.models.comprobante import Comprobante, ComprobanteRenglon
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

@router.put("/grupos/{grupo_id}", response_model=GrupoActivoFijoOut)
async def update_grupo_activo(
    grupo_id: UUID,
    grupo_in: GrupoActivoFijoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    grupo = await db.get(GrupoActivoFijo, grupo_id)
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado.")

    grupo.codigo = grupo_in.codigo
    grupo.descripcion = grupo_in.descripcion
    await db.commit()
    await db.refresh(grupo)
    return grupo

@router.delete("/grupos/{grupo_id}", status_code=status.HTTP_200_OK)
async def delete_grupo_activo(
    grupo_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    grupo = await db.get(GrupoActivoFijo, grupo_id)
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado.")

    grupo.activo = False
    await db.commit()
    return {"status": "success", "message": "Grupo desactivado.", "id": str(grupo_id)}

@router.put("/ubicaciones/{ubicacion_id}", response_model=UbicacionActivoFijoOut)
async def update_ubicacion_activo(
    ubicacion_id: UUID,
    ubi_in: UbicacionActivoFijoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    ubi = await db.get(UbicacionActivoFijo, ubicacion_id)
    if not ubi:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada.")

    ubi.codigo = ubi_in.codigo
    ubi.descripcion = ubi_in.descripcion
    await db.commit()
    await db.refresh(ubi)
    return ubi

@router.delete("/ubicaciones/{ubicacion_id}", status_code=status.HTTP_200_OK)
async def delete_ubicacion_activo(
    ubicacion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    ubi = await db.get(UbicacionActivoFijo, ubicacion_id)
    if not ubi:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada.")

    ubi.activo = False
    await db.commit()
    return {"status": "success", "message": "Ubicación desactivada.", "id": str(ubicacion_id)}

@router.post("/empresas/{empresa_id}/depreciar")
async def ejecutar_depreciacion_mensual(
    empresa_id: UUID,
    fecha_corte: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ejecuta el cálculo de depreciación mensual lineal para todos los activos fijos activos de la empresa.
    Actualiza la depreciación acumulada y valor contable, y genera un comprobante contable de depreciación.
    """
    fecha = fecha_corte or date.today()
    stmt = select(ActivoFijo).where(
        ActivoFijo.empresa_id == empresa_id,
        ActivoFijo.activo == True,
        ActivoFijo.desincorporado == False
    )
    result = await db.execute(stmt)
    activos = result.scalars().all()

    if not activos:
        return {"status": "success", "message": "No hay activos fijos activos sujetos a depreciación.", "total_depreciado": 0}

    total_depreciacion = 0.0
    activos_actualizados = 0

    for a in activos:
        meses_totales = (a.vida_util_anos * 12) + (a.vida_util_meses or 0)
        if meses_totales <= 0:
            meses_totales = 60 # 5 años por defecto
        
        monto_depreciable = float(a.valor_adquisicion) - float(a.valor_salvamento)
        cuota_mensual = round(monto_depreciable / meses_totales, 2)

        # No depreciar más allá del valor depreciable
        deprec_actual = float(a.depreciacion_acumulada)
        if deprec_actual + cuota_mensual > monto_depreciable:
            cuota_mensual = max(0.0, round(monto_depreciable - deprec_actual, 2))

        if cuota_mensual > 0:
            a.depreciacion_acumulada = deprec_actual + cuota_mensual
            a.valor_contable = float(a.valor_adquisicion) - float(a.depreciacion_acumulada)
            a.monto_ultima_depreciacion = cuota_mensual
            a.fecha_ultima_depreciacion = fecha
            total_depreciacion += cuota_mensual
            activos_actualizados += 1

    # Generar asiento contable si hubo depreciación
    if total_depreciacion > 0:
        # Buscar cuentas de depreciación estándar
        stmt_gasto = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == "6.1.02.001")
        stmt_acum = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo == "1.2.02.004")
        cta_gasto = (await db.execute(stmt_gasto)).scalars().first()
        cta_acum = (await db.execute(stmt_acum)).scalars().first()

        # Si no existen, buscar cualquier cuenta del grupo 6 y 1.2
        if not cta_gasto:
            stmt_g = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo.like("6%"), CuentaContable.permite_movimiento == True)
            cta_gasto = (await db.execute(stmt_g)).scalars().first()
        if not cta_acum:
            stmt_a = select(CuentaContable).where(CuentaContable.empresa_id == empresa_id, CuentaContable.codigo.like("1.2%"), CuentaContable.permite_movimiento == True)
            cta_acum = (await db.execute(stmt_a)).scalars().first()

        if cta_gasto and cta_acum:
            num_asiento = f"DEP-{fecha.strftime('%Y%m')}-{datetime.utcnow().strftime('%S')}"
            comp = Comprobante(
                empresa_id=empresa_id,
                numero=num_asiento,
                fecha=fecha,
                tipo="DEPRECIACION",
                concepto=f"Depreciación periódica mensual de Activos Fijos - {fecha.strftime('%m/%Y')}",
                tasa_cambio=40.0,
                estado="ASENTADO",
                total_debito_base=total_depreciacion,
                total_credito_base=total_depreciacion,
                total_debito_divisa=round(total_depreciacion / 40.0, 2),
                total_credito_divisa=round(total_depreciacion / 40.0, 2),
                creado_por_usuario_id=current_user.id,
                creado_tipo_usuario="SISTEMA_AUTO",
                asentado_at=datetime.utcnow()
            )
            db.add(comp)
            await db.flush()

            r1 = ComprobanteRenglon(
                comprobante_id=comp.id,
                empresa_id=empresa_id,
                numero_linea=1,
                cuenta_id=cta_gasto.id,
                descripcion="Gasto de Depreciación Propiedad, Planta y Equipos",
                monto_debito_base=total_depreciacion,
                monto_debito_divisa=round(total_depreciacion / 40.0, 2)
            )
            r2 = ComprobanteRenglon(
                comprobante_id=comp.id,
                empresa_id=empresa_id,
                numero_linea=2,
                cuenta_id=cta_acum.id,
                descripcion="Depreciación Acumulada de Propiedad, Planta y Equipos",
                monto_credito_base=total_depreciacion,
                monto_credito_divisa=round(total_depreciacion / 40.0, 2)
            )
            db.add_all([r1, r2])

    await db.commit()
    return {
        "status": "success",
        "activos_procesados": activos_actualizados,
        "total_depreciacion_ves": round(total_depreciacion, 2),
        "total_depreciacion_usd": round(total_depreciacion / 40.0, 2),
        "mensaje": f"Depreciación calculada con éxito para {activos_actualizados} activos. Se imputaron Bs. {total_depreciacion:,.2f} a resultados."
    }
