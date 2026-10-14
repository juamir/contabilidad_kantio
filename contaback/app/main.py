from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base, AsyncSessionLocal
from app.services.initial_seed import seed_initial_demo_data

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import text

@app.on_event("startup")
async def startup_event():
    # Migración defensiva en caliente para prevenir error 500 (columna faltante y nuevas tablas)
    async with engine.begin() as conn:
        ddl_statements = [
            """CREATE TABLE IF NOT EXISTS grupos_empresariales (
                id UUID PRIMARY KEY,
                codigo VARCHAR(20) UNIQUE NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )""",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS nombre_comercial VARCHAR(255)",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS nit VARCHAR(50)",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS prioridad INTEGER DEFAULT 0",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS es_grupo_holding BOOLEAN DEFAULT FALSE",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS grupo_id UUID",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS plan_suscripcion VARCHAR(50) DEFAULT 'ESTANDAR'",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS licencia_lease_token TEXT",
            "ALTER TABLE IF EXISTS empresas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE",
            "ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS avatar_url TEXT",
            "ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'CONTADOR'",
            "ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE",
            "ALTER TABLE IF EXISTS facturas_fiscales ADD COLUMN IF NOT EXISTS rif_tercero VARCHAR(20)",
            "ALTER TABLE IF EXISTS facturas_fiscales ADD COLUMN IF NOT EXISTS nombre_tercero VARCHAR(255)",
            """CREATE TABLE IF NOT EXISTS cuentas_bancarias (
                id UUID PRIMARY KEY,
                empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
                codigo VARCHAR(20) NOT NULL,
                banco VARCHAR(100) NOT NULL,
                numero_cuenta VARCHAR(30) NOT NULL,
                tipo VARCHAR(50) NOT NULL DEFAULT 'CORRIENTE VES',
                moneda VARCHAR(10) NOT NULL DEFAULT 'VES',
                saldo_libros_ves NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
                saldo_banco_ves NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
                saldo_usd NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
                estado_conciliacion VARCHAR(30) NOT NULL DEFAULT 'CONCILIADO',
                cuenta_contable_id UUID REFERENCES cuentas_contables(id),
                activo BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )""",
            "CREATE INDEX IF NOT EXISTS ix_cuentas_bancarias_empresa_id ON cuentas_bancarias (empresa_id)"
        ]
        for stmt in ddl_statements:
            try:
                await conn.execute(text(stmt))
            except Exception as ddl_err:
                print(f"Nota DDL: {ddl_err}")

        await conn.run_sync(Base.metadata.create_all)

    # Inyectar datos semilla precargados automáticos
    async with AsyncSessionLocal() as session:
        try:
            await seed_initial_demo_data(session)
        except Exception as e:
            print(f"Error al sembrar datos iniciales: {e}")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "kantio-contabilidad-api",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
