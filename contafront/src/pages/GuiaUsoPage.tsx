import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Divider,
  Button,
  Stack,
  Alert,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import SchemaIcon from '@mui/icons-material/Schema';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import GavelIcon from '@mui/icons-material/Gavel';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableChartIcon from '@mui/icons-material/TableChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link, useNavigate } from 'react-router-dom';

export const GuiaUsoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<string | false>('faq-1');
  const [copiedAsiento, setCopiedAsiento] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChangeFaq = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const handleCopyAsiento = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiedAsiento(texto);
    setTimeout(() => setCopiedAsiento(null), 2500);
  };

  // 10 Fases Metodológicas End-to-End
  const workflowSteps = [
    {
      label: 'Fase 1: Alta de Empresa Titular & Parámetros Contables',
      shortTitle: 'Empresas & Parámetros',
      icon: <CorporateFareIcon sx={{ color: '#7c3aed' }} />,
      route: '/empresas?tab=parametros',
      responsable: 'Administrador General / Contador Principal',
      legalRef: 'Código de Comercio de Venezuela (Art. 32) y BA VEN-NIF 8',
      descripcion:
        'Cree la ficha jurídica de la empresa con su RIF venezolano (J-, G-, V-) y defina la estructura jerárquica de cuentas (niveles 1 a 6, longitud de dígitos y separador ".", ej: X.X.XX.XXX). Configure las fechas de inicio de ejercicio fiscal y consecutivos oficiales de comprobantes.',
      checklist: [
        'RIF y Razón Social coincidentes con el certificado del SENIAT.',
        'Máscara de cuenta definida antes de crear el catálogo.',
        'Fechas de ejercicio contable (01/01 al 31/12 o período especial).'
      ]
    },
    {
      label: 'Fase 2: Catálogo Plan Único de Cuentas (PUC) VEN-NIF',
      shortTitle: 'Plan de Cuentas',
      icon: <AccountTreeIcon sx={{ color: '#7c3aed' }} />,
      route: '/cuentas',
      responsable: 'Contador Senior',
      legalRef: 'Boletín de Aplicación BA VEN-NIF N° 8 (Versión 11) y NIIF para PYMES',
      descripcion:
        'Revise el plan de cuentas preconfigurado con más de 100 cuentas estándar. Al crear cuentas adicionales, el sistema infiere automáticamente la Clase Financiera (1=Activo, 2=Pasivo, 3=Patrimonio, etc.) y expande ceros a la izquierda (ej: 1.1.1.6 -> 1.1.01.006). Solo las subcuentas de último nivel deben tener activado "Permite Movimiento".',
      checklist: [
        'Cuentas de Activo y Gastos con naturaleza Deudora.',
        'Cuentas de Pasivo, Patrimonio e Ingresos con naturaleza Acreedora.',
        'Indicador de "Permite Movimiento" reservado para el último nivel.'
      ]
    },
    {
      label: 'Fase 3: Monedas, Tasas BCV & Cuentas Bancarias',
      shortTitle: 'Tesorería & Tasas',
      icon: <CurrencyExchangeIcon sx={{ color: '#7c3aed' }} />,
      route: '/cuentas?tab=monedas',
      responsable: 'Tesorero / Administrador',
      legalRef: 'Convenio Cambiario N° 1 del BCV y Ley del Banco Central de Venezuela',
      descripcion:
        'Establezca el Bolívar Digital (VES) como moneda funcional y configure el Dólar Estadounidense (USD) o Euro como moneda de reporte. Registre o verifique la tasa de cambio oficial del BCV del día para la conversión y registro bimonetario de los comprobantes.',
      checklist: [
        'Cuentas bancarias asociadas con sus códigos SUDEBAN de 4 dígitos.',
        'Tasa oficial BCV actualizada antes de procesar transacciones del día.',
        'Cuentas de Diferencial Cambiario (Ganancia / Pérdida) configuradas.'
      ]
    },
    {
      label: 'Fase 4: Auxiliares (Terceros), Centros de Costo & Documentos',
      shortTitle: 'Terceros & Centros',
      icon: <TableChartIcon sx={{ color: '#7c3aed' }} />,
      route: '/cuentas?tab=auxiliares',
      responsable: 'Asistente Contable / Facturación',
      legalRef: 'Providencia SENIAT N° 00071 (Emisión de Facturas y Documentos)',
      descripcion:
        'Catalogue los proveedores y clientes como Auxiliares indicando su condición de contribuyente y porcentaje de retención habitual. Defina Centros de Costo operativos y los Tipos de Documentos mercantiles soportados (FACT, NC, ND, RETIVA, COMPR).',
      checklist: [
        'Proveedores con RIF verificado y porcentaje de retención IVA (75%/100%).',
        'Centros de costo vinculados a departamentos operacionales.',
        'Tipos de documento asociados a los correlativos legales.'
      ]
    },
    {
      label: 'Fase 5: Registro de Comprobantes de Diario (Vouchers Bimonetarios)',
      shortTitle: 'Asientos de Diario',
      icon: <ReceiptLongIcon sx={{ color: '#7c3aed' }} />,
      route: '/asientos',
      responsable: 'Asistente Contable / Contador Senior',
      legalRef: 'Código de Comercio Art. 34 (Principio de Partida Doble)',
      descripcion:
        'Elabore asientos contables registrando cargos y abonos en Bolívares con contravalor simultáneo en USD a la tasa BCV aplicable. Utilice la función "Auto-Cuadrar" para balancear diferencias menores o utilice los 14 Comprobantes Modelo predefinidos (Apertura, Nómina, Ventas, Cierre).',
      checklist: [
        'Sumatoria de Débitos exactamente igual a la sumatoria de Créditos.',
        'Fecha del comprobante dentro del período fiscal vigente.',
        'Soporte digital o físico vinculado a la glosa del asiento.'
      ]
    },
    {
      label: 'Fase 6: Procesamiento por Lote & Asentado Oficial',
      shortTitle: 'Procesamiento Lote',
      icon: <PlayCircleOutlineIcon sx={{ color: '#7c3aed' }} />,
      route: '/asientos?tab=lote',
      responsable: 'Contador Senior',
      legalRef: 'Código de Comercio Art. 36 (Inalterabilidad de Asientos)',
      descripcion:
        'Revise los comprobantes registrados en estado BORRADOR. Ejecute la validación masiva y el Asentado en Lote, transformándolos en registros firmes del Libro Mayor. Si requiere corregir un comprobante ya asentado, utilice la opción de Anulación o Reversión por Lote.',
      checklist: [
        'Verificación previa del balance de cada comprobante.',
        'Asentado ordenado cronológicamente.',
        'Pista de auditoría preservada con usuario y fecha de modificación.'
      ]
    },
    {
      label: 'Fase 7: Gestión de Activos Fijos & Depreciación Mensual',
      shortTitle: 'Activos Fijos',
      icon: <PrecisionManufacturingIcon sx={{ color: '#7c3aed' }} />,
      route: '/activos-fijos',
      responsable: 'Contador de Activos / Costos',
      legalRef: 'NIIF para PYMES Sección 17 y Ley de ISLR Art. 27',
      descripcion:
        'Mantenga el inventario físico y valorado de Propiedad, Planta y Equipo. Ejecute la corrida mensual de depreciación calculada bajo el método de línea recta, la cual genera de forma automática el comprobante de diario correspondiente.',
      checklist: [
        'Vida útil y valor residual debidamente documentados.',
        'Grupos de activo vinculados a cuentas de Activo y Depreciación Acumulada.',
        'Comprobante mensual de depreciación revisado y aprobado.'
      ]
    },
    {
      label: 'Fase 8: Módulo Fiscal SENIAT, Retenciones & Archivo TXT',
      shortTitle: 'Fiscal & SENIAT',
      icon: <ReceiptLongIcon sx={{ color: '#7c3aed' }} />,
      route: '/fiscal',
      responsable: 'Especialista Tributario / Contador Senior',
      legalRef: 'Providencia SNAT/2025/000091 y Decreto 1.808 (ISLR)',
      descripcion:
        'Liquide las retenciones de IVA (75% o 100%) e ISLR sobre compras de bienes y servicios. Emita e imprima el Comprobante Oficial SENIAT en PDF o envíelo por correo electrónico al proveedor. Genere el archivo plano TXT quincenal estructurado para el portal fiscal.',
      checklist: [
        'Comprobante SENIAT generado con 14 dígitos (AAAAMMDDDDDDDD).',
        'Impresión / PDF entregado al proveedor dentro de los 3 días hábiles.',
        'Archivo TXT validado con estructura de campos del SENIAT.'
      ]
    },
    {
      label: 'Fase 9: Libros Oficiales & Estados Financieros NIIF 18',
      shortTitle: 'Libros & Balances',
      icon: <AssessmentIcon sx={{ color: '#7c3aed' }} />,
      route: '/libros',
      responsable: 'Contador Principal / Auditor',
      legalRef: 'NIIF 18 (Presentación e Información a Revelar) y Código de Comercio',
      descripcion:
        'Emita el Estado de Rendimiento Financiero desglosado en categorías NIIF 18 (Operativo, Inversión, Financiación e Impuestos). Genere el Balance General Clasificado comprobando la igualdad patrimonial y obtenga el Balance de Comprobación analítico de 4 u 8 columnas.',
      checklist: [
        'Margen Bruto Operativo diferenciado de partidas de financiamiento.',
        'Activo Total exactamente igual a Pasivo Total + Patrimonio Total.',
        'Saldos coincidentes con los libros foliados ante el Registro Mercantil.'
      ]
    },
    {
      label: 'Fase 10: Ajuste por Inflación (NIC 29) & Cierre de Ejercicio',
      shortTitle: 'Ajuste & Cierre',
      icon: <VerifiedUserIcon sx={{ color: '#7c3aed' }} />,
      route: '/asientos?tab=cierres',
      responsable: 'Contador Senior / Socio de Firma',
      legalRef: 'BA VEN-NIF N° 2 (Criterios de Aplicación NIC 29) y Ley de ISLR',
      descripcion:
        'Efectúe la reexpresión de partidas no monetarias aplicando el Índice Nacional de Precios al Consumidor (INPC) del BCV para determinar el Resultado Monetario del Ejercicio (REME). Ejecute el cierre anual cancelando cuentas nominales y transfiriendo el resultado a Utilidades No Distribuidas.',
      checklist: [
        'Índices INPC del BCV del ejercicio cargados en el sistema.',
        'Asiento de cancelación de Ingresos, Costos y Gastos generado.',
        'Cierre de período con candado para impedir alteraciones posteriores.'
      ]
    }
  ];

  // Recetario de Asientos Modelo VEN-NIF
  const recetarioAsientos = [
    {
      titulo: 'Asiento 1: Apertura de Ejercicio / Constitución de Capital',
      codigo: 'MOD-01',
      descripcion: 'Aporte de accionistas e inicio formal de operaciones comerciales.',
      cuentas: [
        { cuenta: '1.1.01.001 - Banco Nacional Moneda Local', debe: '100,000.00', haber: '-' },
        { cuenta: '1.2.01.001 - Cuentas por Cobrar Accionistas', debe: '50,000.00', haber: '-' },
        { cuenta: '3.1.01.001 - Capital Social Suscrito y Pagado', debe: '-', haber: '150,000.00' }
      ]
    },
    {
      titulo: 'Asiento 2: Compra de Mercancía con Retención de IVA (75%) e ISLR (2%)',
      codigo: 'MOD-02',
      descripcion: 'Compra a crédito a un Proveedor Sujeto Pasivo Especial.',
      cuentas: [
        { cuenta: '5.1.01.001 - Compras de Mercancía (Base Imponible)', debe: '5,000.00', haber: '-' },
        { cuenta: '1.1.04.001 - Crédito Fiscal IVA (16%)', debe: '800.00', haber: '-' },
        { cuenta: '2.1.04.001 - Retención de IVA por Enterar (75% del IVA)', debe: '-', haber: '600.00' },
        { cuenta: '2.1.04.002 - Retención ISLR por Enterar (2% de la Base)', debe: '-', haber: '100.00' },
        { cuenta: '2.1.01.001 - Cuentas por Pagar Comerciales (Neto)', debe: '-', haber: '5,100.00' }
      ]
    },
    {
      titulo: 'Asiento 3: Causación de Nómina Quincenal & Beneficios LOTTT',
      codigo: 'MOD-03',
      descripcion: 'Registro de sueldos, cestaticket y deducciones obligatorias de ley.',
      cuentas: [
        { cuenta: '6.1.01.001 - Sueldos y Salarios Básicos', debe: '8,000.00', haber: '-' },
        { cuenta: '6.1.01.002 - Bono de Alimentación (Cestaticket)', debe: '3,500.00', haber: '-' },
        { cuenta: '2.1.03.001 - Retención Trabajadores IVSS (4%)', debe: '-', haber: '320.00' },
        { cuenta: '2.1.03.002 - Retención Trabajadores FAOV (1%)', debe: '-', haber: '80.00' },
        { cuenta: '2.1.03.003 - Retención Régimen Prestacional Empleo (0.5%)', debe: '-', haber: '40.00' },
        { cuenta: '2.1.01.002 - Nómina por Pagar a Colaboradores (Neto)', debe: '-', haber: '11,060.00' }
      ]
    },
    {
      titulo: 'Asiento 4: Corrida Mensual de Depreciación de Activos Fijos (Línea Recta)',
      codigo: 'MOD-04',
      descripcion: 'Reconocimiento del desgaste y vida útil de equipos e instalaciones.',
      cuentas: [
        { cuenta: '6.2.01.005 - Gasto Depreciación Equipos de Computación', debe: '450.00', haber: '-' },
        { cuenta: '6.2.01.006 - Gasto Depreciación Mobiliario de Oficina', debe: '300.00', haber: '-' },
        { cuenta: '1.3.02.001 - Depreciación Acumulada Equipos de Computación', debe: '-', haber: '450.00' },
        { cuenta: '1.3.02.002 - Depreciación Acumulada Mobiliario', debe: '-', haber: '300.00' }
      ]
    }
  ];

  // Preguntas Frecuentes Exhaustivas
  const faqs = [
    {
      id: 'faq-1',
      pregunta: '¿Cómo funciona la inferencia automática de la Clase Financiera al crear una cuenta?',
      respuesta:
        'En Kantio Contabilidad no necesita clasificar manualmente si una cuenta es Activo, Pasivo o Gasto. El sistema analiza el primer dígito del código contable según las normas VEN-NIF:\n• 1 = Activo (Naturaleza Deudora)\n• 2 = Pasivo (Naturaleza Acreedora)\n• 3 = Patrimonio (Naturaleza Acreedora)\n• 4 = Ingreso (Naturaleza Acreedora)\n• 5 = Costo (Naturaleza Deudora)\n• 6 = Gasto (Naturaleza Deudora)\n• 7 = Otros Ingresos | 8 = Otros Egresos | 9 = Cuentas de Orden.\nEl sistema mostrará una insignia visual confirmando la deducción.',
    },
    {
      id: 'faq-2',
      pregunta: '¿Cómo escribir códigos de cuentas abreviados con expansión de ceros?',
      respuesta:
        'Si su empresa tiene configurada una máscara como X.X.XX.XXX (4 niveles: 1-1-2-3 dígitos), usted no necesita teclear todos los ceros intermedios. Basta con ingresar "1.1.1.6" o "1-1-1-6" y, al salir del campo (onBlur) o presionar la varita mágica, el sistema lo convertirá automáticamente en "1.1.01.006".',
    },
    {
      id: 'faq-3',
      pregunta: '¿Cómo emitir y enviar el Comprobante Oficial de Retención SENIAT en PDF por correo?',
      respuesta:
        'Al ingresar una factura con retención de IVA o ISLR en la Calculadora Fiscal (/fiscal), pulse "Generar Comprobante de Retención". Se desplegará el comprobante oficial conforme a la Providencia SNAT/2025/000091. Puede pulsar "Imprimir / Guardar PDF" para obtener la hoja membretada en formato horizontal, o pulsar "Enviar por Email (PDF)" para despacharlo directamente a la casilla de correo del proveedor con asunto y texto formal.',
    },
    {
      id: 'faq-4',
      pregunta: '¿Qué diferencia existe entre un Comprobante en Borrador y un Comprobante Asentado?',
      respuesta:
        'Los comprobantes en estado BORRADOR son transacciones preliminares que pueden ser editadas, corregidas o eliminadas libremente.\nLos comprobantes ASENTADOS tienen valor contable oficial: no se pueden modificar directamente para preservar la pista de auditoría. Si requiere ajustar uno, puede anularlo generando el comprobante inverso o utilizar la herramienta de Reversión por Lote si el periodo no está cerrado con candado.',
    },
    {
      id: 'faq-5',
      pregunta: '¿Cómo se maneja la bimoneda (Bolívares Digitales y Dólares USD)?',
      respuesta:
        'La contabilidad se lleva estrictamente en la moneda funcional legal de Venezuela (Bolívar - VES). Para cada comprobante, el sistema toma la tasa oficial del Banco Central de Venezuela (BCV) del día y calcula en paralelo el contravalor de referencia en Dólares (USD). Al cierre mensual, el módulo genera automáticamente el asiento de ganancia o pérdida por Diferencial Cambiario sobre activos y pasivos monetarios en divisas.',
    },
    {
      id: 'faq-6',
      pregunta: '¿Cómo operan los Despachos o Estudios Contables (Hub Multi-inquilino)?',
      respuesta:
        'Un usuario puede ingresar con su correo electrónico y tener acceso simultáneo a múltiples empresas clientes. Desde la barra superior, el selector rápido permite conmutar entre organizaciones autorizadas con 1 clic. Si usted es una firma externa, las empresas clientes le confieren acceso temporal o permanente mediante tokens de delegación revocables.',
    },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Encabezado Principal */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
          Guía Metodológica de Procesos & Centro de Capacitación
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manual integral de operaciones contables, ciclo de vida de la información, marco regulatorio venezolano (VEN-NIF / SENIAT) y recetario de fórmulas.
        </Typography>
      </Box>

      {/* Selector de Pestañas Principales */}
      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="secondary"
          textColor="secondary"
          sx={{
            px: 2,
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '0.95rem' }
          }}
        >
          <Tab icon={<SchemaIcon />} iconPosition="start" label="Ciclo Completo End-to-End (10 Fases)" />
          <Tab icon={<FunctionsIcon />} iconPosition="start" label="Recetario de Asientos VEN-NIF" />
          <Tab icon={<LiveHelpIcon />} iconPosition="start" label="Preguntas Frecuentes (FAQ)" />
        </Tabs>
      </Card>

      {/* ============================================================== */}
      {/* PESTAÑA 0: CICLO COMPLETO END-TO-END (10 FASES)                */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Box>
          {/* Banner de Metodología */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Metodología de Trabajo en Kantio Contabilidad
            </Typography>
            <Typography variant="body2">
              Siga el orden estricto de las 10 fases para garantizar la integridad contable. Cada fase alimenta a la siguiente, evitando desbalances, reprocesos y observaciones en auditorías fiscales o financieras.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Lista Vertical de Fases (Stepper) */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchemaIcon /> Las 10 Fases del Flujo de Trabajo
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stepper activeStep={activeStep} orientation="vertical">
                  {workflowSteps.map((step, index) => (
                    <Step key={step.shortTitle}>
                      <StepLabel
                        onClick={() => setActiveStep(index)}
                        sx={{ cursor: 'pointer' }}
                        StepIconProps={{
                          sx: {
                            color: activeStep === index ? '#7c3aed !important' : '#cbd5e1 !important',
                          }
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={activeStep === index ? 'bold' : 'medium'} sx={{ color: activeStep === index ? '#7c3aed' : 'text.primary' }}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', my: 1 }}>
                          <Typography variant="body2" paragraph sx={{ color: '#334155' }}>
                            {step.descripcion}
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: '#7c3aed', display: 'block', mb: 0.5 }}>
                              Checklist de Verificación Obligatorio:
                            </Typography>
                            {step.checklist.map((item, idx) => (
                              <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#475569' }}>
                                ✓ {item}
                              </Typography>
                            ))}
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              component={Link}
                              to={step.route}
                              sx={{
                                bgcolor: '#7c3aed',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: '#6d28d9' }
                              }}
                            >
                              Ir a la Pantalla de {step.shortTitle}
                            </Button>
                            {index < workflowSteps.length - 1 && (
                              <Button
                                size="small"
                                onClick={() => setActiveStep(index + 1)}
                                sx={{ textTransform: 'none', color: '#7c3aed' }}
                              >
                                Siguiente Fase
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Card>
            </Grid>

            {/* Ficha Resumen de la Fase Activa */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', p: 3, position: 'sticky', top: 90 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  {workflowSteps[activeStep].icon}
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      FASE SELECCIONADA ({activeStep + 1}/10)
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#581c87', lineHeight: 1.2 }}>
                      {workflowSteps[activeStep].shortTitle}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      RESPONSABLE PRINCIPAL:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                      {workflowSteps[activeStep].responsable}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      FUNDAMENTO LEGAL & TÉCNICO:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {workflowSteps[activeStep].legalRef}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#f5f3ff', borderRadius: 2, border: '1px solid #ddd6fe' }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#7c3aed', display: 'block', mb: 0.5 }}>
                      Causa y Efecto en la Contabilidad:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#581c87' }}>
                      La adecuada ejecución de esta fase previene observaciones de auditores externos y asegura que los Balances NIIF 18 y declaraciones del SENIAT sean exactas.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to={workflowSteps[activeStep].route}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderColor: '#7c3aed',
                      color: '#7c3aed',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1,
                      '&:hover': { bgcolor: '#f5f3ff', borderColor: '#6d28d9' }
                    }}
                  >
                    Abrir Módulo de {workflowSteps[activeStep].shortTitle}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 1: RECETARIO DE ASIENTOS MODELO VEN-NIF                */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Box>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Plantillas Listas para Usar (Copia Rápida)
            </Typography>
            <Typography variant="body2">
              Consulte y copie la estructura de partida doble para las operaciones más comunes bajo normativa venezolana. Cada plantilla respeta la segregación analítica y las retenciones legales.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {recetarioAsientos.map((asiento) => (
              <Grid item xs={12} md={6} key={asiento.codigo}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={asiento.codigo}
                        size="small"
                        sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', fontWeight: 'bold' }}
                      />
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopyAsiento(asiento.titulo)}
                        sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#7c3aed' }}
                      >
                        {copiedAsiento === asiento.titulo ? '¡Copiado!' : 'Copiar Glosa'}
                      </Button>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5 }}>
                      {asiento.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" paragraph>
                      {asiento.descripcion}
                    </Typography>

                    <Box sx={{ mt: 2, border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Cuenta Contable</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'right' }}>Debe (VES)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'right' }}>Haber (VES)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {asiento.cuentas.map((c, i) => (
                            <TableRow key={i}>
                              <TableCell sx={{ fontSize: '0.75rem' }}>{c.cuenta}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: c.debe !== '-' ? 'bold' : 'normal' }}>
                                {c.debe}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: c.haber !== '-' ? 'bold' : 'normal' }}>
                                {c.haber}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: PREGUNTAS FRECUENTES (FAQ)                          */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Box>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LiveHelpIcon sx={{ color: '#7c3aed' }} />
              <Typography variant="h6" fontWeight="bold">
                Preguntas Frecuentes de Contabilidad & Fiscalidad
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {faqs.map((f) => (
                <Accordion
                  key={f.id}
                  expanded={expandedFaq === f.id}
                  onChange={handleChangeFaq(f.id)}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#7c3aed' }} />}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                      {f.pregunta}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {f.respuesta}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default GuiaUsoPage;
