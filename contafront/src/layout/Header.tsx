import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, Empresa } from '../store/useAuthStore';
import { DRAWER_WIDTH_OPEN, DRAWER_WIDTH_COLLAPSED } from './Sidebar';
import { NotificationsPopover } from '../components/NotificationsPopover';
import { UserProfileModal } from '../components/UserProfileModal';
import { api } from '../services/api';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onOpenHelp,
}) => {
  const { user, empresaActiva, setEmpresaActiva, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [empresasDisponibles, setEmpresasDisponibles] = useState<Empresa[]>([]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const data = await api.get<Empresa[]>('/empresas/');
        if (Array.isArray(data) && data.length > 0) {
          setEmpresasDisponibles(data);
          if (!empresaActiva || !data.some((e) => e.id === empresaActiva.id)) {
            setEmpresaActiva(data[0]);
          }
        }
      } catch (err) {
        console.warn('No se pudieron obtener empresas desde el servidor en Header:', err);
      }
    };
    fetchEmpresas();
  }, []);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const getScreenHelpTitle = (pathname: string): string => {
    if (pathname === '/') return 'Dashboard Contable & KPIs';
    if (pathname.includes('/cuentas')) return 'Plan de Cuentas & Maestros';
    if (pathname.includes('/asientos')) return 'Comprobantes & Partida Doble';
    if (pathname.includes('/activos-fijos')) return 'Activos Fijos & Depreciación';
    if (pathname.includes('/fiscal') || pathname.includes('/libros-iva') || pathname.includes('/txt-seniat'))
      return 'Cumplimiento Fiscal & SENIAT';
    if (pathname.includes('/libros') || pathname.includes('/balance')) return 'Estados Financieros NIIF 18';
    if (pathname.includes('/empresas') || pathname.includes('/estudios')) return 'Gobernanza & Multi-tenant';
    if (pathname.includes('/guia')) return 'Guía de Procesos & FAQ';
    return 'Manual Operativo';
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleSelectEmpresa = (emp: Empresa) => {
    setEmpresaActiva(emp);
    setSelectorOpen(false);
  };

  const handleExecuteLogout = () => {
    setLogoutConfirmOpen(false);
    setUserMenuAnchor(null);
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_COLLAPSED}px)` },
          ml: { md: `${sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_COLLAPSED}px` },
          backgroundColor: '#ffffff',
          color: '#364152',
          borderBottom: '1px solid #e3e8ef',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2.5 } }}>
          {/* Lado Izquierdo: Botón Menú + Selector Rápido de Empresa */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Alternar menú lateral">
              <IconButton color="inherit" edge="start" onClick={onToggleSidebar} sx={{ mr: 0.5 }}>
                <MenuIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cambiar rápidamente entre las empresas autorizadas">
              <Button
                onClick={() => setSelectorOpen(true)}
                variant="outlined"
                size="small"
                sx={{
                  textAlign: 'left',
                  textTransform: 'none',
                  py: 0.5,
                  px: 1.2,
                  borderRadius: 2,
                  borderColor: '#e2e8f0',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#f8fafc',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
                }}
              >
                <CorporateFareIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                <Box sx={{ maxWidth: { xs: 140, sm: 260 }, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      noWrap
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                    >
                      {empresaActiva ? empresaActiva.razon_social : 'CORPORACION DEMO KANTIO C.A.'}
                    </Typography>
                    <SwapHorizIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {empresaActiva ? `RIF: ${empresaActiva.rif}` : 'RIF: J-50123456-7'}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
          </Box>

          {/* Lado Derecho: Ayuda (?) + Notificaciones + Menú de Perfil/Usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Botón de Ayuda Contextual (?) */}
            <Tooltip title={`Ayuda de Pantalla: ${getScreenHelpTitle(location.pathname)}`}>
              <IconButton
                onClick={onOpenHelp}
                sx={{
                  bgcolor: '#f5f3ff',
                  color: '#7c3aed',
                  '&:hover': { bgcolor: '#7c3aed', color: '#fff' }
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Popover de Notificaciones */}
            <NotificationsPopover />

            {/* Perfil de Usuario con Avatar y Menú Desplegable */}
            <Box
              onClick={handleOpenUserMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                px: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Avatar
                src={user?.avatar_url || undefined}
                sx={{
                  bgcolor: '#7c3aed',
                  width: 36,
                  height: 36,
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: 1
                }}
              >
                {(user?.nombre_completo || 'A')[0].toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>
                  {user?.nombre_completo || 'Administrador'}
                </Typography>
                <Chip
                  label={user?.rol || 'ADMIN_EMPRESA'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    mt: 0.3,
                    borderColor: '#ddd6fe',
                    color: '#6d28d9',
                    bgcolor: '#f5f3ff'
                  }}
                />
              </Box>
              <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, display: { xs: 'none', md: 'block' } }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú Desplegable de Usuario (Perfil, Ajustes, Seguridad, Cerrar Sesión) */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 250, mt: 1, borderRadius: 2, boxShadow: 4 }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.nombre_completo || 'Administrador'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {user?.email || 'admin@kantio.online'}
          </Typography>
          <Chip
            label={empresaActiva ? empresaActiva.codigo : 'DEMOC'}
            size="small"
            sx={{ mt: 0.5, fontSize: '0.7rem', bgcolor: '#f5f3ff', color: '#7c3aed', fontWeight: 'bold' }}
          />
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleCloseUserMenu();
            setProfileModalOpen(true);
          }}
        >
          <ListItemIcon><AccountCircleIcon fontSize="small" sx={{ color: '#7c3aed' }} /></ListItemIcon>
          <ListItemText primary="Mi Perfil & Foto" secondary="Ajustes de cuenta" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseUserMenu();
            navigate('/guia');
          }}
        >
          <ListItemIcon><SchoolIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Guía de Procesos & FAQ" secondary="Manual paso a paso" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseUserMenu();
            navigate('/usuarios');
          }}
        >
          <ListItemIcon><SecurityIcon fontSize="small" color="secondary" /></ListItemIcon>
          <ListItemText primary="Seguridad & Roles" secondary="Control de accesos" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleCloseUserMenu();
            setLogoutConfirmOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontWeight: 'bold' }} />
        </MenuItem>
      </Menu>

      {/* Diálogo de Confirmación de Cierre de Sesión (Limpio, no en la barra) */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogoutIcon /> ¿Cerrar Sesión en Kantio Contabilidad?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Está a punto de cerrar su sesión activa como <strong>{user?.nombre_completo || 'Usuario'}</strong> en <strong>{empresaActiva?.razon_social || 'la empresa actual'}</strong>.
            Cualquier cambio no guardado en comprobantes o formularios se descartará.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setLogoutConfirmOpen(false)} color="inherit">
            Permanecer
          </Button>
          <Button
            onClick={handleExecuteLogout}
            color="error"
            variant="contained"
            startIcon={<LogoutIcon />}
          >
            Sí, Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Cambiar Empresa Activa */}
      <Dialog open={selectorOpen} onClose={() => setSelectorOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CorporateFareIcon sx={{ color: '#7c3aed' }} /> Seleccionar Empresa Titular
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, mb: 1 }}>
            Empresas y clientes autorizados para su usuario:
          </Typography>
          <List>
            {empresasDisponibles.map((emp) => {
              const isSelected = empresaActiva?.id === emp.id;
              return (
                <ListItemButton
                  key={emp.id}
                  onClick={() => handleSelectEmpresa(emp)}
                  selected={isSelected}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: '#f5f3ff', color: '#6d28d9' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isSelected ? <CheckCircleIcon sx={{ color: '#7c3aed' }} /> : <CorporateFareIcon color="action" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={emp.razon_social}
                    primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.875rem' }}
                    secondary={`RIF: ${emp.rif} • Código: ${emp.codigo}`}
                    secondaryTypographyProps={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Perfil y Cambiar Foto de Usuario */}
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default Header;
