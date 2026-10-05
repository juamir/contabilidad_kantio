import React from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, Accordion,
  AccordionSummary, AccordionDetails, Chip, Alert, Button, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GavelIcon from '@mui/icons-material/Gavel';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useLocation, useNavigate } from 'react-router-dom';

interface HelpSection {
  title: string;
  fundamentoLegal: string;
  pasoAPaso: string[];
  causaEfecto: string;
  erroresFrecuentes: string[];
}

const HELP_DATA: Record<string, HelpSection> = {
  '/': {
    title: 'Dashboard Gerencial & KPIs Contables',
    fundamentoLegal: 'Código de Comercio de Venezuela (Art. 32 Libros Obligatorios) y BA VEN-NIF N° 8 (Versión 11).',
    pasoAPaso: [
      'Revise los indicadores financieros: Activo Circulante, Pasivos por Enterar, Diferencial Cambiario del mes y Estatus de Cierres.',
      'Verifique las alertas del monitor fiscal quincenal (Sujetos Pasivos Especiales del SENIAT).',
      'Monitoree la tasa oficial del Banco Central de Venezuela (BCV) del día y su impacto en la reexpresión de partidas monetarias.',
      'Utilice los accesos directos rápidos para registrar un Asiento de Diario o consultar los Libros Oficiales.'
    ],
    causaEfecto: 'Mantener el control diario de las operaciones garantiza que la información financiera sea oportuna, fidedigna y auditable por terceros o accionistas.',
    erroresFrecuentes: [
      'Operar con tasas de cambio no oficiales que contravengan el marco cambiario del BCV.',
      'Postergar la revisión de desbalance entre asientos borrador y el libro mayor definitivo.'
    ]
  },
  '/cuentas': {
    title: 'Plan Único de Cuentas (PUC) & Maestros',
    fundamentoLegal: 'BA VEN-NIF N° 8, NIIF para las PYMES Sección 3 y Providencia SENIAT sobre Libros Contables.',
    pasoAPaso: [
      'Consulte el catálogo de cuentas precargado con más de 100 cuentas estándar bajo normativa venezolana.',
      'Para crear una nueva cuenta, ingrese el código contable: el sistema deducirá automáticamente la Clase Financiera (1=Activo, 2=Pasivo, 3=Patrimonio, 4=Ingreso, 5=Costo, 6=Gasto) y completará los ceros según la máscara.',
      'Defina el indicador "Permite Movimiento": solo las cuentas de último nivel de detalle pueden recibir asientos directos.',
      'Asocie los Códigos Auxiliares (Terceros, Bancos y Centros de Costo) para habilitar el rastreo analítico.'
    ],
    causaEfecto: 'Una correcta parametrización del catálogo previene inconsistencias al consolidar balances y simplifica las declaraciones de ISLR e IVA.',
    erroresFrecuentes: [
      'Intentar imputar comprobantes a cuentas totalizadoras o de grupo (Niveles 1 al 3).',
      'Crear códigos que no respeten la jerarquía del árbol de cuentas ni el separador establecido en los parámetros de la empresa.'
    ]
  },
  '/asientos': {
    title: 'Motor de Comprobantes de Diario (Partida Doble)',
    fundamentoLegal: 'Código de Comercio Art. 34 al 38 (Libro Diario y Mayor) y NIIF para las PYMES Sección 2.',
    pasoAPaso: [
      'Haga clic en "Nuevo Asiento" para abrir el formulario bimonetario.',
      'Indique la fecha de la transacción y el concepto general o glosa explicativa.',
      'Agregue las líneas de imputación seleccionando la cuenta operativa, indicando el débito o crédito en Bolívares (VES); el sistema computa el equivalente en USD automáticamente.',
      'Utilice el botón "Auto-Cuadrar" para balancear cualquier diferencia pendiente antes de asentar.',
      'Opcionalmente, use la pestaña "Comprobantes Modelo" para invocar plantillas estándar preconfiguradas (Apertura, Nómina, Ventas, Cierre).'
    ],
    causaEfecto: 'Cada asiento balanceado alimenta en tiempo real el Libro Diario, el Libro Mayor y los Balances de Comprobación sin desfases temporales.',
    erroresFrecuentes: [
      'Intentar guardar un comprobante con diferencia entre débitos y créditos (la partida doble es inquebrantable).',
      'Modificar directamente un asiento ya asentado y aprobado (se debe registrar un asiento de corrección o reversión).'
    ]
  },
  '/activos-fijos': {
    title: 'Control de Activos Fijos & Depreciación (NIC 16)',
    fundamentoLegal: 'NIIF para las PYMES Sección 17 (Propiedad, Planta y Equipo) y Ley de ISLR (Art. 27 deducción de depreciación).',
    pasoAPaso: [
      'Registre el bien de capital con su código de inventario, fecha de adquisición, costo histórico y vida útil estimada en meses o años.',
      'Asocie el activo a su grupo patrimonial (Mobiliario, Equipos de Computación, Vehículos, Maquinaria) y ubicación física.',
      'Ejecute la corrida periódica de depreciación por el método de línea recta.',
      'Revise el comprobante contable generado automáticamente que carga al Gasto de Depreciación con abono a la Depreciación Acumulada.'
    ],
    causaEfecto: 'Garantiza la correcta valoración de los activos en el Balance General y el aprovechamiento de la deducción fiscal en la conciliación de rentas.',
    erroresFrecuentes: [
      'Omitir la asignación de valor de salvamento cuando el activo tenga valor de reventa previsible.',
      'Duplicar la depreciación de períodos fiscales ya cerrados.'
    ]
  },
  '/fiscal': {
    title: 'Cumplimiento Tributario SENIAT & Retenciones',
    fundamentoLegal: 'Providencia SNAT/2025/000091 (Retenciones de IVA), Decreto 1.808 (Retenciones de ISLR) y Ley del IVA.',
    pasoAPaso: [
      'Utilice la Calculadora Fiscal y OCR para escanear facturas o ingresar datos manuales de proveedores.',
      'El sistema liquida automáticamente la retención de IVA (75% o 100%) y la retención de ISLR (1%, 2%, 3% o 5%).',
      'Haga clic en "Generar Comprobante de Retención" para visualizar el documento oficial del SENIAT.',
      'Imprima o guarde en PDF con el formato oficial regulatorio o envíelo por correo electrónico al proveedor en un solo clic.',
      'Desde la pestaña "TXT SENIAT", exporte el archivo plano validado para su carga directa en el portal fiscal quincenal.'
    ],
    causaEfecto: 'El cumplimiento oportuno y la emisión de comprobantes en los 3 días hábiles siguientes evita multas y sanciones de clausura por parte del SENIAT.',
    erroresFrecuentes: [
      'Generar archivos TXT con RIFs sin guión o números de control erróneos.',
      'No entregar o no archivar el comprobante digital firmado por el agente de retención.'
    ]
  },
  '/libros': {
    title: 'Estados Financieros NIIF 18 & Balances',
    fundamentoLegal: 'Norma Internacional de Información Financiera NIIF 18 (Presentación e Información a Revelar) y BA VEN-NIF N° 8.',
    pasoAPaso: [
      'Seleccione el período fiscal a examinar (mes o ejercicio anual).',
      'Examine el Estado de Rendimiento Financiero clasificado bajo categorías NIIF 18: Operativo, Inversión, Financiación e Impuestos.',
      'Genere el Balance General Clasificado verificando que Activo = Pasivo + Patrimonio.',
      'Consulte el Balance de Comprobación a 4 u 8 columnas para certificar que la sumatoria de débitos y créditos del período coincida exactamente.'
    ],
    causaEfecto: 'Proporciona a la junta directiva y a los auditores externos estados financieros con rigor internacional listos para asambleas y certificaciones.',
    erroresFrecuentes: [
      'Analizar estados financieros sin haber corrido previamente las depreciaciones o los diferenciales cambiarios.',
      'Confundir el margen operativo con el resultado integral neto antes de tributos.'
    ]
  },
  '/empresas': {
    title: 'Gobernanza Multi-empresa & Estudios Contables',
    fundamentoLegal: 'Código de Comercio de Venezuela (Sociedades Mercantiles) y Ley de Infogobierno.',
    pasoAPaso: [
      'Registre las empresas clientes o filiales del grupo empresarial.',
      'Configure los parámetros contables específicos de cada empresa (máscara de cuentas, períodos fiscales, consecutivos).',
      'Otorgue o revoque delegaciones a Despachos Contables externos mediante tokens de acceso seguro.',
      'Si administra un grupo holding, active la consolidación de estados financieros para eliminar operaciones intercompañía.'
    ],
    causaEfecto: 'Permite operar como una plataforma SaaS multi-inquilino donde cada empresa mantiene aislamiento estricto de sus libros.',
    erroresFrecuentes: [
      'Modificar la máscara de cuentas cuando una empresa ya tiene comprobantes históricos registrados.',
      'Asignar roles de administración total a usuarios que solo requieren facultades de consulta o auditoría.'
    ]
  },
  '/guia': {
    title: 'Centro de Capacitación Metodológica & FAQ',
    fundamentoLegal: 'Ecosistema de Formación Integral Kantio bajo Estándares Profesionales.',
    pasoAPaso: [
      'Recorra las 6 fases del ciclo contable desde la parametrización hasta el cierre anual.',
      'Consulte la sección de Preguntas Frecuentes (FAQ) para aclarar dudas sobre inferencia de cuentas, retenciones y libros oficiales.',
      'Revise los ejemplos prácticos de asientos bimonetarios y liquidaciones de retenciones.'
    ],
    causaEfecto: 'Reduce la curva de aprendizaje de nuevos contadores y asistentes contables garantizando la homogeneidad de los registros.',
    erroresFrecuentes: [
      'Saltarse el orden de fases metodológicas al implementar una nueva empresa en el sistema.'
    ]
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const OperationalHelpDrawer: React.FC<Props> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Buscar la sección de ayuda más cercana por ruta
  const currentPath = Object.keys(HELP_DATA).find((path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }) || '/';

  const help = HELP_DATA[currentPath] || HELP_DATA['/'];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460, md: 520 },
          p: 0,
          boxSizing: 'border-box',
          boxShadow: 6,
        }
      }}
    >
      {/* Encabezado del Cajón de Ayuda */}
      <Box sx={{ p: 2.5, bgcolor: '#f5f3ff', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <HelpOutlineIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#581c87', lineHeight: 1.2 }}>
              Manual Operativo & Ayuda
            </Typography>
            <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 600 }}>
              Pantalla: {help.title}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#7c3aed' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Contenido Modular con 4 Secciones Estandarizadas */}
      <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Sección 1: Fundamento Legal & Normativo */}
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GavelIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b' }}>
              1. Fundamento Legal & Marco Normativo
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {help.fundamentoLegal}
          </Typography>
        </Box>

        {/* Sección 2: Guía Paso a Paso */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <PlayCircleOutlineIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b' }}>
              2. Guía Paso a Paso del Operador
            </Typography>
          </Box>
          <Stack spacing={1.2}>
            {help.pasoAPaso.map((paso, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Chip
                  label={idx + 1}
                  size="small"
                  sx={{
                    bgcolor: '#7c3aed',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    height: 22,
                    minWidth: 22
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#334155', pt: 0.2 }}>
                  {paso}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Sección 3: Causa y Efecto en el Negocio */}
        <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SyncAltIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e40af' }}>
              3. Causa y Efecto en el Negocio
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
            {help.causaEfecto}
          </Typography>
        </Box>

        {/* Sección 4: Prevención de Errores Frecuentes */}
        <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fef3c7' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningAmberIcon sx={{ color: '#d97706', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#92400e' }}>
              4. Prevención de Errores Frecuentes
            </Typography>
          </Box>
          <Stack spacing={0.8}>
            {help.erroresFrecuentes.map((err, idx) => (
              <Typography key={idx} variant="body2" sx={{ fontSize: '0.82rem', color: '#78350f' }}>
                • {err}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Pie del Cajón con Enlace a la Guía Completa */}
      <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AccountTreeIcon />}
          onClick={() => {
            onClose();
            navigate('/guia');
          }}
          sx={{
            borderColor: '#7c3aed',
            color: '#7c3aed',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#f5f3ff', borderColor: '#6d28d9' }
          }}
        >
          Ver Metodología Completa & FAQ
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onClose}
          sx={{
            bgcolor: '#7c3aed',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#6d28d9' }
          }}
        >
          Entendido
        </Button>
      </Box>
    </Drawer>
  );
};

export default OperationalHelpDrawer;
