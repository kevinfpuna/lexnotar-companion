import { useLocalStorage } from './useLocalStorage';
import { TipoDocumento } from '@/types';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';

const tiposDocumentoDefault: TipoDocumento[] = [
  { id: '1', nombre: 'CI', descripcion: 'Cédula de Identidad', activo: true, orden: 0, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '2', nombre: 'Poder', descripcion: 'Poderes generales o especiales', activo: true, orden: 1, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '3', nombre: 'Título', descripcion: 'Títulos de propiedad', activo: true, orden: 2, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '4', nombre: 'Contrato', descripcion: 'Contratos diversos', activo: true, orden: 3, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '5', nombre: 'Presupuesto', descripcion: 'Presupuestos generados', activo: true, orden: 4, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '6', nombre: 'Acta', descripcion: 'Actas notariales', activo: true, orden: 5, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '7', nombre: 'Sentencia', descripcion: 'Sentencias judiciales', activo: true, orden: 6, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '8', nombre: 'Comprobante pago', descripcion: 'Comprobantes de pago', activo: true, orden: 7, fechaCreacion: new Date(), fechaActualizacion: new Date() },
  { id: '9', nombre: 'Otro', descripcion: 'Otros documentos', activo: true, orden: 8, fechaCreacion: new Date(), fechaActualizacion: new Date() },
];

export function useTiposDocumento() {
  const [tiposDocumento, setTiposDocumento] = useLocalStorage<TipoDocumento[]>('lexnotar_tipos_documento', tiposDocumentoDefault);

  const addTipoDocumento = useCallback((nombre: string, descripcion: string) => {
    const newTipo: TipoDocumento = {
      id: generateId(),
      nombre,
      descripcion,
      activo: true,
      orden: tiposDocumento.length,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    setTiposDocumento(prev => [...prev, newTipo]);
    toast.success('Tipo de documento creado');
    return newTipo;
  }, [tiposDocumento.length, setTiposDocumento]);

  const updateTipoDocumento = useCallback((id: string, updates: Partial<TipoDocumento>) => {
    setTiposDocumento(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, fechaActualizacion: new Date() } : t
    ));
    toast.success('Tipo de documento actualizado');
  }, [setTiposDocumento]);

  const toggleTipoDocumentoActivo = useCallback((id: string) => {
    setTiposDocumento(prev => prev.map(t =>
      t.id === id ? { ...t, activo: !t.activo, fechaActualizacion: new Date() } : t
    ));
  }, [setTiposDocumento]);

  const deleteTipoDocumento = useCallback((id: string) => {
    setTiposDocumento(prev =>
      prev.filter(t => t.id !== id).map((t, idx) => ({ ...t, orden: idx }))
    );
    toast.success('Tipo de documento eliminado');
  }, [setTiposDocumento]);

  return {
    tiposDocumento,
    addTipoDocumento,
    updateTipoDocumento,
    toggleTipoDocumentoActivo,
    deleteTipoDocumento,
    setTiposDocumento,
  };
}
