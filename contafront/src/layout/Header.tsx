import React, { useState } from 'react';
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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuthStore } from '../store/useAuthStore';
import { DRAWER_WIDTH_OPEN, DRAWER_WIDTH_COLLAPSED } from './Sidebar';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenHelp: () => void;
}

const EMPRESAS_DISPONIBLES = [
  { id: '1', codigo: 'DEMOC', razon_social: 'CORPORACION DEMO KANTIO C.A.', rif: 'J-50123456-7' },
  { id: '2', codigo: 'ALIMC', razon_social: 'DISTRIBUIDORA DE ALIMENTOS DEL CENTRO S.A.', rif: 'J-40998877-1' },
  { id: '3', codigo: 'LOGIS', razon_social: 'LOGISTICA & TRANSPORTE VALENCIA EXPRESS C.A.', rif: 'J-30111222-3' },
];

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onOpenHelp,
}) => {
  const { user, empresaActiva, setEmpresaActiva, logout } = useAuthStore();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSelectEmpresa = (emp: typeof EMPRESAS_DISPONIBLES[0]) => {
    setEmpresaActiva(emp);
    setSelectorOpen(false);
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
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton color="inherit" edge="start" onClick={onToggleSidebar}>
              <MenuIcon />
            </IconButton>

            <Tooltip title="Haga clic para alternar la empresa activa (SaaS Multi-empresa)">
              <Button
                onClick={() => setSelectorOpen(true)}
                variant="text"
                sx={{
                  textAlign: 'left',
                  textTransform: 'none',
                  p: 0.5,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' }
                }}
              >
                <CorporateFareIcon color="primary" />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2} color="text.primary">
                      {empresaActiva ? empresaActiva.razon_social : 'CORPORACION DEMO KANTIO C.A.'}
                    </Typography>
                    <SwapHorizIcon fontSize="small" color="action" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {empresaActiva ? `RIF: ${empresaActiva.rif} | Empresa Activa` : 'RIF: J-50123456-7 | Empresa Activa'}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
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

      {/* Selector de Empresa Activa (SaaS Multi-tenant) */}
      <Dialog open={selectorOpen} onClose={() => setSelectorOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Seleccionar Empresa Titular
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, mb: 1 }}>
            Empresas donde su usuario tiene permisos autorizados:
          </Typography>
          <List>
            {EMPRESAS_DISPONIBLES.map((emp) => {
              const isSelected = empresaActiva?.id === emp.id || (!empresaActiva && emp.codigo === 'DEMOC');
              return (
                <ListItemButton
                  key={emp.id}
                  onClick={() => handleSelectEmpresa(emp)}
                  selected={isSelected}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isSelected ? <CheckCircleIcon color="primary" /> : <CorporateFareIcon color="action" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={emp.razon_social}
                    primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.875rem' }}
                    secondary={`RIF: ${emp.rif} (${emp.codigo})`}
                    secondaryTypographyProps={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
