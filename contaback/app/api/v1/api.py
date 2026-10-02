from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, empresas, estudios, cuentas, monedas, asientos, fiscal, reportes, integracion,
    centros_costo, auxiliares, tipos_documento, activos_fijos
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(empresas.router, prefix="/empresas", tags=["Empresas & Parámetros"])
api_router.include_router(estudios.router, prefix="/estudios", tags=["Estudios Contables & Delegaciones"])
api_router.include_router(cuentas.router, prefix="/cuentas", tags=["Plan Único de Cuentas (PUC)"])
api_router.include_router(centros_costo.router, prefix="/centros-costo", tags=["Centros de Costo"])
api_router.include_router(auxiliares.router, prefix="/auxiliares", tags=["Auxiliares & Terceros"])
api_router.include_router(tipos_documento.router, prefix="/tipos-documento", tags=["Tipos de Documento"])
api_router.include_router(activos_fijos.router, prefix="/activos-fijos", tags=["Activos Fijos & Depreciación"])
api_router.include_router(monedas.router, prefix="/monedas", tags=["Monedas & Tasas"])
api_router.include_router(asientos.router, prefix="/asientos", tags=["Comprobantes & Asientos"])
api_router.include_router(fiscal.router, prefix="/fiscal", tags=["Fiscal & Retenciones SENIAT"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["Estados Financieros & Reportes"])
api_router.include_router(integracion.router, prefix="/integracion", tags=["Integración Ecosistema (Nómina & POS)"])
