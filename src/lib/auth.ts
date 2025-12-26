import { Usuario } from '@/types';

// Hash simple para MVP (usar bcrypt en producción real)
export const hashPassword = (password: string): string => {
  return btoa(password);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash;
};

export const createDefaultUser = (): Usuario => ({
  id: 'user_admin',
  email: 'admin@lexnotar.com',
  username: 'admin',
  passwordHash: hashPassword('admin'),
  profesionalId: '1',
  rol: 'admin',
  fechaCreacion: new Date(),
});
