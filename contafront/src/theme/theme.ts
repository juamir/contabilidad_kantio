import { createTheme } from '@mui/material/styles';

export const berryTheme = createTheme({
  palette: {
    primary: {
      light: '#e3f2fd',
      main: '#2196f3',
      dark: '#1e88e5',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ede7f6',
      main: '#673ab7',
      dark: '#5e35b1',
      contrastText: '#fff',
    },
    success: {
      light: '#b9f6ca',
      main: '#00e676',
      dark: '#00c853',
    },
    error: {
      light: '#ef9a9a',
      main: '#f44336',
      dark: '#c62828',
    },
    warning: {
      light: '#fff8e1',
      main: '#ffe57f',
      dark: '#ffc107',
    },
    background: {
      default: '#eef2f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#364152',
      secondary: '#697586',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Inter', sans-serif",
    h5: {
      fontWeight: 600,
      color: '#121926',
    },
    h6: {
      fontWeight: 600,
      color: '#121926',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 14px 0 rgba(32, 40, 45, 0.08)',
        },
      },
    },
  },
});
