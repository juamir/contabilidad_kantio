# 📐 ESPECIFICACIÓN TÉCNICA 05: HUB MULTICLIENTE E INTEGRACIONES DE ECOSISTEMA (NÓMINA & FASTPOS)

> **Módulo:** Interoperabilidad & Hub de Estudios  
> **Estado:** Aprobado para Desarrollo  
> **Fase:** 5  

---

## 1. 🎯 Objetivo
Proveer la interfaz REST y webhooks de integración para que los sistemas satélites del ecosistema (**Kantio Nómina** y **Kantio FastPOS**) generen asientos contables automáticos sin digitación manual, y habilitar el Workspace Multicliente para que los Estudios Contables gestionen a todas sus empresas delegadas desde una sola pantalla.

---

## 2. 🔌 Endpoints de Integración Inter-Sistemas

### 2.1. Webhook de Contabilización de Nómina (`POST /api/v1/integracion/nomina`)
Recibe el resumen liquidado de una nómina quincenal o mensual emitida por `Kantio Nómina`:
- **Débito:** Gastos de Personal (Sueldos y Salarios `6.1.01.001`, Cestaticket `6.1.01.002`, Aportes Patronales `6.1.02.001..004`).
- **Crédito:** Retenciones de Ley por Enterar (`2.1.04.002` SSO, `2.1.04.003` RPE, `2.1.04.004` FAOV).
- **Crédito:** Nómina Neta por Pagar o Banco (`2.1.04.001` o `1.1.01.002`).

### 2.2. Webhook de Contabilización de Ventas POS (`POST /api/v1/integracion/pos`)
Recibe el cierre Z de caja diaria desde `Kantio FastPOS`:
- **Débito:** Caja General (`1.1.01.001`) y Bancos Punto de Venta (`1.1.01.002`).
- **Crédito:** Ventas de Actividades Ordinarias (`4.1.01.001`).
- **Crédito:** Débito Fiscal IVA (`2.1.03.001`).
- **Asiento complementario de inventario:** Débito Costo de Ventas (`5.1.01.001`) vs Crédito Inventario de Mercancía (`1.1.03.001`).

### 2.3. Hub Multicliente del Estudio (`GET /api/v1/estudios/{estudio_id}/resumen-empresas`)
Lista todas las empresas que han delegado acceso al estudio contable con métricas clave:
- Nombre y RIF de la empresa.
- Tipo de delegación (`OPERATIVO_COMPLETO` o `AUDITORIA_LECTURA`).
- Cantidad de comprobantes pendientes por asentar (Borradores).
- Último periodo cerrado.

---

## 3. 🧪 Criterios de Aceptación y Pruebas TDD
1. Un payload válido de nómina genera automáticamente un comprobante en estado `ASENTADO` con tipo `INTEGRACION_NOMINA` con balance perfecto de débitos y créditos.
2. Un payload de venta POS genera el asiento de ventas separando la base imponible del débito fiscal IVA (16%).
3. Si el estudio contable consulta sus empresas asignadas, recibe únicamente las empresas que mantienen una delegación activa.
