import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LockClockIcon from '@mui/icons-material/LockClock';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useSearchParams } from 'react-router-dom';
import { MODELOS_PROFIT_PLUS, ComprobanteModeloProfit } from '../data/modelosProfitPlus';
import { PUC_COMPLETO_VEN_NIF } from '../data/pucVenNifCompleto';

interface Props {
  initialTab?: string;
}

interface RenglonUI {
  id: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  descripcion: string;
  debitoBase: number;
  creditoBase: number;
  debitoDivisa: number;
  creditoDivisa: number;
}

export const AsientosPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'asientos';

  const tabIndexMap: Record<string, number> = {
    asientos: 0,
    modelos: 1,
    cierres: 2,
    inflacion: 3,
    integraciones: 4,
  };

  const indexTabMap: Record<number, string> = {
    0: 'asientos',
    1: 'modelos',
    2: 'cierres',
    3: 'inflacion',
    4: 'integraciones',
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

  // --- TAB 0: VOUCHER CREATION STATE ---
  const [tasaBcv, setTasaBcv] = useState<number>(40.00);
  const [numero, setNumero] = useState<string>('2026-10-0001');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [concepto, setConcepto] = useState<string>('Registro de ventas y operaciones comerciales del día');
  const [tipo, setTipo] = useState<string>('DIARIO');

  const [renglones, setRenglones] = useState<RenglonUI[]>([
    {
      id: '1',
      cuentaCodigo: '1.1.01.004',
      cuentaNombre: 'BANCO MERCANTIL C.A. (CORRIENTE VES)',
      descripcion: 'Cobro de factura cliente por transferencia',
      debitoBase: 4640.0,
      creditoBase: 0,
      debitoDivisa: 116.0,
      creditoDivisa: 0,
    },
    {
      id: '2',
      cuentaCodigo: '4.1.01.001',
      cuentaNombre: 'VENTAS DE MERCANCIAS GRAVADAS CON IVA (16%)',
      descripcion: 'Ingreso por venta de mercancías gravadas',
      debitoBase: 0,
      creditoBase: 4000.0,
      debitoDivisa: 0,
      creditoDivisa: 100.0,
    },
    {
      id: '3',
      cuentaCodigo: '2.1.03.001',
      cuentaNombre: 'DEBITO FISCAL IVA (16%)',
      descripcion: 'Débito Fiscal IVA 16% Factura',
      debitoBase: 0,
      creditoBase: 640.0,
      debitoDivisa: 0,
      creditoDivisa: 16.0,
    },
  ]);

  const [guardadoExito, setGuardadoExito] = useState(false);

  const totalDebitoBase = renglones.reduce((acc, r) => acc + (Number(r.debitoBase) || 0), 0);
  const totalCreditoBase = renglones.reduce((acc, r) => acc + (Number(r.creditoBase) || 0), 0);
  const diffBase = totalDebitoBase - totalCreditoBase;

  const totalDebitoDivisa = renglones.reduce((acc, r) => acc + (Number(r.debitoDivisa) || 0), 0);
  const totalCreditoDivisa = renglones.reduce((acc, r) => acc + (Number(r.creditoDivisa) || 0), 0);
  const diffDivisa = totalDebitoDivisa - totalCreditoDivisa;

  const estaCuadrado = Math.abs(diffBase) < 0.01 && Math.abs(diffDivisa) < 0.01;

  const handleAddRenglon = () => {
    setRenglones([
      ...renglones,
      {
        id: Date.now().toString(),
        cuentaCodigo: '',
        cuentaNombre: '',
        descripcion: concepto,
        debitoBase: 0,
        creditoBase: 0,
        debitoDivisa: 0,
        creditoDivisa: 0,
      },
    ]);
  };

  const handleRemoveRenglon = (id: string) => {
    setRenglones(renglones.filter((r) => r.id !== id));
  };

  const handleUpdateRenglon = (id: string, field: keyof RenglonUI, value: any) => {
    setRenglones(
      renglones.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };

        if (field === 'debitoBase') {
          const val = Number(value) || 0;
          updated.debitoDivisa = Number((val / tasaBcv).toFixed(2));
          if (val > 0) {
            updated.creditoBase = 0;
            updated.creditoDivisa = 0;
          }
        } else if (field === 'creditoBase') {
          const val = Number(value) || 0;
          updated.creditoDivisa = Number((val / tasaBcv).toFixed(2));
          if (val > 0) {
            updated.debitoBase = 0;
            updated.debitoDivisa = 0;
          }
        }
        return updated;
      })
    );
  };

  const handleAutoCuadrar = () => {
    if (estaCuadrado) return;
    if (diffBase > 0) {
      setRenglones([
        ...renglones,
        {
          id: Date.now().toString(),
          cuentaCodigo: '1.1.01.001',
          cuentaNombre: 'CAJA GENERAL (VES)',
          descripcion: 'Línea de Ajuste / Balanceo Automático',
          debitoBase: 0,
          creditoBase: Number(diffBase.toFixed(2)),
          debitoDivisa: 0,
          creditoDivisa: Number(diffDivisa.toFixed(2)),
        },
      ]);
    } else {
      setRenglones([
        ...renglones,
        {
          id: Date.now().toString(),
          cuentaCodigo: '1.1.01.001',
          cuentaNombre: 'CAJA GENERAL (VES)',
          descripcion: 'Línea de Ajuste / Balanceo Automático',
          debitoBase: Number(Math.abs(diffBase).toFixed(2)),
          creditoBase: 0,
          debitoDivisa: Number(Math.abs(diffDivisa).toFixed(2)),
          creditoDivisa: 0,
        },
      ]);
    }
  };

  // Cargar modelo de Profit Plus en el voucher actual
  const handleCargarModelo = (modelo: ComprobanteModeloProfit) => {
    setConcepto(`[${modelo.codigo}] ${modelo.nombre}`);
    const nuevosRenglones: RenglonUI[] = modelo.renglones.map((r, idx) => ({
      id: `${Date.now()}-${idx}`,
      cuentaCodigo: r.codigo_cuenta,
      cuentaNombre: r.descripcion_cuenta,
      descripcion: `${modelo.nombre} - ${r.porcentaje_o_regla}`,
      debitoBase: r.naturaleza === 'DEBE' ? 1000 : 0,
      creditoBase: r.naturaleza === 'HABER' ? 1000 : 0,
      debitoDivisa: r.naturaleza === 'DEBE' ? Number((1000 / tasaBcv).toFixed(2)) : 0,
      creditoDivisa: r.naturaleza === 'HABER' ? Number((1000 / tasaBcv).toFixed(2)) : 0,
    }));
    setRenglones(nuevosRenglones);
    setActiveTab(0);
    setSearchParams({ tab: 'asientos' });
  };

  // --- TAB 1: MODELOS PROFIT FILTRO ---
  const [categoriaModelo, setCategoriaModelo] = useState<string>('TODAS');
  const modelosFiltrados = MODELOS_PROFIT_PLUS.filter(
    (m) => categoriaModelo === 'TODAS' || m.categoria === categoriaModelo
  );

  // --- TAB 2: CIERRES PERIODOS ---
  const [periodos] = useState([
    { periodo: '2026-10', nombre: 'Octubre 2026', estado: 'ABIERTO', comprobantes: 18, fecha_inicio: '2026-10-01', fecha_fin: '2026-10-31' },
    { periodo: '2026-09', nombre: 'Septiembre 2026', estado: 'BLOQUEADO', comprobantes: 142, fecha_inicio: '2026-09-01', fecha_fin: '2026-09-30' },
    { periodo: '2026-08', nombre: 'Agosto 2026', estado: 'CERRADO DEFINITIVO', comprobantes: 156, fecha_inicio: '2026-08-01', fecha_fin: '2026-08-31' },
    { periodo: '2026-07', nombre: 'Julio 2026', estado: 'CERRADO DEFINITIVO', comprobantes: 138, fecha_inicio: '2026-07-01', fecha_fin: '2026-07-31' },
  ]);

  // --- TAB 3: INFLACIÓN (NIC 29) ---
  const inpcHistorico = [
    { periodo: 'Sep 2026', inpc: 45210.5, inflacion_mes: '2.1%' },
    { periodo: 'Ago 2026', inpc: 44280.2, inflacion_mes: '1.9%' },
    { periodo: 'Jul 2026', inpc: 43454.0, inflacion_mes: '2.4%' },
    { periodo: 'Jun 2026', inpc: 42435.6, inflacion_mes: '2.0%' },
    { periodo: 'May 2026', inpc: 41603.5, inflacion_mes: '1.8%' },
  ];

  // --- TAB 4: INTEGRACIONES NÓMINA & POS ---
  const [integraciones] = useState([
    { origen: 'Kantio Nómina (LOTTT)', evento: 'Corrida Quincenal 30/09/2026', status: 'SINCRONIZADO', monto_ves: 'Bs. 84.500,00', voucher: 'AS-NOM-2026-09-2' },
    { origen: 'Kantio Nómina (LOTTT)', evento: 'Aportes Patronales IVSS/FAOV', status: 'SINCRONIZADO', monto_ves: 'Bs. 12.340,00', voucher: 'AS-PARAF-2026-09' },
    { origen: 'Kantio FastPOS', evento: 'Corte Z Diario (Tienda Principal)', status: 'SINCRONIZADO', monto_ves: 'Bs. 45.890,00', voucher: 'POS-Z-20261001' },
    { origen: 'Kantio FastPOS', evento: 'Cobros IGTF en Divisas Efectivo', status: 'SINCRONIZADO', monto_ves: 'Bs. 3.200,00', voucher: 'IGTF-POS-20261001' },
  ]);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          2. Procesos Contables & Vouchers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registro bimonetario de comprobantes de diario, plantillas modelo de Profit Plus, cierres periódicos y ajuste por inflación.
        </Typography>
      </Box>

      {/* Selector de Pestañas */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Registro de Asientos (Vouchers)" />
          <Tab icon={<AutoAwesomeIcon />} iconPosition="start" label="Comprobantes Modelo (Profit Plus)" />
          <Tab icon={<LockClockIcon />} iconPosition="start" label="Cierre de Periodo / Ejercicio" />
          <Tab icon={<TrendingDownIcon />} iconPosition="start" label="Ajuste por Inflación (NIC 29)" />
          <Tab icon={<SyncAltIcon />} iconPosition="start" label="Integración Nómina & POS" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: REGISTRO DE ASIENTOS BIMONETARIOS                       */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Box>
          {guardadoExito && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setGuardadoExito(false)}>
              <strong>Comprobante Guardado:</strong> El asiento contable <strong>{numero}</strong> ha sido asentado exitosamente con partida doble bimonetaria validada.
            </Alert>
          )}

          {/* Cabecera del Voucher */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                Encabezado del Comprobante Contable
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Número de Asiento" value={numero} onChange={(e) => setNumero(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" select label="Tipo de Asiento" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <MenuItem value="DIARIO">DIARIO - Operaciones Generales</MenuItem>
                    <MenuItem value="INGRESOS">INGRESOS - Cobranzas y Ventas</MenuItem>
                    <MenuItem value="EGRESOS">EGRESOS - Pagos y Compras</MenuItem>
                    <MenuItem value="AJUSTES">AJUSTES - Reexpresiones y Depreciaciones</MenuItem>
                    <MenuItem value="CIERRE">CIERRE - Fin de Ejercicio</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" type="number" label="Tasa BCV del Día (Bs./$)" value={tasaBcv} onChange={(e) => setTasaBcv(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Concepto General / Glosa" value={concepto} onChange={(e) => setConcepto(e.target.value)} multiline rows={2} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Renglones Contables */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Partidas Contables (Doble Partida Bimonetaria)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="primary" startIcon={<AutoAwesomeIcon />} onClick={handleAutoCuadrar} disabled={estaCuadrado}>
                    Auto-Cuadrar Diferencia
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddRenglon}>
                    Agregar Línea
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Cuenta Contable</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Descripción de la Línea</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '11%' }}>Debe (VES)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '11%' }}>Haber (VES)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '10%' }}>Debe (USD)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '10%' }}>Haber (USD)</TableCell>
                      <TableCell sx={{ width: '3%' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renglones.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={r.cuentaCodigo}
                            onChange={(e) => {
                              const sel = PUC_COMPLETO_VEN_NIF.find((c) => c.codigo === e.target.value);
                              handleUpdateRenglon(r.id, 'cuentaCodigo', e.target.value);
                              if (sel) handleUpdateRenglon(r.id, 'cuentaNombre', sel.descripcion);
                            }}
                          >
                            <MenuItem value="">-- Seleccionar Cuenta --</MenuItem>
                            {PUC_COMPLETO_VEN_NIF.filter((c) => c.permite_movimiento).map((c) => (
                              <MenuItem key={c.codigo} value={c.codigo}>
                                <strong>{c.codigo}</strong>&nbsp;- {c.descripcion}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" value={r.descripcion} onChange={(e) => handleUpdateRenglon(r.id, 'descripcion', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" type="number" value={r.debitoBase || ''} onChange={(e) => handleUpdateRenglon(r.id, 'debitoBase', e.target.value)} inputProps={{ style: { textAlign: 'right' } }} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" type="number" value={r.creditoBase || ''} onChange={(e) => handleUpdateRenglon(r.id, 'creditoBase', e.target.value)} inputProps={{ style: { textAlign: 'right' } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#1976d2' }}>
                          $ {r.debitoDivisa.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#1976d2' }}>
                          $ {r.creditoDivisa.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleRemoveRenglon(r.id)} disabled={renglones.length <= 2}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totales y Cuadre */}
              <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={estaCuadrado ? 'CUADRADO Y BALANCEADO' : 'DESCUADRADO'}
                        color={estaCuadrado ? 'success' : 'error'}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {estaCuadrado ? 'Partida doble satisfecha' : `Diferencia: Bs. ${Math.abs(diffBase).toFixed(2)}`}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Total Moneda Funcional (VES):</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      Debe: Bs. {totalDebitoBase.toLocaleString('es-VE', { minimumFractionDigits: 2 })} | Haber: Bs. {totalCreditoBase.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Total Moneda Extranjera (USD):</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      Debe: $ {totalDebitoDivisa.toFixed(2)} | Haber: $ {totalCreditoDivisa.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="contained" color="success" size="large" startIcon={<SaveIcon />} disabled={!estaCuadrado} onClick={() => setGuardadoExito(true)}>
                  Asentar Comprobante Oficial
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ============================================================== */}
      {/* TAB 1: COMPROBANTES MODELO (PROFIT PLUS)                       */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Catálogo de Comprobantes Modelo (Plantillas Profit Plus)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Plantillas operativas para estandarizar registros contables frecuentes con cuentas predefinidas al Debe y Haber.
                </Typography>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select value={categoriaModelo} label="Categoría" onChange={(e) => setCategoriaModelo(e.target.value)}>
                    <MenuItem value="TODAS">Todas las Categorías</MenuItem>
                    <MenuItem value="OPERACIONES">Operaciones de Capital</MenuItem>
                    <MenuItem value="VENTAS">Ventas & Cobranzas</MenuItem>
                    <MenuItem value="COMPRAS">Compras & Pagos</MenuItem>
                    <MenuItem value="NOMINA">Nómina & Parafiscales</MenuItem>
                    <MenuItem value="TRIBUTOS">Tributos SENIAT</MenuItem>
                    <MenuItem value="AJUSTES">Ajustes & Depreciaciones</MenuItem>
                    <MenuItem value="CIERRES">Cierres de Ejercicio</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {modelosFiltrados.map((m) => (
                <Grid item xs={12} md={6} key={m.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip label={m.codigo} size="small" color="primary" sx={{ fontWeight: 'bold', mb: 0.5 }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {m.nombre}
                          </Typography>
                        </Box>
                        <Chip label={m.categoria} size="small" variant="outlined" />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {m.descripcion}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        Estructura Contable Preconfigurada:
                      </Typography>

                      <Stack spacing={0.8} sx={{ mt: 1, mb: 2 }}>
                        {m.renglones.map((r, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', bgcolor: '#f8fafc', p: 0.8, borderRadius: 1 }}>
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
                              <strong>{r.codigo_cuenta}</strong> - {r.descripcion_cuenta}
                            </Box>
                            <Chip
                              label={r.naturaleza}
                              size="small"
                              color={r.naturaleza === 'DEBE' ? 'primary' : 'secondary'}
                              sx={{ fontSize: '0.65rem', height: 18 }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>

                    <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleCargarModelo(m)}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Cargar este Modelo en Asiento
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CIERRE DE PERIODO / EJERCICIO                           */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Cierre de Periodo Mensual & Cierre de Ejercicio Económico
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Control de periodos contables, bloqueo de fechas para auditoría y generación automática del asiento de refundición de cuentas nominales.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Periodo Fiscal</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Rango de Fechas</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Vouchers</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {periodos.map((p) => (
                        <TableRow key={p.periodo} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{p.nombre} ({p.periodo})</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{p.fecha_inicio} al {p.fecha_fin}</TableCell>
                          <TableCell sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{p.comprobantes}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={p.estado}
                              size="small"
                              color={p.estado === 'ABIERTO' ? 'success' : p.estado === 'BLOQUEADO' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {p.estado === 'ABIERTO' ? (
                              <Button size="small" variant="outlined" color="warning">
                                Bloquear
                              </Button>
                            ) : (
                              <Button size="small" variant="text" disabled>
                                Auditado
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                      Checklist de Cierre Mensual
                    </Typography>
                    <Stack spacing={1.5} sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">Todos los asientos están aprobados</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">Libros de Compras y Ventas conciliados</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">Diferencial cambiario BCV registrado</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">Depreciaciones de PPE contabilizadas</Typography>
                      </Box>
                    </Stack>

                    <Button variant="contained" color="error" fullWidth sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                      Ejecutar Cierre de Periodo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AJUSTE POR INFLACIÓN (NIC 29)                           */}
      {/* ============================================================== */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Ajuste por Inflación Financiero (BA VEN-NIF N° 2 / NIC 29)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reexpresión de estados financieros en economías hiperinflacionarias mediante el Índice Nacional de Precios al Consumidor (INPC).
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<PlayArrowIcon />} size="small">
                Calcular REME del Periodo
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Índices Históricos Publicados por el BCV (INPC)
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Mes / Año</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor del INPC</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Inflación Intermensual</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inpcHistorico.map((h) => (
                        <TableRow key={h.periodo} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{h.periodo}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>{h.inpc.toLocaleString('es-VE')}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: '#c62828', fontWeight: 'bold' }}>
                            {h.inflacion_mes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                      Posición Monetaria Neta y Resultado Monetario (REME)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Las partidas monetarias (Caja, Bancos, Cuentas por Cobrar) sufren pérdida de poder adquisitivo, mientras que las partidas no monetarias (Inventarios, Propiedades) se reexpresan.
                    </Typography>

                    <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Activos Monetarios Promedio:</Typography>
                        <Typography variant="body2" fontWeight="bold">Bs. 320.400,00</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Pasivos Monetarios Promedio:</Typography>
                        <Typography variant="body2" fontWeight="bold">Bs. 185.000,00</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight="bold">Posición Monetaria Activa Neta:</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color="error.main">Bs. 135.400,00</Typography>
                      </Box>
                    </Box>

                    <Button variant="outlined" color="primary" fullWidth sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                      Generar Asiento Contable del REME
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: INTEGRACIÓN NÓMINA & POS                                */}
      {/* ============================================================== */}
      {activeTab === 4 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Integración Satelital Ecosistema (Kantio Nómina & Kantio FastPOS)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recepción automatizada de corridas salariales, deducciones parafiscales y cierres de caja POS en tiempo real vía Webhook.
                </Typography>
              </Box>
              <Chip label="Webhook Activo en Línea" color="success" size="small" />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Módulo Origen</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Evento / Transacción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Monto Contabilizado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Asiento Generado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Sincronización</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {integraciones.map((it, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{it.origen}</TableCell>
                      <TableCell>{it.evento}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>{it.monto_ves}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main' }}>{it.voucher}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label={it.status} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AsientosPage;
