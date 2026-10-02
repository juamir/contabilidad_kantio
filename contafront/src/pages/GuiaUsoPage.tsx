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
import { Link } from 'react-router-dom';

export const GuiaUsoPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<string | false>('faq-1');

  const handleChangeFaq = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const pasosFlujo = [
    {
      numero: '1',
      titulo: 'Creación de Empresa Titular & Parametrización de Máscara',
      icono: <CorporateFareIcon color="primary" />,
      descripcion:
        'Cree su empresa con su RIF venezolano y configure la estructura del Plan de Cuentas (niveles 1 a 6, caracteres de separación como "." o "-" y consecutivos de comprobantes). Esto define la máscara de validación automática (ej: X.X.XX.XXX).',
      link: '/empresas?tab=parametros',
      linkText: 'Ir a Parámetros de Empresa',
    },
    {
      numero: '2',
      titulo: 'Plan de Cuentas VEN-NIF & Inferencia Inteligente',
      icono: <AccountTreeIcon color="primary" />,
      descripcion:
        'El catálogo VEN-NIF viene precargado con más de 100 cuentas según el BA VEN-NIF N° 8. Al crear nuevas cuentas, no tiene que seleccionar la clase ni la naturaleza: el sistema las deduce automáticamente a partir del primer dígito (1=Activo, 2=Pasivo, 3=Patrimonio, etc.) y expande ceros a la izquierda (ej: 1.1.1.6 se expande a 1.1.01.006).',
      link: '/cuentas',
      linkText: 'Ver Plan de Cuentas',
    },
    {
      numero: '3',
      titulo: 'Definición de Documentos Soporte y Auxiliares',
      icono: <MenuBookIcon color="primary" />,
      descripcion:
        'Configure los tipos de documentos comerciales que respaldan las transacciones (FACT, NC, ND, GIRO, RETIVA) y registre sus Auxiliares (clientes, proveedores y bancos con su porcentaje de retención de IVA e ISLR).',
      link: '/cuentas?tab=documentos',
      linkText: 'Ver Tipos de Documento',
    },
    {
      numero: '4',
      titulo: 'Registro de Vouchers y Uso de Comprobantes Modelo',
      icono: <ReceiptLongIcon color="primary" />,
      descripcion:
        'Elabore sus asientos bimonetarios (VES y USD a tasa oficial BCV). Puede cargar cualquiera de las 14 plantillas estándar (Apertura, Ventas con IVA, Nómina LOTTT, Cierre Anual) con 1 clic para cuadrar automáticamente la partida doble.',
      link: '/asientos?tab=modelos',
      linkText: 'Ver Comprobantes Modelo',
    },
    {
      numero: '5',
      titulo: 'Gestión de Activos Fijos & Corrida de Depreciación',
      icono: <PrecisionManufacturingIcon color="primary" />,
      descripcion:
        'Registre su Propiedad, Planta y Equipo con su costo de adquisición, vida útil y ubicación física. El motor de cálculo genera periódicamente el asiento de ajuste mensual por línea recta.',
      link: '/activos-fijos',
      linkText: 'Ir a Activos Fijos',
    },
    {
      numero: '6',
      titulo: 'Procesamiento por Lote, Fiscal SENIAT & Cierre',
      icono: <VerifiedUserIcon color="primary" />,
      descripcion:
        'Procese masivamente los borradores asentándolos en lote tras validar su cuadre estricto. Genere los libros de compra/venta y el archivo plano TXT para el SENIAT, y finalmente ejecute el cierre de periodo o el ajuste por inflación (NIC 29 / REME).',
      link: '/asientos?tab=lote',
      linkText: 'Ver Procesamiento por Lote',
    },
  ];

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
      pregunta: '¿Cómo consultar los movimientos históricos de una cuenta sin emitir todo el Libro Mayor?',
      respuesta:
        'En la pantalla del Plan de Cuentas (/cuentas), cada cuenta contable dispone de un botón de historial ("Ver movimientos históricos"). Al pulsarlo, se abre de inmediato una ficha emergente que resume el Mayor Analítico de esa cuenta en específico, con sus débitos, créditos y saldo neto.',
    },
    {
      id: 'faq-4',
      pregunta: '¿Qué diferencia hay entre un Comprobante en Borrador y un Comprobante Asentado?',
      respuesta:
        'Los comprobantes en estado BORRADOR son transacciones preliminares que pueden ser editadas, corregidas o eliminadas libremente.\nLos comprobantes ASENTADOS tienen valor contable oficial: no se pueden modificar directamente para preservar la pista de auditoría. Si requiere ajustar uno, puede anularlo generando el comprobante inverso o utilizar la herramienta de Reversión por Lote si el periodo no está cerrado con candado.',
    },
    {
      id: 'faq-5',
      pregunta: '¿Cómo operan los Estudios Contables (Hub) y el acceso multi-empresa?',
      respuesta:
        'Un usuario puede ingresar con su correo electrónico y tener acceso simultáneo a múltiples empresas o grupos. Si usted es una firma o estudio contable, sus clientes pueden autorizarle acceso desde el módulo de Gobernanza. Usted podrá asignar qué miembros de su equipo tienen permiso para operar en cada cliente.',
    },
    {
      id: 'faq-6',
      pregunta: '¿Cómo se maneja la bimoneda (Bolívares y Dólares)?',
      respuesta:
        'La contabilidad se lleva estrictamente en la moneda funcional legal de Venezuela (Bolívar Digital - VES). Para cada comprobante, el sistema toma la tasa oficial del Banco Central de Venezuela (BCV) del día y calcula en paralelo el contravalor de referencia en Dólares (USD). Al cierre mensual, el módulo genera automáticamente el asiento de ganancia o pérdida por Diferencial Cambiario.',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Centro de Ayuda, Flujo de Procesos & FAQ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Guía integral para usuarios y contadores nuevos sobre el funcionamiento lógico de principio a fin de Kantio Contabilidad.
        </Typography>
      </Box>

      {/* BANNER INFORMATIVO */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Metodología de Trabajo en Kantio Contabilidad
        </Typography>
        <Typography variant="body2">
          El sistema está diseñado para ofrecer una experiencia contable rigurosa bajo normas <strong>VEN-NIF (BA VEN-NIF 8)</strong> y cumplimiento tributario con el <strong>SENIAT</strong>, combinando automatizaciones inteligentes como autocompletado de máscaras, inferencia de clases contables, plantillas de vouchers predefinidas y control patrimonial de activos fijos.
        </Typography>
      </Alert>

      {/* SECCIÓN 1: FLUJO DE PROCESOS PASO A PASO */}
      <Card sx={{ borderRadius: 2, mb: 4, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SchemaIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Flujo de Procesos de Principio a Fin
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {pasosFlujo.map((p) => (
              <Grid item xs={12} md={6} key={p.numero}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': { borderColor: 'primary.main', bgcolor: '#fbfcfe' },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Chip
                        label={`Paso ${p.numero}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {p.titulo}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {p.descripcion}
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    <Button
                      component={Link}
                      to={p.link}
                      size="small"
                      variant="outlined"
                      endIcon={<PlayCircleOutlineIcon />}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      {p.linkText}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* SECCIÓN 2: PREGUNTAS FRECUENTES (FAQ) */}
      <Card sx={{ borderRadius: 2, mb: 4, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LiveHelpIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Preguntas Frecuentes (FAQ)
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
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
        </CardContent>
      </Card>
    </Box>
  );
};
