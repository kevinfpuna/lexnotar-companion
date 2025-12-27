import bcrypt from 'bcryptjs';
import { Usuario } from '@/types';

const SALT_ROUNDS = 10;

/**
 * Hash seguro de contraseña usando bcrypt
 */
export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

/**
 * Verificar contraseña contra hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.error('Error verificando password:', error);
    return false;
  }
};

/**
 * Validar fortaleza de contraseña
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'débil' | 'media' | 'fuerte';
} {
  const errors: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  } else {
    score++;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  } else {
    score++;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  } else {
    score++;
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  } else {
    score++;
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Se recomienda incluir caracteres especiales (!@#$%^&*)');
  } else {
    score++;
  }
  
  let strength: 'débil' | 'media' | 'fuerte' = 'débil';
  if (score >= 4) strength = 'fuerte';
  else if (score >= 3) strength = 'media';
  
  return {
    valid: errors.length === 0 && password.length >= 8,
    errors,
    strength
  };
}

/**
 * Crear usuario admin por defecto
 */
export const createDefaultUser = (): Usuario => ({
  id: 'user-admin',
  email: 'admin@lexnotar.com',
  username: 'admin',
  passwordHash: hashPassword('admin'), // ⚠️ CAMBIAR en producción
  profesionalId: '1',
  rol: 'admin',
  fechaCreacion: new Date(),
  ultimoAcceso: new Date(),
});
