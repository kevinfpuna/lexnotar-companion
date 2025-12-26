import { useLocalStorage } from './useLocalStorage';
import { Profesional } from '@/types';
import { useCallback } from 'react';
import { toast } from 'sonner';

const profesionalDefault: Profesional = {
  id: '1',
  nombre: 'María',
  apellido: 'González',
  cedula: '1234567',
  telefono: '+595 981 123456',
  email: 'maria@lexnotar.com',
  domicilio: 'Asunción, Paraguay',
  monedaDefault: 'PYG',
  formatoFecha: 'dd/MM/yyyy',
  fechaCreacion: new Date('2024-01-01'),
  fechaActualizacion: new Date(),
};

export function useProfesional() {
  const [profesional, setProfesional] = useLocalStorage<Profesional>(
    'lexnotar_profesional',
    profesionalDefault
  );

  const updateProfesional = useCallback((updates: Partial<Profesional>) => {
    setProfesional(prev => ({
      ...prev,
      ...updates,
      fechaActualizacion: new Date(),
    }));
    toast.success('Datos actualizados correctamente');
  }, [setProfesional]);

  const uploadLogo = useCallback(async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El logo no debe superar 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProfesional(prev => ({
        ...prev,
        logoBase64: base64,
        logoUrl: file.name,
        fechaActualizacion: new Date(),
      }));
      toast.success('Logo actualizado');
    };
    reader.onerror = () => {
      toast.error('Error al cargar el logo');
    };
    reader.readAsDataURL(file);
  }, [setProfesional]);

  const uploadFirma = useCallback(async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La firma no debe superar 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProfesional(prev => ({
        ...prev,
        firmaBase64: base64,
        firmaDigitalPath: file.name,
        fechaActualizacion: new Date(),
      }));
      toast.success('Firma actualizada');
    };
    reader.onerror = () => {
      toast.error('Error al cargar la firma');
    };
    reader.readAsDataURL(file);
  }, [setProfesional]);

  const deleteLogo = useCallback(() => {
    setProfesional(prev => ({
      ...prev,
      logoBase64: undefined,
      logoUrl: undefined,
      fechaActualizacion: new Date(),
    }));
    toast.success('Logo eliminado');
  }, [setProfesional]);

  const deleteFirma = useCallback(() => {
    setProfesional(prev => ({
      ...prev,
      firmaBase64: undefined,
      firmaDigitalPath: undefined,
      fechaActualizacion: new Date(),
    }));
    toast.success('Firma eliminada');
  }, [setProfesional]);

  return {
    profesional,
    updateProfesional,
    uploadLogo,
    uploadFirma,
    deleteLogo,
    deleteFirma,
  };
}
