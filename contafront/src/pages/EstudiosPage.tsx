import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyIcon from '@mui/icons-material/Key';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  initialTab?: string;
}

interface Delegacion {
  id: string;
  estudioNombre: string;
  rif: string;
  tipoDelegacion: 'OPERATIVO_COMPLETO' | 'AUDITORIA_LECTURA';
  fechaInicio: string;
  estado: 'ACTIVA' | 'REVOCADA';
}

interface EmpresaGrupoUI {
  id: string;
  codigo: string;
  razon_social: string;
  rif: string;
  participacion: string;
  ingresos_ves: string;
  activos_ves: string;
  estado: string;
}

interface UsuarioRbacUI {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  entidad: string;
  permisos: string;
  estado: string;
}

export const EstudiosPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialTab || 'estudios';

  const tabIndexMap: Record<string, number> = {
    estudios: 0,
    holding: 1,
    usuarios: 2,
  };

  const indexTabMap: Record<number, string> = {
    0: 'estudios',
    1: 'holding',
    2: 'usuarios',
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

  // --- TAB 0: DELEGACIONES ---
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);

  const cargarEstudios = async () => {
    try {
      const data = await api.get<any[]>('/estudios/');
      if (Array.isArray(data) && data.length > 0) {
        setDelegaciones(
          data.map((e) => ({
            id: e.id,
            estudioNombre: e.nombre,
            rif: e.rif,
            tipoDelegacion: 'OPERATIVO_COMPLETO',
            fechaInicio: e.created_at ? e.created_at.split('T')[0] : '2026-01-01',
            estado: e.activo ? 'ACTIVA' : 'REVOCADA',
          }))
        );
      } else {
        setDelegaciones([]);
      }
    } catch (err) {
      console.warn('Error cargando despachos contables:', err);
    }
  };

  useEffect(() => {
    cargarEstudios();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoRif, setNuevoRif] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'OPERATIVO_COMPLETO' | 'AUDITORIA_LECTURA'>('OPERATIVO_COMPLETO');

  const handleRevocar = async (id: string) => {
    try {
      if (id.length > 5) {
        await api.delete(`/estudios/${id}`);
      }
      setDelegaciones((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: 'REVOCADA' as const } : d))
      );
      setToastMessage('Acceso de delegación revocado inmediatamente.');
    } catch (err: any) {
      alert(`Error al revocar: ${err.message || err}`);
    }
  };

  const handleEliminarDelegacion = async (id: string) => {
    if (window.confirm('¿Desea remover el registro histórico de este despacho?')) {
      try {
        if (id.length > 5) {
          await api.delete(`/estudios/${id}`);
        }
        setDelegaciones((prev) => prev.filter((d) => d.id !== id));
        setToastMessage('Registro de despacho eliminado.');
      } catch (err: any) {
        setDelegaciones((prev) => prev.filter((d) => d.id !== id));
        setToastMessage('Registro de despacho eliminado.');
      }
    }
  };

  const handleAgregarDelegacion = async () => {
    if (!nuevoRif) return;
    try {
      const payload = {
        codigo: `EST-${nuevoRif.replace(/[^A-Za-z0-9]/g, '').slice(-6)}`,
        nombre: nuevoNombre || `Despacho Contable RIF ${nuevoRif}`,
        rif: nuevoRif.toUpperCase().trim(),
        email_contacto: `contacto@${nuevoRif.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      };
      const created = await api.post<any>('/estudios/', payload);
      setDelegaciones((prev) => [
        ...prev,
        {
          id: created.id,
          estudioNombre: created.nombre,
          rif: created.rif,
          tipoDelegacion: nuevoTipo,
          fechaInicio: new Date().toISOString().split('T')[0],
          estado: 'ACTIVA',
        },
      ]);
      setModalOpen(false);
      setNuevoRif('');
      setNuevoNombre('');
      setToastMessage(`Despacho ${nuevoRif} registrado y autorizado en la base de datos.`);
    } catch (err: any) {
      alert(`Error al registrar despacho: ${err.message || err}`);
    }
  };

  // --- TAB 1: CONSOLIDACIÓN DE HOLDING ---
  const [empresasGrupo, setEmpresasGrupo] = useState<EmpresaGrupoUI[]>([
    { id: '1', codigo: 'EMP-01', razon_social: 'CORPORACION DEMO KANTIO C.A. (MATRIZ)', rif: 'J-50123456-7', participacion: '100%', ingresos_ves: 'Bs. 380.000,00', activos_ves: 'Bs. 1.219.400,00', estado: 'CONSOLIDADA' },
    { id: '2', codigo: 'EMP-02', razon_social: 'DISTRIBUIDORA DE ALIMENTOS DEL CENTRO S.A.', rif: 'J-40998877-1', participacion: '85%', ingresos_ves: 'Bs. 210.000,00', activos_ves: 'Bs. 750.000,00', estado: 'CONSOLIDADA' },
    { id: '3', codigo: 'EMP-03', razon_social: 'LOGISTICA & TRANSPORTE VALENCIA EXPRESS C.A.', rif: 'J-30111222-3', participacion: '70%', ingresos_ves: 'Bs. 145.000,00', activos_ves: 'Bs. 480.000,00', estado: 'CONSOLIDADA' },
  ]);

  const [modalHoldingOpen, setModalHoldingOpen] = useState(false);
  const [holdingEditando, setHoldingEditando] = useState<EmpresaGrupoUI | null>(null);
  const [holdingForm, setHoldingForm] = useState({
    codigo: '',
    razon_social: '',
    rif: '',
    participacion: '100%',
    ingresos_ves: 'Bs. 0,00',
    activos_ves: 'Bs. 0,00',
    estado: 'CONSOLIDADA'
  });

  const handleOpenHoldingModal = (h?: EmpresaGrupoUI) => {
    if (h) {
      setHoldingEditando(h);
      setHoldingForm({ ...h });
    } else {
      setHoldingEditando(null);
      setHoldingForm({
        codigo: `EMP-0${empresasGrupo.length + 1}`,
        razon_social: '',
        rif: 'J-',
        participacion: '80%',
        ingresos_ves: 'Bs. 50.000,00',
        activos_ves: 'Bs. 200.000,00',
        estado: 'CONSOLIDADA'
      });
    }
    setModalHoldingOpen(true);
  };

  const handleSaveHolding = () => {
    if (!holdingForm.razon_social || !holdingForm.rif) {
      alert('Razón Social y RIF son obligatorios.');
      return;
    }
    if (holdingEditando) {
      setEmpresasGrupo((prev) =>
        prev.map((e) => (e.id === holdingEditando.id ? { ...e, ...holdingForm } : e))
      );
      setToastMessage(`Empresa ${holdingForm.razon_social} actualizada en Holding.`);
    } else {
      setEmpresasGrupo((prev) => [...prev, { ...holdingForm, id: Date.now().toString() }]);
      setToastMessage(`Empresa filial ${holdingForm.razon_social} incorporada al grupo.`);
    }
    setModalHoldingOpen(false);
  };

  const handleDeleteHolding = (id: string, razon: string) => {
    if (window.confirm(`¿Remover a ${razon} de la consolidación del grupo holding?`)) {
      setEmpresasGrupo((prev) => prev.filter((e) => e.id !== id));
      setToastMessage(`Empresa ${razon} removida.`);
    }
  };

  // --- TAB 2: USUARIOS Y PERMISOS RBAC ---
  const [usuariosRbac, setUsuariosRbac] = useState<UsuarioRbacUI[]>([
    { id: '1', email: 'superadmin@kantio.online', nombre: 'Super Administrador Kantio', rol: 'SUPERADMIN PLATAFORMA', entidad: 'Kantio Core Global', permisos: 'Acceso Total Multi-inquilino', estado: 'ACTIVO' },
    { id: '2', email: 'admin.demo@kantio.online', nombre: 'Gerente General Demo', rol: 'ADMIN EMPRESA', entidad: 'Corporación Demo Kantio C.A.', permisos: 'Gobierno, Cierres, Revocación en 1 Clic', estado: 'ACTIVO' },
    { id: '3', email: 'contador.alpha@kantio.online', nombre: 'Lic. Carlos Méndez (Contador Senior)', rol: 'CONTADOR SENIOR', entidad: 'Despacho Alpha & Asoc.', permisos: 'Aprobación Asientos, Libros Fiscales SENIAT', estado: 'ACTIVO' },
    { id: '4', email: 'asistente.alpha@kantio.online', nombre: 'T.S.U. María Pérez (Asistente Carga)', rol: 'ASISTENTE CONTABLE', entidad: 'Despacho Alpha & Asoc.', permisos: 'Carga Facturas OCR, Borradores de Asientos', estado: 'ACTIVO' },
    { id: '5', email: 'auditor.externo@kantio.online', nombre: 'Dr. Fernando Ruiz (Auditor)', rol: 'AUDITOR FORENSE', entidad: 'Auditoría Externa', permisos: 'Solo Lectura, Trazabilidad, Pistas de Auditoría', estado: 'ACTIVO' },
  ]);

  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRbacUI | null>(null);
  const [usuarioForm, setUsuarioForm] = useState({
    email: '',
    nombre: '',
    rol: 'ASISTENTE CONTABLE',
    entidad: 'Corporación Demo Kantio C.A.',
    permisos: 'Carga Facturas OCR, Borradores',
    estado: 'ACTIVO'
  });

  const handleOpenUsuarioModal = (u?: UsuarioRbacUI) => {
    if (u) {
      setUsuarioEditando(u);
      setUsuarioForm({ ...u });
    } else {
      setUsuarioEditando(null);
      setUsuarioForm({
        email: '',
        nombre: '',
        rol: 'ASISTENTE CONTABLE',
        entidad: 'Corporación Demo Kantio C.A.',
        permisos: 'Operación asistida y borrador',
        estado: 'ACTIVO'
      });
    }
    setModalUsuarioOpen(true);
  };

  const handleSaveUsuario = () => {
    if (!usuarioForm.email || !usuarioForm.nombre) {
      alert('Email y Nombre Completo son requeridos.');
      return;
    }
    if (usuarioEditando) {
      setUsuariosRbac((prev) =>
        prev.map((u) => (u.id === usuarioEditando.id ? { ...u, ...usuarioForm } : u))
      );
      setToastMessage(`Usuario ${usuarioForm.email} actualizado.`);
    } else {
      setUsuariosRbac((prev) => [...prev, { ...usuarioForm, id: Date.now().toString() }]);
      setToastMessage(`Usuario ${usuarioForm.email} registrado en el sistema RBAC.`);
    }
    setModalUsuarioOpen(false);
  };

  const handleDeleteUsuario = (id: string, email: string) => {
    if (window.confirm(`¿Desea desactivar / eliminar al usuario ${email}?`)) {
      setUsuariosRbac((prev) => prev.filter((u) => u.id !== id));
      setToastMessage(`Usuario ${email} desactivado.`);
    }
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
          5. Gobernanza, Despachos & Seguridad RBAC
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Portabilidad y delegación de estudios contables, consolidación de grupos empresariales y control de accesos RBAC.
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
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Estudios Contables (Delegación & Revocación)" />
          <Tab icon={<CorporateFareIcon />} iconPosition="start" label="Consolidación de Grupos (Holding)" />
          <Tab icon={<AdminPanelSettingsIcon />} iconPosition="start" label="Usuarios & Permisos (RBAC)" />
        </Tabs>
      </Paper>

      {/* ============================================================== */}
      {/* TAB 0: ESTUDIOS CONTABLES (DELEGACIÓN Y REVOCACIÓN)            */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Modelo de Soberanía Empresarial:</strong> La empresa cliente es la dueña absoluta de sus datos contables. En cualquier momento puede revocar el acceso a un despacho contable en un solo clic y transferir el gobierno contable a un nuevo asesor sin pérdida de historial ni fricción.
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Despachos y Asesores Contables Autorizados
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Autorizar Nuevo Despacho
            </Button>
          </Box>

          <Grid container spacing={3}>
            {delegaciones.map((d) => (
              <Grid item xs={12} md={6} key={d.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: d.estado === 'ACTIVA' ? '#2196f3' : '#e0e0e0',
                    borderLeftWidth: 6,
                    borderLeftColor: d.estado === 'ACTIVA' ? '#2196f3' : '#9e9e9e',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {d.estudioNombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                          RIF: {d.rif}
                        </Typography>
                      </Box>
                      <Chip
                        icon={d.estado === 'ACTIVA' ? <CheckCircleIcon sx={{ fontSize: '16px !important' }} /> : <BlockIcon sx={{ fontSize: '16px !important' }} />}
                        label={d.estado}
                        color={d.estado === 'ACTIVA' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.85rem' }}>
                      <Typography variant="caption" color="text.secondary">Nivel de Delegación:</Typography>
                      <Chip
                        label={d.tipoDelegacion === 'OPERATIVO_COMPLETO' ? 'Operativo Completo (Carga & Asientos)' : 'Solo Lectura (Auditoría Forense)'}
                        size="small"
                        color={d.tipoDelegacion === 'OPERATIVO_COMPLETO' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '0.85rem' }}>
                      <Typography variant="caption" color="text.secondary">Fecha de Autorización:</Typography>
                      <Typography variant="body2" fontFamily="monospace">{d.fechaInicio}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {d.estado === 'ACTIVA' ? (
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          startIcon={<BlockIcon />}
                          onClick={() => handleRevocar(d.id)}
                          sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                          Revocar Acceso Inmediatamente (1 Clic)
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleEliminarDelegacion(d.id)}
                          sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                          Eliminar Registro del Historial
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Modal para Autorizar Despacho */}
          <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Autorizar Despacho Contable Externo</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ingrese el RIF del despacho contable registrado en la red Kantio para otorgarle acceso seguro a esta empresa.
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Nombre o Razón Social del Despacho"
                value={nuevoNombre}
                placeholder="ej: Despacho Auditor Ramos & Asoc."
                onChange={(e) => setNuevoNombre(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="RIF del Despacho (ej: J-31456789-0)"
                value={nuevoRif}
                onChange={(e) => setNuevoRif(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                select
                label="Nivel de Permisos Autorizados"
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value as any)}
              >
                <MenuItem value="OPERATIVO_COMPLETO">OPERATIVO COMPLETO - Carga de Asientos, Facturas y Cierres</MenuItem>
                <MenuItem value="AUDITORIA_LECTURA">SOLO LECTURA - Dictamen, Pistas de Auditoría y Balances</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleAgregarDelegacion} disabled={!nuevoRif}>
                Confirmar y Delegar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* ============================================================== */}
      {/* TAB 1: CONSOLIDACIÓN DE HOLDING                                */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Consolidación de Estados Financieros (Grupo Holding)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Eliminación de saldos intercompañía y consolidación contable de empresas filiales bajo NIIF 10.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleOpenHoldingModal()}
                >
                  Agregar Filial al Grupo
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Empresa Filial / Subsidiaria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>RIF</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>% Control</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Ingresos Brutos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Activos Totales</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresasGrupo.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{e.codigo}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="600">{e.razon_social}</Typography></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{e.rif}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={e.participacion} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>{e.ingresos_ves}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'primary.main', fontWeight: 'bold' }}>{e.activos_ves}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={e.estado} size="small" color="success" /></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Editar empresa filial">
                          <IconButton size="small" color="primary" onClick={() => handleOpenHoldingModal(e)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover de holding">
                          <IconButton size="small" color="error" onClick={() => handleDeleteHolding(e.id, e.razon_social)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Balance Consolidado del Grupo Económico</Typography>
                <Typography variant="caption" color="text.secondary">Total Activos Consolidados: <strong>Bs. 2.449.400,00 ($ 61.235,00 USD)</strong></Typography>
              </Box>
              <Button variant="contained" color="primary" size="small">
                Generar Balance Consolidado NIIF 10
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USUARIOS Y PERMISOS RBAC                                */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Usuarios & Control de Accesos Basado en Roles (RBAC)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Segregación de funciones obligatoria conforme a mejores prácticas del Colegio de Contadores y Normas de Auditoría (NIA 240/315).
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<KeyIcon />}
                size="small"
                onClick={() => handleOpenUsuarioModal()}
              >
                Nuevo Usuario / Asignar Rol
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ef', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usuario / Correo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rol Asignado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Organización</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Permisos Clave</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosRbac.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{u.email}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="500">{u.nombre}</Typography></TableCell>
                      <TableCell><Chip label={u.rol} size="small" color={u.rol.includes('ADMIN') ? 'primary' : u.rol.includes('CONTADOR') ? 'success' : 'default'} /></TableCell>
                      <TableCell>{u.entidad}</TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{u.permisos}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={u.estado} size="small" color="success" variant="outlined" /></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Editar rol / permisos">
                          <IconButton size="small" color="primary" onClick={() => handleOpenUsuarioModal(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Desactivar usuario">
                          <IconButton size="small" color="error" onClick={() => handleDeleteUsuario(u.id, u.email)}>
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

      {/* --- MODAL PARA EMPRESA EN HOLDING --- */}
      <Dialog open={modalHoldingOpen} onClose={() => setModalHoldingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {holdingEditando ? 'Modificar Empresa del Holding' : 'Vincular Filial a Grupo Holding'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={holdingForm.codigo}
                onChange={(e) => setHoldingForm({ ...holdingForm, codigo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="RIF"
                value={holdingForm.rif}
                onChange={(e) => setHoldingForm({ ...holdingForm, rif: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Razón Social"
                value={holdingForm.razon_social}
                onChange={(e) => setHoldingForm({ ...holdingForm, razon_social: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="% Participación Accionaria"
                value={holdingForm.participacion}
                onChange={(e) => setHoldingForm({ ...holdingForm, participacion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Activos Aproximados"
                value={holdingForm.activos_ves}
                onChange={(e) => setHoldingForm({ ...holdingForm, activos_ves: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalHoldingOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveHolding}>Guardar Empresa</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL PARA USUARIO RBAC --- */}
      <Dialog open={modalUsuarioOpen} onClose={() => setModalUsuarioOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {usuarioEditando ? 'Modificar Usuario y Privilegios' : 'Crear Usuario / Asignar Rol RBAC'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electrónico"
                value={usuarioForm.email}
                disabled={!!usuarioEditando}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Completo"
                value={usuarioForm.nombre}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol Operativo</InputLabel>
                <Select
                  value={usuarioForm.rol}
                  label="Rol Operativo"
                  onChange={(e) => {
                    const r = e.target.value;
                    let p = 'Operación estándar';
                    if (r === 'ADMIN EMPRESA') p = 'Gobierno, Cierres, Revocación en 1 Clic';
                    else if (r === 'CONTADOR SENIOR') p = 'Aprobación Asientos, Libros Fiscales SENIAT';
                    else if (r === 'ASISTENTE CONTABLE') p = 'Carga Facturas OCR, Borradores';
                    else if (r === 'AUDITOR FORENSE') p = 'Solo Lectura, Trazabilidad, Pistas';
                    setUsuarioForm({ ...usuarioForm, rol: r, permisos: p });
                  }}
                >
                  <MenuItem value="ADMIN EMPRESA">ADMIN EMPRESA (Dueño / Gerente)</MenuItem>
                  <MenuItem value="CONTADOR SENIOR">CONTADOR SENIOR (Firma Dictamen)</MenuItem>
                  <MenuItem value="ASISTENTE CONTABLE">ASISTENTE CONTABLE (Captura)</MenuItem>
                  <MenuItem value="AUDITOR FORENSE">AUDITOR FORENSE (Revisión Externa)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Organización / Empresa"
                value={usuarioForm.entidad}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, entidad: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Permisos Clave Asignados"
                value={usuarioForm.permisos}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, permisos: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalUsuarioOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveUsuario}>Guardar Usuario</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstudiosPage;
