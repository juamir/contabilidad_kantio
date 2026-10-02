from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.usuario import Usuario
from app.services.reportes_engine import (
    calcular_balance_comprobacion,
    calcular_estado_resultados_niif18,
    calcular_balance_general
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/empresas/{empresa_id}/balance-comprobacion")
async def get_balance_comprobacion(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera el Balance de Comprobación de Sumas y Saldos a partir de todos los comprobantes asentados.
    """
    return await calcular_balance_comprobacion(db, empresa_id)

@router.get("/empresas/{empresa_id}/estado-resultados")
async def get_estado_resultados(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera el Estado de Rendimiento Financiero (PyG) estructurado bajo la nueva norma NIIF 18
    (Subtotales Operativo, Margen Bruto, Financiamiento/Diferencial Cambiario, e IGTF).
    """
    return await calcular_estado_resultados_niif18(db, empresa_id)

@router.get("/empresas/{empresa_id}/balance-general")
async def get_balance_general(
    empresa_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera el Balance General (Estado de Situación Financiera clasificado):
    Activos = Pasivos + Patrimonio + Resultado del Ejercicio.
    """
    return await calcular_balance_general(db, empresa_id)
