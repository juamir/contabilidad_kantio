# 📐 ESPECIFICACIÓN TÉCNICA 00: ARQUITECTURA BASE, MULTI-TENANCY Y RLS

> **Módulo:** Arquitectura Base, Seguridad & Tenancy  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 0  

---

## 1. 🎯 Objetivo
Definir e implementar el modelo de aislamiento multi-tenant a nivel de base de datos PostgreSQL mediante **Row Level Security (RLS)**, el modelo entidad-relación de Empresas, Grupos, Estudios Contables, Usuarios y Roles (RBAC), así como la integración del motor de tokens criptográficos con **Kantio Core**.

---

## 2. 🗃️ Modelo Entidad-Relación y Tablas Base

### 2.1. `empresas` (Tenants Principales)
Representa la entidad legal propietaria de la contabilidad y de la suscripción.
- `id`: UUID (PK, default uuid_generate_v4())
- `codigo`: VARCHAR(20) UNIQUE NOT NULL (ej. "EMP-001")
- `razon_social`: VARCHAR(255) NOT NULL
- `nombre_comercial`: VARCHAR(255)
- `rif`: VARCHAR(20) NOT NULL (Validación fiscal J/V/G/E)
- `moneda_base_id`: UUID (Referencia a VES por defecto)
- `moneda_reporte_id`: UUID (Referencia a USD por defecto)
- `es_grupo_holding`: BOOLEAN DEFAULT FALSE
- `grupo_id`: UUID (FK nullable a `grupos_empresariales.id`)
- `plan_suscripcion`: VARCHAR(50) DEFAULT 'ESTANDAR' (ESTANDAR, CORPORATIVO)
- `licencia_lease_token`: TEXT
- `activo`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.2. `grupos_empresariales`
Permite consolidar contabilidades de múltiples empresas.
- `id`: UUID (PK)
- `codigo`: VARCHAR(20) UNIQUE NOT NULL
- `nombre`: VARCHAR(255) NOT NULL
- `empresa_matriz_id`: UUID (FK a `empresas.id`)
- `activo`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.3. `estudios_contables`
Despachos contables que ofrecen servicios de outsourcing a múltiples empresas.
- `id`: UUID (PK)
- `codigo`: VARCHAR(20) UNIQUE NOT NULL (ej. "EST-KANTIO")
- `nombre`: VARCHAR(255) NOT NULL
- `rif`: VARCHAR(20) NOT NULL
- `email_contacto`: VARCHAR(255) NOT NULL
- `telefono`: VARCHAR(50)
- `activo`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.4. `empresa_estudio_delegaciones` (Portabilidad & Delegación)
Gobernanza de vinculación entre Empresas y Estudios Contables.
- `id`: UUID (PK)
- `empresa_id`: UUID (FK a `empresas.id` NOT NULL)
- `estudio_id`: UUID (FK a `estudios_contables.id` NOT NULL)
- `tipo_delegacion`: VARCHAR(30) NOT NULL -- 'OPERATIVO_COMPLETO', 'AUDITORIA_LECTURA'
- `fecha_inicio`: DATE NOT NULL
- `fecha_fin`: DATE (Nullable)
- `estado`: VARCHAR(20) DEFAULT 'ACTIVA' -- 'ACTIVA', 'REVOCADA', 'SUSPENDIDA'
- `revocado_por_usuario_id`: UUID
- `revocado_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.5. `usuarios`
Cuentas de usuario de toda la plataforma.
- `id`: UUID (PK)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `hashed_password`: VARCHAR(255) NOT NULL
- `nombre_completo`: VARCHAR(255) NOT NULL
- `telefono`: VARCHAR(50)
- `tipo_usuario`: VARCHAR(30) NOT NULL -- 'KANTIO_ADMIN', 'EMPRESA_INTERNO', 'ESTUDIO_MIEMBRO'
- `empresa_id`: UUID (FK a `empresas.id`, nullable si es del estudio o admin)
- `estudio_id`: UUID (FK a `estudios_contables.id`, nullable si es de empresa o admin)
- `rol`: VARCHAR(50) NOT NULL -- 'ADMIN_EMPRESA', 'TESORERIA', 'SOCIO_ESTUDIO', 'CONTADOR_SENIOR', 'ASISTENTE_CONTABLE', 'AUDITOR_EXTERNO'
- `activo`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.6. `audit_logs`
Bitácora inmutable de eventos.
- `id`: BIGSERIAL (PK)
- `empresa_id`: UUID NOT NULL
- `usuario_id`: UUID NOT NULL
- `tipo_usuario`: VARCHAR(30) NOT NULL
- `estudio_id`: UUID (Nullable)
- `accion`: VARCHAR(100) NOT NULL -- 'ASIENTO_CREAR', 'ASIENTO_ANULAR', 'CIERRE_MES', 'DELEGACION_REVOCAR'
- `recurso_tipo`: VARCHAR(50) NOT NULL
- `recurso_id`: VARCHAR(100) NOT NULL
- `payload_anterior`: JSONB
- `payload_nuevo`: JSONB
- `ip_address`: VARCHAR(45)
- `user_agent`: TEXT
- `timestamp`: TIMESTAMPTZ DEFAULT NOW()

---

## 3. 🛡️ Implementación de Row Level Security (RLS)

1. Cada conexión a la base de datos establecerá la variable de sesión:
   ```sql
   SET LOCAL app.current_empresa_id = 'uuid-de-empresa';
   SET LOCAL app.current_user_role = 'CONTADOR_SENIOR';
   ```
2. Todas las tablas transaccionales y paramétricas de la contabilidad (`cuentas_contables`, `comprobantes`, `comprobante_renglones`, etc.) tendrán:
   ```sql
   ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;

   CREATE POLICY comprobantes_isolation_policy ON comprobantes
     AS RESTRICTIVE
     FOR ALL
     USING (empresa_id = NULLIF(current_setting('app.current_empresa_id', true), '')::uuid);
   ```
3. Reglas especiales para auditores:
   Si `app.current_user_role = 'AUDITOR_EXTERNO'`, las operaciones `INSERT`, `UPDATE`, `DELETE` serán bloqueadas automáticamente por política SQL o middleware FastAPI.

---

## 4. 🧪 Criterios de Aceptación y Pruebas TDD

1. **Test Aislamiento:** Un usuario de la Empresa A no puede leer registros de la Empresa B, obteniendo siempre un conjunto vacío.
2. **Test Delegación:** Un usuario de un Estudio Contable con asignación activa sobre Empresa A puede establecer el contexto de Empresa A y crear asientos si su rol es `CONTADOR_SENIOR` o `ASISTENTE_CONTABLE`.
3. **Test Revocación:** Al marcar una delegación como `REVOCADA`, cualquier intento subsiguiente de acceso por miembros de dicho estudio a esa empresa genera un error HTTP 403 Forbidden.
4. **Test Auditor:** Un usuario con rol `AUDITOR_EXTERNO` puede consultar reportes y comprobantes de la empresa asignada, pero cualquier llamada `POST /api/v1/asientos` retorna HTTP 403.
