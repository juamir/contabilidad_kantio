import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuthStore } from '../store/useAuthStore';

export const Dashboard: React.FC = () => {
  const { empresaActiva } = useAuthStore();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Panel de Control Contable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visión consolidada, monitoreo bimonetario y cumplimiento fiscal (SENIAT & VEN-NIF).
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Soporte Activo para Tablets (PWA):</strong> Puede instalar esta aplicación en su dispositivo móvil o tablet para capturar comprobantes por cámara y continuar operando sin interrupción durante contingencias eléctricas.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TASA OFICIAL BCV
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#2196f3' }}>
                    Bs. 36.85
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#90caf9' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Actualizada hoy para transacciones bimonetarias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #673ab7' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    ESTADO DE ASIENTOS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#673ab7' }}>
                    Al Día
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: '#b39ddb' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Partida doble cuadrada en VES y USD
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #00c853' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    ESTUDIO CONTABLE ASIGNADO
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5, color: '#00c853' }}>
                    Alpha & Asoc.
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 40, color: '#a5d6a7' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Delegación Operativa Completa
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    CALENDARIO SENIAT (SPE)
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5, color: '#ff9800' }}>
                    Próx: 15 Oct
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: '#ffcc80' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Retenciones de IVA e IGTF
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
