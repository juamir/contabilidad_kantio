import React, { useState, useEffect } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, Button, Divider, Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
  leida: boolean;
  created_at: string;
}

export const NotificationsPopover: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  const loadNotifications = () => {
    // Alertas financieras y operativas de Kantio Contabilidad
    setNotifications([
      {
        id: 'n-1',
        tipo: 'INFO',
        titulo: 'Kantio Contabilidad Operativo',
        mensaje: 'Motor bimonetario VEN-NIF y comprobantes SENIAT listos.',
        enlace: '/cuentas',
        leida: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'n-2',
        tipo: 'SENIAT',
        titulo: 'Calendario SENIAT SPE Activo',
        mensaje: 'Verifique las retenciones de IVA de la quincena en curso.',
        enlace: '/fiscal',
        leida: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'n-3',
        tipo: 'TASAS',
        titulo: 'Tasa Oficial BCV Actualizada',
        mensaje: 'Se encuentra sincronizada la tasa de cambio oficial de referencia.',
        enlace: '/cuentas?tab=monedas',
        leida: true,
        created_at: new Date().toISOString()
      }
    ]);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.leida).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.leida) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
      );
    }
    if (notif.enlace) {
      handleClose();
      navigate(notif.enlace);
    }
  };

  const getIcon = (tipo: string) => {
    if (tipo === 'SENIAT') {
      return (
        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 34, height: 34 }}>
          <ReceiptIcon fontSize="small" />
        </Avatar>
      );
    }
    if (tipo === 'TASAS') {
      return (
        <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 34, height: 34 }}>
          <AccountBalanceIcon fontSize="small" />
        </Avatar>
      );
    }
    return (
      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 34, height: 34 }}>
        <InfoIcon fontSize="small" />
      </Avatar>
    );
  };

  return (
    <>
      <Tooltip title="Notificaciones del Sistema">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{
            bgcolor: '#f5f3ff',
            width: 38,
            height: 38,
            color: '#7c3aed',
            '&:hover': { bgcolor: '#ede9fe', color: '#6d28d9' }
          }}
        >
          <Badge badgeContent={unreadCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxHeight: 450, borderRadius: 2, boxShadow: 3 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notificaciones ({unreadCount} nuevas)
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              sx={{ fontSize: '0.75rem', textTransform: 'none' }}
            >
              Marcar leídas
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 350 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No tienes notificaciones pendientes.</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <ListItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notif.leida ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid #f1f5f9',
                  '&:hover': { bgcolor: 'primary.light' }
                }}
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  {getIcon(notif.tipo)}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notif.leida ? 'normal' : 'bold', fontSize: '0.85rem' }}>
                      {notif.titulo}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                      {notif.mensaje}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsPopover;
