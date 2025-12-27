import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Usuario } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { verifyPassword, hashPassword, createDefaultUser, validatePasswordStrength } from '@/lib/auth';
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
  const migrationDone = useRef(false);
  
  const usuario = usuarios.find(u => u.id === currentUserId) || null;
  const isAuthenticated = usuario !== null;

  // Check auth status and migrate passwords on mount
  useEffect(() => {
    // Ensure default user exists
    if (!usuarios.some(u => u.email === 'admin@lexnotar.com')) {
      setUsuarios(prev => [...prev, createDefaultUser()]);
    }

    // Migrate usuarios with old hash (btoa) - only once
    if (!migrationDone.current) {
      migrationDone.current = true;
      
      const needsMigration = usuarios.some(u => {
        try {
          // Si se puede decodificar con atob, es hash antiguo
          atob(u.passwordHash);
          return true;
        } catch {
          return false;
        }
      });

      if (needsMigration) {
        console.warn('⚠️ Detectadas contraseñas con hash antiguo. Migrando...');
        setUsuarios(prev => 
          prev.map(u => {
            try {
              const plainPassword = atob(u.passwordHash);
              return {
                ...u,
                passwordHash: hashPassword(plainPassword),
                fechaActualizacion: new Date()
              };
            } catch {
              // Ya está con bcrypt
              return u;
            }
          })
        );
        toast.info('Seguridad mejorada: contraseñas actualizadas a bcrypt');
      }
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

    // Verificar contraseña actual
    if (!verifyPassword(oldPassword, usuario.passwordHash)) {
      toast.error('Contraseña actual incorrecta');
      return false;
    }

    // Validar fortaleza de nueva contraseña
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      toast.error('Contraseña débil', {
        description: validation.errors.join('\n')
      });
      return false;
    }

    // Advertencia si la contraseña es media
    if (validation.strength === 'media') {
      toast.warning('Contraseña aceptable pero podría ser más fuerte');
    }

    // Actualizar contraseña
    setUsuarios(prev => 
      prev.map(u => 
        u.id === usuario.id 
          ? { 
              ...u, 
              passwordHash: hashPassword(newPassword),
              fechaActualizacion: new Date()
            } 
          : u
      )
    );

    toast.success('Contraseña cambiada exitosamente', {
      description: `Fortaleza: ${validation.strength}`
    });
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
