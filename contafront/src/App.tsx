import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { berryTheme } from './theme/theme';
import { MainLayout } from './layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CuentasPage } from './pages/CuentasPage';
import { EstudiosPage } from './pages/EstudiosPage';
import { AsientosPage } from './pages/AsientosPage';
import { FiscalPage } from './pages/FiscalPage';
import { ReportesPage } from './pages/ReportesPage';
import { EmpresasPage } from './pages/EmpresasPage';

import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient();

const ProtectedRoutes: React.FC = () => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Modulo 1: Tablas & Maestros */}
        <Route path="/cuentas" element={<CuentasPage />} />
        <Route path="/centros-costo" element={<CuentasPage initialTab="centros" />} />
        <Route path="/monedas" element={<CuentasPage initialTab="monedas" />} />
        <Route path="/bancos" element={<CuentasPage initialTab="bancos" />} />
        <Route path="/auxiliares" element={<CuentasPage initialTab="auxiliares" />} />

        {/* Modulo 2: Procesos Contables */}
        <Route path="/asientos" element={<AsientosPage />} />
        <Route path="/comprobantes-modelo" element={<AsientosPage initialTab="modelos" />} />
        <Route path="/cierres" element={<AsientosPage initialTab="cierres" />} />
        <Route path="/ajuste-inflacion" element={<AsientosPage initialTab="inflacion" />} />
        <Route path="/integraciones" element={<AsientosPage initialTab="integraciones" />} />

        {/* Modulo 3: Fiscal & SENIAT */}
        <Route path="/fiscal" element={<FiscalPage />} />
        <Route path="/txt-seniat" element={<FiscalPage initialTab="txt" />} />
        <Route path="/libros-iva" element={<FiscalPage initialTab="libros_iva" />} />

        {/* Modulo 4: Reportes & Balances */}
        <Route path="/libros" element={<ReportesPage />} />
        <Route path="/balance-general" element={<ReportesPage initialTab="balance_general" />} />
        <Route path="/balance-comprobacion" element={<ReportesPage initialTab="comprobacion" />} />

        {/* Modulo 5: Gobernanza & Despachos */}
        <Route path="/empresas" element={<EmpresasPage />} />
        <Route path="/estudios" element={<EstudiosPage />} />
        <Route path="/consolidacion" element={<EstudiosPage initialTab="holding" />} />
        <Route path="/usuarios" element={<EstudiosPage initialTab="usuarios" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={berryTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
