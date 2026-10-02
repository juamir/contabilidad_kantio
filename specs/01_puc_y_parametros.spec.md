# 📐 ESPECIFICACIÓN TÉCNICA 01: PLAN DE CUENTAS (PUC), MONEDAS Y PARÁMETROS

> **Módulo:** Contabilidad General / Catálogo & Maestros  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 1  

---

## 1. 🎯 Objetivo
Implementar el modelo de datos y endpoints REST para el Plan Único de Cuentas (PUC) jerárquico bajo estándares **VEN-NIF**, soporte de monedas y tasas de cambio históricas (BCV y paralelas), centros de costos multidimensionales y auxiliares (terceros).

---

## 2. 🗃️ Modelo de Datos

### 2.1. `cuentas_contables`
- `id`: UUID (PK)
- `empresa_id`: UUID (FK NOT NULL con RLS)
- `codigo`: VARCHAR(50) NOT NULL (ej. "1.1.01.001")
- `descripcion`: VARCHAR(255) NOT NULL
- `nivel`: SMALLINT NOT NULL (1 a 6)
- `naturaleza`: VARCHAR(10) NOT NULL -- 'DEUDORA', 'ACREEDORA'
- `tipo_cuenta`: VARCHAR(20) NOT NULL -- 'ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'COSTO', 'GASTO', 'ORDEN'
- `permite_movimiento`: BOOLEAN NOT NULL -- True solo para el último nivel
- `parent_id`: UUID (FK nullable a `cuentas_contables.id`)
- `requiere_auxiliar`: BOOLEAN DEFAULT FALSE
- `requiere_centro_costo`: BOOLEAN DEFAULT FALSE
- `requiere_documento`: BOOLEAN DEFAULT FALSE
- `moneda_restringida_id`: UUID (Nullable, si solo admite operaciones en una moneda)
- `activa`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

*Índice Único:* `(empresa_id, codigo)`

### 2.2. `monedas`
- `id`: UUID (PK)
- `codigo`: VARCHAR(10) NOT NULL -- 'VES', 'USD', 'EUR', 'USDT'
- `nombre`: VARCHAR(50) NOT NULL
- `simbolo`: VARCHAR(5) NOT NULL
- `es_moneda_nacional`: BOOLEAN DEFAULT FALSE
- `activa`: BOOLEAN DEFAULT TRUE

### 2.3. `tasas_cambio`
- `id`: UUID (PK)
- `moneda_origen_id`: UUID (FK a `monedas.id`)
- `moneda_destino_id`: UUID (FK a `monedas.id`)
- `fecha`: DATE NOT NULL
- `tipo_tasa`: VARCHAR(30) NOT NULL -- 'BCV_OFICIAL', 'PARALELO'
- `tasa`: NUMERIC(18, 6) NOT NULL
- `fuente`: VARCHAR(50) DEFAULT 'BCV'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

*Índice Único:* `(moneda_origen_id, moneda_destino_id, fecha, tipo_tasa)`

### 2.4. `centros_costo`
- `id`: UUID (PK)
- `empresa_id`: UUID (FK NOT NULL con RLS)
- `codigo`: VARCHAR(50) NOT NULL
- `nombre`: VARCHAR(255) NOT NULL
- `parent_id`: UUID (Nullable)
- `activo`: BOOLEAN DEFAULT TRUE

### 2.5. `auxiliares` (Terceros)
- `id`: UUID (PK)
- `empresa_id`: UUID (FK NOT NULL con RLS)
- `codigo`: VARCHAR(50) NOT NULL
- `nombre_razon_social`: VARCHAR(255) NOT NULL
- `tipo_identificacion`: VARCHAR(10) NOT NULL -- 'J', 'V', 'G', 'E'
- `rif_cedula`: VARCHAR(20) NOT NULL
- `tipo_auxiliar`: VARCHAR(30) NOT NULL -- 'CLIENTE', 'PROVEEDOR', 'EMPLEADO', 'SOCIO', 'OTRO'
- `email`: VARCHAR(255)
- `telefono`: VARCHAR(50)
- `activo`: BOOLEAN DEFAULT TRUE

---

## 3. 🌱 Catálogo Semilla Predeterminado (VEN-NIF)
Al crearse una nueva empresa, el sistema inyecta automáticamente el Plan de Cuentas base VEN-NIF estructurado en 8 macro-grupos:
1. ACTIVOS (Corrientes y No Corrientes, Efectivo, Cuentas por Cobrar, Inventarios, PPE, Deprec. Acumulada)
2. PASIVOS (Corrientes y No Corrientes, Cuentas por Pagar, Obligaciones Fiscales/SENIAT, Laborales/LOTTT)
3. PATRIMONIO (Capital Social, Reservas, Resultados Acumulados)
4. INGRESOS (Operacionales, Descuentos)
5. COSTOS DE VENTAS
6. GASTOS OPERATIVOS (Personal, Administración, Depreciaciones)
7. OTROS INGRESOS (Diferencial Cambiario Ganancia, Financieros)
8. OTROS EGRESOS (Diferencial Cambiario Pérdida, IGTF, Gastos Bancarios)

---

## 4. 🧪 Criterios de Aceptación y Pruebas TDD

1. **Jerarquía:** Una cuenta de nivel superior (`permite_movimiento = False`) no puede recibir asientos contables directamente.
2. **Eliminación Segura:** No se puede eliminar una cuenta contable si tiene subcuentas hijas o si tiene movimientos en `comprobante_renglones`.
3. **Carga Semilla:** Toda empresa creada inicia con el PUC VEN-NIF precargado y listo para operar.
4. **Búsqueda Autocompletar:** El endpoint `GET /api/v1/cuentas/buscar` debe responder en menos de 50ms soportando búsqueda por código y por nombre para alimentar el DataGrid en React.
