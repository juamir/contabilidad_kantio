import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  Grid,
  Stack,
  CircularProgress
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import CalculateIcon from '@mui/icons-material/Calculate';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface DemoUser {
  label: string;
  email: string;
  rol: string;
  tipo_usuario: 'KANTIO_ADMIN' | 'EMPRESA_INTERNO' | 'ESTUDIO_MIEMBRO';
  nombre_completo: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  description: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    label: 'SuperAdmin Kantio',
    email: 'superadmin@kantio.online',
    rol: 'ADMIN_EMPRESA',
    tipo_usuario: 'KANTIO_ADMIN',
    nombre_completo: 'Super Administrador Kantio',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    color: 'primary',
    description: 'Control de plataforma SaaS, grupos y hosting'
  },
  {
    label: 'Admin Empresa Demo',
    email: 'admin.demo@kantio.online',
    rol: 'ADMIN_EMPRESA',
    tipo_usuario: 'EMPRESA_INTERNO',
    nombre_completo: 'Gerente General Demo',
    icon: <CorporateFareIcon fontSize="small" />,
    color: 'info',
    description: 'Gobierno de la empresa, delegaciones y revocaciones'
  },
  {
    label: 'Contador Senior',
    email: 'contador.alpha@kantio.online',
    rol: 'CONTADOR_SENIOR',
    tipo_usuario: 'ESTUDIO_MIEMBRO',
    nombre_completo: 'Lic. Carlos Méndez (Contador Senior)',
    icon: <CalculateIcon fontSize="small" />,
    color: 'success',
    description: 'Aprobación de asientos, libros SENIAT y balances NIIF'
  },
  {
    label: 'Asistente Contable',
    email: 'asistente.alpha@kantio.online',
    rol: 'ASISTENTE_CONTABLE',
    tipo_usuario: 'ESTUDIO_MIEMBRO',
    nombre_completo: 'T.S.U. María Pérez (Asistente de Carga)',
    icon: <EditNoteIcon fontSize="small" />,
    color: 'warning',
    description: 'Carga de facturas OCR, borradores y retenciones'
  },
  {
    label: 'Auditor Externo',
    email: 'auditor.externo@kantio.online',
    rol: 'AUDITOR_EXTERNO',
    tipo_usuario: 'ESTUDIO_MIEMBRO',
    nombre_completo: 'Dr. Fernando Ruiz (Auditor Forense)',
    icon: <VisibilityIcon fontSize="small" />,
    color: 'secondary',
    description: 'Auditoría de solo lectura, dictámenes y papeles de trabajo'
  }
];

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin.demo@kantio.online');
  const [password, setPassword] = useState('Kantio2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string, demoUser?: DemoUser) => {
    setError(null);
    setLoading(true);

    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAuth(
          data.access_token,
          {
            id: data.usuario_id,
            email: data.email,
            nombre_completo: data.nombre_completo,
            tipo_usuario: data.tipo_usuario,
            rol: data.rol
          },
          {
            id: data.empresa_activa_id || 'demo-empresa-id',
            codigo: 'EMP-DEMO',
            razon_social: 'CORPORACION DEMO KANTIO C.A.',
            rif: 'J-50123456-7'
          }
        );
        navigate('/');
        return;
      }
    } catch {
      // Si la API remota o local no responde durante desarrollo o modo offline, usar credenciales precargadas
    }

    // Modo de contingencia / offline / demo directo si coincide con los usuarios precargados
    const foundDemo = demoUser || DEMO_USERS.find((u) => u.email === loginEmail);
    if (foundDemo && (loginPass === 'Kantio2026!' || loginPass === 'demo')) {
      setAuth(
        'mock-jwt-token-demo-kantio-2026',
        {
          id: 'demo-user-' + foundDemo.rol.toLowerCase(),
          email: foundDemo.email,
          nombre_completo: foundDemo.nombre_completo,
          tipo_usuario: foundDemo.tipo_usuario,
          rol: foundDemo.rol
        },
        {
          id: 'emp-demo-id',
          codigo: 'EMP-DEMO',
          razon_social: 'CORPORACION DEMO KANTIO C.A.',
          rif: 'J-50123456-7'
        }
      );
      navigate('/');
    } else {
      setError('Credenciales inválidas. Compruebe su correo y contraseña (Predefinida: Kantio2026!).');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleSelectDemo = (u: DemoUser) => {
    setEmail(u.email);
    setPassword('Kantio2026!');
    performLogin(u.email, 'Kantio2026!', u);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f4f6fb',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 580,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.08)',
          border: '1px solid #e3e8ef'
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo y Encabezado */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.5,
                bgcolor: '#e3f2fd',
                borderRadius: '50%',
                mb: 1.5,
                color: '#2196f3'
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Kantio Contabilidad
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sistema Bimonetario VEN-NIF & Cumplimiento SENIAT (Multi-tenant)
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario Principal */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Correo Electrónico"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="ACCESO RÁPIDO PARA PRUEBAS (DEMO SEEDS)" size="small" sx={{ fontWeight: 'bold' }} />
          </Divider>

          {/* Accesos rápidos de prueba por rol */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'center' }}>
            Haga clic en cualquiera de los roles precargados para iniciar sesión instantáneamente:
          </Typography>

          <Stack spacing={1.5}>
            {DEMO_USERS.map((u) => (
              <Box
                key={u.email}
                onClick={() => handleSelectDemo(u)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid #e3e8ef',
                  bgcolor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#2196f3',
                    bgcolor: '#f8fbff',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={u.label}
                    size="small"
                    color={u.color}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="#364152">
                      {u.nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.description}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {u.email}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f2f5', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Contraseña maestra precargada para todos los usuarios: <code>Kantio2026!</code>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
