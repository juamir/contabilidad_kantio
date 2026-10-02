import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DomainIcon from '@mui/icons-material/Domain';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSearchParams } from 'react-router-dom';
import { PUC_COMPLETO_VEN_NIF, CuentaPUC } from '../data/pucVenNifCompleto';

interface Props {
  initialTab?: string;
}

export const CuentasPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'puc';

  const tabIndexMap: Record<string, number> = {
    puc: 0,
    centros: 1,
    monedas: 2,
    bancos: 3,
    auxiliares: 4,
  };

  const indexTabMap: Record<number, string> = {
    0: 'puc',
    1: 'centros',
    2: 'monedas',
    3: 'bancos',
    4: 'auxiliares',
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

  // --- TAB 0: PUC ESTADOS Y FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<number | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  const filteredCuentas = PUC_COMPLETO_VEN_NIF.filter((c) => {
    const matchesSearch =
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = filtroNivel === 'TODOS' || c.nivel === filtroNivel;
    const matchesTipo = filtroTipo === 'TODOS' || c.tipo_cuenta === filtroTipo;
    return matchesSearch && matchesNivel && matchesTipo;
  });

  // --- TAB 1: CENTROS DE COSTO ---
  const [centrosCosto, setCentrosCosto] = useState([
    { codigo: 'CC-ADM-01', nombre: 'Administración y Finanzas Central', responsable: 'Lic. Ana Blanco', presupuesto_ves: 150000, presupuesto_usd: 3750, estado: 'ACTIVO' },
    { codigo: 'CC-VEN-01', nombre: 'Ventas, Mercadeo & E-commerce', responsable: 'Ing. Marcos Rivas', presupuesto_ves: 220000, presupuesto_usd: 5500, estado: 'ACTIVO' },
    { codigo: 'CC-OPS-01', nombre: 'Operaciones, Logística & Despacho', responsable: 'T.S.U. Pedro Díaz', presupuesto_ves: 180000, presupuesto_usd: 4500, estado: 'ACTIVO' },
    { codigo: 'CC-TEC-01', nombre: 'Tecnología, Sistemas & Nube', responsable: 'Ing. Juamir Gómez', presupuesto_ves: 120000, presupuesto_usd: 3000, estado: 'ACTIVO' },
    { codigo: 'CC-ALM-01', nombre: 'Almacén Principal Caracas', responsable: 'Carlos Romero', presupuesto_ves: 95000, presupuesto_usd: 2375, estado: 'ACTIVO' },
  ]);

  // --- TAB 2: MONEDAS Y TASAS BCV ---
  const [tasaBcvHoy, setTasaBcvHoy] = useState(40.00);
  const [calcMonto, setCalcMonto] = useState<number>(100);
  const [calcMonedaOrigen, setCalcMonedaOrigen] = useState<'USD' | 'VES'>('USD');

  const monedasRegistradas = [
    { codigo: 'VES', nombre: 'Bolívar Digital', simbolo: 'Bs.', es_nacional: true, tasa_frente_usd: tasaBcvHoy, estado: 'OFICIAL' },
    { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', es_nacional: false, tasa_frente_usd: 1.0, estado: 'REFERENCIAL' },
    { codigo: 'EUR', nombre: 'Euro', simbolo: '€', es_nacional: false, tasa_frente_usd: 1.08, estado: 'REFERENCIAL' },
    { codigo: 'USDT', nombre: 'Tether Crypto Stablecoin', simbolo: 'USDT', es_nacional: false, tasa_frente_usd: 1.0, estado: 'OPERATIVO' },
  ];

  // --- TAB 3: BANCOS Y TESORERÍA ---
  const bancosData = [
    { codigo: 'BAN-001', banco: 'BANCO MERCANTIL C.A.', numero_cuenta: '0105-0024-81-1024567890', tipo: 'CORRIENTE VES', saldo_libros_ves: 284500.50, saldo_banco_ves: 284500.50, estado_conciliacion: 'CONCILIADO' },
    { codigo: 'BAN-002', banco: 'BANCO DE VENEZUELA S.A.', numero_cuenta: '0102-0111-42-0001234567', tipo: 'CORRIENTE VES (PAGO SENIAT)', saldo_libros_ves: 142300.00, saldo_banco_ves: 142300.00, estado_conciliacion: 'CONCILIADO' },
    { codigo: 'BAN-003', banco: 'BANESCO BANCO UNIVERSAL', numero_cuenta: '0134-0865-19-8650012345', tipo: 'CORRIENTE VES', saldo_libros_ves: 89600.00, saldo_banco_ves: 89600.00, estado_conciliacion: 'CONCILIADO' },
    { codigo: 'BAN-004', banco: 'BBVA BANCO PROVINCIAL', numero_cuenta: '0108-0012-33-0100456789', tipo: 'CORRIENTE VES', saldo_libros_ves: 65120.80, saldo_banco_ves: 65120.80, estado_conciliacion: 'CONCILIADO' },
    { codigo: 'BAN-005', banco: 'BANCAMIGA / MERCANTIL DIVISAS', numero_cuenta: '0105-0999-01-9999123456', tipo: 'CUSTODIA ESPECIAL USD', saldo_libros_ves: 340000.00, saldo_banco_ves: 340000.00, estado_conciliacion: 'CONCILIADO', saldo_usd: 8500.00 },
  ];

  // --- TAB 4: AUXILIARES (TERCEROS) ---
  const auxiliaresData = [
    { rif: 'J-00002961-0', razon_social: 'BANCO MERCANTIL C.A.', tipo: 'BANCO / FINANCIERO', ret_iva: '0%', ret_islr: '0%', calificacion: 'AGENTE PERCEPCION' },
    { rif: 'J-20009997-6', razon_social: 'BANCO DE VENEZUELA S.A.', tipo: 'BANCO / FINANCIERO', ret_iva: '0%', ret_islr: '0%', calificacion: 'AGENTE PERCEPCION' },
    { rif: 'J-30111222-3', razon_social: 'PROVEEDORA NACIONAL DE ALIMENTOS C.A.', tipo: 'PROVEEDOR BIENES', ret_iva: '75%', ret_islr: '2%', calificacion: 'CONTRIBUYENTE ORDINARIO' },
    { rif: 'J-40998877-1', razon_social: 'DISTRIBUIDORA Y SUMINISTROS CARACAS S.A.', tipo: 'PROVEEDOR BIENES & REPUESTOS', ret_iva: '75%', ret_islr: '2%', calificacion: 'CONTRIBUYENTE ORDINARIO' },
    { rif: 'J-50123456-7', razon_social: 'CORPORACION DEMO KANTIO C.A.', tipo: 'EMPRESA MATRIZ', ret_iva: '75%', ret_islr: '2%', calificacion: 'SUJETO PASIVO ESPECIAL (SPE)' },
    { rif: 'J-31456789-0', razon_social: 'DESPACHO CONTABLE Y AUDITORES ALPHA & ASOC.', tipo: 'PROVEEDOR SERVICIOS', ret_iva: '75%', ret_islr: '3%', calificacion: 'PERSONA JURIDICA DOMICILIADA' },
    { rif: 'V-14555666-0', razon_social: 'CLIENTE GENERAL DE CONTADO (VENTAS MOSTRADOR)', tipo: 'CLIENTE COMERCIAL', ret_iva: '0%', ret_islr: '0%', calificacion: 'CONSUMIDOR FINAL' },
    { rif: 'V-18999888-2', razon_social: 'ING. CARLOS MENDEZ (SERVICIOS PROFESIONALES)', tipo: 'PROVEEDOR SERVICIOS', ret_iva: '100%', ret_islr: '3%', calificacion: 'PERSONA NATURAL NO ASOCIADA' },
  ];

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            1. Tablas & Maestros Contables
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Catálogos fundamentales, Plan VEN-NIF completo, centros de costo, monedas oficiales BCV y terceros auxiliares.
          </Typography>
        </Box>
      </Box>

      {/* Barra de Pestañas */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AccountTreeIcon />} iconPosition="start" label="Plan de Cuentas (PUC VEN-NIF)" />
          <Tab icon={<DomainIcon />} iconPosition="start" label="Centros de Costo" />
          <Tab icon={<CurrencyExchangeIcon />} iconPosition="start" label="Monedas & Tasas BCV" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Bancos & Tesorería" />
          <Tab icon={<GroupIcon />} iconPosition="start" label="Auxiliares (Terceros)" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: PLAN DE CUENTAS COMPLETO                                */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Catálogo Oficial VEN-NIF (Más de 100 Cuentas Normalizadas)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estructurado según Boletín de Aplicación BA VEN-NIF N° 8 para empresas en Venezuela.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
                  Exportar Catálogo
                </Button>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="small">
                  Nueva Cuenta
                </Button>
              </Box>
            </Box>

            {/* Filtros */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por código contable o descripción (ej: 'BANCOS', 'IVA', '1.1')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filtro-nivel-label">Nivel Jerárquico</InputLabel>
                  <Select
                    labelId="filtro-nivel-label"
                    value={filtroNivel}
                    label="Nivel Jerárquico"
                    onChange={(e) => setFiltroNivel(e.target.value as any)}
                  >
                    <MenuItem value="TODOS">Todos los Niveles</MenuItem>
                    <MenuItem value={1}>Nivel 1 (Grupo Mayor)</MenuItem>
                    <MenuItem value={2}>Nivel 2 (Subgrupo)</MenuItem>
                    <MenuItem value={3}>Nivel 3 (Rubro)</MenuItem>
                    <MenuItem value={4}>Nivel 4 (Cuenta Imputable)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filtro-tipo-label">Clasificación Financiera</InputLabel>
                  <Select
                    labelId="filtro-tipo-label"
                    value={filtroTipo}
                    label="Clasificación Financiera"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="TODOS">Todas las Clases</MenuItem>
                    <MenuItem value="ACTIVO">1. Activo</MenuItem>
                    <MenuItem value="PASIVO">2. Pasivo</MenuItem>
                    <MenuItem value="PATRIMONIO">3. Patrimonio</MenuItem>
                    <MenuItem value="INGRESO">4. Ingreso</MenuItem>
                    <MenuItem value="COSTO">5. Costo</MenuItem>
                    <MenuItem value="GASTO">6. Gasto</MenuItem>
                    <MenuItem value="ORDEN">9. Cuentas de Orden</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Tabla del PUC */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción de la Cuenta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nivel</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Naturaleza</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Movimiento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Atributos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCuentas.map((c) => {
                    const isTotalizadora = !c.permite_movimiento;
                    const paddingLeft = (c.nivel - 1) * 20;

                    return (
                      <TableRow
                        key={c.codigo}
                        hover
                        sx={{
                          bgcolor: isTotalizadora ? (c.nivel === 1 ? '#f1f5f9' : '#fafafa') : '#ffffff',
                          fontWeight: isTotalizadora ? 'bold' : 'normal',
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: isTotalizadora ? 'bold' : '500' }}>
                          {c.codigo}
                        </TableCell>
                        <TableCell sx={{ pl: `${paddingLeft + 16}px` }}>
                          <Typography variant="body2" sx={{ fontWeight: isTotalizadora ? (c.nivel === 1 ? 800 : 700) : 400 }}>
                            {c.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`Nivel ${c.nivel}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.naturaleza}
                            size="small"
                            color={c.naturaleza === 'DEUDORA' ? 'primary' : 'secondary'}
                            variant="filled"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.permite_movimiento ? 'Imputable (Operativa)' : 'Totalizadora'}
                            size="small"
                            color={c.permite_movimiento ? 'success' : 'default'}
                            variant={c.permite_movimiento ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {c.requiere_auxiliar && (
                              <Chip label="Auxiliar" size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                            )}
                            {c.requiere_documento && (
                              <Chip label="Factura/Doc" size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 1: CENTROS DE COSTO                                        */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Catálogo de Centros de Costo y Unidades de Negocio
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Permite imputar gastos e ingresos a divisiones operativas para análisis de rentabilidad.
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="small">
                Nuevo Centro de Costo
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Centro de Costo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Responsable</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Presupuesto (VES)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Presupuesto (USD)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {centrosCosto.map((cc) => (
                    <TableRow key={cc.codigo} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{cc.codigo}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="500">{cc.nombre}</Typography></TableCell>
                      <TableCell>{cc.responsable}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        Bs. {cc.presupuesto_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: '#2e7d32', fontWeight: 'bold' }}>
                        $ {cc.presupuesto_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={cc.estado} color="success" size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MONEDAS Y TASAS OFICIALES BCV                           */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Parámetros Bimonetarios & Tasa Oficial del Banco Central de Venezuela (BCV)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gestión multimoneda con reexpresión automática para transacciones en divisas según normativa legal.
                </Typography>
              </Box>
              <Button variant="contained" color="primary" size="small" startIcon={<CalculateIcon />}>
                Actualizar Tasa BCV
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={7}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Moneda</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Símbolo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Factor de Cambio (USD)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Régimen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monedasRegistradas.map((m) => (
                        <TableRow key={m.codigo} hover>
                          <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{m.codigo}</TableCell>
                          <TableCell>{m.nombre}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{m.simbolo}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {m.codigo === 'VES' ? `Bs. ${m.tasa_frente_usd.toFixed(2)}` : `$ ${m.tasa_frente_usd.toFixed(2)}`}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip label={m.estado} color={m.es_nacional ? 'primary' : 'info'} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Calculadora Bimonetaria Interactiva */}
              <Grid item xs={12} md={5}>
                <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                      Calculadora Bimonetaria en Tiempo Real
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Conversión oficial usando tasa del día: <strong>Bs. {tasaBcvHoy.toFixed(2)} / USD</strong>
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <TextField
                        label="Monto a Convertir"
                        type="number"
                        size="small"
                        value={calcMonto}
                        onChange={(e) => setCalcMonto(Number(e.target.value))}
                        fullWidth
                      />
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Moneda</InputLabel>
                        <Select
                          value={calcMonedaOrigen}
                          label="Moneda"
                          onChange={(e) => setCalcMonedaOrigen(e.target.value as any)}
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="VES">VES (Bs.)</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" color="text.secondary">Resultado Equivalente Oficial:</Typography>
                      <Typography variant="h5" fontWeight="bold" color={calcMonedaOrigen === 'USD' ? 'primary.main' : 'success.main'}>
                        {calcMonedaOrigen === 'USD'
                          ? `Bs. ${(calcMonto * tasaBcvHoy).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                          : `$ ${(calcMonto / (tasaBcvHoy || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BANCOS Y CUENTAS DE TESORERÍA                           */}
      {/* ============================================================== */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Bancos Nacionales & Cuentas de Tesorería Bimonetaria
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Control de disponibilidades bancarias en Bolívares y cuentas de custodia en divisas autorizadas por Sudeban.
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="small">
                Registrar Cuenta Bancaria
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Entidad Bancaria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Número de Cuenta (20 Dígitos)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Cuenta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Saldo en Libros</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Conciliación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bancosData.map((b) => (
                    <TableRow key={b.codigo} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{b.codigo}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="600">{b.banco}</Typography></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{b.numero_cuenta}</TableCell>
                      <TableCell><Chip label={b.tipo} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {b.saldo_usd ? (
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              $ {b.saldo_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (Bs. {b.saldo_libros_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
                            </Typography>
                          </Box>
                        ) : (
                          `Bs. ${b.saldo_libros_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                          label={b.estado_conciliacion}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AUXILIARES (TERCEROS)                                   */}
      {/* ============================================================== */}
      {activeTab === 4 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Maestro de Auxiliares (Terceros: Proveedores, Clientes y Bancos)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Directorio fiscal con RIF validado, condición tributaria SENIAT y alícuotas de retención asociadas.
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="small">
                Nuevo Auxiliar / Tercero
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>RIF / Identificación</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre o Razón Social</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Tercero</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ret. IVA</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ret. ISLR</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Calificación Fiscal SENIAT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auxiliaresData.map((aux) => (
                    <TableRow key={aux.rif} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{aux.rif}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="600">{aux.razon_social}</Typography></TableCell>
                      <TableCell><Chip label={aux.tipo} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={aux.ret_iva} size="small" color={aux.ret_iva !== '0%' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={aux.ret_islr} size="small" color={aux.ret_islr !== '0%' ? 'secondary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={aux.calificacion}
                          size="small"
                          color={aux.calificacion.includes('SPE') ? 'error' : 'default'}
                          variant="outlined"
                        />
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

export default CuentasPage;
