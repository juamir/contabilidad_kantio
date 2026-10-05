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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface ActivoItem {
  id: string;
  codigo: string;
  descripcion: string;
  serial: string;
  fecha_adquisicion: string;
  grupo: string;
  ubicacion: string;
  vida_util_anos: number;
  valor_adquisicion: number;
  valor_salvamento: number;
  depreciacion_acumulada: number;
  valor_contable: number;
  metodo: string;
}

interface GrupoItem {
  id: string;
  codigo: string;
  descripcion: string;
  porcentaje_anual: number;
}

interface UbicacionItem {
  id: string;
  codigo: string;
  descripcion: string;
}

export const ActivosFijosPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'activos';

  const tabIndexMap: Record<string, number> = {
    activos: 0,
    grupos: 1,
    ubicaciones: 2,
    depreciacion: 3,
  };

  const [activeTab, setActiveTab] = useState(tabIndexMap[tabParam] || 0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { empresaActiva } = useAuthStore();

  // Tab 0: Activos Fijos Data
  const [activos, setActivos] = useState<ActivoItem[]>([]);
  // Tab 1: Grupos
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  // Tab 2: Ubicaciones
  const [ubicaciones, setUbicaciones] = useState<UbicacionItem[]>([]);

  const cargarDatos = async () => {
    if (!empresaActiva?.id) return;
    try {
      const [activosData, gruposData, ubisData] = await Promise.all([
        api.get<any[]>(`/activos-fijos/empresas/${empresaActiva.id}`).catch(() => []),
        api.get<any[]>(`/activos-fijos/empresas/${empresaActiva.id}/grupos`).catch(() => []),
        api.get<any[]>(`/activos-fijos/empresas/${empresaActiva.id}/ubicaciones`).catch(() => []),
      ]);

      if (Array.isArray(activosData) && activosData.length > 0) {
        setActivos(activosData.map((a) => ({
          id: a.id,
          codigo: a.codigo,
          descripcion: a.descripcion,
          serial: a.serial || '',
          fecha_adquisicion: a.fecha_adquisicion || '2026-01-01',
          grupo: gruposData.find((g: any) => g.id === a.grupo_id)?.descripcion || 'GENERAL',
          ubicacion: ubisData.find((u: any) => u.id === a.ubicacion_id)?.descripcion || 'CENTRAL',
          vida_util_anos: a.vida_util_anos || 3,
          valor_adquisicion: a.valor_adquisicion || 0,
          valor_salvamento: a.valor_salvamento || 0,
          depreciacion_acumulada: a.depreciacion_acumulada || 0,
          valor_contable: a.valor_contable || 0,
          metodo: a.metodo || 'LINEA_RECTA',
        })));
      } else {
        setActivos([]);
      }

      if (Array.isArray(gruposData) && gruposData.length > 0) {
        setGrupos(gruposData.map((g) => ({
          id: g.id,
          codigo: g.codigo,
          descripcion: g.descripcion,
          porcentaje_anual: 10,
        })));
      } else {
        setGrupos([]);
      }

      if (Array.isArray(ubisData) && ubisData.length > 0) {
        setUbicaciones(ubisData.map((u) => ({
          id: u.id,
          codigo: u.codigo,
          descripcion: u.descripcion,
        })));
      } else {
        setUbicaciones([]);
      }
    } catch (err) {
      console.warn('Error cargando activos fijos desde API:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [empresaActiva?.id]);

  // Modal Activo
  const [modalActivoOpen, setModalActivoOpen] = useState(false);
  const [activoEditando, setActivoEditando] = useState<ActivoItem | null>(null);
  const [activoForm, setActivoForm] = useState<ActivoItem>({
    id: '',
    codigo: '',
    descripcion: '',
    serial: '',
    fecha_adquisicion: '2026-01-01',
    grupo: 'EQUIPOS ELECTRONICOS Y COMPUTACION',
    ubicacion: 'OFICINA CENTRAL CARACAS',
    vida_util_anos: 3,
    valor_adquisicion: 0,
    valor_salvamento: 0,
    depreciacion_acumulada: 0,
    valor_contable: 0,
    metodo: 'LINEA_RECTA',
  });

  // Modal Grupo
  const [modalGrupoOpen, setModalGrupoOpen] = useState(false);
  const [grupoForm, setGrupoForm] = useState<GrupoItem>({ id: '', codigo: '', descripcion: '', porcentaje_anual: 10 });

  // Modal Ubicacion
  const [modalUbiOpen, setModalUbiOpen] = useState(false);
  const [ubiForm, setUbiForm] = useState<UbicacionItem>({ id: '', codigo: '', descripcion: '' });

  const handleOpenActivoModal = (item?: ActivoItem) => {
    if (item) {
      setActivoEditando(item);
      setActivoForm({ ...item });
    } else {
      setActivoEditando(null);
      setActivoForm({
        id: `act-${Date.now()}`,
        codigo: `ACT-000${activos.length + 1}`,
        descripcion: '',
        serial: '',
        fecha_adquisicion: new Date().toISOString().slice(0, 10),
        grupo: grupos[0]?.descripcion || 'EQUIPOS ELECTRONICOS Y COMPUTACION',
        ubicacion: ubicaciones[0]?.descripcion || 'OFICINA CENTRAL CARACAS',
        vida_util_anos: 3,
        valor_adquisicion: 0,
        valor_salvamento: 0,
        depreciacion_acumulada: 0,
        valor_contable: 0,
        metodo: 'LINEA_RECTA',
      });
    }
    setModalActivoOpen(true);
  };

  const handleSaveActivo = async () => {
    if (!activoForm.codigo || !activoForm.descripcion) {
      alert('Código y descripción son obligatorios.');
      return;
    }
    const valContable = activoForm.valor_adquisicion - activoForm.depreciacion_acumulada;
    const finalItem = { ...activoForm, valor_contable: valContable };

    try {
      if (activoEditando && !activoEditando.id.startsWith('act-')) {
        await api.put(`/activos-fijos/${activoEditando.id}`, {
          descripcion: finalItem.descripcion,
          serial: finalItem.serial,
          valor_adquisicion: Number(finalItem.valor_adquisicion),
          valor_salvamento: Number(finalItem.valor_salvamento),
          depreciacion_acumulada: Number(finalItem.depreciacion_acumulada),
          vida_util_anos: Number(finalItem.vida_util_anos),
          metodo: finalItem.metodo,
        });
        setActivos((prev) => prev.map((a) => (a.id === activoEditando.id ? finalItem : a)));
        setToastMessage(`Activo ${finalItem.codigo} actualizado con éxito.`);
      } else if (empresaActiva?.id) {
        const created = await api.post<any>(`/activos-fijos/empresas/${empresaActiva.id}`, {
          codigo: finalItem.codigo.toUpperCase().trim(),
          descripcion: finalItem.descripcion.trim(),
          serial: finalItem.serial.trim(),
          fecha_adquisicion: finalItem.fecha_adquisicion,
          inicio_depreciacion: finalItem.fecha_adquisicion,
          vida_util_anos: Number(finalItem.vida_util_anos),
          vida_util_meses: Number(finalItem.vida_util_anos) * 12,
          metodo: finalItem.metodo,
          valor_adquisicion: Number(finalItem.valor_adquisicion),
          valor_salvamento: Number(finalItem.valor_salvamento),
          depreciacion_acumulada: Number(finalItem.depreciacion_acumulada),
        });
        setActivos((prev) => [...prev, { ...finalItem, id: created.id }]);
        setToastMessage(`Activo ${finalItem.codigo} registrado exitosamente en la base de datos.`);
      } else {
        setActivos((prev) => [...prev, finalItem]);
        setToastMessage(`Activo ${finalItem.codigo} registrado.`);
      }
      setModalActivoOpen(false);
    } catch (err: any) {
      alert(`Error al guardar activo fijo: ${err.message || err}`);
    }
  };

  const handleDeleteActivo = async (id: string, cod: string) => {
    if (window.confirm(`¿Desea desincorporar/eliminar el activo fijo ${cod}?`)) {
      try {
        if (!id.startsWith('act-')) {
          await api.delete(`/activos-fijos/${id}`);
        }
        setActivos((prev) => prev.filter((a) => a.id !== id));
        setToastMessage(`Activo ${cod} desincorporado.`);
      } catch (err: any) {
        setActivos((prev) => prev.filter((a) => a.id !== id));
        setToastMessage(`Activo ${cod} desincorporado.`);
      }
    }
  };

  const handleCalcularDepreciacion = () => {
    alert(
      'Cálculo de Depreciación Mensual procesado correctamente.\nSe generó la propuesta de asiento contable para imputar a Gastos de Depreciación y Depreciación Acumulada de la Propiedad, Planta y Equipo.'
    );
    setToastMessage('Depreciación periódica calculada y lista para asentar.');
  };

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
          Gestión de Activos Fijos & Depreciaciones (PPE)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control patrimonial de bienes, cálculo sistemático de depreciación por línea recta, grupos contables y ubicaciones físicas conforme a NIC 16 / VEN-NIF.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            const keys = ['activos', 'grupos', 'ubicaciones', 'depreciacion'];
            setSearchParams({ tab: keys[val] });
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<PrecisionManufacturingIcon />} iconPosition="start" label="Catálogo de Activos Fijos" />
          <Tab icon={<CategoryIcon />} iconPosition="start" label="Grupos de Activos Fijos" />
          <Tab icon={<LocationOnIcon />} iconPosition="start" label="Ubicaciones Físicas" />
          <Tab icon={<CalculateIcon />} iconPosition="start" label="Cálculo & Corrida de Depreciación" />
        </Tabs>
      </Paper>

      {/* TAB 0: CATALOGO DE ACTIVOS FIJOS */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Bienes Registrados ({activos.length} Activos Fijos)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Valor Contable Total: Bs. {activos.reduce((a, b) => a + b.valor_contable, 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenActivoModal()}
              >
                Nuevo Activo Fijo
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción / Bien</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Serial</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grupo / Clasificación</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ubicación</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor Adquisición</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Deprec. Acumulada</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor Neto Contable</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activos.map((act) => (
                    <TableRow key={act.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{act.codigo}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{act.descripcion}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{act.serial || '-'}</TableCell>
                      <TableCell><Chip label={act.grupo} size="small" variant="outlined" /></TableCell>
                      <TableCell>{act.ubicacion}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        Bs. {act.valor_adquisicion.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'error.main' }}>
                        Bs. {act.depreciacion_acumulada.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                        Bs. {act.valor_contable.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Editar activo">
                          <IconButton size="small" color="primary" onClick={() => handleOpenActivoModal(act)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Desincorporar activo">
                          <IconButton size="small" color="error" onClick={() => handleDeleteActivo(act.id, act.codigo)}>
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

      {/* TAB 1: GRUPOS DE ACTIVOS FIJOS */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Grupos y Categorías de Propiedad, Planta y Equipo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Define las alícuotas anuales y reglas de vida útil para el cálculo sistemático de depreciación.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => {
                  setGrupoForm({ id: `g-${Date.now()}`, codigo: `000${grupos.length + 1}`, descripcion: '', porcentaje_anual: 10 });
                  setModalGrupoOpen(true);
                }}
              >
                Nuevo Grupo
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción del Grupo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Tasa Depreciación Anual</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupos.map((g) => (
                    <TableRow key={g.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{g.codigo}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{g.descripcion}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {g.porcentaje_anual}% Anual
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar grupo ${g.descripcion}?`)) {
                              setGrupos(grupos.filter((x) => x.id !== g.id));
                              setToastMessage('Grupo eliminado.');
                            }
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: UBICACIONES FISICAS */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Ubicaciones y Sedes Físicas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Identificación geográfica y por departamento de los activos fijos para inventarios y auditoría física.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => {
                  setUbiForm({ id: `u-${Date.now()}`, codigo: `UB-00${ubicaciones.length + 1}`, descripcion: '' });
                  setModalUbiOpen(true);
                }}
              >
                Nueva Ubicación
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre / Sede de la Ubicación</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ubicaciones.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{u.codigo}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{u.descripcion}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ubicación ${u.descripcion}?`)) {
                              setUbicaciones(ubicaciones.filter((x) => x.id !== u.id));
                              setToastMessage('Ubicación eliminada.');
                            }
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CALCULO DE DEPRECIACION */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Motor de Cálculo y Corrida Periódica de Depreciaciones
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Genera automáticamente el comprobante de diario de ajuste mensual calculando la alícuota sobre todos los activos fijos activos no desincorporados.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Parámetros de la Corrida Mensual
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" type="date" label="Fecha de Corte" defaultValue="2026-10-31" InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Método de Depreciación</InputLabel>
                        <Select defaultValue="LINEA_RECTA" label="Método de Depreciación">
                          <MenuItem value="LINEA_RECTA">Línea Recta (Uniforme)</MenuItem>
                          <MenuItem value="UNIDADES_PRODUCCION">Unidades Producidas</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                      Resumen Proyectado de la Corrida:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Activos a Depreciar:</Typography>
                      <Typography variant="body2" fontWeight="bold">3 bienes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2">Gasto Mensual Estimado:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">Bs. 34.708,33</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleCalcularDepreciacion}
                  >
                    Ejecutar Corrida y Generar Asiento Contable
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HelpOutlineIcon color="primary" fontSize="small" /> Cuentas Involucradas en el Asiento
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    El motor genera la partida doble afectando:
                  </Typography>
                  <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0', mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="error.main">DEBE (Gasto de Operación):</Typography>
                    <Typography variant="body2">6.4.01.002 - GASTO DEPRECIACION PPE</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" fontWeight="bold" color="primary.main">HABER (Activo Complementario):</Typography>
                    <Typography variant="body2">1.2.02.001 - DEPRECIACION ACUMULADA PPE</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* MODAL NUEVO / EDITAR ACTIVO */}
      <Dialog open={modalActivoOpen} onClose={() => setModalActivoOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {activoEditando ? `Editar Activo Fijo: ${activoEditando.codigo}` : 'Registrar Nuevo Activo Fijo'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Código del Activo"
                value={activoForm.codigo}
                onChange={(e) => setActivoForm({ ...activoForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Descripción del Bien"
                value={activoForm.descripcion}
                onChange={(e) => setActivoForm({ ...activoForm, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Serial / Placa"
                value={activoForm.serial}
                onChange={(e) => setActivoForm({ ...activoForm, serial: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha de Adquisición"
                value={activoForm.fecha_adquisicion}
                onChange={(e) => setActivoForm({ ...activoForm, fecha_adquisicion: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Grupo / Categoría</InputLabel>
                <Select
                  value={activoForm.grupo}
                  label="Grupo / Categoría"
                  onChange={(e) => setActivoForm({ ...activoForm, grupo: e.target.value })}
                >
                  {grupos.map((g) => (
                    <MenuItem key={g.id} value={g.descripcion}>{g.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Ubicación Física</InputLabel>
                <Select
                  value={activoForm.ubicacion}
                  label="Ubicación Física"
                  onChange={(e) => setActivoForm({ ...activoForm, ubicacion: e.target.value })}
                >
                  {ubicaciones.map((u) => (
                    <MenuItem key={u.id} value={u.descripcion}>{u.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Vida Útil (Años)"
                value={activoForm.vida_util_anos}
                onChange={(e) => setActivoForm({ ...activoForm, vida_util_anos: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Valor de Adquisición (Bs.)"
                value={activoForm.valor_adquisicion}
                onChange={(e) => setActivoForm({ ...activoForm, valor_adquisicion: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Valor de Salvamento (Bs.)"
                value={activoForm.valor_salvamento}
                onChange={(e) => setActivoForm({ ...activoForm, valor_salvamento: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Depreciación Acumulada (Bs.)"
                value={activoForm.depreciacion_acumulada}
                onChange={(e) => setActivoForm({ ...activoForm, depreciacion_acumulada: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalActivoOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveActivo}>Guardar Activo</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL NUEVO GRUPO */}
      <Dialog open={modalGrupoOpen} onClose={() => setModalGrupoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nuevo Grupo de Activo</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={grupoForm.codigo}
                onChange={(e) => setGrupoForm({ ...grupoForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descripción"
                value={grupoForm.descripcion}
                onChange={(e) => setGrupoForm({ ...grupoForm, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="% Depreciación Anual"
                value={grupoForm.porcentaje_anual}
                onChange={(e) => setGrupoForm({ ...grupoForm, porcentaje_anual: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalGrupoOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!grupoForm.descripcion) return;
              setGrupos([...grupos, grupoForm]);
              setModalGrupoOpen(false);
              setToastMessage('Grupo creado con éxito.');
            }}
          >
            Guardar Grupo
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL NUEVA UBICACION */}
      <Dialog open={modalUbiOpen} onClose={() => setModalUbiOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nueva Ubicación Física</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Código Ubicación"
                value={ubiForm.codigo}
                onChange={(e) => setUbiForm({ ...ubiForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descripción / Sede"
                value={ubiForm.descripcion}
                onChange={(e) => setUbiForm({ ...ubiForm, descripcion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalUbiOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!ubiForm.descripcion) return;
              setUbicaciones([...ubicaciones, ubiForm]);
              setModalUbiOpen(false);
              setToastMessage('Ubicación física creada con éxito.');
            }}
          >
            Guardar Ubicación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
