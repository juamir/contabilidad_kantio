# 📐 ESPECIFICACIÓN TÉCNICA 04: REPORTES FINANCIEROS Y CIERRES BAJO VEN-NIF (NIIF 18)

> **Módulo:** Contabilidad Financiera / Reportes & Libros Legales  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 4  

---

## 1. 🎯 Objetivo
Generar los estados financieros obligatorios bajo estándares **VEN-NIF** actualizados (especialmente la nueva taxonomía de la **NIIF 18** para presentación del Estado de Resultados con subtotales operativos y de financiamiento), así como el Libro Mayor Analítico y Balance de Comprobación de Sumas y Saldos.

---

## 2. 📊 Especificación de Reportes

### 2.1. Balance de Comprobación (Sumas y Saldos)
Calculado a partir de los comprobantes en estado `ASENTADO`:
- Columnas: Código | Descripción | Débitos Acumulados | Créditos Acumulados | Saldo Deudor | Saldo Acreedor.
- Validación de cuadre global: $\sum \text{Saldos Deudores} = \sum \text{Saldos Acreedores}$.

### 2.2. Estado de Situación Financiera (Balance General)
- **Activos:**
  - Activos Corrientes (Efectivo y Equivalentes, Cuentas por Cobrar, Inventarios, Impuestos Anticipados).
  - Activos No Corrientes (Propiedades, Planta y Equipo, Intangibles, Depreciación Acumulada).
- **Pasivos:**
  - Pasivos Corrientes (Cuentas por Pagar, Obligaciones Fiscales/SENIAT, Provisiones Laborales).
  - Pasivos No Corrientes (Prestaciones Sociales a Largo Plazo).
- **Patrimonio:**
  - Capital Social, Reservas Legales, Resultados Acumulados, Resultado del Ejercicio.
- *Ecuación Fundamental:* $\text{Activo} = \text{Pasivo} + \text{Patrimonio}$.

### 2.3. Estado de Rendimiento Financiero / PyG (Bajo NIIF 18)
Conforme a la NIIF 18 aprobada por la FCCPV en la actualización 2026:
- **Categoría Operativa:**
  - (+) Ingresos de Actividades Ordinarias
  - (-) Costo de Ventas
  - (=) **Margen Bruto Operativo**
  - (-) Gastos Operativos (Personal, Administración, Depreciaciones)
  - (=) **Resultado Operativo**
- **Categoría de Financiamiento y Otros:**
  - (+) Ingresos por Diferencial Cambiario
  - (-) Gastos Bancarios e IGTF
  - (-) Pérdida en Diferencial Cambiario
- (=) **Resultado Neto del Ejercicio (Ganancia o Pérdida)**.

---

## 3. 🧪 Criterios de Aceptación y Pruebas TDD
1. Un asiento asentado de Venta aumenta los Ingresos y el Activo en el Balance y el PyG.
2. Los comprobantes en estado `BORRADOR` o `ANULADO` son excluidos estrictamente de los cálculos de saldos.
3. El Estado de Resultados refleja con exactitud la Ganancia/Pérdida en Diferencial Cambiario y el IGTF en sus categorías NIIF 18.
