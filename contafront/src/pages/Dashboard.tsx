import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DevicesIcon from '@mui/icons-material/Devices';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const { empresaActiva } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tasaBcv, setTasaBcv] = useState<{ tasa: number; fecha: string; fuente: string }>({
    tasa: 40.0,
    fecha: new Date().toISOString().split('T')[0],
    fuente: 'BCV'
  });

  const [kpis, setKpis] = useState({
    totalAsientos: 0,
    asentados: 0,
    borradores: 0,
    totalCuentas: 0,
    totalFacturas: 0,
    totalActivos: 0,
    estudioNombre: 'Sin Despacho Asignado',
    estudioDelegacion: 'Gestión Directa'
  });

  const cargarDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Tasa BCV Actual
      try {
        const tasaData = await api.get<any>('/monedas/tasas/actual');
        if (tasaData && tasaData.tasa) {
          setTasaBcv({
            tasa: Number(tasaData.tasa),
            fecha: tasaData.fecha || new Date().toISOString().split('T')[0],
            fuente: tasaData.fuente || 'BCV'
          });
        }
      } catch (err) {
        console.warn('No se pudo obtener tasa BCV actual:', err);
      }

      if (!empresaActiva?.id) return;

      // 2. Asientos
      let totalAsientos = 0;
      let asentados = 0;
      let borradores = 0;
      try {
        const compData = await api.get<any[]>(`/asientos/empresas/${empresaActiva.id}`);
        if (Array.isArray(compData)) {
          totalAsientos = compData.length;
          asentados = compData.filter((c) => c.estado === 'ASENTADO').length;
          borradores = compData.filter((c) => c.estado === 'BORRADOR' || c.estado === 'REVISADO').length;
        }
      } catch (err) {
        console.warn('Error cargando asientos en Dashboard:', err);
      }

      // 3. Cuentas Contables
      let totalCuentas = 0;
      try {
        const cuentasData = await api.get<any[]>(`/cuentas/empresas/${empresaActiva.id}`);
        if (Array.isArray(cuentasData)) {
          totalCuentas = cuentasData.length;
        }
      } catch (err) {
        console.warn('Error cargando cuentas en Dashboard:', err);
      }

      // 4. Facturas Fiscales
      let totalFacturas = 0;
      try {
        const factData = await api.get<any[]>(`/fiscal/empresas/${empresaActiva.id}/facturas`);
        if (Array.isArray(factData)) {
          totalFacturas = factData.length;
        }
      } catch (err) {
        console.warn('Error cargando facturas en Dashboard:', err);
      }

      // 5. Activos Fijos
      let totalActivos = 0;
      try {
        const actData = await api.get<any[]>(`/activos-fijos/empresas/${empresaActiva.id}`);
        if (Array.isArray(actData)) {
          totalActivos = actData.length;
        }
      } catch (err) {
        console.warn('Error cargando activos fijos en Dashboard:', err);
      }

      // 6. Estudio Contable Delegado
      let estudioNombre = 'Gestión Interna';
      let estudioDelegacion = 'Sin delegación externa';
      try {
        const delegData = await api.get<any[]>(`/estudios/empresas/${empresaActiva.id}/delegaciones`);
        if (Array.isArray(delegData) && delegData.length > 0) {
          const activa = delegData.find((d) => d.estado === 'ACTIVA') || delegData[0];
          estudioNombre = activa.estudio?.nombre_razon_social || activa.estudio_nombre || 'Despacho Contable';
          estudioDelegacion = `Delegación ${activa.tipo_delegacion || 'Operativa'}`;
        }
      } catch (err) {
        console.warn('Error cargando delegaciones en Dashboard:', err);
      }

      setKpis({
        totalAsientos,
        asentados,
        borradores,
        totalCuentas,
        totalFacturas,
        totalActivos,
        estudioNombre,
        estudioDelegacion
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboardData();
  }, [empresaActiva?.id]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Panel de Control Contable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visión consolidada, monitoreo bimonetario y cumplimiento fiscal ({empresaActiva?.razon_social || 'Empresa Activa'}).
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={empresaActiva ? `Empresa: ${empresaActiva.codigo}` : 'Seleccione Empresa'}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Tooltip title="Actualizar indicadores">
            <IconButton onClick={cargarDashboardData} disabled={loading} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Soporte Activo para Tablets y Laptops (PWA):</strong> Puede instalar esta aplicación en su dispositivo móvil o tablet para capturar comprobantes por cámara y continuar operando sin interrupción durante contingencias.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* KPI 1: Tasa Oficial BCV */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #2196f3', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TASA OFICIAL BCV
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#2196f3' }}>
                    Bs. {tasaBcv.tasa.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#90caf9' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                USD / VES | Vigente al {tasaBcv.fecha}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 2: Estado de Asientos */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #673ab7', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    ESTADO DE ASIENTOS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#673ab7' }}>
                    {kpis.asentados} Asentados
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: '#b39ddb' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {kpis.borradores > 0 ? `${kpis.borradores} comprobantes en borrador` : 'Partida doble al día y balanceada'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 3: Despacho / Estudio Asignado */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #00c853', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    ESTUDIO CONTABLE ASIGNADO
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5, color: '#00c853', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                    {kpis.estudioNombre}
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 40, color: '#a5d6a7' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {kpis.estudioDelegacion}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 4: Plan de Cuentas & Registros */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff', borderLeft: '4px solid #ff9800', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    MAESTROS ACTIVOS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#ff9800' }}>
                    {kpis.totalCuentas} Cuentas
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: '#ffcc80' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {kpis.totalFacturas} Facturas | {kpis.totalActivos} Activos Fijos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accesos Rápidos Operativos */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Accesos Directos a Operaciones Clave
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PostAddIcon />}
            sx={{ p: 1.5, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 2 }}
            onClick={() => navigate('/asientos')}
          >
            <Box>
              <Typography variant="body2" fontWeight="bold">Comprobantes & Asientos</Typography>
              <Typography variant="caption" color="text.secondary">Registrar partida doble en VES y USD</Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ReceiptLongIcon />}
            sx={{ p: 1.5, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 2 }}
            onClick={() => navigate('/fiscal')}
          >
            <Box>
              <Typography variant="body2" fontWeight="bold">Fiscal & Retenciones SENIAT</Typography>
              <Typography variant="caption" color="text.secondary">Libros de IVA, OCR y TXT oficial</Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MenuBookIcon />}
            sx={{ p: 1.5, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 2 }}
            onClick={() => navigate('/libros')}
          >
            <Box>
              <Typography variant="body2" fontWeight="bold">Estados Financieros NIIF 18</Typography>
              <Typography variant="caption" color="text.secondary">Balance de Comprobación y Resultados</Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DevicesIcon />}
            sx={{ p: 1.5, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 2 }}
            onClick={() => navigate('/activos-fijos')}
          >
            <Box>
              <Typography variant="body2" fontWeight="bold">Activos Fijos & Depreciación</Typography>
              <Typography variant="caption" color="text.secondary">Control patrimonial y corrida mensual</Typography>
            </Box>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
