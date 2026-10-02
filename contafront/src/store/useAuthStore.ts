import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  nombre_completo: string;
  tipo_usuario: 'KANTIO_ADMIN' | 'EMPRESA_INTERNO' | 'ESTUDIO_MIEMBRO';
  rol: string;
}

interface Empresa {
  id: string;
  codigo: string;
  razon_social: string;
  rif: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  empresaActiva: Empresa | null;
  setAuth: (token: string, user: User, empresaActiva?: Empresa) => void;
  setEmpresaActiva: (empresa: Empresa) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('kantio_conta_token'),
  user: JSON.parse(localStorage.getItem('kantio_conta_user') || 'null'),
  empresaActiva: JSON.parse(localStorage.getItem('kantio_conta_empresa') || 'null'),
  
  setAuth: (token, user, empresaActiva) => {
    localStorage.setItem('kantio_conta_token', token);
    localStorage.setItem('kantio_conta_user', JSON.stringify(user));
    if (empresaActiva) {
      localStorage.setItem('kantio_conta_empresa', JSON.stringify(empresaActiva));
    }
    set({ token, user, empresaActiva: empresaActiva || null });
  },

  setEmpresaActiva: (empresa) => {
    localStorage.setItem('kantio_conta_empresa', JSON.stringify(empresa));
    set({ empresaActiva: empresa });
  },

  logout: () => {
    localStorage.removeItem('kantio_conta_token');
    localStorage.removeItem('kantio_conta_user');
    localStorage.removeItem('kantio_conta_empresa');
    set({ token: null, user: null, empresaActiva: null });
  },
}));
