import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/client';
import { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  atualizarUsuario: (u: Usuario) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('admig_user');
    if (!raw || !localStorage.getItem('admig_token')) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      localStorage.removeItem('admig_user');
      localStorage.removeItem('admig_token');
      return null;
    }
  });

  async function login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha });
    const usuarioLogado: Usuario = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      role: data.role,
      fotoUrl: data.fotoUrl,
    };
    localStorage.setItem('admig_token', data.token);
    localStorage.setItem('admig_user', JSON.stringify(usuarioLogado));
    setUsuario(usuarioLogado);
  }

  function logout() {
    localStorage.removeItem('admig_token');
    localStorage.removeItem('admig_user');
    setUsuario(null);
  }

  function atualizarUsuario(u: Usuario) {
    localStorage.setItem('admig_user', JSON.stringify(u));
    setUsuario(u);
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      atualizarUsuario,
      isAdmin: usuario?.role === 'ADMINISTRADOR',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
