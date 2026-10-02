# 📐 ESPECIFICACIÓN TÉCNICA 02: MOTOR BIMONETARIO DE ASIENTOS (COMPROBANTES)

> **Módulo:** Contabilidad General / Transaccional  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 2  

---

## 1. 🎯 Objetivo
Diseñar e implementar el motor central de comprobantes y asientos de diario contable, garantizando la validación estricta de **Partida Doble en Tiempo Real (Débitos = Créditos)** en dos monedas simultáneas (Moneda Base VES y Moneda Extranjera USD/EUR), estados de ciclo de vida del asiento, plantillas recurrentes (Comprobantes Modelo) y captura ultra-rápida por teclado.

---

## 2. 🗃️ Modelo de Datos Relacional

### 2.1. `periodos_contables`
Control de ejercicios y meses fiscales para evitar registros extemporáneos.
- `id`: UUID (PK)
- `empresa_id`: UUID (FK con RLS)
- `ano`: INTEGER NOT NULL (ej. 2026)
- `mes`: SMALLINT NOT NULL (1 a 12)
- `fecha_inicio`: DATE NOT NULL
- `fecha_fin`: DATE NOT NULL
- `cerrado`: BOOLEAN DEFAULT FALSE
- `cerrado_por_usuario_id`: UUID (Nullable)
- `cerrado_at`: TIMESTAMPTZ (Nullable)

*Índice Único:* `(empresa_id, ano, mes)`

### 2.2. `comprobantes` (Encabezado de Asiento / Voucher)
- `id`: UUID (PK)
- `empresa_id`: UUID (FK con RLS NOT NULL)
- `numero`: VARCHAR(30) NOT NULL -- Correlativo anual/mensual (ej. "2026-10-0001")
- `fecha`: DATE NOT NULL -- Fecha valor del asiento
- `periodo_id`: UUID (FK a `periodos_contables.id`)
- `tipo`: VARCHAR(30) DEFAULT 'DIARIO' -- 'DIARIO', 'AJUSTE', 'CIERRE', 'APERTURA', 'INTEGRACION_NOMINA', 'INTEGRACION_POS'
- `concepto`: VARCHAR(500) NOT NULL -- Glosa general
- `tasa_cambio`: NUMERIC(18, 6) NOT NULL -- Tasa BCV aplicada
- `moneda_origen_id`: UUID (VES)
- `moneda_divisa_id`: UUID (USD)
- `estado`: VARCHAR(20) DEFAULT 'BORRADOR' -- 'BORRADOR', 'REVISADO', 'ASENTADO', 'ANULADO'
- `total_debito_base`: NUMERIC(18, 2) NOT NULL
- `total_credito_base`: NUMERIC(18, 2) NOT NULL
- `total_debito_divisa`: NUMERIC(18, 2) NOT NULL
- `total_credito_divisa`: NUMERIC(18, 2) NOT NULL
- `creado_por_usuario_id`: UUID NOT NULL
- `creado_tipo_usuario`: VARCHAR(30) NOT NULL -- 'EMPRESA_INTERNO', 'ESTUDIO_MIEMBRO'
- `estudio_id`: UUID (Nullable, si lo creó un contador delegado)
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `asentado_at`: TIMESTAMPTZ (Nullable)

*Índice Único:* `(empresa_id, numero)`

### 2.3. `comprobante_renglones` (Líneas de Detalle / Asiento)
- `id`: UUID (PK)
- `comprobante_id`: UUID (FK a `comprobantes.id` ON DELETE CASCADE)
- `empresa_id`: UUID (FK con RLS)
- `numero_linea`: SMALLINT NOT NULL (1, 2, 3...)
- `cuenta_id`: UUID (FK a `cuentas_contables.id` NOT NULL)
- `descripcion`: VARCHAR(255) NOT NULL -- Glosa específica de la línea
- `auxiliar_id`: UUID (FK nullable a `auxiliares.id` para Terceros/Clientes/Proveedores)
- `centro_costo_id`: UUID (FK nullable a `centros_costo.id`)
- `tipo_documento`: VARCHAR(20) (Nullable: FACT, NC, ND, CHQ, TRANSF)
- `numero_documento`: VARCHAR(50) (Nullable)
- `monto_debito_base`: NUMERIC(18, 2) DEFAULT 0.00
- `monto_credito_base`: NUMERIC(18, 2) DEFAULT 0.00
- `monto_debito_divisa`: NUMERIC(18, 2) DEFAULT 0.00
- `monto_credito_divisa`: NUMERIC(18, 2) DEFAULT 0.00

### 2.4. `comprobantes_modelo` & `comprobante_modelo_renglones`
Plantillas para asientos recurrentes (ej: Provisiones, depreciación, alquiler mensual).

---

## 3. ⚖️ Reglas de Validación Contable (Inmutables)

1. **Partida Doble Estricta:**
   $$\sum \text{Débitos Base} = \sum \text{Créditos Base} \quad (\text{Tolerancia } \le 0.01)$$
   $$\sum \text{Débitos Divisa} = \sum \text{Créditos Divisa} \quad (\text{Tolerancia } \le 0.01)$$
2. **Cuentas Imputables:** Solo cuentas con `permite_movimiento = True` y `activa = True` pueden registrarse en renglones.
3. **Periodo Abierto:** No se permite asentar en periodos con `cerrado = True`.
4. **Inmutabilidad de Asentados:** Un asiento en estado `ASENTADO` no puede modificarse directamente. Para corregirlo, debe generarse un asiento de reversión o anularse mediante un contra-asiento auditable.
5. **Auditor Externo:** Los usuarios con rol `AUDITOR_EXTERNO` tienen acceso bloqueado para crear, modificar o asentar comprobantes.

---

## 4. ⌨️ Requerimientos de UX de Alta Velocidad (Frontend)
1. **Atajos de Teclado:**
   - `Ctrl + Enter`: Guardar y asentar comprobante.
   - `F4`: Insertar nueva línea de renglón.
   - `Tab`: Salto entre campos: Cuenta $\rightarrow$ Auxiliar $\rightarrow$ Débito $\rightarrow$ Crédito.
   - `Espacio` en columna de crédito/débito: Calcula y rellena automáticamente la diferencia para cuadrar la partida doble con un solo toque.
