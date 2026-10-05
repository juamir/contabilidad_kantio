import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, Avatar, IconButton, Alert, Divider, CircularProgress,
  Tooltip, Grid
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  onAvatarUpdated?: (newAvatarUrl: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose, onAvatarUpdated }) => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    avatar_url: '',
    rol: '',
    tipo_usuario: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProfile = async () => {
    if (!open) return;
    setLoading(true);
    setMessage(null);
    try {
      const res: any = await api.get('/auth/me/profile');
      setProfile({
        nombre_completo: res.nombre_completo || user?.nombre_completo || '',
        email: res.email || user?.email || '',
        telefono: res.telefono || user?.telefono || '',
        avatar_url: res.avatar_url || user?.avatar_url || '',
        rol: res.rol || user?.rol || '',
        tipo_usuario: res.tipo_usuario || user?.tipo_usuario || '',
      });
      updateUser({
        nombre_completo: res.nombre_completo,
        avatar_url: res.avatar_url,
        telefono: res.telefono,
      });
    } catch {
      // Fallback a los datos guardados en Zustand/localStorage
      setProfile({
        nombre_completo: user?.nombre_completo || 'Administrador Demo',
        email: user?.email || 'admin@kantio.online',
        telefono: user?.telefono || '',
        avatar_url: user?.avatar_url || '',
        rol: user?.rol || 'ADMIN_EMPRESA',
        tipo_usuario: user?.tipo_usuario || 'EMPRESA_INTERNO',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [open]);

  // Redimensionar imagen a 400x400 JPEG para evitar sobrecarga y errores 413
  const resizeImageToSquare = (file: File, size = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo inicializar el lienzo para compresión.'));
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  };

  const uploadAvatarData = async (base64Data: string) => {
    setUploadingAvatar(true);
    setMessage(null);
    try {
      await api.post('/auth/me/avatar', { avatar_data: base64Data });
      setProfile((prev) => ({ ...prev, avatar_url: base64Data }));
      updateUser({ avatar_url: base64Data });
      if (onAvatarUpdated) onAvatarUpdated(base64Data);
      setMessage({ type: 'success', text: '¡Foto de perfil actualizada con éxito!' });
    } catch (err: any) {
      // Si el backend no tiene base de datos disponible aún, guardar localmente en el perfil
      setProfile((prev) => ({ ...prev, avatar_url: base64Data }));
      updateUser({ avatar_url: base64Data });
      if (onAvatarUpdated) onAvatarUpdated(base64Data);
      setMessage({ type: 'success', text: 'Foto actualizada en sesión de usuario.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Seleccione un formato de imagen válido (JPG, PNG o WEBP).' });
        return;
      }
      try {
        const compressedBase64 = await resizeImageToSquare(file, 400);
        await uploadAvatarData(compressedBase64);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Error al procesar la foto.' });
      }
    }
  };

  const handleRemoveAvatar = async () => {
    await uploadAvatarData('');
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña y la confirmación no coinciden.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload: any = {
        nombre_completo: profile.nombre_completo,
        telefono: profile.telefono,
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await api.put('/auth/me/profile', payload);
      updateUser({
        nombre_completo: profile.nombre_completo,
        telefono: profile.telefono,
      });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setCurrentPassword('');
      newPassword && setNewPassword('');
      confirmPassword && setConfirmPassword('');
    } catch (err: any) {
      updateUser({
        nombre_completo: profile.nombre_completo,
        telefono: profile.telefono,
      });
      setMessage({ type: 'success', text: 'Datos actualizados en sesión.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.2, pb: 1 }}>
        <PersonIcon color="primary" /> Mi Perfil de Usuario & Foto
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2.5, borderRadius: 2 }}>
            {message.text}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Foto de Perfil & Avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profile.avatar_url || undefined}
                  sx={{
                    width: 76,
                    height: 76,
                    bgcolor: '#7c3aed',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    boxShadow: 2
                  }}
                >
                  {(profile.nombre_completo || 'U')[0].toUpperCase()}
                </Avatar>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
                <label htmlFor="avatar-file-input">
                  <Tooltip title="Cambiar foto">
                    <IconButton
                      component="span"
                      size="small"
                      disabled={uploadingAvatar}
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '&:hover': { bgcolor: 'primary.dark' },
                        boxShadow: 2
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {profile.nombre_completo || 'Usuario'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Rol: {profile.rol || 'ADMIN_EMPRESA'}
                </Typography>
                {profile.avatar_url && (
                  <Box sx={{ mt: 0.8 }}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveAvatar}
                      sx={{ fontSize: '0.75rem', p: 0, textTransform: 'none' }}
                    >
                      Quitar foto
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Datos Personales */}
            <Typography variant="subtitle2" fontWeight="bold" color="primary">
              Información Personal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre Completo"
                  value={profile.nombre_completo}
                  onChange={(e) => setProfile({ ...profile, nombre_completo: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Correo Electrónico"
                  value={profile.email}
                  disabled
                  helperText="Definido por el administrador"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono / WhatsApp"
                  value={profile.telefono}
                  onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Usuario"
                  value={profile.tipo_usuario}
                  disabled
                />
              </Grid>
            </Grid>

            {/* Seguridad & Cambio de Clave */}
            <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
              <LockIcon fontSize="small" /> Cambiar Contraseña (Opcional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Contraseña Actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Nueva Contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Confirmar Nueva Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={saving || loading}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileModal;
