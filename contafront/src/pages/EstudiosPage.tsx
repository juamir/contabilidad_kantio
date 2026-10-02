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
  Stack
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import { useSearchParams } from 'react-router-dom';

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

  // --- TAB 0: DELEGACIONES ---
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([
    {
      id: 'del-1',
      estudioNombre: 'DESPACHO CONTABLE Y AUDITORES ALPHA & ASOCIADOS',
      rif: 'J-31456789-0',
      tipoDelegacion: 'OPERATIVO_COMPLETO',
      fechaInicio: '2026-01-15',
      estado: 'ACTIVA',
    },
    {
      id: 'del-2',
      estudioNombre: 'FIRMA DE AUDITORÍA FORENSE & COMPLIANCE KPMG-PARTNER',
      rif: 'J-29876543-1',
      tipoDelegacion: 'AUDITORIA_LECTURA',
      fechaInicio: '2026-03-01',
      estado: 'ACTIVA',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoRif, setNuevoRif] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('OPERATIVO_COMPLETO');

  const handleRevocar = (id: string) => {
    setDelegaciones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: 'REVOCADA' as const } : d))
    );
  };

  const handleAgregarDelegacion = () => {
    if (!nuevoRif) return;
    setDelegaciones((prev) => [
      ...prev,
      {
        id: `del-${Date.now()}`,
        estudioNombre: `Estudio Asesor RIF ${nuevoRif}`,
        rif: nuevoRif,
        tipoDelegacion: nuevoTipo as any,
        fechaInicio: new Date().toISOString().split('T')[0],
        estado: 'ACTIVA',
      },
    ]);
    setModalOpen(false);
    setNuevoRif('');
  };

  // --- TAB 1: CONSOLIDACIÓN DE HOLDING ---
  const empresasGrupo = [
    { codigo: 'EMP-01', razon_social: 'CORPORACION DEMO KANTIO C.A. (MATRIZ)', rif: 'J-50123456-7', participacion: '100%', ingresos_ves: 'Bs. 380.000,00', activos_ves: 'Bs. 1.219.400,00', estado: 'CONSOLIDADA' },
    { codigo: 'EMP-02', razon_social: 'DISTRIBUIDORA DE ALIMENTOS DEL CENTRO S.A.', rif: 'J-40998877-1', participacion: '85%', ingresos_ves: 'Bs. 210.000,00', activos_ves: 'Bs. 750.000,00', estado: 'CONSOLIDADA' },
    { codigo: 'EMP-03', razon_social: 'LOGISTICA & TRANSPORTE VALENCIA EXPRESS C.A.', rif: 'J-30111222-3', participacion: '70%', ingresos_ves: 'Bs. 145.000,00', activos_ves: 'Bs. 480.000,00', estado: 'CONSOLIDADA' },
  ];

  // --- TAB 2: USUARIOS Y PERMISOS RBAC ---
  const usuariosRbac = [
    { email: 'superadmin@kantio.online', nombre: 'Super Administrador Kantio', rol: 'SUPERADMIN PLATAFORMA', entidad: 'Kantio Core Global', permisos: 'Acceso Total Multi-inquilino', estado: 'ACTIVO' },
    { email: 'admin.demo@kantio.online', nombre: 'Gerente General Demo', rol: 'ADMIN EMPRESA', entidad: 'Corporación Demo Kantio C.A.', permisos: 'Gobierno, Cierres, Revocación en 1 Clic', estado: 'ACTIVO' },
    { email: 'contador.alpha@kantio.online', nombre: 'Lic. Carlos Méndez (Contador Senior)', rol: 'CONTADOR SENIOR', entidad: 'Despacho Alpha & Asoc.', permisos: 'Aprobación Asientos, Libros Fiscales SENIAT', estado: 'ACTIVO' },
    { email: 'asistente.alpha@kantio.online', nombre: 'T.S.U. María Pérez (Asistente Carga)', rol: 'ASISTENTE CONTABLE', entidad: 'Despacho Alpha & Asoc.', permisos: 'Carga Facturas OCR, Borradores de Asientos', estado: 'ACTIVO' },
    { email: 'auditor.externo@kantio.online', nombre: 'Dr. Fernando Ruiz (Auditor)', rol: 'AUDITOR FORENSE', entidad: 'Auditoría Externa', permisos: 'Solo Lectura, Trazabilidad, Pistas de Auditoría', estado: 'ACTIVO' },
  ];

  return (
    <Box>
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
                      <Alert severity="warning" sx={{ py: 0.5, px: 1.5, borderRadius: 1 }}>
                        Acceso revocado por el Gerente General. El estudio no puede ver ni modificar registros.
                      </Alert>
                    )}
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
                label="RIF del Despacho (ej: J-31456789-0)"
                value={nuevoRif}
                onChange={(e) => setNuevoRif(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                select
                label="Nivel de Permisos Autorizados"
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value)}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Consolidación de Estados Financieros (Grupo Holding)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Eliminación de saldos intercompañía y consolidación contable de empresas filiales bajo NIIF 10.
                </Typography>
              </Box>
              <Chip label="Holding Kantio Activo" color="primary" size="small" />
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresasGrupo.map((e) => (
                    <TableRow key={e.codigo} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{e.codigo}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="600">{e.razon_social}</Typography></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{e.rif}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={e.participacion} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>{e.ingresos_ves}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', color: 'primary.main', fontWeight: 'bold' }}>{e.activos_ves}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={e.estado} size="small" color="success" /></TableCell>
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
              <Button variant="contained" startIcon={<KeyIcon />} size="small">
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosRbac.map((u) => (
                    <TableRow key={u.email} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{u.email}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="500">{u.nombre}</Typography></TableCell>
                      <TableCell><Chip label={u.rol} size="small" color={u.rol.includes('ADMIN') ? 'primary' : u.rol.includes('CONTADOR') ? 'success' : 'default'} /></TableCell>
                      <TableCell>{u.entidad}</TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{u.permisos}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Chip label={u.estado} size="small" color="success" variant="outlined" /></TableCell>
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

export default EstudiosPage;
