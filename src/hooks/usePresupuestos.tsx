import { useCallback } from 'react';
import { PresupuestoVersion } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/lib/calculations';
import { toast } from 'sonner';

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useLocalStorage<PresupuestoVersion[]>(
    'lexnotar-presupuestos',
    []
  );

  const getPresupuestosByTrabajo = useCallback(
    (trabajoId: string) => {
      return presupuestos
        .filter(p => p.trabajoId === trabajoId)
        .sort((a, b) => b.version - a.version);
    },
    [presupuestos]
  );

  const getUltimaVersion = useCallback(
    (trabajoId: string): number => {
      const versions = presupuestos.filter(p => p.trabajoId === trabajoId);
      if (versions.length === 0) return 0;
      return Math.max(...versions.map(p => p.version));
    },
    [presupuestos]
  );

  const createPresupuesto = useCallback(
    async (data: {
      trabajoId: string;
      subtotal: number;
      descuentoGlobal: number;
      cargosExtra: number;
      iva: number;
      terminosCondiciones?: string;
    }): Promise<PresupuestoVersion> => {
      const ultimaVersion = getUltimaVersion(data.trabajoId);
      const total = data.subtotal - data.descuentoGlobal + data.cargosExtra + data.iva;

      const newPresupuesto: PresupuestoVersion = {
        id: generateId(),
        trabajoId: data.trabajoId,
        version: ultimaVersion + 1,
        estado: 'borrador',
        subtotal: data.subtotal,
        descuentoGlobal: data.descuentoGlobal,
        cargosExtra: data.cargosExtra,
        iva: data.iva,
        total,
        terminosCondiciones: data.terminosCondiciones,
        fechaCreacion: new Date()
      };

      setPresupuestos(prev => [...prev, newPresupuesto]);
      toast.success(`Presupuesto versión ${newPresupuesto.version} creado`);
      return newPresupuesto;
    },
    [getUltimaVersion, setPresupuestos]
  );

  const updatePresupuestoEstado = useCallback(
    async (
      id: string,
      estado: PresupuestoVersion['estado'],
      motivoRechazo?: string
    ) => {
      setPresupuestos(prev =>
        prev.map(p => {
          if (p.id !== id) return p;

          const updates: Partial<PresupuestoVersion> = { estado };

          if (estado === 'enviado') {
            updates.fechaEnviado = new Date();
          } else if (estado === 'aprobado') {
            updates.fechaAprobado = new Date();
          } else if (estado === 'rechazado') {
            updates.fechaRechazado = new Date();
            updates.motivoRechazo = motivoRechazo;
          }

          return { ...p, ...updates };
        })
      );

      toast.success(`Presupuesto marcado como ${estado}`);
    },
    [setPresupuestos]
  );

  const deletePresupuesto = useCallback(
    async (id: string): Promise<boolean> => {
      const presupuesto = presupuestos.find(p => p.id === id);
      
      if (presupuesto?.estado === 'aprobado') {
        toast.error('No se puede eliminar un presupuesto aprobado');
        return false;
      }

      if (!window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
        return false;
      }

      setPresupuestos(prev => prev.filter(p => p.id !== id));
      toast.success('Presupuesto eliminado');
      return true;
    },
    [presupuestos, setPresupuestos]
  );

  return {
    presupuestos,
    getPresupuestosByTrabajo,
    getUltimaVersion,
    createPresupuesto,
    updatePresupuestoEstado,
    deletePresupuesto,
    setPresupuestos
  };
}
