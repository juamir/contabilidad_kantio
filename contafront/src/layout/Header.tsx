import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useAuthStore } from '../store/useAuthStore';
import { DRAWER_WIDTH_OPEN, DRAWER_WIDTH_COLLAPSED } from './Sidebar';

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
  const { user, empresaActiva, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
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
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton color="inherit" edge="start" onClick={onToggleSidebar}>
            <MenuIcon />
          </IconButton>

          <CorporateFareIcon color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
              {empresaActiva ? empresaActiva.razon_social : 'Kantio Contabilidad Bimonetaria'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {empresaActiva ? `RIF: ${empresaActiva.rif} | Plan Activo` : 'Plataforma SaaS Multi-tenant'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Ayuda Contextual y Normativa (SENIAT & VEN-NIF)">
            <IconButton
              color="primary"
              onClick={onOpenHelp}
              sx={{ backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#bbdefb' } }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          <Chip
            avatar={
              <Avatar sx={{ bgcolor: '#2196f3' }}>
                {user ? user.nombre_completo.charAt(0) : 'U'}
              </Avatar>
            }
            label={user ? `${user.nombre_completo} (${user.rol})` : 'Usuario Demo'}
            variant="outlined"
            sx={{ borderColor: '#e3e8ef' }}
          />

          <IconButton color="error" onClick={handleLogout} title="Cerrar Sesión / Cambiar Usuario">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
