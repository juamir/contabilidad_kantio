import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import GroupIcon from '@mui/icons-material/Group';
import DomainIcon from '@mui/icons-material/Domain';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LockClockIcon from '@mui/icons-material/LockClock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BalanceIcon from '@mui/icons-material/Balance';
import InsightsIcon from '@mui/icons-material/Insights';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const DRAWER_WIDTH_OPEN = 280;
export const DRAWER_WIDTH_COLLAPSED = 72;

interface NavLeafItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface NavSubSection {
  subtitle: string;
  key: string;
  items: NavLeafItem[];
}

interface NavPrimaryGroup {
  title: string;
  key: string;
  icon: React.ReactNode;
  subsections: NavSubSection[];
}

// Organización lógica de navegación con UX moderna y jerárquica para Kantio Contabilidad
const MENU_GROUPS: NavPrimaryGroup[] = [
  {
    title: '1. Tablas & Maestros',
    key: 'maestros',
    icon: <TableChartIcon />,
    subsections: [
      {
        subtitle: 'Catálogo de Cuentas',
        key: 'cuentas',
        items: [
          { text: 'Plan de Cuentas (PUC VEN-NIF)', icon: <AccountTreeIcon />, path: '/cuentas' },
          { text: 'Centros de Costo', icon: <DomainIcon />, path: '/cuentas?tab=centros' },
          { text: 'Tipos de Documentos', icon: <AssignmentIcon />, path: '/cuentas?tab=documentos' },
        ]
      },
      {
        subtitle: 'Parámetros Bimonetarios',
        key: 'bimoneda',
        items: [
          { text: 'Monedas & Tasas BCV', icon: <CurrencyExchangeIcon />, path: '/cuentas?tab=monedas' },
          { text: 'Bancos & Cuentas de Tesorería', icon: <AccountBalanceIcon />, path: '/cuentas?tab=bancos' },
          { text: 'Auxiliares (Terceros)', icon: <GroupIcon />, path: '/cuentas?tab=auxiliares' },
        ]
      }
    ]
  },
  {
    title: '2. Procesos Contables',
    key: 'procesos',
    icon: <ReceiptLongIcon />,
    subsections: [
      {
        subtitle: 'Comprobantes de Diario',
        key: 'asientos',
        items: [
          { text: 'Registro de Asientos (Vouchers)', icon: <ReceiptLongIcon />, path: '/asientos' },
          { text: 'Comprobantes Modelo (Plantillas)', icon: <AutoAwesomeIcon />, path: '/asientos?tab=modelos' },
          { text: 'Procesamiento por Lote', icon: <PlayArrowIcon />, path: '/asientos?tab=lote' },
        ]
      },
      {
        subtitle: 'Cierres & Ajustes',
        key: 'cierres',
        items: [
          { text: 'Cierre de Periodo / Ejercicio', icon: <LockClockIcon />, path: '/asientos?tab=cierres' },
          { text: 'Ajuste por Inflación (NIC 29)', icon: <TrendingDownIcon />, path: '/asientos?tab=inflacion' },
          { text: 'Integración Nómina & POS', icon: <SyncAltIcon />, path: '/asientos?tab=integraciones' },
        ]
      }
    ]
  },
  {
    title: '3. Activos Fijos & PPE',
    key: 'activos',
    icon: <PrecisionManufacturingIcon />,
    subsections: [
      {
        subtitle: 'Control Patrimonial',
        key: 'activos_fijos',
        items: [
          { text: 'Catálogo de Activos Fijos', icon: <PrecisionManufacturingIcon />, path: '/activos-fijos' },
          { text: 'Grupos & Ubicaciones', icon: <DomainIcon />, path: '/activos-fijos?tab=grupos' },
          { text: 'Cálculo de Depreciación', icon: <TrendingDownIcon />, path: '/activos-fijos?tab=depreciacion' },
        ]
      }
    ]
  },
  {
    title: '4. Fiscal & SENIAT',
    key: 'fiscal',
    icon: <ReceiptIcon />,
    subsections: [
      {
        subtitle: 'Gestión Tributaria',
        key: 'retenciones',
        items: [
          { text: 'Retenciones IVA & ISLR', icon: <ReceiptIcon />, path: '/fiscal' },
          { text: 'Exportar TXT SENIAT', icon: <FileDownloadIcon />, path: '/fiscal?tab=txt' },
          { text: 'Libros de Compras y Ventas', icon: <MenuBookIcon />, path: '/fiscal?tab=libros_iva' },
        ]
      }
    ]
  },
  {
    title: '5. Reportes & Balances',
    key: 'reportes',
    icon: <AssessmentIcon />,
    subsections: [
      {
        subtitle: 'Estados Financieros NIIF',
        key: 'financieros',
        items: [
          { text: 'Estado de Rendimiento (NIIF 18)', icon: <InsightsIcon />, path: '/libros' },
          { text: 'Balance General Clasificado', icon: <BalanceIcon />, path: '/libros?tab=balance_general' },
          { text: 'Balance de Comprobación', icon: <TableChartIcon />, path: '/libros?tab=comprobacion' },
        ]
      }
    ]
  },
  {
    title: '6. Gobernanza & Despachos',
    key: 'gobernanza',
    icon: <BusinessIcon />,
    subsections: [
      {
        subtitle: 'Empresas & Outsourcing',
        key: 'outsourcing',
        items: [
          { text: 'Empresas Titulares (SaaS)', icon: <CorporateFareIcon />, path: '/empresas' },
          { text: 'Parámetros de Empresa', icon: <BusinessIcon />, path: '/empresas?tab=parametros' },
          { text: 'Estudios Contables (Hub)', icon: <DomainIcon />, path: '/estudios' },
          { text: 'Consolidación de Grupos', icon: <CorporateFareIcon />, path: '/estudios?tab=holding' },
          { text: 'Usuarios & Permisos (RBAC)', icon: <AdminPanelSettingsIcon />, path: '/estudios?tab=usuarios' },
        ]
      }
    ]
  },
  {
    title: '7. Ayuda & Documentación',
    key: 'ayuda',
    icon: <SchoolIcon />,
    subsections: [
      {
        subtitle: 'Capacitación & Soporte',
        key: 'soporte',
        items: [
          { text: 'Guía de Procesos & FAQ', icon: <SchoolIcon />, path: '/guia' },
        ]
      }
    ]
  }
];

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    maestros: true,
    procesos: true,
    activos: true,
    fiscal: true,
    reportes: true,
    gobernanza: false,
    ayuda: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const drawerContent = (
    <Box sx={{ overflowY: 'auto', overflowX: 'hidden', p: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />

      {/* Ítem Raíz: Dashboard Principal */}
      <List sx={{ p: 0, mb: 1 }}>
        <ListItemButton
          component={Link}
          to="/"
          selected={location.pathname === '/' && !location.search}
          onClick={() => {
            if (isMobile) onClose();
          }}
          sx={{
            borderRadius: 2,
            px: open ? 2 : 1.5,
            justifyContent: open ? 'initial' : 'center',
            '&.Mui-selected': {
              bgcolor: 'primary.light',
              color: 'primary.main',
              fontWeight: 'bold',
              '& .MuiListItemIcon-root': { color: 'primary.main' }
            }
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? 36 : 0,
              mr: open ? 1.5 : 0,
              justifyContent: 'center',
              color: location.pathname === '/' && !location.search ? 'primary.main' : 'text.secondary'
            }}
          >
            <DashboardIcon />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary="Tablero Principal"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: location.pathname === '/' && !location.search ? 'bold' : 'medium'
              }}
            />
          )}
        </ListItemButton>
      </List>

      <Divider sx={{ my: 0.5 }} />

      {/* Grupos Jerárquicos en 3 Niveles */}
      <List sx={{ flexGrow: 1, p: 0 }}>
        {MENU_GROUPS.map((group) => {
          const isGroupOpen = !!openGroups[group.key];
          const hasActiveChild = group.subsections.some((sub) =>
            sub.items.some((item) => {
              if (item.path.includes('?')) {
                return (location.pathname + location.search) === item.path;
              }
              return location.pathname === item.path && !location.search;
            })
          );

          return (
            <Box key={group.key} sx={{ mb: 1 }}>
              {/* Nivel 1: Cabecera del Módulo */}
              {open ? (
                <ListItemButton
                  onClick={() => toggleGroup(group.key)}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: hasActiveChild ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: hasActiveChild ? 'primary.main' : 'text.secondary' }}>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={group.title}
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: hasActiveChild ? 'primary.main' : 'text.primary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  />
                  {isGroupOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
              ) : (
                <Tooltip title={group.title} placement="right" arrow>
                  <ListItemButton
                    onClick={() => toggleGroup(group.key)}
                    sx={{ justifyContent: 'center', px: 1.5, borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: hasActiveChild ? 'primary.main' : 'text.secondary' }}>
                      {group.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              )}

              {/* Niveles 2 y 3 Anidados */}
              <Collapse in={open ? isGroupOpen : false} timeout="auto" unmountOnExit>
                <Box sx={{ pl: open ? 1.5 : 0, mt: 0.5 }}>
                  {group.subsections.map((sub) => (
                    <Box key={sub.key} sx={{ mb: 1 }}>
                      {/* Nivel 2: Sub-título Organizacional */}
                      {open && (
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1.5,
                            py: 0.25,
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.6
                          }}
                        >
                          {sub.subtitle}
                        </Typography>
                      )}

                      {/* Nivel 3: Ítems Ejecutables (Hojas) */}
                      <List component="div" disablePadding>
                        {sub.items.map((item) => {
                          const isSelected = item.path.includes('?')
                            ? (location.pathname + location.search) === item.path
                            : location.pathname === item.path && !location.search;

                          const btn = (
                            <ListItemButton
                              key={item.text}
                              component={Link}
                              to={item.path}
                              selected={isSelected}
                              onClick={() => {
                                if (isMobile) onClose();
                              }}
                              sx={{
                                borderRadius: 1.5,
                                mb: 0.25,
                                py: 0.5,
                                px: open ? 1.5 : 1,
                                justifyContent: open ? 'initial' : 'center',
                                '&.Mui-selected': {
                                  bgcolor: 'primary.light',
                                  color: 'primary.main',
                                  fontWeight: 'bold',
                                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                                }
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: open ? 28 : 0,
                                  mr: open ? 1 : 0,
                                  justifyContent: 'center',
                                  color: isSelected ? 'primary.main' : 'text.secondary',
                                  '& svg': { fontSize: '1.05rem' }
                                }}
                              >
                                {item.icon}
                              </ListItemIcon>
                              {open && (
                                <ListItemText
                                  primary={item.text}
                                  primaryTypographyProps={{
                                    fontSize: '0.8rem',
                                    fontWeight: isSelected ? 700 : 400
                                  }}
                                />
                              )}
                            </ListItemButton>
                          );

                          return open ? (
                            btn
                          ) : (
                            <Tooltip key={item.text} title={`${sub.subtitle} > ${item.text}`} placement="right" arrow>
                              {btn}
                            </Tooltip>
                          );
                        })}
                      </List>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH_OPEN,
            boxSizing: 'border-box',
            bgcolor: 'background.paper'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  const currentWidth = open ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_COLLAPSED;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        }),
        '& .MuiDrawer-paper': {
          width: currentWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid #e0e0e0',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
