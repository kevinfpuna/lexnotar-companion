import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Usuario } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { verifyPassword, hashPassword, createDefaultUser } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  cambiarPassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useLocalStorage<Usuario[]>('lexnotar_usuarios', [createDefaultUser()]);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('lexnotar_current_user', null);
  const [isLoading, setIsLoading] = useState(true);
  
  const usuario = usuarios.find(u => u.id === currentUserId) || null;
  const isAuthenticated = usuario !== null;

  // Check auth status on mount
  useEffect(() => {
    // Ensure default user exists
    if (!usuarios.some(u => u.email === 'admin@lexnotar.com')) {
      setUsuarios(prev => [...prev, createDefaultUser()]);
    }
    setIsLoading(false);
  }, [usuarios, setUsuarios]);

  const login = (email: string, password: string): boolean => {
    const user = usuarios.find(u => u.email === email || u.username === email);
    if (user && verifyPassword(password, user.passwordHash)) {
      // Update last access
      setUsuarios(prev => prev.map(u => 
        u.id === user.id ? { ...u, ultimoAcceso: new Date() } : u
      ));
      setCurrentUserId(user.id);
      toast.success(`Bienvenido, ${user.username}`);
      return true;
    }
    toast.error('Usuario o contraseña incorrectos');
    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
    toast.success('Sesión cerrada');
  };

  const cambiarPassword = (oldPassword: string, newPassword: string): boolean => {
    if (!usuario) {
      toast.error('No hay usuario autenticado');
      return false;
    }
    
    if (!verifyPassword(oldPassword, usuario.passwordHash)) {
      toast.error('Contraseña actual incorrecta');
      return false;
    }

    if (newPassword.length < 4) {
      toast.error('La nueva contraseña debe tener al menos 4 caracteres');
      return false;
    }
    
    setUsuarios(prev => prev.map(u => 
      u.id === usuario.id 
        ? { ...u, passwordHash: hashPassword(newPassword), fechaActualizacion: new Date() } 
        : u
    ));
    
    toast.success('Contraseña cambiada exitosamente');
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      isAuthenticated, 
      isLoading,
      login, 
      logout, 
      cambiarPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
