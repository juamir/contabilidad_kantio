# 📜 MANDATO DE DESARROLLO: KANTIO CONTABILIDAD

Este documento rige las reglas absolutas, estándares técnicos y flujo de trabajo que **todos los agentes de Inteligencia Artificial y desarrolladores** deben seguir estrictamente para la construcción del sistema `Kantio Contabilidad`.

## 1. 🎯 Reglas Fundamentales (Reglas de Oro)

1. **SDD (Spec Driven Development) Primero:** NINGÚN agente escribirá código fuente sin antes haber redactado y validado el archivo de especificación (`.spec.md`) correspondiente en la carpeta `specs/`. 
2. **PostgreSQL RLS Obligatorio:** Ninguna tabla transaccional se creará sin la columna `tenant_id` y su respectiva política de seguridad a nivel de fila (Row Level Security). Esto es innegociable para garantizar el aislamiento SaaS.
3. **PWA y UI Sensitiva (Berry Template):** El frontend debe ser desarrollado como una PWA usando **React Berry Template** (MUI), garantizando funcionalidad táctil fluida (tablets) e incluyendo siempre ayudas contextuales (Onboarding/Tooltips).
4. **Integración Exclusiva con Kantio Core:** Toda autenticación, validación de licencias y jerarquía de suscripciones se delegará al servidor central (`api.kantio.online` / `51.170.55.93`). 
5. **No Inventar Frameworks:** 
   - Backend: **FastAPI** + **SQLAlchemy 2.0 Asyncio** + **Pydantic v2**.
   - Frontend: **React 18 (Vite)** + **Zustand** + **TanStack Query** + **Material-UI**.

## 2. 🗂️ Estructura del Repositorio

El proyecto reside en `C:\proyjuamir\Kantio\kantio_contabilidad\`:
- `/contaback/`: API REST asíncrona en Python.
- `/contafront/`: PWA en React TypeScript.
- `/specs/`: Documentos de especificación funcional detallada (Markdown).

## 3. 🚦 Control de Avance y Versionado (Basado en el Brief)

El documento base de arquitectura es `c:\proyjuamir\Kantio\BRIEF_KANTIO_CONTABILIDAD.md`. Usaremos el siguiente *Checklist de Fases* para medir el avance real de este mandato:

### [FASE 0] Arquitectura Base & Setup (COMPLETADA)
- [x] **0.1.** Inicialización de repositorios base (FastAPI + React Berry PWA).
- [x] **0.2.** Diseño del Modelo de Base de Datos Base (`tenant_id`, Roles, Usuarios).
- [x] **0.3.** Implementación de RLS en PostgreSQL y conexión Async.
- [x] **0.4.** Integración de Auth/Licencias con Kantio Core (Lease Tokens) y pruebas TDD pasando.

### [FASE 1] Plan Único de Cuentas (PUC) y Parámetros (COMPLETADA)
- [x] **1.1.** Creación de Especificación (`specs/01_puc_y_parametros.spec.md`).
- [x] **1.2.** Módulo de Cuentas Contables (Árbol Jerárquico VEN-NIF con 50+ cuentas base).
- [x] **1.3.** Módulo de Tasas de Cambio, Monedas y Auxiliares (Terceros, Centros de Costo).
- [x] **1.4.** Búsqueda autocompletar rápida (<50ms) y UI en React Berry.

### [FASE 2] Motor Bimonetario de Asientos (COMPLETADA)
- [x] **2.1.** Creación de Especificación (`specs/02_motor_asientos.spec.md`).
- [x] **2.2.** Lógica de cuadre de Partida Doble Bimonetaria (VES / USD) con tolerancia < 0.01.
- [x] **2.3.** Bloqueo a cuentas no operativas y bloqueo de escritura a Auditores Externos.
- [x] **2.4.** UX de Alta Velocidad (DataGrid con atajos, auto-cuadre y chips en vivo).
- [x] **2.5.** Pruebas unitarias e integración TDD pasando al 100%.

### [FASE 3] Inteligencia, OCR y Cumplimiento Fiscal (COMPLETADA)
- [x] **3.1.** Creación de Especificación (`specs/03_ocr_y_fiscal.spec.md`).
- [x] **3.2.** Motor OCR Open Source (Tesseract + Regex) sin costos de APIs externas.
- [x] **3.3.** Automatización de Retenciones (IVA 75%/100% e ISLR) en compras y ventas.
- [x] **3.4.** Generación y descarga oficial del archivo TXT para el portal del SENIAT.
- [x] **3.5.** Pruebas unitarias e integración TDD pasando al 100%.

### [FASE 4] Reportes Financieros y Cierres (NIIF 18) (COMPLETADA)
- [x] **4.1.** Creación de Especificación (`specs/04_reportes_financieros.spec.md`).
- [x] **4.2.** Balance General y Estado de Rendimiento bajo nueva norma NIIF 18 (Operativo vs Financiamiento).
- [x] **4.3.** Balance de Comprobación con validación matemática de saldos deudores y acreedores.
- [x] **4.4.** Interfaz interactiva de reportes en React Berry con pestañas por estado financiero.
- [x] **4.5.** Pruebas unitarias e integración TDD pasando al 100%.

### [FASE 5] Hub Multicliente e Integración de Ecosistema (COMPLETADA)
- [x] **5.1.** Creación de Especificación (`specs/05_hub_integracion.spec.md`).
- [x] **5.2.** Portal y Gobernanza de Estudios Contables (Portabilidad en 1 Clic).
- [x] **5.3.** Webhook de integración automática con `Kantio Nómina` (Asiento de gastos, aportes y retenciones).
- [x] **5.4.** Webhook de integración automática con `Kantio FastPOS` (Cierre Z con desglose de IVA 16%).
- [x] **5.5.** Suite completa de pruebas TDD pasando al 100% (10 tests verdes).

---
## 4. 🚀 Acción Inmediata (Start Development)
A partir de este momento, el agente iniciará con la **Fase 0.1 y 0.2**: Redactar la especificación técnica de la base de datos y generar los proyectos base.
