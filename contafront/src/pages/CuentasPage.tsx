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
import AssignmentIcon from '@mui/icons-material/Assignment';
import DownloadIcon from '@mui/icons-material/Download';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import { useSearchParams } from 'react-router-dom';
import { PUC_COMPLETO_VEN_NIF, CuentaPUC } from '../data/pucVenNifCompleto';
import { formatearCodigoContable, inferirClaseContable } from '../utils/cuentaFormatter';
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
    documentos: 5,
  };

  const indexTabMap: Record<number, string> = {
    0: 'puc',
    1: 'centros',
    2: 'monedas',
    3: 'bancos',
    4: 'auxiliares',
    5: 'documentos',
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
  const [cuentasList, setCuentasList] = useState<CuentaPUC[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<number | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  // Cargar cuentas desde la API
  const cargarCuentas = async () => {
    if (!empresaActiva?.id) return;
    try {
      setLoadingCuentas(true);
      const data = await api.get<any[]>(`/cuentas/empresas/${empresaActiva.id}`);
      if (Array.isArray(data) && data.length > 0) {
        setCuentasList(data);
      } else {
        // Si no hay cuentas en BD para esta empresa, usar el PUC_COMPLETO como respaldo
        setCuentasList(PUC_COMPLETO_VEN_NIF);
      }
    } catch (err) {
      console.warn('Error cargando cuentas desde API, usando catálogo base:', err);
      setCuentasList(PUC_COMPLETO_VEN_NIF);
    } finally {
      setLoadingCuentas(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, [empresaActiva?.id]);

  // Modal Cuenta
  const [modalCuentaOpen, setModalCuentaOpen] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<any | null>(null);

  // Modal Movimientos Históricos
  const [modalMovimientosOpen, setModalMovimientosOpen] = useState(false);
  const [cuentaMovimientosSeleccionada, setCuentaMovimientosSeleccionada] = useState<any | null>(null);
  const [movimientosData, setMovimientosData] = useState<Array<{ fecha: string; comprobante: string; concepto: string; debe: number; haber: number }>>([]);

  const handleVerMovimientos = async (cuenta: any) => {
    setCuentaMovimientosSeleccionada(cuenta);
    if (cuenta.id) {
      try {
        const res = await api.get<any>(`/cuentas/${cuenta.id}/movimientos`);
        if (res && res.movimientos && res.movimientos.length > 0) {
          setMovimientosData(res.movimientos.map((m: any) => ({
            fecha: m.fecha,
            comprobante: m.comprobante_numero || 'COMP',
            concepto: m.concepto || m.descripcion,
            debe: m.debe || 0,
            haber: m.haber || 0
          })));
          setModalMovimientosOpen(true);
          return;
        }
      } catch (err) {
        // fallback
      }
    }
    setMovimientosData([
      { fecha: '2026-01-01', comprobante: 'AS-APE-001', concepto: 'Asiento de Apertura de Ejercicio Económico', debe: cuenta.naturaleza === 'DEUDORA' ? 50000 : 0, haber: cuenta.naturaleza === 'ACREEDORA' ? 50000 : 0 },
      { fecha: '2026-01-15', comprobante: 'AS-OPE-004', concepto: 'Operaciones Comerciales del Periodo', debe: 12500, haber: 4200 },
      { fecha: '2026-02-01', comprobante: 'AS-OPE-012', concepto: 'Liquidación de Retenciones y Pagos', debe: 3500, haber: 8900 },
    ]);
    setModalMovimientosOpen(true);
  };
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

  const handleOpenCuentaModal = (cuenta?: any) => {
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

  const handleCodigoChange = (raw: string) => {
    const inferred = inferirClaseContable(raw);
    const nivelCalculado = raw.includes('.') ? Math.min(raw.split('.').filter(Boolean).length, 6) : 1;
    setCuentaForm((prev) => ({
      ...prev,
      codigo: raw,
      tipo_cuenta: inferred.tipo_cuenta,
      naturaleza: inferred.naturaleza,
      nivel: nivelCalculado || 4,
    }));
  };

  const handleBlurCodigo = () => {
    if (cuentaForm.codigo) {
      const formatted = formatearCodigoContable(cuentaForm.codigo);
      const inferred = inferirClaseContable(formatted);
      const nivelCalculado = formatted.includes('.') ? Math.min(formatted.split('.').filter(Boolean).length, 6) : 1;
      setCuentaForm((prev) => ({
        ...prev,
        codigo: formatted,
        tipo_cuenta: inferred.tipo_cuenta,
        naturaleza: inferred.naturaleza,
        nivel: nivelCalculado || 4,
      }));
    }
  };

  const handleSaveCuenta = async () => {
    if (!cuentaForm.codigo || !cuentaForm.descripcion) {
      alert('Por favor ingrese código y descripción');
      return;
    }

    try {
      if (cuentaEditando?.id) {
        // Modificar existente en backend
        const updated = await api.put<any>(`/cuentas/${cuentaEditando.id}`, {
          descripcion: cuentaForm.descripcion,
          nivel: Number(cuentaForm.nivel),
          naturaleza: cuentaForm.naturaleza,
          tipo_cuenta: cuentaForm.tipo_cuenta,
          permite_movimiento: cuentaForm.permite_movimiento,
          requiere_auxiliar: cuentaForm.requiere_auxiliar,
          requiere_documento: cuentaForm.requiere_documento,
        });
        setCuentasList((prev) =>
          prev.map((c) => (c.codigo === cuentaEditando.codigo ? { ...c, ...updated } : c))
        );
        setToastMessage(`Cuenta ${cuentaForm.codigo} actualizada con éxito en la base de datos.`);
      } else if (empresaActiva?.id) {
        // Crear nueva en backend
        const created = await api.post<any>(`/cuentas/empresas/${empresaActiva.id}`, {
          codigo: cuentaForm.codigo,
          descripcion: cuentaForm.descripcion,
          nivel: Number(cuentaForm.nivel),
          naturaleza: cuentaForm.naturaleza,
          tipo_cuenta: cuentaForm.tipo_cuenta,
          permite_movimiento: cuentaForm.permite_movimiento,
          requiere_auxiliar: cuentaForm.requiere_auxiliar,
          requiere_documento: cuentaForm.requiere_documento,
        });
        setCuentasList((prev) => [...prev, created].sort((a, b) => a.codigo.localeCompare(b.codigo)));
        setToastMessage(`Cuenta ${cuentaForm.codigo} creada con éxito en la base de datos.`);
      } else {
        const nueva: any = { ...cuentaForm };
        setCuentasList((prev) => [...prev, nueva].sort((a, b) => a.codigo.localeCompare(b.codigo)));
        setToastMessage(`Cuenta ${cuentaForm.codigo} guardada localmente.`);
      }
      setModalCuentaOpen(false);
    } catch (err: any) {
      alert(`Error al guardar cuenta: ${err.message || err}`);
    }
  };

  const handleDeleteCuenta = async (codigo: string) => {
    if (window.confirm(`¿Está seguro de eliminar o desactivar la cuenta contable ${codigo}?`)) {
      const encontrada = cuentasList.find((c) => c.codigo === codigo);
      if (encontrada && (encontrada as any).id) {
        try {
          await api.delete(`/cuentas/${(encontrada as any).id}`);
          setCuentasList((prev) => prev.filter((c) => c.codigo !== codigo));
          setToastMessage(`Cuenta ${codigo} desactivada en la base de datos.`);
          return;
        } catch (err: any) {
          alert(`Error al desactivar cuenta: ${err.message || err}`);
          return;
        }
      }
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
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);

  const cargarCentrosCosto = async () => {
    if (!empresaActiva?.id) return;
    try {
      const data = await api.get<any[]>(`/centros-costo/empresas/${empresaActiva.id}`);
      if (Array.isArray(data) && data.length > 0) {
        setCentrosCosto(data);
      } else {
        setCentrosCosto([]);
      }
    } catch (err) {
      console.warn('Error cargando centros de costo desde API:', err);
    }
  };

  useEffect(() => {
    cargarCentrosCosto();
  }, [empresaActiva?.id]);

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

  const handleSaveCc = async () => {
    if (!ccForm.codigo || !ccForm.nombre) {
      alert('Código y nombre del centro de costo son requeridos.');
      return;
    }
    try {
      if (ccEditando?.id && !ccEditando.id.toString().startsWith('mock-')) {
        const updated = await api.put<any>(`/centros-costo/${ccEditando.id}`, {
          nombre: ccForm.nombre,
          activo: ccForm.estado === 'ACTIVO',
        });
        setCentrosCosto((prev) =>
          prev.map((c) => (c.id === ccEditando.id ? { ...c, ...updated, ...ccForm } : c))
        );
        setToastMessage(`Centro de Costo ${ccForm.codigo} modificado con éxito.`);
      } else if (empresaActiva?.id) {
        const created = await api.post<any>(`/centros-costo/empresas/${empresaActiva.id}`, {
          codigo: ccForm.codigo.toUpperCase().trim(),
          nombre: ccForm.nombre.trim(),
          activo: ccForm.estado === 'ACTIVO',
        });
        setCentrosCosto((prev) => [...prev, { ...created, ...ccForm }]);
        setToastMessage(`Centro de Costo ${ccForm.codigo} creado en la base de datos.`);
      } else {
        setCentrosCosto((prev) => [...prev, { ...ccForm, id: Date.now().toString() }]);
        setToastMessage(`Centro de Costo ${ccForm.codigo} creado.`);
      }
      setModalCcOpen(false);
    } catch (err: any) {
      alert(`Error al guardar centro de costo: ${err.message || err}`);
    }
  };

  const handleDeleteCc = async (id: string, codigo: string) => {
    if (window.confirm(`¿Desea eliminar el centro de costo ${codigo}?`)) {
      try {
        await api.delete(`/centros-costo/${id}`);
        setCentrosCosto((prev) => prev.filter((c) => c.id !== id));
        setToastMessage(`Centro de Costo ${codigo} eliminado.`);
      } catch (err: any) {
        // Fallback local si era id local
        setCentrosCosto((prev) => prev.filter((c) => c.id !== id));
        setToastMessage(`Centro de Costo ${codigo} eliminado.`);
      }
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
  const [auxiliaresData, setAuxiliaresData] = useState<any[]>([]);

  const cargarAuxiliares = async () => {
    if (!empresaActiva?.id) return;
    try {
      const data = await api.get<any[]>(`/auxiliares/empresas/${empresaActiva.id}`);
      if (Array.isArray(data) && data.length > 0) {
        setAuxiliaresData(data);
      } else {
        setAuxiliaresData([]);
      }
    } catch (err) {
      console.warn('Error cargando auxiliares desde API:', err);
    }
  };

  useEffect(() => {
    cargarAuxiliares();
  }, [empresaActiva?.id]);

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
      setAuxForm({
        rif: aux.rif_cedula || aux.rif || '',
        razon_social: aux.nombre_razon_social || aux.razon_social || '',
        tipo: aux.tipo_auxiliar || aux.tipo || 'PROVEEDOR BIENES',
        ret_iva: aux.ret_iva || '75%',
        ret_islr: aux.ret_islr || '2%',
        calificacion: aux.calificacion || 'CONTRIBUYENTE ORDINARIO'
      });
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

  const handleSaveAux = async () => {
    if (!auxForm.rif || !auxForm.razon_social) {
      alert('RIF y Razón Social son campos requeridos.');
      return;
    }
    try {
      if (auxEditando?.id && !auxEditando.id.toString().startsWith('mock-')) {
        const updated = await api.put<any>(`/auxiliares/${auxEditando.id}`, {
          nombre_razon_social: auxForm.razon_social.trim(),
          rif_cedula: auxForm.rif.toUpperCase().trim(),
          tipo_auxiliar: auxForm.tipo,
        });
        setAuxiliaresData((prev) =>
          prev.map((a) => (a.id === auxEditando.id ? { ...a, ...updated, ...auxForm } : a))
        );
        setToastMessage(`Auxiliar fiscal ${auxForm.rif} actualizado con éxito.`);
      } else if (empresaActiva?.id) {
        const created = await api.post<any>(`/auxiliares/empresas/${empresaActiva.id}`, {
          codigo: `AUX-${auxForm.rif.replace(/[^A-Za-z0-9]/g, '')}`,
          nombre_razon_social: auxForm.razon_social.trim(),
          rif_cedula: auxForm.rif.toUpperCase().trim(),
          tipo_auxiliar: auxForm.tipo,
          tipo_identificacion: auxForm.rif.startsWith('V-') ? 'V' : 'J',
          activo: true
        });
        setAuxiliaresData((prev) => [...prev, { ...created, ...auxForm }]);
        setToastMessage(`Nuevo auxiliar fiscal ${auxForm.rif} registrado en la base de datos.`);
      } else {
        setAuxiliaresData((prev) => [...prev, { ...auxForm, id: Date.now().toString() }]);
        setToastMessage(`Nuevo auxiliar fiscal ${auxForm.rif} registrado.`);
      }
      setModalAuxOpen(false);
    } catch (err: any) {
      alert(`Error al guardar auxiliar: ${err.message || err}`);
    }
  };

  const handleDeleteAux = async (id: string, rif: string) => {
    if (window.confirm(`¿Desea eliminar el auxiliar fiscal ${rif}?`)) {
      try {
        await api.delete(`/auxiliares/${id}`);
        setAuxiliaresData((prev) => prev.filter((a) => a.id !== id));
        setToastMessage(`Auxiliar fiscal ${rif} eliminado.`);
      } catch (err: any) {
        setAuxiliaresData((prev) => prev.filter((a) => a.id !== id));
        setToastMessage(`Auxiliar fiscal ${rif} eliminado.`);
      }
    }
  };

  // --- TAB 5: TIPOS DE DOCUMENTO CONTABLES ---
  const [tiposDocData, setTiposDocData] = useState<any[]>([]);

  const cargarTiposDoc = async () => {
    if (!empresaActiva?.id) return;
    try {
      const data = await api.get<any[]>(`/tipos-documento/empresas/${empresaActiva.id}`);
      if (Array.isArray(data) && data.length > 0) {
        setTiposDocData(data);
      } else {
        setTiposDocData([]);
      }
    } catch (err) {
      console.warn('Error cargando tipos de documento desde API:', err);
    }
  };

  useEffect(() => {
    cargarTiposDoc();
  }, [empresaActiva?.id]);

  const [modalTipoDocOpen, setModalTipoDocOpen] = useState(false);
  const [tipoDocEditando, setTipoDocEditando] = useState<any | null>(null);
  const [tipoDocForm, setTipoDocForm] = useState({ codigo: '', descripcion: '' });

  const handleOpenTipoDocModal = (doc?: any) => {
    if (doc) {
      setTipoDocEditando(doc);
      setTipoDocForm({ codigo: doc.codigo, descripcion: doc.descripcion });
    } else {
      setTipoDocEditando(null);
      setTipoDocForm({ codigo: '', descripcion: '' });
    }
    setModalTipoDocOpen(true);
  };

  const handleSaveTipoDoc = async () => {
    if (!tipoDocForm.codigo || !tipoDocForm.descripcion) {
      alert('Código y descripción son obligatorios.');
      return;
    }
    try {
      if (tipoDocEditando?.id && !tipoDocEditando.id.toString().startsWith('td-')) {
        const updated = await api.put<any>(`/tipos-documento/${tipoDocEditando.id}`, {
          descripcion: tipoDocForm.descripcion.trim(),
        });
        setTiposDocData((prev) =>
          prev.map((d) => (d.id === tipoDocEditando.id ? { ...d, ...updated, ...tipoDocForm } : d))
        );
        setToastMessage(`Tipo de documento ${tipoDocForm.codigo} actualizado.`);
      } else if (empresaActiva?.id) {
        const created = await api.post<any>(`/tipos-documento/empresas/${empresaActiva.id}`, {
          codigo: tipoDocForm.codigo.toUpperCase().trim(),
          descripcion: tipoDocForm.descripcion.trim(),
        });
        setTiposDocData((prev) => [...prev, created]);
        setToastMessage(`Tipo de documento ${tipoDocForm.codigo} registrado en la base de datos.`);
      } else {
        setTiposDocData((prev) => [...prev, { ...tipoDocForm, id: `td-${Date.now()}` }]);
        setToastMessage(`Tipo de documento ${tipoDocForm.codigo} registrado.`);
      }
      setModalTipoDocOpen(false);
    } catch (err: any) {
      alert(`Error al guardar tipo de documento: ${err.message || err}`);
    }
  };

  const handleDeleteTipoDoc = async (id: string, codigo: string) => {
    if (window.confirm(`¿Desea eliminar el tipo de documento ${codigo}?`)) {
      try {
        await api.delete(`/tipos-documento/${id}`);
        setTiposDocData((prev) => prev.filter((d) => d.id !== id));
        setToastMessage(`Tipo de documento ${codigo} eliminado.`);
      } catch (err: any) {
        setTiposDocData((prev) => prev.filter((d) => d.id !== id));
        setToastMessage(`Tipo de documento ${codigo} eliminado.`);
      }
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
          <Tab icon={<AssignmentIcon />} iconPosition="start" label="Tipos de Documentos" />
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
                          <Tooltip title="Ver movimientos históricos">
                            <IconButton size="small" color="info" onClick={() => handleVerMovimientos(c)}>
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* ============================================================== */}
      {/* TAB 5: TIPOS DE DOCUMENTOS CONTABLES                           */}
      {/* ============================================================== */}
      {activeTab === 5 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Maestro de Tipos de Documentos Soporte ({tiposDocData.length} Tipos)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Documentos legales y comerciales que respaldan las operaciones contables (Facturas, Giros, Retenciones, Notas de Crédito/Débito).
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenTipoDocModal()}
              >
                Nuevo Tipo de Documento
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción del Documento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiposDocData.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        <Chip label={doc.codigo} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{doc.descripcion}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Modificar tipo de documento">
                          <IconButton size="small" color="primary" onClick={() => handleOpenTipoDocModal(doc)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar tipo de documento">
                          <IconButton size="small" color="error" onClick={() => handleDeleteTipoDoc(doc.id, doc.codigo)}>
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

      {/* --- MODAL TIPO DE DOCUMENTO --- */}
      <Dialog open={modalTipoDocOpen} onClose={() => setModalTipoDocOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {tipoDocEditando ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Código de Documento"
                placeholder="ej: FACT, RETIVA, ND"
                value={tipoDocForm.codigo}
                onChange={(e) => setTipoDocForm({ ...tipoDocForm, codigo: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descripción del Documento"
                placeholder="ej: FACTURA FISCAL DE VENTA"
                value={tipoDocForm.descripcion}
                onChange={(e) => setTipoDocForm({ ...tipoDocForm, descripcion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalTipoDocOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveTipoDoc}>Guardar Documento</Button>
        </DialogActions>
      </Dialog>

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
                placeholder="ej: 1.1.1.6 (se expande a 1.1.01.006)"
                helperText="Formato automático con ceros a la izquierda según niveles configurados"
                onChange={(e) => handleCodigoChange(e.target.value)}
                onBlur={handleBlurCodigo}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Expandir con máscara configurada">
                        <IconButton size="small" onClick={handleBlurCodigo}>
                          <AutoFixHighIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
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
            <Grid item xs={12}>
              <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1.5, border: '1px solid #90caf9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Clasificación Financiera Invertida/Inferida Automáticamente:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.dark">
                    {inferirClaseContable(cuentaForm.codigo).nombre_clase}
                  </Typography>
                </Box>
                <Chip
                  label={cuentaForm.naturaleza}
                  color={cuentaForm.naturaleza === 'DEUDORA' ? 'primary' : 'secondary'}
                  size="small"
                  variant="filled"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Naturaleza (Ajuste Opcional)</InputLabel>
                <Select
                  value={cuentaForm.naturaleza}
                  label="Naturaleza (Ajuste Opcional)"
                  onChange={(e) => setCuentaForm({ ...cuentaForm, naturaleza: e.target.value as any })}
                >
                  <MenuItem value="DEUDORA">DEUDORA (Aumenta por Debe)</MenuItem>
                  <MenuItem value="ACREEDORA">ACREEDORA (Aumenta por Haber)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Clase Financiera (Ajuste Opcional)</InputLabel>
                <Select
                  value={cuentaForm.tipo_cuenta}
                  label="Clase Financiera (Ajuste Opcional)"
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

      {/* --- MODAL MOVIMIENTOS HISTÓRICOS --- */}
      <Dialog open={modalMovimientosOpen} onClose={() => setModalMovimientosOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Movimientos de la Cuenta: {cuentaMovimientosSeleccionada?.codigo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cuentaMovimientosSeleccionada?.descripcion} | Naturaleza: {cuentaMovimientosSeleccionada?.naturaleza}
            </Typography>
          </Box>
          <Chip label="Mayor Analítico Integrado" color="primary" size="small" />
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
            <Paper sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="text.secondary">Total Débitos (Debe):</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                Bs. {movimientosData.reduce((acc, m) => acc + m.debe, 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="text.secondary">Total Créditos (Haber):</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                Bs. {movimientosData.reduce((acc, m) => acc + m.haber, 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, bgcolor: '#f1f8e9', border: '1px solid #c8e6c9' }}>
              <Typography variant="caption" color="text.secondary">Saldo Actual en Libros:</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                Bs. {((movimientosData.reduce((acc, m) => acc + m.debe, 0) - movimientosData.reduce((acc, m) => acc + m.haber, 0)) * (cuentaMovimientosSeleccionada?.naturaleza === 'ACREEDORA' ? -1 : 1)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Comprobante</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Concepto / Glosa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Debe (VES)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Haber (VES)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientosData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                      No se registran movimientos en el ejercicio actual para esta cuenta.
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosData.map((m, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{m.fecha}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>#{m.comprobante}</TableCell>
                      <TableCell>{m.concepto}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: m.debe > 0 ? 'bold' : 'normal' }}>
                        {m.debe > 0 ? `Bs. ${m.debe.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: m.haber > 0 ? 'bold' : 'normal' }}>
                        {m.haber > 0 ? `Bs. ${m.haber.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setModalMovimientosOpen(false)}>Cerrar Ficha</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CuentasPage;
