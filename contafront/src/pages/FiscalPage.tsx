import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  Alert,
  MenuItem,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSearchParams } from 'react-router-dom';
import { ComprobanteSeniatModal, ComprobanteRetencionData } from '../components/ComprobanteSeniatModal';

interface Props {
  initialTab?: string;
}

interface FacturaFiscalUI {
  id: string;
  fecha: string;
  tipo: 'COMPRA' | 'VENTA';
  rif: string;
  nombre: string;
  factura: string;
  control: string;
  total: number;
  base: number;
  iva: number;
  ret_iva: number;
  ret_islr: number;
}

export const FiscalPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'retenciones';

  const tabIndexMap: Record<string, number> = {
    retenciones: 0,
    txt: 1,
    libros_iva: 2,
  };

  const indexTabMap: Record<number, string> = {
    0: 'retenciones',
    1: 'txt',
    2: 'libros_iva',
  };

  const [activeTab, setActiveTab] = useState(tabIndexMap[tabParam] || 0);

  useEffect(() => {
    if (tabParam && tabIndexMap[tabParam] !== undefined) {
      setActiveTab(tabIndexMap[tabParam]);
    }
  }, [tabParam]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchParams({ tab: indexTabMap[newValue] });
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- TAB 0: CALCULADORA Y RETENCIONES ---
  const [tipoOp, setTipoOp] = useState<'COMPRA' | 'VENTA'>('COMPRA');
  const [rifTercero, setRifTercero] = useState('J-30456789-1');
  const [nombreTercero, setNombreTercero] = useState('Servicios Tecnológicos C.A.');
  const [numeroFactura, setNumeroFactura] = useState('0001245');
  const [numeroControl, setNumeroControl] = useState('00-008912');
  const [baseImponible, setBaseImponible] = useState<number>(5000.0);
  const [alicuotaIva, setAlicuotaIva] = useState<number>(16.0);
  const [porcRetIva, setPorcRetIva] = useState<number>(75.0);
  const [porcRetIslr, setPorcRetIslr] = useState<number>(2.0);

  const [ocrCargando, setOcrCargando] = useState(false);
  const [ocrExito, setOcrExito] = useState(false);

  const montoIva = Number((baseImponible * (alicuotaIva / 100)).toFixed(2));
  const montoTotal = Number((baseImponible + montoIva).toFixed(2));
  const montoRetIva = Number((montoIva * (porcRetIva / 100)).toFixed(2));
  const montoRetIslr = Number((baseImponible * (porcRetIslr / 100)).toFixed(2));
  const netoAPagar = Number((montoTotal - montoRetIva - montoRetIslr).toFixed(2));

  const handleSimularOCR = () => {
    setOcrCargando(true);
    setTimeout(() => {
      setRifTercero('J-40112233-9');
      setNombreTercero('Inversiones y Suministros Caracas C.A.');
      setNumeroFactura('0009871');
      setNumeroControl('00-004455');
      setBaseImponible(3500.0);
      setOcrCargando(false);
      setOcrExito(true);
      setTimeout(() => setOcrExito(false), 4000);
    }, 1200);
  };

  // --- LISTA DE FACTURAS FISCALES PARA LIBROS Y TXT ---
  const [facturas, setFacturas] = useState<FacturaFiscalUI[]>([
    { id: '1', fecha: '2026-10-02', tipo: 'COMPRA', rif: 'J-30111222-3', nombre: 'PROVEEDORA NACIONAL DE ALIMENTOS C.A.', factura: '0001245', control: '00-008912', total: 5800.00, base: 5000.00, iva: 800.00, ret_iva: 600.00, ret_islr: 100.00 },
    { id: '2', fecha: '2026-10-04', tipo: 'COMPRA', rif: 'J-40998877-1', nombre: 'DISTRIBUIDORA Y SUMINISTROS CARACAS S.A.', factura: '0004562', control: '00-001290', total: 3480.00, base: 3000.00, iva: 480.00, ret_iva: 360.00, ret_islr: 60.00 },
    { id: '3', fecha: '2026-10-07', tipo: 'COMPRA', rif: 'J-31456789-0', nombre: 'DESPACHO CONTABLE Y AUDITORES ALPHA & ASOC.', factura: '0000890', control: '00-009911', total: 8120.00, base: 7000.00, iva: 1120.00, ret_iva: 840.00, ret_islr: 210.00 },
    { id: '4', fecha: '2026-10-01', tipo: 'VENTA', rif: 'V-14555666-0', nombre: 'CLIENTE GENERAL DE CONTADO (TIENDA)', factura: '0000001', control: '00-000001', total: 4640.00, base: 4000.00, iva: 640.00, ret_iva: 0.00, ret_islr: 0.00 },
    { id: '5', fecha: '2026-10-05', tipo: 'VENTA', rif: 'J-50123456-7', nombre: 'INVERSIONES SAN CRISTOBAL S.A.', factura: '0000002', control: '00-000002', total: 9280.00, base: 8000.00, iva: 1280.00, ret_iva: 960.00, ret_islr: 160.00 },
  ]);

  // Modal de Comprobante Oficial SENIAT (Impresión y Envío Email PDF)
  const [comprobanteModalOpen, setComprobanteModalOpen] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<ComprobanteRetencionData | null>(null);

  const handleVerComprobanteSeniat = (f: FacturaFiscalUI) => {
    const periodo = f.fecha.slice(0, 7); // ej: "2026-10"
    const periodoNum = periodo.replace('-', '');
    const numComp = `${periodoNum}${f.id.padStart(8, '0').slice(-8)}`;

    setComprobanteSeleccionado({
      tipo: 'IVA',
      numeroComprobante: numComp,
      fechaEmision: f.fecha,
      periodoFiscal: periodo,
      agenteRazonSocial: 'KANTIO SERVICIOS CONTABLES Y FINANCIEROS C.A.',
      agenteRif: 'J-50123456-7',
      agenteDireccion: 'Av. Francisco de Miranda, Torre Kantio, Piso 8, Ofic. 802, Caracas, Venezuela',
      sujetoRazonSocial: f.nombre,
      sujetoRif: f.rif,
      sujetoDireccion: 'Domicilio Fiscal Registrado en RIF',
      sujetoEmail: 'contacto@' + f.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) + '.com',
      numeroOperacion: 1,
      fechaFactura: f.fecha,
      numeroFactura: f.factura,
      numeroControl: f.control,
      tipoTransaccion: '01-Reg',
      montoTotalFactura: f.total,
      montoExento: 0,
      baseImponible: f.base,
      alicuota: 16,
      impuestoIva: f.iva,
      porcentajeRetencion: f.iva > 0 ? Math.round((f.ret_iva / f.iva) * 100) : 75,
      montoRetenido: f.ret_iva,
    });
    setComprobanteModalOpen(true);
  };

  const handleGenerarComprobanteRetencion = () => {
    const idGenerado = Date.now().toString();
    const nueva: FacturaFiscalUI = {
      id: idGenerado,
      fecha: new Date().toISOString().split('T')[0],
      tipo: tipoOp,
      rif: rifTercero,
      nombre: nombreTercero,
      factura: numeroFactura,
      control: numeroControl,
      total: montoTotal,
      base: baseImponible,
      iva: montoIva,
      ret_iva: montoRetIva,
      ret_islr: montoRetIslr,
    };
    setFacturas((prev) => [nueva, ...prev]);
    setToastMessage(`Comprobante fiscal registrado con éxito (Factura #${numeroFactura}).`);

    // Abrir automáticamente el comprobante SENIAT para imprimir o enviar PDF
    handleVerComprobanteSeniat(nueva);
  };

  // Modal para crear / editar factura directamente desde los libros
  const [modalFacturaOpen, setModalFacturaOpen] = useState(false);
  const [facturaEditando, setFacturaEditando] = useState<FacturaFiscalUI | null>(null);
  const [facturaForm, setFacturaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'COMPRA' as 'COMPRA' | 'VENTA',
    rif: '',
    nombre: '',
    factura: '',
    control: '',
    base: 1000,
    alicuota: 16,
    porc_ret_iva: 75,
    porc_ret_islr: 2
  });

  const handleOpenFacturaModal = (f?: FacturaFiscalUI) => {
    if (f) {
      setFacturaEditando(f);
      setFacturaForm({
        fecha: f.fecha,
        tipo: f.tipo,
        rif: f.rif,
        nombre: f.nombre,
        factura: f.factura,
        control: f.control,
        base: f.base,
        alicuota: 16,
        porc_ret_iva: f.base > 0 ? Math.round((f.ret_iva / f.iva) * 100) : 75,
        porc_ret_islr: f.base > 0 ? Math.round((f.ret_islr / f.base) * 100) : 2
      });
    } else {
      setFacturaEditando(null);
      setFacturaForm({
        fecha: new Date().toISOString().split('T')[0],
        tipo: subtipoLibro === 'COMPRAS' ? 'COMPRA' : 'VENTA',
        rif: 'J-',
        nombre: '',
        factura: `FAC-${Date.now().toString().slice(-4)}`,
        control: `00-${Date.now().toString().slice(-6)}`,
        base: 2000,
        alicuota: 16,
        porc_ret_iva: subtipoLibro === 'COMPRAS' ? 75 : 0,
        porc_ret_islr: subtipoLibro === 'COMPRAS' ? 2 : 0
      });
    }
    setModalFacturaOpen(true);
  };

  const handleSaveFactura = () => {
    if (!facturaForm.rif || !facturaForm.nombre || !facturaForm.factura) {
      alert('RIF, Nombre y Número de Factura son requeridos.');
      return;
    }
    const calcIva = Number((facturaForm.base * (facturaForm.alicuota / 100)).toFixed(2));
    const calcTotal = Number((facturaForm.base + calcIva).toFixed(2));
    const calcRetIva = Number((calcIva * (facturaForm.porc_ret_iva / 100)).toFixed(2));
    const calcRetIslr = Number((facturaForm.base * (facturaForm.porc_ret_islr / 100)).toFixed(2));

    if (facturaEditando) {
      setFacturas((prev) =>
        prev.map((item) =>
          item.id === facturaEditando.id
            ? {
                ...item,
                fecha: facturaForm.fecha,
                tipo: facturaForm.tipo,
                rif: facturaForm.rif,
                nombre: facturaForm.nombre,
                factura: facturaForm.factura,
                control: facturaForm.control,
                base: facturaForm.base,
                iva: calcIva,
                total: calcTotal,
                ret_iva: calcRetIva,
                ret_islr: calcRetIslr
              }
            : item
        )
      );
      setToastMessage(`Factura fiscal ${facturaForm.factura} actualizada.`);
    } else {
      const nueva: FacturaFiscalUI = {
        id: Date.now().toString(),
        fecha: facturaForm.fecha,
        tipo: facturaForm.tipo,
        rif: facturaForm.rif,
        nombre: facturaForm.nombre,
        factura: facturaForm.factura,
        control: facturaForm.control,
        base: facturaForm.base,
        iva: calcIva,
        total: calcTotal,
        ret_iva: calcRetIva,
        ret_islr: calcRetIslr
      };
      setFacturas((prev) => [nueva, ...prev]);
      setToastMessage(`Factura fiscal ${facturaForm.factura} agregada.`);
    }
    setModalFacturaOpen(false);
  };

  const handleDeleteFactura = (id: string, numero: string) => {
    if (window.confirm(`¿Está seguro de eliminar la factura ${numero}?`)) {
      setFacturas((prev) => prev.filter((f) => f.id !== id));
      setToastMessage(`Factura ${numero} eliminada.`);
    }
  };

  // --- TAB 1: TXT SENIAT EXPORTACIÓN ---
  const [periodoTxt, setPeriodoTxt] = useState('202610');
  const [quincenaTxt, setQuincenaTxt] = useState('1');

  const comprasConRetencion = facturas.filter((f) => f.tipo === 'COMPRA' && f.ret_iva > 0);
  const lineasTxt = comprasConRetencion.map((c, i) =>
    `J501234567\t${periodoTxt}\t${c.fecha}\tC\t01\t${c.rif.replace(/-/g, '')}\t${c.factura}\t${c.control}\t${c.total.toFixed(2)}\t${c.base.toFixed(2)}\t${c.iva.toFixed(2)}\t${periodoTxt}0000000${i + 1}\t${c.ret_iva.toFixed(2)}\t0\t0.00\t16.00`
  );

  const handleDescargarTXT = () => {
    const rawContent = lineasTxt.join('\r\n');
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENIAT_RET_IVA_${periodoTxt}_Q${quincenaTxt}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- TAB 2: LIBROS DE COMPRAS Y VENTAS ---
  const [subtipoLibro, setSubtipoLibro] = useState<'COMPRAS' | 'VENTAS'>('COMPRAS');
  const facturasFiltradasLibro = facturas.filter((f) =>
    subtipoLibro === 'COMPRAS' ? f.tipo === 'COMPRA' : f.tipo === 'VENTA'
  );

  return (
    <Box>
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          3. Cumplimiento Fiscal & SENIAT
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión de retenciones de IVA e ISLR, exportador oficial del archivo TXT para el portal fiscal y Libros Legales de IVA.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Retenciones IVA & ISLR (Captura OCR)" />
          <Tab icon={<FileDownloadIcon />} iconPosition="start" label="Exportar TXT SENIAT" />
          <Tab icon={<MenuBookIcon />} iconPosition="start" label="Libros de Compras y Ventas" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: RETENCIONES IVA & ISLR CON OCR                          */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            {/* Formulario de Carga */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Datos de la Factura y Parámetros Fiscales
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<PhotoCameraIcon />}
                      onClick={handleSimularOCR}
                      disabled={ocrCargando}
                      sx={{ textTransform: 'none' }}
                    >
                      {ocrCargando ? 'Escaneando OCR...' : 'Escanear Foto / PDF'}
                    </Button>
                  </Box>

                  {ocrExito && (
                    <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                      ¡Lectura OCR Completada! Se han extraído el RIF, Razón Social, Números de Factura/Control y Montos.
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Tipo de Operación"
                        value={tipoOp}
                        onChange={(e) => setTipoOp(e.target.value as any)}
                      >
                        <MenuItem value="COMPRA">COMPRA - Proveedor (Sujeto Pasivo Retención)</MenuItem>
                        <MenuItem value="VENTA">VENTA - Cliente</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="RIF del Tercero" value={rifTercero} onChange={(e) => setRifTercero(e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth size="small" label="Razón Social / Nombre Fiscal" value={nombreTercero} onChange={(e) => setNombreTercero(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Número de Factura" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Número de Control Fiscal" value={numeroControl} onChange={(e) => setNumeroControl(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" type="number" label="Base Imponible (Bs.)" value={baseImponible} onChange={(e) => setBaseImponible(Number(e.target.value))} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" select label="Alícuota IVA" value={alicuotaIva} onChange={(e) => setAlicuotaIva(Number(e.target.value))}>
                        <MenuItem value={16}>16% - Alícuota General</MenuItem>
                        <MenuItem value={8}>8% - Alícuota Reducida</MenuItem>
                        <MenuItem value={31}>31% - General + Adicional Suntuario</MenuItem>
                        <MenuItem value={0}>0% - Exento / Exonerado</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" select label="% Retención IVA (SENIAT)" value={porcRetIva} onChange={(e) => setPorcRetIva(Number(e.target.value))}>
                        <MenuItem value={75}>75% - Contribuyente Especial Ordinario</MenuItem>
                        <MenuItem value={100}>100% - No Emite Factura / Incumplimiento</MenuItem>
                        <MenuItem value={0}>0% - No Sujeto</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" select label="% Retención ISLR" value={porcRetIslr} onChange={(e) => setPorcRetIslr(Number(e.target.value))}>
                        <MenuItem value={2}>2% - Venta de Bienes Muebles (P. Jurídica)</MenuItem>
                        <MenuItem value={3}>3% - Servicios / Honorarios (P. Natural)</MenuItem>
                        <MenuItem value={5}>5% - Honorarios Profesionales (P. Jurídica)</MenuItem>
                        <MenuItem value={1}>1% - Transporte y Fletes</MenuItem>
                        <MenuItem value={0}>0% - Sin Retención</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Liquidación de Retenciones */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    Liquidación Automática & Retenciones
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                    Cálculo conforme a Providencia SNAT/2025/000091 del SENIAT.
                  </Typography>

                  <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Base Imponible:</Typography>
                      <Typography variant="body2" fontWeight="bold">Bs. {baseImponible.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">IVA ({alicuotaIva}%):</Typography>
                      <Typography variant="body2" fontWeight="bold">Bs. {montoIva.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight="bold">Total Factura:</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">Bs. {montoTotal.toFixed(2)}</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#c62828' }}>
                      <Typography variant="body2">Retención IVA ({porcRetIva}%):</Typography>
                      <Typography variant="body2" fontWeight="bold">- Bs. {montoRetIva.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#c62828' }}>
                      <Typography variant="body2">Retención ISLR ({porcRetIslr}%):</Typography>
                      <Typography variant="body2" fontWeight="bold">- Bs. {montoRetIslr.toFixed(2)}</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                      <Typography variant="subtitle1" fontWeight="bold">Neto a Desembolsar:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">Bs. {netoAPagar.toFixed(2)}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<CalculateIcon />}
                      onClick={handleGenerarComprobanteRetencion}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Generar Comprobante de Retención
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ============================================================== */}
      {/* TAB 1: EXPORTAR ARCHIVO TXT SENIAT                             */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Exportador Oficial de Archivo Plano TXT de Retenciones de IVA (SENIAT)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Genera el archivo plano conforme a las especificaciones técnicas del portal del SENIAT para Sujetos Pasivos Especiales.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<CloudDownloadIcon />}
                onClick={handleDescargarTXT}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Descargar TXT para Portal SENIAT
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Periodo Fiscal (AñoMes)" value={periodoTxt} onChange={(e) => setPeriodoTxt(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Quincena a Declarar</InputLabel>
                  <Select value={quincenaTxt} label="Quincena a Declarar" onChange={(e) => setQuincenaTxt(e.target.value)}>
                    <MenuItem value="1">Primera Quincena (01 al 15)</MenuItem>
                    <MenuItem value="2">Segunda Quincena (16 al fin de mes)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Registros Compilados:</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{lineasTxt.length} Facturas con Retención</Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Previsualización del Archivo TXT (Separador Tabulador Tab):
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 2, fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto', mb: 3 }}>
              {lineasTxt.map((line, idx) => (
                <Box key={idx} sx={{ py: 0.5, borderBottom: '1px dashed #334155' }}>
                  {line}
                </Box>
              ))}
            </Paper>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <strong>Instrucciones de Carga:</strong> Guarde el archivo generado e ingrese a <code>seniat.gob.ve &gt; Menú Contribuyente Especial &gt; Retenciones de IVA &gt; Transmisión de Archivo</code>. Kantio valida los códigos de RIF sin guiones y los formatos numéricos con punto decimal.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LIBROS DE COMPRAS Y VENTAS                             */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Libros Oficiales del Impuesto al Valor Agregado (IVA)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reportes legales foliados conforme al Reglamento de la Ley del IVA y Código Orgánico Tributario.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  variant={subtipoLibro === 'COMPRAS' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSubtipoLibro('COMPRAS')}
                >
                  Libro de Compras
                </Button>
                <Button
                  variant={subtipoLibro === 'VENTAS' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSubtipoLibro('VENTAS')}
                >
                  Libro de Ventas
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => handleOpenFacturaModal()}
                >
                  Nueva Factura
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>RIF {subtipoLibro === 'COMPRAS' ? 'Proveedor' : 'Cliente'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre o Razón Social</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>N° Factura</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>N° Control</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total {subtipoLibro === 'COMPRAS' ? 'Compra' : 'Venta'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Base Imponible</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{subtipoLibro === 'COMPRAS' ? 'Crédito' : 'Débito'} Fiscal</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>IVA Retenido</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {facturasFiltradasLibro.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{c.fecha}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.rif}</TableCell>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{c.factura}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{c.control}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        Bs. {c.total.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. {c.base.toFixed(2)}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: subtipoLibro === 'COMPRAS' ? 'primary.main' : 'secondary.main', fontWeight: 'bold' }}>
                        Bs. {c.iva.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'error.main' }}>
                        Bs. {c.ret_iva.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {c.ret_iva > 0 && (
                          <Tooltip title="Imprimir / Enviar Comprobante Retención IVA (SENIAT)">
                            <IconButton size="small" color="secondary" onClick={() => handleVerComprobanteSeniat(c)}>
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Modificar factura fiscal">
                          <IconButton size="small" color="primary" onClick={() => handleOpenFacturaModal(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar factura fiscal">
                          <IconButton size="small" color="error" onClick={() => handleDeleteFactura(c.id, c.factura)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL PARA FACTURA FISCAL --- */}
      <Dialog open={modalFacturaOpen} onClose={() => setModalFacturaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {facturaEditando ? 'Modificar Registro Fiscal' : `Registrar Factura en Libro de ${subtipoLibro}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha de Emisión"
                value={facturaForm.fecha}
                onChange={(e) => setFacturaForm({ ...facturaForm, fecha: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Operación</InputLabel>
                <Select
                  value={facturaForm.tipo}
                  label="Tipo Operación"
                  onChange={(e) => setFacturaForm({ ...facturaForm, tipo: e.target.value as any })}
                >
                  <MenuItem value="COMPRA">COMPRA (Proveedor)</MenuItem>
                  <MenuItem value="VENTA">VENTA (Cliente)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="RIF"
                value={facturaForm.rif}
                onChange={(e) => setFacturaForm({ ...facturaForm, rif: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                size="small"
                label="Razón Social"
                value={facturaForm.nombre}
                onChange={(e) => setFacturaForm({ ...facturaForm, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="N° Factura"
                value={facturaForm.factura}
                onChange={(e) => setFacturaForm({ ...facturaForm, factura: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="N° Control Fiscal"
                value={facturaForm.control}
                onChange={(e) => setFacturaForm({ ...facturaForm, control: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Base Imponible (Bs.)"
                value={facturaForm.base}
                onChange={(e) => setFacturaForm({ ...facturaForm, base: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Alícuota IVA</InputLabel>
                <Select
                  value={facturaForm.alicuota}
                  label="Alícuota IVA"
                  onChange={(e) => setFacturaForm({ ...facturaForm, alicuota: Number(e.target.value) })}
                >
                  <MenuItem value={16}>16% - General</MenuItem>
                  <MenuItem value={8}>8% - Reducida</MenuItem>
                  <MenuItem value={31}>31% - Suntuario</MenuItem>
                  <MenuItem value={0}>0% - Exento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>% Retención IVA</InputLabel>
                <Select
                  value={facturaForm.porc_ret_iva}
                  label="% Retención IVA"
                  onChange={(e) => setFacturaForm({ ...facturaForm, porc_ret_iva: Number(e.target.value) })}
                >
                  <MenuItem value={0}>0% - Sin Retención</MenuItem>
                  <MenuItem value={75}>75% - Contribuyente Especial</MenuItem>
                  <MenuItem value={100}>100% - Total</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>% Retención ISLR</InputLabel>
                <Select
                  value={facturaForm.porc_ret_islr}
                  label="% Retención ISLR"
                  onChange={(e) => setFacturaForm({ ...facturaForm, porc_ret_islr: Number(e.target.value) })}
                >
                  <MenuItem value={0}>0% - Sin Retención</MenuItem>
                  <MenuItem value={2}>2% - Bienes</MenuItem>
                  <MenuItem value={3}>3% - Servicios</MenuItem>
                  <MenuItem value={5}>5% - Honorarios</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalFacturaOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveFactura}>Guardar Factura</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL OFICIAL COMPROBANTE DE RETENCIÓN SENIAT (PDF / IMPRESIÓN / CORREO) --- */}
      <ComprobanteSeniatModal
        open={comprobanteModalOpen}
        onClose={() => setComprobanteModalOpen(false)}
        data={comprobanteSeleccionado}
      />
    </Box>
  );
};

export default FiscalPage;
