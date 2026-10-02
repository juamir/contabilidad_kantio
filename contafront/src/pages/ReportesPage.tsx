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
  Button
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import BalanceIcon from '@mui/icons-material/Balance';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSearchParams } from 'react-router-dom';

interface Props {
  initialTab?: string;
}

export const ReportesPage: React.FC<Props> = ({ initialTab }) => {
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

  useEffect(() => {
    if (tabParam && tabIndexMap[tabParam] !== undefined) {
      setTabIndex(tabIndexMap[tabParam]);
    }
  }, [tabParam]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSearchParams({ tab: indexTabMap[newValue] });
  };

  // Datos de Balance de Comprobación Sumas y Saldos
  const cuentasComprobacion = [
    { codigo: '1.1.01.001', descripcion: 'CAJA GENERAL (VES)', debe_ves: 12500, haber_ves: 4500, saldo_deudor: 8000, saldo_acreedor: 0 },
    { codigo: '1.1.01.004', descripcion: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', debe_ves: 284500, haber_ves: 120000, saldo_deudor: 164500, saldo_acreedor: 0 },
    { codigo: '1.1.01.008', descripcion: 'CUENTAS EN DIVISAS USD (CUSTODIA)', debe_ves: 340000, haber_ves: 0, saldo_deudor: 340000, saldo_acreedor: 0 },
    { codigo: '1.1.03.001', descripcion: 'CUENTAS POR COBRAR CLIENTES', debe_ves: 95000, haber_ves: 35000, saldo_deudor: 60000, saldo_acreedor: 0 },
    { codigo: '1.1.04.001', descripcion: 'CREDITO FISCAL IVA (16%)', debe_ves: 18400, haber_ves: 0, saldo_deudor: 18400, saldo_acreedor: 0 },
    { codigo: '1.1.05.001', descripcion: 'INVENTARIO DE MERCANCIAS', debe_ves: 112000, haber_ves: 0, saldo_deudor: 112000, saldo_acreedor: 0 },
    { codigo: '1.2.01.002', descripcion: 'EDIFICACIONES Y LOCALES', debe_ves: 450000, haber_ves: 0, saldo_deudor: 450000, saldo_acreedor: 0 },
    { codigo: '1.2.01.005', descripcion: 'EQUIPOS DE COMPUTACION Y ERP', debe_ves: 85000, haber_ves: 0, saldo_deudor: 85000, saldo_acreedor: 0 },
    { codigo: '1.2.02.004', descripcion: 'DEPREC. ACUM. COMPUTACION', debe_ves: 0, haber_ves: 18500, saldo_deudor: 0, saldo_acreedor: 18500 },
    { codigo: '2.1.01.001', descripcion: 'PROVEEDORES NACIONALES (VES)', debe_ves: 45000, haber_ves: 125000, saldo_deudor: 0, saldo_acreedor: 80000 },
    { codigo: '2.1.03.001', descripcion: 'DEBITO FISCAL IVA (16%)', debe_ves: 0, haber_ves: 24800, saldo_deudor: 0, saldo_acreedor: 24800 },
    { codigo: '2.1.03.002', descripcion: 'RETENCIONES DE IVA POR ENTERAR (75%)', debe_ves: 0, haber_ves: 9400, saldo_deudor: 0, saldo_acreedor: 9400 },
    { codigo: '2.1.03.004', descripcion: 'RETENCIONES DE ISLR POR ENTERAR', debe_ves: 0, haber_ves: 3200, saldo_deudor: 0, saldo_acreedor: 3200 },
    { codigo: '3.1.01.001', descripcion: 'CAPITAL SOCIAL SUSCRITO Y PAGADO', debe_ves: 0, haber_ves: 850000, saldo_deudor: 0, saldo_acreedor: 850000 },
    { codigo: '4.1.01.001', descripcion: 'VENTAS DE MERCANCIAS GRAVADAS', debe_ves: 0, haber_ves: 380000, saldo_deudor: 0, saldo_acreedor: 380000 },
    { codigo: '5.1.01.001', descripcion: 'COMPRAS DE MERCANCIAS GRAVADAS', debe_ves: 165000, haber_ves: 0, saldo_deudor: 165000, saldo_acreedor: 0 },
    { codigo: '6.1.01.001', descripcion: 'SUELDOS Y SALARIOS (ADMIN)', debe_ves: 72000, haber_ves: 0, saldo_deudor: 72000, saldo_acreedor: 0 },
    { codigo: '6.2.01.001', descripcion: 'ALQUILER DE OFICINAS', debe_ves: 24000, haber_ves: 0, saldo_deudor: 24000, saldo_acreedor: 0 },
  ];

  const totalSumasDebe = cuentasComprobacion.reduce((a, b) => a + b.debe_ves, 0);
  const totalSumasHaber = cuentasComprobacion.reduce((a, b) => a + b.haber_ves, 0);
  const totalSaldosDeudor = cuentasComprobacion.reduce((a, b) => a + b.saldo_deudor, 0);
  const totalSaldosAcreedor = cuentasComprobacion.reduce((a, b) => a + b.saldo_acreedor, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            4. Estados Financieros & Balances Oficiales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Conformidad con normas VEN-NIF (FCCPV) y nueva taxonomía de presentación NIIF 18.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} size="small">
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} size="small" sx={{ bgcolor: '#2196f3' }}>
            Imprimir PDF Foliado
          </Button>
        </Box>
      </Box>

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
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold">
                CORPORACIÓN DEMO KANTIO C.A.
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                RIF: J-50123456-7 | EJERCICIO FISCAL 2026
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: '#1976d2' }}>
                ESTADO DE RENDIMIENTO FINANCIERO (NIIF 18)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Expresado en Bolívares Digitales y Dólares Estadounidenses a Tasa Oficial BCV)
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={8}><Typography variant="subtitle1" fontWeight="bold">CATEGORÍA OPERATIVA</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="caption" fontWeight="bold">VES (Bs.)</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="caption" fontWeight="bold">USD ($)</Typography></Grid>

              <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Ingresos por Actividades Ordinarias (Ventas Netas)</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace">380.000,00</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace" color="primary">9.500,00</Typography></Grid>

              <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Costo de Ventas de Mercancías</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace">-165.000,00</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace" color="primary">-4.125,00</Typography></Grid>

              <Grid item xs={8} sx={{ pl: 2, bgcolor: '#f1f5f9', py: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">MARGEN BRUTO OPERATIVO</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#f1f5f9', py: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" fontFamily="monospace">215.000,00</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#f1f5f9', py: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" fontFamily="monospace" color="primary">5.375,00</Typography>
              </Grid>

              <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Gastos de Administración y Personal</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace">-96.000,00</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace" color="primary">-2.400,00</Typography></Grid>

              <Grid item xs={8} sx={{ pl: 2, bgcolor: '#e3f2fd', py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">RESULTADO OPERATIVO (NIIF 18)</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e3f2fd', py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" fontFamily="monospace">119.000,00</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e3f2fd', py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" fontFamily="monospace" color="primary">2.975,00</Typography>
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              <Grid item xs={8}><Typography variant="subtitle1" fontWeight="bold">CATEGORÍA DE FINANCIAMIENTO & DIFERENCIAL CAMBIARIO</Typography></Grid>
              <Grid item xs={4}></Grid>

              <Grid item xs={8} sx={{ pl: 2 }}><Typography variant="body2">Ganancia Neta en Diferencial Cambiario (BCV)</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace">14.200,00</Typography></Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}><Typography variant="body2" fontFamily="monospace" color="primary">355,00</Typography></Grid>

              <Grid item xs={8} sx={{ pl: 2, bgcolor: '#e8f5e9', py: 1.5, borderRadius: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="success.main">UTILIDAD NETA INTEGRAL DEL EJERCICIO</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e8f5e9', py: 1.5 }}>
                <Typography variant="h6" fontWeight="bold" fontFamily="monospace" color="success.main">Bs. 133.200,00</Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right', bgcolor: '#e8f5e9', py: 1.5 }}>
                <Typography variant="h6" fontWeight="bold" fontFamily="monospace" color="success.main">$ 3.330,00</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 1: BALANCE GENERAL CLASIFICADO                             */}
      {/* ============================================================== */}
      {tabIndex === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold">CORPORACIÓN DEMO KANTIO C.A.</Typography>
              <Typography variant="subtitle2" color="text.secondary">RIF: J-50123456-7</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: '#1976d2' }}>
                ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL CLASIFICADO)
              </Typography>
              <Typography variant="caption" color="text.secondary">Al 31 de Octubre de 2026 (Expresado en Bolívares y USD)</Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Columna Izquierda: ACTIVOS */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    1. ACTIVOS
                  </Typography>

                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>Activos Corrientes:</Typography>
                  <Box sx={{ pl: 2, my: 1, fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Efectivo y Equivalentes de Efectivo:</span>
                      <strong>Bs. 512.500,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cuentas por Cobrar Comerciales:</span>
                      <strong>Bs. 60.000,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Créditos Fiscales (IVA & Retenciones):</span>
                      <strong>Bs. 18.400,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Inventario de Mercancías:</span>
                      <strong>Bs. 112.000,00</strong>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" fontWeight="bold">Activos No Corrientes:</Typography>
                  <Box sx={{ pl: 2, my: 1, fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Propiedades, Planta y Equipos (PPE):</span>
                      <strong>Bs. 535.000,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Depreciación Acumulada:</span>
                      <strong>-Bs. 18.500,00</strong>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight="bold">TOTAL ACTIVOS:</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">Bs. 1.219.400,00</Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Columna Derecha: PASIVOS Y PATRIMONIO */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
                    2. PASIVOS Y PATRIMONIO
                  </Typography>

                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>Pasivos Corrientes:</Typography>
                  <Box sx={{ pl: 2, my: 1, fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cuentas por Pagar Proveedores:</span>
                      <strong>Bs. 80.000,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Débito Fiscal IVA y Retenciones SENIAT:</span>
                      <strong>Bs. 37.400,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Obligaciones Laborales y Parafiscales:</span>
                      <strong>Bs. 18.800,00</strong>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" fontWeight="bold" color="text.primary">Patrimonio Neto:</Typography>
                  <Box sx={{ pl: 2, my: 1, fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Capital Social Suscrito y Pagado:</span>
                      <strong>Bs. 850.000,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Reserva Legal:</span>
                      <strong>Bs. 42.500,00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Utilidad Neta del Ejercicio:</span>
                      <strong style={{ color: '#2e7d32' }}>Bs. 190.700,00</strong>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, p: 1.5, bgcolor: '#ede7f6', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight="bold">TOTAL PASIVO + PATRIMONIO:</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary">Bs. 1.219.400,00</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BALANCE DE COMPROBACIÓN                                 */}
      {/* ============================================================== */}
      {tabIndex === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Balance de Comprobación de Sumas y Saldos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verificación de igualdad matemática del Libro Mayor (Partida Doble).
                </Typography>
              </Box>
              <Chip label="Partida Doble Balanceada" color="success" size="small" />
            </Box>

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
                  {cuentasComprobacion.map((c) => (
                    <TableRow key={c.codigo} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.codigo}</TableCell>
                      <TableCell>{c.descripcion}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. {c.debe_ves.toLocaleString('es-VE')}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. {c.haber_ves.toLocaleString('es-VE')}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: c.saldo_deudor ? 'bold' : 'normal' }}>
                        {c.saldo_deudor ? `Bs. ${c.saldo_deudor.toLocaleString('es-VE')}` : '-'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: c.saldo_acreedor ? 'bold' : 'normal' }}>
                        {c.saldo_acreedor ? `Bs. ${c.saldo_acreedor.toLocaleString('es-VE')}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de Totales */}
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>TOTALES GENERALES:</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      Bs. {totalSumasDebe.toLocaleString('es-VE')}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      Bs. {totalSumasHaber.toLocaleString('es-VE')}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                      Bs. {totalSaldosDeudor.toLocaleString('es-VE')}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                      Bs. {totalSaldosAcreedor.toLocaleString('es-VE')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIBRO MAYOR ANALÍTICO                                   */}
      {/* ============================================================== */}
      {tabIndex === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight="bold">
                Libro Mayor Analítico & Fichas de Cuentas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Historial cronológico de cargos, abonos y saldo progresivo por cuenta contable individual.
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Cuenta: 1.1.01.004 - BANCO MERCANTIL C.A. (CORRIENTE VES)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Naturaleza: DEUDORA | Moneda: VES (Bolívar Digital)
              </Typography>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Comprobante</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Concepto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Debe (Cargo)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Haber (Abono)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Saldo Acumulado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>2026-10-01</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>AS-APE-01</TableCell>
                    <TableCell>Apertura de Ejercicio / Integración de Capital</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. 200.000,00</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>-</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>Bs. 200.000,00</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>2026-10-02</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>AS-COB-01</TableCell>
                    <TableCell>Cobro de Factura N° 0001 a Cliente Nacional</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. 84.500,00</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>-</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>Bs. 284.500,00</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>2026-10-04</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>AS-PAG-01</TableCell>
                    <TableCell>Pago a Proveedora Nacional de Alimentos C.A.</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>-</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>Bs. 120.000,00</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>Bs. 164.500,00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportesPage;
