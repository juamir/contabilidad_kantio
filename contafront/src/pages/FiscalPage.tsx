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
  Stack
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useSearchParams } from 'react-router-dom';

interface Props {
  initialTab?: string;
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

  // --- TAB 0: CALCULADORA Y RETENCIONES ---
  const [tipoOp, setTipoOp] = useState('COMPRA');
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

  // --- TAB 1: TXT SENIAT EXP EXPORTACIÓN ---
  const [periodoTxt, setPeriodoTxt] = useState('202610');
  const [quincenaTxt, setQuincenaTxt] = useState('1');

  const lineasTxtDemo = [
    `J501234567\t${periodoTxt}\t2026-10-02\tC\t01\tJ301112223\t0001245\t00-008912\t5800.00\t5000.00\t800.00\t${periodoTxt}00000001\t600.00\t0\t0.00\t16.00`,
    `J501234567\t${periodoTxt}\t2026-10-04\tC\t01\tJ409988771\t0004562\t00-001290\t3480.00\t3000.00\t480.00\t${periodoTxt}00000002\t360.00\t0\t0.00\t16.00`,
    `J501234567\t${periodoTxt}\t2026-10-07\tC\t01\tJ314567890\t0000890\t00-009911\t8120.00\t7000.00\t1120.00\t${periodoTxt}00000003\t840.00\t0\t0.00\t16.00`,
    `J501234567\t${periodoTxt}\t2026-10-11\tC\t01\tV189998882\t0000112\t00-000443\t1740.00\t1500.00\t240.00\t${periodoTxt}00000004\t240.00\t0\t0.00\t16.00`,
  ];

  const handleDescargarTXT = () => {
    const rawContent = lineasTxtDemo.join('\r\n');
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

  const comprasFiscales = [
    { fecha: '2026-10-02', rif: 'J-30111222-3', proveedor: 'PROVEEDORA NACIONAL DE ALIMENTOS C.A.', factura: '0001245', control: '00-008912', total: 5800.00, base: 5000.00, iva: 800.00, ret_iva: 600.00, ret_islr: 100.00 },
    { fecha: '2026-10-04', rif: 'J-40998877-1', proveedor: 'DISTRIBUIDORA Y SUMINISTROS CARACAS S.A.', factura: '0004562', control: '00-001290', total: 3480.00, base: 3000.00, iva: 480.00, ret_iva: 360.00, ret_islr: 60.00 },
    { fecha: '2026-10-07', rif: 'J-31456789-0', proveedor: 'DESPACHO CONTABLE Y AUDITORES ALPHA & ASOC.', factura: '0000890', control: '00-009911', total: 8120.00, base: 7000.00, iva: 1120.00, ret_iva: 840.00, ret_islr: 210.00 },
  ];

  const ventasFiscales = [
    { fecha: '2026-10-01', rif: 'V-14555666-0', cliente: 'CLIENTE GENERAL DE CONTADO (TIENDA)', factura: '0000001', control: '00-000001', total: 4640.00, base: 4000.00, iva: 640.00, ret_iva: 0.00, ret_islr: 0.00 },
    { fecha: '2026-10-05', rif: 'J-50123456-7', cliente: 'INVERSIONES SAN CRISTOBAL S.A.', factura: '0000002', control: '00-000002', total: 9280.00, base: 8000.00, iva: 1280.00, ret_iva: 960.00, ret_islr: 160.00 },
  ];

  return (
    <Box>
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
                      <TextField fullWidth size="small" select label="Tipo de Operación" value={tipoOp} onChange={(e) => setTipoOp(e.target.value)}>
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
                    <Button variant="contained" color="primary" fullWidth startIcon={<CalculateIcon />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
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
                  <Typography variant="subtitle2" fontWeight="bold">4 Facturas Sujetas a Retención</Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Previsualización del Archivo TXT (Separador Tabulador Tab):
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 2, fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto', mb: 3 }}>
              {lineasTxtDemo.map((line, idx) => (
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
      {/* TAB 2: LIBROS DE COMPRAS Y VENTAS                              */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Libros Oficiales del Impuesto al Valor Agregado (IVA)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reportes legales foliados conforme al Reglamento de la Ley del IVA y Código Orgánico Tributario.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
              </Box>
            </Box>

            {subtipoLibro === 'COMPRAS' ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>RIF Proveedor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre o Razón Social</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>N° Factura</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>N° Control</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total Compra</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Base Imponible</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Crédito Fiscal</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>IVA Retenido</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprasFiscales.map((c, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{c.fecha}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.rif}</TableCell>
                        <TableCell>{c.proveedor}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{c.factura}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{c.control}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          Bs. {c.total.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. {c.base.toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'primary.main', fontWeight: 'bold' }}>
                          Bs. {c.iva.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'error.main' }}>
                          Bs. {c.ret_iva.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>RIF Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre o Razón Social</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>N° Factura</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>N° Control</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total Venta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Base Imponible</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Débito Fiscal</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>IVA Retenido por Cliente</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventasFiscales.map((v, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.fecha}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{v.rif}</TableCell>
                        <TableCell>{v.cliente}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.factura}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.control}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          Bs. {v.total.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. {v.base.toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'secondary.main', fontWeight: 'bold' }}>
                          Bs. {v.iva.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'success.main' }}>
                          Bs. {v.ret_iva.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FiscalPage;
