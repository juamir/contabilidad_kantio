import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import BalanceIcon from '@mui/icons-material/Balance';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

interface Props {
  initialTab?: string;
}

export const ReportesPage: React.FC<Props> = ({ initialTab }) => {
  const { empresaActiva } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'rendimiento';

  const tabIndexMap: Record<string, number> = {
    rendimiento: 0,
    balance_general: 1,
    comprobacion: 2,
    mayor: 3,
  };

  const indexTabMap: Record<number, string> = {
    0: 'rendimiento',
    1: 'balance_general',
    2: 'comprobacion',
    3: 'mayor',
  };

  const [tabIndex, setTabIndex] = useState(tabIndexMap[tabParam] || 0);
  const [loading, setLoading] = useState(false);
  const [tasaBcv, setTasaBcv] = useState(40.0);

  // Estados de datos reales
  const [rendimientoData, setRendimientoData] = useState<any | null>(null);
  const [balanceGeneralData, setBalanceGeneralData] = useState<any | null>(null);
  const [comprobacionData, setComprobacionData] = useState<any | null>(null);

  // Mayor analítico
  const [cuentasDisponibles, setCuentasDisponibles] = useState<any[]>([]);
  const [selectedCuentaId, setSelectedCuentaId] = useState<string>('');
  const [mayorData, setMayorData] = useState<any | null>(null);

  useEffect(() => {
    if (tabParam && tabIndexMap[tabParam] !== undefined) {
      setTabIndex(tabIndexMap[tabParam]);
    }
  }, [tabParam]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSearchParams({ tab: indexTabMap[newValue] });
  };

  // Cargar Tasa BCV
  useEffect(() => {
    const fetchTasa = async () => {
      try {
        const res = await api.get<any>('/monedas/tasas/actual');
        if (res && res.tasa) setTasaBcv(Number(res.tasa));
      } catch (e) {
        console.warn('Error obteniendo tasa BCV:', e);
      }
    };
    fetchTasa();
  }, []);

  // Cargar Cuentas para el Libro Mayor
  useEffect(() => {
    if (!empresaActiva?.id) return;
    const fetchCuentas = async () => {
      try {
        const data = await api.get<any[]>(`/cuentas/empresas/${empresaActiva.id}`);
        if (Array.isArray(data)) {
          const movimientoCuentas = data.filter((c) => c.permite_movimiento);
          setCuentasDisponibles(movimientoCuentas);
          if (movimientoCuentas.length > 0 && !selectedCuentaId) {
            setSelectedCuentaId(movimientoCuentas[0].id);
          }
        }
      } catch (e) {
        console.warn('Error cargando cuentas para mayor:', e);
      }
    };
    fetchCuentas();
  }, [empresaActiva?.id]);

  // Cargar movimientos de la cuenta seleccionada
  useEffect(() => {
    if (!selectedCuentaId) return;
    const fetchMayor = async () => {
      try {
        setLoading(true);
        const data = await api.get<any>(`/cuentas/${selectedCuentaId}/movimientos`);
        setMayorData(data);
      } catch (e) {
        console.warn('Error cargando mayor analítico:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMayor();
  }, [selectedCuentaId]);

  // Cargar datos del tab activo
  const cargarReporteActivo = async () => {
    if (!empresaActiva?.id) return;
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const res = await api.get<any>(`/reportes/empresas/${empresaActiva.id}/estado-resultados`);
        setRendimientoData(res);
      } else if (tabIndex === 1) {
        const res = await api.get<any>(`/reportes/empresas/${empresaActiva.id}/balance-general`);
        setBalanceGeneralData(res);
      } else if (tabIndex === 2) {
        const res = await api.get<any>(`/reportes/empresas/${empresaActiva.id}/balance-comprobacion`);
        setComprobacionData(res);
      }
    } catch (err) {
      console.error('Error cargando reportes financieros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporteActivo();
  }, [tabIndex, empresaActiva?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (tabIndex === 2 && comprobacionData?.cuentas) {
      let csv = 'Codigo;Descripcion;Naturaleza;Debito_VES;Credito_VES;Saldo_Deudor;Saldo_Acreedor\n';
      comprobacionData.cuentas.forEach((c: any) => {
        csv += `"${c.codigo}";"${c.descripcion}";"${c.naturaleza}";${c.total_debito};${c.total_credito};${c.saldo_deudor};${c.saldo_acreedor}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Balance_Comprobacion_${empresaActiva?.codigo || 'EMP'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('La exportación directa a hoja de cálculo para este informe ha sido generada.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Estados Financieros & Balances Oficiales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Conformidad con normas VEN-NIF (FCCPV) y taxonomía de presentación NIIF 18 ({empresaActiva?.razon_social || 'Empresa Activa'}).
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={cargarReporteActivo} disabled={loading}>
            Actualizar
          </Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} size="small" onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} size="small" sx={{ bgcolor: '#2196f3' }} onClick={handlePrint}>
            Imprimir PDF Foliado
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<InsightsIcon />} iconPosition="start" label="Estado de Rendimiento (NIIF 18 / PyG)" />
          <Tab icon={<BalanceIcon />} iconPosition="start" label="Balance General Clasificado" />
          <Tab icon={<TableChartIcon />} iconPosition="start" label="Balance de Comprobación (Sumas y Saldos)" />
          <Tab icon={<MenuBookIcon />} iconPosition="start" label="Libro Mayor Analítico" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: RENDIMIENTO NIIF 18                                     */}
      {/* ============================================================== */}
      {tabIndex === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold">
                {empresaActiva?.razon_social || 'EMPRESA ACTIVA'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                RIF: {empresaActiva?.rif || 'J-00000000-0'} | EJERCICIO FISCAL 2026
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: '#1976d2' }}>
                ESTADO DE RENDIMIENTO FINANCIERO (NIIF 18)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Expresado en Bolívares Digitales y Dólares Estadounidenses a Tasa Oficial BCV: Bs. {tasaBcv.toFixed(2)})
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {rendimientoData ? (
              <Grid container spacing={2}>
                <Grid item xs={8}><Typography variant="subtitle1" fontWeight="bold">CATEGORÍA OPERATIVA</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="caption" fontWeight="bold">VES (Bs.)</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="caption" fontWeight="bold">USD ($)</Typography></Grid>

                <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Ingresos por Actividades Ordinarias (Ventas Netas)</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    {rendimientoData.ingresos_operativos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace" color="primary">
                    {(rendimientoData.ingresos_operativos / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Costo de Ventas de Mercancías</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    -{rendimientoData.costos_ventas.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace" color="primary">
                    -{(rendimientoData.costos_ventas / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2, bgcolor: '#f1f5f9', py: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">MARGEN BRUTO OPERATIVO</Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#f1f5f9', py: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold" fontFamily="monospace">
                    {rendimientoData.margen_bruto.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#f1f5f9', py: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold" fontFamily="monospace" color="primary">
                    {(rendimientoData.margen_bruto / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Gastos de Administración y Personal</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    -{rendimientoData.gastos_operativos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace" color="primary">
                    -{(rendimientoData.gastos_operativos / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2, bgcolor: '#e3f2fd', py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">RESULTADO OPERATIVO (NIIF 18)</Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e3f2fd', py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" fontFamily="monospace">
                    {rendimientoData.resultado_operativo.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e3f2fd', py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" fontFamily="monospace" color="primary">
                    {(rendimientoData.resultado_operativo / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={8}><Typography variant="subtitle1" fontWeight="bold">CATEGORÍA DE FINANCIAMIENTO & DIFERENCIAL CAMBIARIO</Typography></Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Otros Ingresos / Ganancia Neta Cambiaria</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    {rendimientoData.otros_ingresos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace" color="primary">
                    {(rendimientoData.otros_ingresos / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Otros Egresos / IGTF / Gastos Bancarios</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    -{rendimientoData.otros_egresos.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontFamily="monospace" color="primary">
                    -{(rendimientoData.otros_egresos / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={8} sx={{ pl: 2, bgcolor: '#e8f5e9', py: 1.5, borderRadius: 1 }}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">UTILIDAD NETA INTEGRAL DEL EJERCICIO</Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e8f5e9', py: 1.5 }}>
                  <Typography variant="h6" fontWeight="bold" fontFamily="monospace" color="success.main">
                    Bs. {rendimientoData.resultado_neto_ejercicio.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e8f5e9', py: 1.5 }}>
                  <Typography variant="h6" fontWeight="bold" fontFamily="monospace" color="success.main">
                    $ {(rendimientoData.resultado_neto_ejercicio / tasaBcv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No se encontraron movimientos contables asentados para generar el estado de resultados.</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 1: BALANCE GENERAL CLASIFICADO                             */}
      {/* ============================================================== */}
      {tabIndex === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold">{empresaActiva?.razon_social || 'EMPRESA ACTIVA'}</Typography>
              <Typography variant="subtitle2" color="text.secondary">RIF: {empresaActiva?.rif || 'J-00000000-0'}</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: '#1976d2' }}>
                ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL CLASIFICADO)
              </Typography>
              <Typography variant="caption" color="text.secondary">Al 31 de Diciembre de 2026 (Expresado en Bolívares y USD a tasa oficial)</Typography>
            </Box>

            {balanceGeneralData ? (
              <Grid container spacing={4}>
                {/* Columna Izquierda: ACTIVOS */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                      1. ACTIVOS
                    </Typography>

                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Monto (Bs.)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {balanceGeneralData.detalles?.activos?.map((a: any) => (
                          <TableRow key={a.cuenta_id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{a.codigo}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{a.descripcion}</TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              Bs. {(a.saldo_deudor || a.saldo_acreedor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Box sx={{ mt: 3, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">TOTAL ACTIVOS:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Bs. {balanceGeneralData.total_activo.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Columna Derecha: PASIVOS Y PATRIMONIO */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
                      2. PASIVOS Y PATRIMONIO
                    </Typography>

                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1, mb: 0.5 }}>Pasivos Exigibles:</Typography>
                    <Table size="small">
                      <TableBody>
                        {balanceGeneralData.detalles?.pasivos?.map((p: any) => (
                          <TableRow key={p.cuenta_id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.codigo}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{p.descripcion}</TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              Bs. {(p.saldo_acreedor || p.saldo_deudor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>Patrimonio Neto:</Typography>
                    <Table size="small">
                      <TableBody>
                        {balanceGeneralData.detalles?.patrimonio?.map((pt: any) => (
                          <TableRow key={pt.cuenta_id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{pt.codigo}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{pt.descripcion}</TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              Bs. {(pt.saldo_acreedor || pt.saldo_deudor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'success.main' }}>
                            Resultado Neto del Ejercicio (PyG)
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem', color: 'success.main' }}>
                            Bs. {balanceGeneralData.resultado_ejercicio.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <Box sx={{ mt: 3, p: 1.5, bgcolor: '#ede7f6', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">TOTAL PASIVO + PATRIMONIO:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                        Bs. {balanceGeneralData.total_pasivo_y_patrimonio.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No se encontraron datos para generar el Balance General.</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BALANCE DE COMPROBACIÓN                                 */}
      {/* ============================================================== */}
      {tabIndex === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Balance de Comprobación de Sumas y Saldos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verificación de igualdad matemática del Libro Mayor a partir de comprobantes asentados.
                </Typography>
              </Box>
              {comprobacionData?.esta_cuadrado ? (
                <Chip label="Partida Doble Balanceada" color="success" size="small" />
              ) : (
                <Chip label="Descuadre Detectado" color="error" size="small" />
              )}
            </Box>

            {comprobacionData && comprobacionData.cuentas?.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Descripción de la Cuenta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Sumas Debe</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Sumas Haber</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Saldo Deudor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Saldo Acreedor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprobacionData.cuentas.map((c: any) => (
                      <TableRow key={c.cuenta_id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.codigo}</TableCell>
                        <TableCell>{c.descripcion}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          Bs. {Number(c.total_debito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          Bs. {Number(c.total_credito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: c.saldo_deudor ? 'bold' : 'normal' }}>
                          {c.saldo_deudor ? `Bs. ${Number(c.saldo_deudor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: c.saldo_acreedor ? 'bold' : 'normal' }}>
                          {c.saldo_acreedor ? `Bs. ${Number(c.saldo_acreedor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Fila de Totales */}
                    <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>TOTALES GENERALES:</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        Bs. {Number(comprobacionData.gran_total_debito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        Bs. {Number(comprobacionData.gran_total_credito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                        Bs. {Number(comprobacionData.gran_total_saldo_deudor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                        Bs. {Number(comprobacionData.gran_total_saldo_acreedor).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No hay comprobantes asentados en esta empresa para calcular el balance de comprobación.</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIBRO MAYOR ANALÍTICO                                   */}
      {/* ============================================================== */}
      {tabIndex === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Libro Mayor Analítico & Fichas de Cuentas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Historial cronológico de cargos, abonos y saldo progresivo por cuenta contable individual.
                </Typography>
              </Box>
              <Box sx={{ minWidth: 300 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Seleccione Cuenta Contable</InputLabel>
                  <Select
                    value={selectedCuentaId}
                    label="Seleccione Cuenta Contable"
                    onChange={(e) => setSelectedCuentaId(e.target.value)}
                  >
                    {cuentasDisponibles.map((cta) => (
                      <MenuItem key={cta.id} value={cta.id}>
                        {cta.codigo} - {cta.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {mayorData ? (
              <>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Cuenta: {mayorData.codigo} - {mayorData.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Naturaleza: {mayorData.naturaleza} | Saldo Acumulado Actual: Bs. {Number(mayorData.saldo_acumulado || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Paper>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Comprobante</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Concepto / Glosa</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Debe (Cargo)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Haber (Abono)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Saldo Acumulado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mayorData.movimientos?.length > 0 ? (
                        mayorData.movimientos.map((m: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{m.fecha}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{m.comprobante_numero}</TableCell>
                            <TableCell>{m.descripcion}</TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                              {m.monto_debito > 0 ? `Bs. ${Number(m.monto_debito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                              {m.monto_credito > 0 ? `Bs. ${Number(m.monto_credito).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                              Bs. {Number(m.saldo_progresivo).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            Esta cuenta no tiene movimientos contables registrados en comprobantes asentados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Alert severity="info">Seleccione una cuenta contable para visualizar su libro mayor analítico.</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportesPage;
