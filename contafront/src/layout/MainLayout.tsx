import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH_OPEN, DRAWER_WIDTH_COLLAPSED } from './Sidebar';
import Header from './Header';
import { ContextualHelpModal } from '../components/ContextualHelpModal';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [helpOpen, setHelpOpen] = useState(false);
  const location = useLocation();

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const getHelpContent = () => {
    if (location.pathname.includes('/asientos')) {
      return {
        title: "Ayuda: Motor de Comprobantes de Diario",
        topic: "Partida Doble Bimonetaria y Atajos de Teclado",
        content: "Para registrar un asiento contable, digite las cuentas operativas y los montos. El sistema calcula en tiempo real el contravalor en divisas según la tasa oficial del BCV. El botón 'Auto-Cuadrar' añade automáticamente una línea para balancear cualquier diferencia pendiente.",
        seniatNote: "Los comprobantes asentados alimentan automáticamente los libros de compras y ventas del SENIAT y no pueden alterarse sin un asiento de ajuste o reversión.",
        venNifRef: "Principio de Partida Doble (Fray Luca Pacioli) y NIIF para PYMES Sección 2."
      };
    }
    if (location.pathname.includes('/cuentas')) {
      return {
        title: "Ayuda: Plan Único de Cuentas (PUC)",
        topic: "Estructura del Catálogo y Normas VEN-NIF",
        content: "El Plan de Cuentas está preconfigurado bajo estándares VEN-NIF. Las cuentas de nivel 1 al 3 son totalizadoras y no admiten asientos directos. Solo las subcuentas de nivel 4 o superior con el indicador 'Permite Movimiento' pueden recibir cargos o abonos.",
        seniatNote: "Asocie las cuentas de Débito y Crédito Fiscal a sus respectivos códigos auxiliares para alimentar los Libros de IVA.",
        venNifRef: "Boletín de Aplicación BA VEN-NIF N° 8 (Versión 11) y NIIF para las PYMES Sección 3."
      };
    }
    if (location.pathname.includes('/fiscal')) {
      return {
        title: "Ayuda: Cumplimiento Fiscal & Retenciones SENIAT",
        topic: "Retenciones de IVA (75%/100%), ISLR y Archivo TXT",
        content: "Al registrar facturas de proveedores o clientes, el sistema calcula automáticamente los montos a retener. El botón 'Descargar TXT SENIAT' genera el archivo plano validado para su carga directa en el portal del SENIAT.",
        seniatNote: "Los Sujetos Pasivos Especiales (SPE) deben enterar las retenciones quincenalmente según el terminal del RIF permanente (Providencia SNAT/2025/000091).",
        venNifRef: "Tratamiento de pasivos fiscales por enterar y créditos fiscales conforme a la Sección 29 de NIIF para PYMES."
      };
    }
    if (location.pathname.includes('/libros')) {
      return {
        title: "Ayuda: Estados Financieros y Libros Oficiales",
        topic: "Presentación NIIF 18 y Cuadre de Situación Financiera",
        content: "El Estado de Rendimiento se presenta bajo la nueva taxonomía NIIF 18, segregando con precisión el Margen Bruto Operativo de las partidas de financiamiento y diferencial cambiario. El Balance General corrobora la ecuación de Activo = Pasivo + Patrimonio.",
        seniatNote: "Los saldos mostrados coinciden con los libros foliados exigidos por el Código de Comercio venezolano y las declaraciones definitivas de ISLR.",
        venNifRef: "Boletín de Aplicación BA VEN-NIF N° 8 (Versión 11) y adopción formal de la NIIF 18."
      };
    }
    if (location.pathname.includes('/estudios')) {
      return {
        title: "Ayuda: Gobernanza y Estudios Contables",
        topic: "Delegación y Portabilidad de Asesores",
        content: "La empresa titular autoriza a un Estudio Contable externo a operar su contabilidad. Si decide cambiar de asesor, pulse 'Revocar' para suspender el acceso de inmediato sin perder ningún comprobante ni histórico.",
        seniatNote: "Los auditores externos pueden recibir acceso de solo lectura para revisiones fiscales sin riesgo de alteración de asientos.",
        venNifRef: "Segregación de funciones y control interno conforme a NIA 240 / 315."
      };
    }
    return {
      title: "Ayuda: Panel Principal Kantio",
      topic: "Resumen y Monitoreo General",
      content: "Desde este panel visualice el estado general de su contabilidad, accesos de estudios contables delegados, tasas de cambio del día (BCV) y alertas de cierres mensuales.",
      seniatNote: "Revise periódicamente el calendario quincenal de SPE para retenciones e IGTF.",
      venNifRef: "Preparación continua de estados financieros bimonetarios."
    };
  };

  const currentDrawerWidth = isMobile
    ? 0
    : sidebarOpen
    ? DRAWER_WIDTH_OPEN
    : DRAWER_WIDTH_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#eef2f6' }}>
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          minWidth: 0,
          backgroundColor: '#eef2f6',
          minHeight: '100vh',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box sx={{ height: 64 }} />
        {children}
      </Box>

      <ContextualHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        {...getHelpContent()}
      />
    </Box>
  );
};

export default MainLayout;
