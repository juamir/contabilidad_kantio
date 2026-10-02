import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import BusinessIcon from '@mui/icons-material/Business';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { useAuthStore } from '../store/useAuthStore';

interface EmpresaParametros {
  niveles: number;
  nivel_1: number;
  nivel_2: number;
  nivel_3: number;
  nivel_4: number;
  nivel_5: number;
  nivel_6: number;
  longitud_total: number;
  caracter_separacion: string;
  mascara_formato: string;
  consecutivo_contabilizacion: number;
  consecutivo_depreciacion: number;
  consecutivo_comprobante_cierre: number;
  inicio_ejercicio: string;
  fin_ejercicio: string;
  inicio_contabilidad: string;
}

export const EmpresasPage: React.FC = () => {
  const { empresaActiva, setEmpresaActiva } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- LISTA DE EMPRESAS PARA GESTIÓN GLOBAL / SAAS ---
  const [empresas, setEmpresas] = useState([
    {
      id: '1',
      codigo: 'DEMOC',
      razon_social: 'CORPORACION DEMO KANTIO C.A.',
      nombre_comercial: 'Kantio Cloud Services',
      rif: 'J-50123456-7',
      nit: '01020304',
      prioridad: 0,
      plan_suscripcion: 'ESTANDAR',
      activo: true,
    },
    {
      id: '2',
      codigo: 'ALIMC',
      razon_social: 'DISTRIBUIDORA DE ALIMENTOS DEL CENTRO S.A.',
      nombre_comercial: 'Alimentos Centro',
      rif: 'J-40998877-1',
      nit: '01020305',
      prioridad: 1,
      plan_suscripcion: 'CORPORATIVO',
      activo: true,
    },
    {
      id: '3',
      codigo: 'LOGIS',
      razon_social: 'LOGISTICA & TRANSPORTE VALENCIA EXPRESS C.A.',
      nombre_comercial: 'Valencia Express',
      rif: 'J-30111222-3',
      nit: '01020306',
      prioridad: 2,
      plan_suscripcion: 'ESTANDAR',
      activo: true,
    }
  ]);

  // Modal Empresa
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<any | null>(null);
  const [empresaForm, setEmpresaForm] = useState({
    codigo: '',
    razon_social: '',
    nombre_comercial: '',
    rif: '',
    nit: '',
    prioridad: 0,
    plan_suscripcion: 'ESTANDAR',
  });

  // --- PARAMETRIZACIÓN DE LA EMPRESA (NIVELES & MÁSCARA) ---
  const [parametros, setParametros] = useState<EmpresaParametros>({
    niveles: 4,
    nivel_1: 1,
    nivel_2: 1,
    nivel_3: 2,
    nivel_4: 3,
    nivel_5: 0,
    nivel_6: 0,
    longitud_total: 7,
    caracter_separacion: '.',
    mascara_formato: 'X.X.XX.XXX',
    consecutivo_contabilizacion: 224,
    consecutivo_depreciacion: 4,
    consecutivo_comprobante_cierre: 1,
    inicio_ejercicio: '2026-01-01',
    fin_ejercicio: '2026-12-31',
    inicio_contabilidad: '2025-12-31'
  });

  const recalcularMascara = (p: Partial<EmpresaParametros>) => {
    const updated = { ...parametros, ...p };
    const sep = updated.caracter_separacion || '.';
    const lens = [updated.nivel_1, updated.nivel_2, updated.nivel_3, updated.nivel_4, updated.nivel_5, updated.nivel_6];
    const parts = [];
    let tot = 0;
    for (let i = 0; i < updated.niveles; i++) {
      const l = lens[i] || 0;
      if (l > 0) {
        parts.push('X'.repeat(l));
        tot += l;
      }
    }
    updated.mascara_formato = parts.join(sep);
    updated.longitud_total = tot;
    setParametros(updated);
  };

  const handleOpenEmpresaModal = (emp?: any) => {
    if (emp) {
      setEmpresaEditando(emp);
      setEmpresaForm({ ...emp });
    } else {
      setEmpresaEditando(null);
      setEmpresaForm({
        codigo: '',
        razon_social: '',
        nombre_comercial: '',
        rif: 'J-',
        nit: '',
        prioridad: 0,
        plan_suscripcion: 'ESTANDAR',
      });
    }
    setModalEmpresaOpen(true);
  };

  const handleSaveEmpresa = () => {
    if (!empresaForm.codigo || !empresaForm.razon_social || !empresaForm.rif) {
      alert('Código, Razón Social y RIF son obligatorios.');
      return;
    }
    if (empresaEditando) {
      setEmpresas((prev) =>
        prev.map((e) => (e.id === empresaEditando.id ? { ...e, ...empresaForm } : e))
      );
      setToastMessage(`Empresa ${empresaForm.razon_social} actualizada.`);
    } else {
      const nueva = { ...empresaForm, id: Date.now().toString(), activo: true };
      setEmpresas((prev) => [...prev, nueva]);
      setToastMessage(`Empresa ${empresaForm.razon_social} creada con éxito.`);
    }
    setModalEmpresaOpen(false);
  };

  const handleDeleteEmpresa = (id: string, razon: string) => {
    if (window.confirm(`¿Desea desactivar la empresa ${razon}?`)) {
      setEmpresas((prev) => prev.filter((e) => e.id !== id));
      setToastMessage(`Empresa ${razon} desactivada.`);
    }
  };

  const handleGuardarParametros = () => {
    setToastMessage('Parámetros de empresa (niveles, consecutivos y máscaras) guardados con éxito.');
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
          Configuración & Empresas Titulares
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Catálogo maestro de empresas, parámetros de máscara de cuentas, consecutivos y ejercicios contables.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Empresas Titulares (SaaS Multi-tenant)" />
          <Tab icon={<TuneIcon />} iconPosition="start" label="Parámetros de Empresa (Máscara & Consecutivos)" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: CRUD DE EMPRESAS TITULARES                             */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Empresas Habilitadas en la Cuenta
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cada empresa opera con su propio Plan de Cuentas, libros de IVA y parametrización independiente.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => handleOpenEmpresaModal()}
              >
                Nueva Empresa
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Razón Social</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Comercial</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>R.I.F.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>N.I.T.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresas.map((emp) => {
                    const isActivaActualmente = empresaActiva?.id === emp.id;
                    return (
                      <TableRow key={emp.id} hover sx={{ bgcolor: isActivaActualmente ? '#f0f9ff' : 'inherit' }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{emp.codigo}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">{emp.razon_social}</Typography>
                        </TableCell>
                        <TableCell>{emp.nombre_comercial || '-'}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{emp.rif}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{emp.nit || '-'}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip label={emp.plan_suscripcion} size="small" color={emp.plan_suscripcion === 'CORPORATIVO' ? 'secondary' : 'default'} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isActivaActualmente ? (
                            <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label="En Uso" color="success" size="small" />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setEmpresaActiva(emp as any);
                                setToastMessage(`Empresa activa cambiada a: ${emp.razon_social}`);
                              }}
                            >
                              Seleccionar
                            </Button>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="Editar empresa">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEmpresaModal(emp)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Desactivar empresa">
                            <IconButton size="small" color="error" onClick={() => handleDeleteEmpresa(emp.id, emp.razon_social)}>
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
      {/* TAB 1: PARAMETRIZACIÓN DE LA EMPRESA (MÁSCARA & CONSECUTIVOS)  */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Parámetros de la Empresa: {empresaActiva?.razon_social || 'Empresa Activa'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Configure los niveles del catálogo de cuentas, longitud de máscara, caracteres de separación y correlativos automáticos.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                size="small"
                onClick={handleGuardarParametros}
              >
                Guardar Parámetros
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Sección Niveles y Máscara */}
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsSuggestIcon fontSize="small" /> Estructura de Niveles del Plan de Cuentas
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Niveles Totales"
                        value={parametros.niveles}
                        onChange={(e) => recalcularMascara({ niveles: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Longitud Total"
                        value={parametros.longitud_total}
                        disabled
                        helperText="Calculado por niveles"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Carácter de Separación"
                        value={parametros.caracter_separacion}
                        onChange={(e) => recalcularMascara({ caracter_separacion: e.target.value })}
                        helperText="Ej: . o -"
                      />
                    </Grid>

                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 1"
                        value={parametros.nivel_1}
                        onChange={(e) => recalcularMascara({ nivel_1: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 2"
                        value={parametros.nivel_2}
                        onChange={(e) => recalcularMascara({ nivel_2: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 3"
                        value={parametros.nivel_3}
                        onChange={(e) => recalcularMascara({ nivel_3: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 4"
                        value={parametros.nivel_4}
                        onChange={(e) => recalcularMascara({ nivel_4: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 5"
                        value={parametros.nivel_5}
                        onChange={(e) => recalcularMascara({ nivel_5: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Nivel 6"
                        value={parametros.nivel_6}
                        onChange={(e) => recalcularMascara({ nivel_6: Number(e.target.value) })}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Máscara Resultante del Plan de Cuentas:
                    </Typography>
                    <Typography variant="h5" fontFamily="monospace" fontWeight="bold" color="primary.main">
                      {parametros.mascara_formato}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Permite escribir abreviado: si el usuario escribe <code>1.1.1.6</code>, el sistema expande con ceros a <code>1.1.01.006</code>.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Sección Consecutivos y Ejercicio */}
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                    Números Consecutivos
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Contabilización / Comprobantes de Diario"
                        value={parametros.consecutivo_contabilizacion}
                        onChange={(e) => setParametros({ ...parametros, consecutivo_contabilizacion: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Depreciación de Activos Fijos"
                        value={parametros.consecutivo_depreciacion}
                        onChange={(e) => setParametros({ ...parametros, consecutivo_depreciacion: Number(e.target.value) })}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                    Ejercicio Económico (002 - Ejercicio)
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Inicio del Ejercicio"
                        value={parametros.inicio_ejercicio}
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setParametros({ ...parametros, inicio_ejercicio: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Fin del Ejercicio"
                        value={parametros.fin_ejercicio}
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setParametros({ ...parametros, fin_ejercicio: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL CREAR / EDITAR EMPRESA --- */}
      <Dialog open={modalEmpresaOpen} onClose={() => setModalEmpresaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {empresaEditando ? 'Modificar Empresa Titular' : 'Nueva Empresa Titular'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={empresaForm.codigo}
                disabled={!!empresaEditando}
                placeholder="ej: DEMOC"
                onChange={(e) => setEmpresaForm({ ...empresaForm, codigo: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="R.I.F. (Venezolano)"
                value={empresaForm.rif}
                placeholder="J-50123456-7"
                onChange={(e) => setEmpresaForm({ ...empresaForm, rif: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Razón Social"
                value={empresaForm.razon_social}
                placeholder="ej: CORPORACION COMERCIAL KANTIO C.A."
                onChange={(e) => setEmpresaForm({ ...empresaForm, razon_social: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Comercial"
                value={empresaForm.nombre_comercial}
                placeholder="ej: Tiendas Kantio"
                onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_comercial: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="N.I.T. / Número Fiscal"
                value={empresaForm.nit}
                onChange={(e) => setEmpresaForm({ ...empresaForm, nit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan de Suscripción</InputLabel>
                <Select
                  value={empresaForm.plan_suscripcion}
                  label="Plan de Suscripción"
                  onChange={(e) => setEmpresaForm({ ...empresaForm, plan_suscripcion: e.target.value })}
                >
                  <MenuItem value="ESTANDAR">ESTANDAR (1 Empresa)</MenuItem>
                  <MenuItem value="CORPORATIVO">CORPORATIVO (Multi-filial / Holding)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalEmpresaOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEmpresa}>Guardar Empresa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmpresasPage;
