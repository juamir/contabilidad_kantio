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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  initialTab?: string;
}

export const CuentasPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'puc';
  const empresaActiva = useAuthStore((s) => s.empresaActiva);

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

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- TAB 0: PUC ESTADOS Y CRUD ---
  const [cuentasList, setCuentasList] = useState<CuentaPUC[]>(PUC_COMPLETO_VEN_NIF);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<number | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // Modal Cuenta
  const [modalCuentaOpen, setModalCuentaOpen] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<CuentaPUC | null>(null);
  const [cuentaForm, setCuentaForm] = useState<{
    codigo: string;
    descripcion: string;
    nivel: number;
    naturaleza: 'DEUDORA' | 'ACREEDORA';
    tipo_cuenta: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'COSTO' | 'GASTO' | 'ORDEN';
    permite_movimiento: boolean;
    requiere_auxiliar: boolean;
    requiere_documento: boolean;
  }>({
    codigo: '',
    descripcion: '',
    nivel: 4,
    naturaleza: 'DEUDORA',
    tipo_cuenta: 'ACTIVO',
    permite_movimiento: true,
    requiere_auxiliar: false,
    requiere_documento: false,
  });

  const handleOpenCuentaModal = (cuenta?: CuentaPUC) => {
    if (cuenta) {
      setCuentaEditando(cuenta);
      setCuentaForm({
        codigo: cuenta.codigo,
        descripcion: cuenta.descripcion,
        nivel: cuenta.nivel,
        naturaleza: cuenta.naturaleza,
        tipo_cuenta: cuenta.tipo_cuenta,
        permite_movimiento: cuenta.permite_movimiento,
        requiere_auxiliar: !!cuenta.requiere_auxiliar,
        requiere_documento: !!cuenta.requiere_documento,
      });
    } else {
      setCuentaEditando(null);
      setCuentaForm({
        codigo: '',
        descripcion: '',
        nivel: 4,
        naturaleza: 'DEUDORA',
        tipo_cuenta: 'ACTIVO',
        permite_movimiento: true,
        requiere_auxiliar: false,
        requiere_documento: false,
      });
    }
    setModalCuentaOpen(true);
  };

  const handleSaveCuenta = async () => {
    if (!cuentaForm.codigo || !cuentaForm.descripcion) {
      alert('Por favor ingrese código y descripción');
      return;
    }
    if (cuentaEditando) {
      // Modificar existente
      setCuentasList((prev) =>
        prev.map((c) =>
          c.codigo === cuentaEditando.codigo
            ? { ...c, ...cuentaForm }
            : c
        )
      );
      setToastMessage(`Cuenta ${cuentaForm.codigo} actualizada con éxito.`);
    } else {
      // Agregar nueva
      const nueva: CuentaPUC = {
        codigo: cuentaForm.codigo,
        descripcion: cuentaForm.descripcion,
        nivel: Number(cuentaForm.nivel),
        naturaleza: cuentaForm.naturaleza,
        tipo_cuenta: cuentaForm.tipo_cuenta,
        permite_movimiento: cuentaForm.permite_movimiento,
        requiere_auxiliar: cuentaForm.requiere_auxiliar,
        requiere_documento: cuentaForm.requiere_documento,
      };
      setCuentasList((prev) => [...prev, nueva].sort((a, b) => a.codigo.localeCompare(b.codigo)));
      setToastMessage(`Cuenta ${cuentaForm.codigo} creada con éxito.`);
    }
    setModalCuentaOpen(false);
  };


  const handleDeleteCuenta = (codigo: string) => {
    if (window.confirm(`¿Está seguro de eliminar o desactivar la cuenta contable ${codigo}?`)) {
      setCuentasList((prev) => prev.filter((c) => c.codigo !== codigo));
      setToastMessage(`Cuenta ${codigo} eliminada.`);
    }
  };

  const filteredCuentas = cuentasList.filter((c) => {
    const matchesSearch =
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = filtroNivel === 'TODOS' || c.nivel === filtroNivel;
    const matchesTipo = filtroTipo === 'TODOS' || c.tipo_cuenta === filtroTipo;
    return matchesSearch && matchesNivel && matchesTipo;
  });

  // --- TAB 1: CENTROS DE COSTO ---
  const [centrosCosto, setCentrosCosto] = useState([
    { id: '1', codigo: 'CC-ADM-01', nombre: 'Administración y Finanzas Central', responsable: 'Lic. Ana Blanco', presupuesto_ves: 150000, presupuesto_usd: 3750, estado: 'ACTIVO' },
    { id: '2', codigo: 'CC-VEN-01', nombre: 'Ventas, Mercadeo & E-commerce', responsable: 'Ing. Marcos Rivas', presupuesto_ves: 220000, presupuesto_usd: 5500, estado: 'ACTIVO' },
    { id: '3', codigo: 'CC-OPS-01', nombre: 'Operaciones, Logística & Despacho', responsable: 'T.S.U. Pedro Díaz', presupuesto_ves: 180000, presupuesto_usd: 4500, estado: 'ACTIVO' },
    { id: '4', codigo: 'CC-TEC-01', nombre: 'Tecnología, Sistemas & Nube', responsable: 'Ing. Juamir Gómez', presupuesto_ves: 120000, presupuesto_usd: 3000, estado: 'ACTIVO' },
    { id: '5', codigo: 'CC-ALM-01', nombre: 'Almacén Principal Caracas', responsable: 'Carlos Romero', presupuesto_ves: 95000, presupuesto_usd: 2375, estado: 'ACTIVO' },
  ]);

  const [modalCcOpen, setModalCcOpen] = useState(false);
  const [ccEditando, setCcEditando] = useState<any | null>(null);
  const [ccForm, setCcForm] = useState({
    codigo: '',
    nombre: '',
    responsable: '',
    presupuesto_ves: 0,
    presupuesto_usd: 0,
    estado: 'ACTIVO'
  });

  const handleOpenCcModal = (cc?: any) => {
    if (cc) {
      setCcEditando(cc);
      setCcForm({ ...cc });
    } else {
      setCcEditando(null);
      setCcForm({
        codigo: `CC-${Date.now().toString().slice(-4)}`,
        nombre: '',
        responsable: '',
        presupuesto_ves: 10000,
        presupuesto_usd: 250,
        estado: 'ACTIVO'
      });
    }
    setModalCcOpen(true);
  };

  const handleSaveCc = () => {
    if (!ccForm.codigo || !ccForm.nombre) {
      alert('Código y nombre del centro de costo son requeridos.');
      return;
    }
    if (ccEditando) {
      setCentrosCosto((prev) =>
        prev.map((c) => (c.id === ccEditando.id ? { ...c, ...ccForm } : c))
      );
      setToastMessage(`Centro de Costo ${ccForm.codigo} modificado.`);
    } else {
      setCentrosCosto((prev) => [...prev, { ...ccForm, id: Date.now().toString() }]);
      setToastMessage(`Centro de Costo ${ccForm.codigo} creado.`);
    }
    setModalCcOpen(false);
  };

  const handleDeleteCc = (id: string, codigo: string) => {
    if (window.confirm(`¿Desea eliminar el centro de costo ${codigo}?`)) {
      setCentrosCosto((prev) => prev.filter((c) => c.id !== id));
      setToastMessage(`Centro de Costo ${codigo} eliminado.`);
    }
  };

  // --- TAB 2: MONEDAS Y TASAS BCV ---
  const [tasaBcvHoy, setTasaBcvHoy] = useState(40.00);
  const [calcMonto, setCalcMonto] = useState<number>(100);
  const [calcMonedaOrigen, setCalcMonedaOrigen] = useState<'USD' | 'VES'>('USD');
  const [modalTasaOpen, setModalTasaOpen] = useState(false);
  const [nuevaTasaInput, setNuevaTasaInput] = useState('40.00');

  const [monedasRegistradas, setMonedasRegistradas] = useState([
    { id: '1', codigo: 'VES', nombre: 'Bolívar Digital', simbolo: 'Bs.', es_nacional: true, tasa_frente_usd: 40.0, estado: 'OFICIAL' },
    { id: '2', codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', es_nacional: false, tasa_frente_usd: 1.0, estado: 'REFERENCIAL' },
    { id: '3', codigo: 'EUR', nombre: 'Euro', simbolo: '€', es_nacional: false, tasa_frente_usd: 1.08, estado: 'REFERENCIAL' },
    { id: '4', codigo: 'USDT', nombre: 'Tether Crypto Stablecoin', simbolo: 'USDT', es_nacional: false, tasa_frente_usd: 1.0, estado: 'OPERATIVO' },
  ]);

  const handleActualizarTasa = () => {
    const val = parseFloat(nuevaTasaInput);
    if (!val || val <= 0) return;
    setTasaBcvHoy(val);
    setMonedasRegistradas((prev) =>
      prev.map((m) => (m.codigo === 'VES' ? { ...m, tasa_frente_usd: val } : m))
    );
    setModalTasaOpen(false);
    setToastMessage(`Tasa oficial BCV actualizada a Bs. ${val.toFixed(2)} por USD.`);
  };

  // --- TAB 3: BANCOS Y TESORERÍA ---
  const [bancosData, setBancosData] = useState([
    { id: '1', codigo: 'BAN-001', banco: 'BANCO MERCANTIL C.A.', numero_cuenta: '0105-0024-81-1024567890', tipo: 'CORRIENTE VES', saldo_libros_ves: 284500.50, saldo_banco_ves: 284500.50, estado_conciliacion: 'CONCILIADO', saldo_usd: 0 },
    { id: '2', codigo: 'BAN-002', banco: 'BANCO DE VENEZUELA S.A.', numero_cuenta: '0102-0111-42-0001234567', tipo: 'CORRIENTE VES (PAGO SENIAT)', saldo_libros_ves: 142300.00, saldo_banco_ves: 142300.00, estado_conciliacion: 'CONCILIADO', saldo_usd: 0 },
    { id: '3', codigo: 'BAN-003', banco: 'BANESCO BANCO UNIVERSAL', numero_cuenta: '0134-0865-19-8650012345', tipo: 'CORRIENTE VES', saldo_libros_ves: 89600.00, saldo_banco_ves: 89600.00, estado_conciliacion: 'CONCILIADO', saldo_usd: 0 },
    { id: '4', codigo: 'BAN-004', banco: 'BBVA BANCO PROVINCIAL', numero_cuenta: '0108-0012-33-0100456789', tipo: 'CORRIENTE VES', saldo_libros_ves: 65120.80, saldo_banco_ves: 65120.80, estado_conciliacion: 'CONCILIADO', saldo_usd: 0 },
    { id: '5', codigo: 'BAN-005', banco: 'BANCAMIGA / MERCANTIL DIVISAS', numero_cuenta: '0105-0999-01-9999123456', tipo: 'CUSTODIA ESPECIAL USD', saldo_libros_ves: 340000.00, saldo_banco_ves: 340000.00, estado_conciliacion: 'CONCILIADO', saldo_usd: 8500.00 },
  ]);

  const [modalBancoOpen, setModalBancoOpen] = useState(false);
  const [bancoEditando, setBancoEditando] = useState<any | null>(null);
  const [bancoForm, setBancoForm] = useState({
    codigo: '',
    banco: '',
    numero_cuenta: '',
    tipo: 'CORRIENTE VES',
    saldo_libros_ves: 0,
    saldo_usd: 0,
    estado_conciliacion: 'CONCILIADO'
  });

  const handleOpenBancoModal = (b?: any) => {
    if (b) {
      setBancoEditando(b);
      setBancoForm({ ...b });
    } else {
      setBancoEditando(null);
      setBancoForm({
        codigo: `BAN-00${bancosData.length + 1}`,
        banco: '',
        numero_cuenta: '0102-0000-00-0000000000',
        tipo: 'CORRIENTE VES',
        saldo_libros_ves: 0,
        saldo_usd: 0,
        estado_conciliacion: 'CONCILIADO'
      });
    }
    setModalBancoOpen(true);
  };

  const handleSaveBanco = () => {
    if (!bancoForm.banco || !bancoForm.numero_cuenta) {
      alert('Entidad bancaria y número de cuenta son obligatorios.');
      return;
    }
    if (bancoEditando) {
      setBancosData((prev) =>
        prev.map((b) => (b.id === bancoEditando.id ? { ...b, ...bancoForm } : b))
      );
      setToastMessage(`Cuenta bancaria ${bancoForm.codigo} actualizada.`);
    } else {
      setBancosData((prev) => [...prev, { ...bancoForm, id: Date.now().toString(), saldo_banco_ves: bancoForm.saldo_libros_ves }]);
      setToastMessage(`Cuenta bancaria ${bancoForm.codigo} registrada.`);
    }
    setModalBancoOpen(false);
  };

  const handleDeleteBanco = (id: string, codigo: string) => {
    if (window.confirm(`¿Eliminar la cuenta de tesorería ${codigo}?`)) {
      setBancosData((prev) => prev.filter((b) => b.id !== id));
      setToastMessage(`Cuenta bancaria ${codigo} eliminada.`);
    }
  };

  // --- TAB 4: AUXILIARES (TERCEROS) ---
  const [auxiliaresData, setAuxiliaresData] = useState([
    { id: '1', rif: 'J-00002961-0', razon_social: 'BANCO MERCANTIL C.A.', tipo: 'BANCO / FINANCIERO', ret_iva: '0%', ret_islr: '0%', calificacion: 'AGENTE PERCEPCION' },
    { id: '2', rif: 'J-20009997-6', razon_social: 'BANCO DE VENEZUELA S.A.', tipo: 'BANCO / FINANCIERO', ret_iva: '0%', ret_islr: '0%', calificacion: 'AGENTE PERCEPCION' },
    { id: '3', rif: 'J-30111222-3', razon_social: 'PROVEEDORA NACIONAL DE ALIMENTOS C.A.', tipo: 'PROVEEDOR BIENES', ret_iva: '75%', ret_islr: '2%', calificacion: 'CONTRIBUYENTE ORDINARIO' },
    { id: '4', rif: 'J-40998877-1', razon_social: 'DISTRIBUIDORA Y SUMINISTROS CARACAS S.A.', tipo: 'PROVEEDOR BIENES & REPUESTOS', ret_iva: '75%', ret_islr: '2%', calificacion: 'CONTRIBUYENTE ORDINARIO' },
    { id: '5', rif: 'J-50123456-7', razon_social: 'CORPORACION DEMO KANTIO C.A.', tipo: 'EMPRESA MATRIZ', ret_iva: '75%', ret_islr: '2%', calificacion: 'SUJETO PASIVO ESPECIAL (SPE)' },
    { id: '6', rif: 'J-31456789-0', razon_social: 'DESPACHO CONTABLE Y AUDITORES ALPHA & ASOC.', tipo: 'PROVEEDOR SERVICIOS', ret_iva: '75%', ret_islr: '3%', calificacion: 'PERSONA JURIDICA DOMICILIADA' },
    { id: '7', rif: 'V-14555666-0', razon_social: 'CLIENTE GENERAL DE CONTADO (VENTAS MOSTRADOR)', tipo: 'CLIENTE COMERCIAL', ret_iva: '0%', ret_islr: '0%', calificacion: 'CONSUMIDOR FINAL' },
    { id: '8', rif: 'V-18999888-2', razon_social: 'ING. CARLOS MENDEZ (SERVICIOS PROFESIONALES)', tipo: 'PROVEEDOR SERVICIOS', ret_iva: '100%', ret_islr: '3%', calificacion: 'PERSONA NATURAL NO ASOCIADA' },
  ]);

  const [modalAuxOpen, setModalAuxOpen] = useState(false);
  const [auxEditando, setAuxEditando] = useState<any | null>(null);
  const [auxForm, setAuxForm] = useState({
    rif: '',
    razon_social: '',
    tipo: 'PROVEEDOR BIENES',
    ret_iva: '75%',
    ret_islr: '2%',
    calificacion: 'CONTRIBUYENTE ORDINARIO'
  });

  const handleOpenAuxModal = (aux?: any) => {
    if (aux) {
      setAuxEditando(aux);
      setAuxForm({ ...aux });
    } else {
      setAuxEditando(null);
      setAuxForm({
        rif: 'J-',
        razon_social: '',
        tipo: 'PROVEEDOR BIENES',
        ret_iva: '75%',
        ret_islr: '2%',
        calificacion: 'CONTRIBUYENTE ORDINARIO'
      });
    }
    setModalAuxOpen(true);
  };

  const handleSaveAux = () => {
    if (!auxForm.rif || !auxForm.razon_social) {
      alert('RIF y Razón Social son campos requeridos.');
      return;
    }
    if (auxEditando) {
      setAuxiliaresData((prev) =>
        prev.map((a) => (a.id === auxEditando.id ? { ...a, ...auxForm } : a))
      );
      setToastMessage(`Auxiliar fiscal ${auxForm.rif} actualizado.`);
    } else {
      setAuxiliaresData((prev) => [...prev, { ...auxForm, id: Date.now().toString() }]);
      setToastMessage(`Nuevo auxiliar fiscal ${auxForm.rif} registrado.`);
    }
    setModalAuxOpen(false);
  };

  const handleDeleteAux = (id: string, rif: string) => {
    if (window.confirm(`¿Desea eliminar el auxiliar fiscal ${rif}?`)) {
      setAuxiliaresData((prev) => prev.filter((a) => a.id !== id));
      setToastMessage(`Auxiliar fiscal ${rif} eliminado.`);
    }
  };

  return (
    <Box>
      {/* Notificaciones */}
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
                  Catálogo Oficial VEN-NIF ({cuentasList.length} Cuentas Registradas)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estructurado según Boletín de Aplicación BA VEN-NIF N° 8 para empresas en Venezuela.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
                  Exportar Catálogo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  size="small"
                  onClick={() => handleOpenCuentaModal()}
                >
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
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
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
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="Modificar cuenta">
                            <IconButton size="small" color="primary" onClick={() => handleOpenCuentaModal(c)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar cuenta">
                            <IconButton size="small" color="error" onClick={() => handleDeleteCuenta(c.codigo)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenCcModal()}
              >
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
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {centrosCosto.map((cc) => (
                    <TableRow key={cc.id} hover>
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
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Editar centro de costo">
                          <IconButton size="small" color="primary" onClick={() => handleOpenCcModal(cc)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar centro de costo">
                          <IconButton size="small" color="error" onClick={() => handleDeleteCc(cc.id, cc.codigo)}>
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
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CalculateIcon />}
                onClick={() => setModalTasaOpen(true)}
              >
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
                        <TableRow key={m.id} hover>
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
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenBancoModal()}
              >
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
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bancosData.map((b) => (
                    <TableRow key={b.id} hover>
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
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Modificar cuenta bancaria">
                          <IconButton size="small" color="primary" onClick={() => handleOpenBancoModal(b)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar cuenta bancaria">
                          <IconButton size="small" color="error" onClick={() => handleDeleteBanco(b.id, b.codigo)}>
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
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenAuxModal()}
              >
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
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auxiliaresData.map((aux) => (
                    <TableRow key={aux.id} hover>
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
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Modificar auxiliar">
                          <IconButton size="small" color="primary" onClick={() => handleOpenAuxModal(aux)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar auxiliar">
                          <IconButton size="small" color="error" onClick={() => handleDeleteAux(aux.id, aux.rif)}>
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

      {/* --- MODAL DE CUENTA PUC --- */}
      <Dialog open={modalCuentaOpen} onClose={() => setModalCuentaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {cuentaEditando ? 'Modificar Cuenta Contable' : 'Nueva Cuenta Contable (VEN-NIF)'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Código Contable"
                value={cuentaForm.codigo}
                disabled={!!cuentaEditando}
                placeholder="ej: 1.1.01.006"
                onChange={(e) => setCuentaForm({ ...cuentaForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Nivel Jerárquico</InputLabel>
                <Select
                  value={cuentaForm.nivel}
                  label="Nivel Jerárquico"
                  onChange={(e) => setCuentaForm({ ...cuentaForm, nivel: Number(e.target.value) })}
                >
                  <MenuItem value={1}>1 - Grupo Mayor</MenuItem>
                  <MenuItem value={2}>2 - Subgrupo</MenuItem>
                  <MenuItem value={3}>3 - Rubro</MenuItem>
                  <MenuItem value={4}>4 - Cuenta Imputable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descripción de la Cuenta"
                value={cuentaForm.descripcion}
                placeholder="ej: BANCO NACIONAL DE CRÉDITO VES"
                onChange={(e) => setCuentaForm({ ...cuentaForm, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Naturaleza</InputLabel>
                <Select
                  value={cuentaForm.naturaleza}
                  label="Naturaleza"
                  onChange={(e) => setCuentaForm({ ...cuentaForm, naturaleza: e.target.value as any })}
                >
                  <MenuItem value="DEUDORA">DEUDORA (Aumenta por Debe)</MenuItem>
                  <MenuItem value="ACREEDORA">ACREEDORA (Aumenta por Haber)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Clase Financiera</InputLabel>
                <Select
                  value={cuentaForm.tipo_cuenta}
                  label="Clase Financiera"
                  onChange={(e) => setCuentaForm({ ...cuentaForm, tipo_cuenta: e.target.value as any })}
                >
                  <MenuItem value="ACTIVO">1. Activo</MenuItem>
                  <MenuItem value="PASIVO">2. Pasivo</MenuItem>
                  <MenuItem value="PATRIMONIO">3. Patrimonio</MenuItem>
                  <MenuItem value="INGRESO">4. Ingreso</MenuItem>
                  <MenuItem value="COSTO">5. Costo</MenuItem>
                  <MenuItem value="GASTO">6. Gasto</MenuItem>
                  <MenuItem value="ORDEN">9. Orden</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cuentaForm.permite_movimiento}
                    onChange={(e) => setCuentaForm({ ...cuentaForm, permite_movimiento: e.target.checked })}
                  />
                }
                label="Permite Movimiento Directo (Imputable en Asientos)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalCuentaOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCuenta}>Guardar Cuenta</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL CENTRO DE COSTO --- */}
      <Dialog open={modalCcOpen} onClose={() => setModalCcOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {ccEditando ? 'Modificar Centro de Costo' : 'Nuevo Centro de Costo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={ccForm.codigo}
                onChange={(e) => setCcForm({ ...ccForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Responsable"
                value={ccForm.responsable}
                onChange={(e) => setCcForm({ ...ccForm, responsable: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nombre / Unidad Operativa"
                value={ccForm.nombre}
                onChange={(e) => setCcForm({ ...ccForm, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Presupuesto Anual (VES)"
                value={ccForm.presupuesto_ves}
                onChange={(e) => setCcForm({ ...ccForm, presupuesto_ves: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Presupuesto Anual (USD)"
                value={ccForm.presupuesto_usd}
                onChange={(e) => setCcForm({ ...ccForm, presupuesto_usd: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalCcOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCc}>Guardar Centro</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL TASA BCV --- */}
      <Dialog open={modalTasaOpen} onClose={() => setModalTasaOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Actualizar Tasa Oficial BCV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingrese el valor de cierre publicado por el Banco Central de Venezuela para las reexpresiones del sistema:
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Tasa USD Oficial (Bs.)"
            value={nuevaTasaInput}
            onChange={(e) => setNuevaTasaInput(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">Bs.</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalTasaOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleActualizarTasa}>Fijar Tasa</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL BANCO --- */}
      <Dialog open={modalBancoOpen} onClose={() => setModalBancoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {bancoEditando ? 'Modificar Cuenta Bancaria' : 'Registrar Cuenta de Tesorería'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={bancoForm.codigo}
                onChange={(e) => setBancoForm({ ...bancoForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Entidad Bancaria"
                value={bancoForm.banco}
                placeholder="ej: BANCO NACIONAL DE CREDITO BNC"
                onChange={(e) => setBancoForm({ ...bancoForm, banco: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Número de Cuenta (20 Dígitos)"
                value={bancoForm.numero_cuenta}
                onChange={(e) => setBancoForm({ ...bancoForm, numero_cuenta: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Cuenta</InputLabel>
                <Select
                  value={bancoForm.tipo}
                  label="Tipo de Cuenta"
                  onChange={(e) => setBancoForm({ ...bancoForm, tipo: e.target.value })}
                >
                  <MenuItem value="CORRIENTE VES">CORRIENTE VES</MenuItem>
                  <MenuItem value="CORRIENTE VES (PAGO SENIAT)">CORRIENTE VES (PAGO SENIAT)</MenuItem>
                  <MenuItem value="CUSTODIA ESPECIAL USD">CUSTODIA ESPECIAL USD</MenuItem>
                  <MenuItem value="AHORRO VES">AHORRO VES</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Saldo Inicial en Libros (VES)"
                value={bancoForm.saldo_libros_ves}
                onChange={(e) => setBancoForm({ ...bancoForm, saldo_libros_ves: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalBancoOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveBanco}>Guardar Banco</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL AUXILIAR --- */}
      <Dialog open={modalAuxOpen} onClose={() => setModalAuxOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {auxEditando ? 'Modificar Auxiliar Fiscal' : 'Nuevo Auxiliar (Tercero)'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="RIF / Cédula"
                value={auxForm.rif}
                placeholder="J-12345678-9"
                onChange={(e) => setAuxForm({ ...auxForm, rif: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Tercero</InputLabel>
                <Select
                  value={auxForm.tipo}
                  label="Tipo de Tercero"
                  onChange={(e) => setAuxForm({ ...auxForm, tipo: e.target.value })}
                >
                  <MenuItem value="PROVEEDOR BIENES">PROVEEDOR BIENES</MenuItem>
                  <MenuItem value="PROVEEDOR SERVICIOS">PROVEEDOR SERVICIOS</MenuItem>
                  <MenuItem value="CLIENTE COMERCIAL">CLIENTE COMERCIAL</MenuItem>
                  <MenuItem value="EMPRESA MATRIZ">EMPRESA MATRIZ</MenuItem>
                  <MenuItem value="BANCO / FINANCIERO">BANCO / FINANCIERO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nombre o Razón Social"
                value={auxForm.razon_social}
                onChange={(e) => setAuxForm({ ...auxForm, razon_social: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>% Retención IVA</InputLabel>
                <Select
                  value={auxForm.ret_iva}
                  label="% Retención IVA"
                  onChange={(e) => setAuxForm({ ...auxForm, ret_iva: e.target.value })}
                >
                  <MenuItem value="0%">0% (Sin Retención)</MenuItem>
                  <MenuItem value="75%">75% (General Ordinario)</MenuItem>
                  <MenuItem value="100%">100% (Sujeto Especial)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>% Retención ISLR</InputLabel>
                <Select
                  value={auxForm.ret_islr}
                  label="% Retención ISLR"
                  onChange={(e) => setAuxForm({ ...auxForm, ret_islr: e.target.value })}
                >
                  <MenuItem value="0%">0% (Sin Retención)</MenuItem>
                  <MenuItem value="1%">1% (Fletes / Transporte)</MenuItem>
                  <MenuItem value="2%">2% (Bienes Mercantiles)</MenuItem>
                  <MenuItem value="3%">3% (Servicios PJ)</MenuItem>
                  <MenuItem value="5%">5% (Honorarios Profesionales)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Calificación Fiscal SENIAT</InputLabel>
                <Select
                  value={auxForm.calificacion}
                  label="Calificación Fiscal SENIAT"
                  onChange={(e) => setAuxForm({ ...auxForm, calificacion: e.target.value })}
                >
                  <MenuItem value="CONTRIBUYENTE ORDINARIO">CONTRIBUYENTE ORDINARIO</MenuItem>
                  <MenuItem value="SUJETO PASIVO ESPECIAL (SPE)">SUJETO PASIVO ESPECIAL (SPE)</MenuItem>
                  <MenuItem value="PERSONA JURIDICA DOMICILIADA">PERSONA JURIDICA DOMICILIADA</MenuItem>
                  <MenuItem value="PERSONA NATURAL NO ASOCIADA">PERSONA NATURAL NO ASOCIADA</MenuItem>
                  <MenuItem value="CONSUMIDOR FINAL">CONSUMIDOR FINAL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAuxOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveAux}>Guardar Auxiliar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CuentasPage;
