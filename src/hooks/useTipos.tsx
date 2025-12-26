import { TipoCliente, TipoTrabajo, EstadoItem } from '@/types';
import { tiposClienteMock, tiposTrabajoMock } from '@/lib/mockData';
import { useLocalStorage } from './useLocalStorage';

// Estados de Kanban por defecto (los dos primeros y último son fijos)
export const estadosKanbanDefault: { id: EstadoItem; nombre: string; color: string; fijo: boolean }[] = [
  { id: 'Pendiente', nombre: 'Pendiente', color: 'bg-slate-100 text-slate-800 border-slate-200', fijo: true },
  { id: 'En proceso', nombre: 'En proceso', color: 'bg-blue-100 text-blue-800 border-blue-200', fijo: false },
  { id: 'Mesa entrada', nombre: 'Mesa entrada', color: 'bg-amber-100 text-amber-800 border-amber-200', fijo: false },
  { id: 'Mesa salida', nombre: 'Mesa salida', color: 'bg-orange-100 text-orange-800 border-orange-200', fijo: false },
  { id: 'Listo retirar', nombre: 'Listo retirar', color: 'bg-purple-100 text-purple-800 border-purple-200', fijo: false },
  { id: 'Completado', nombre: 'Completado', color: 'bg-green-100 text-green-800 border-green-200', fijo: true },
];

export interface EstadoKanban {
  id: string;
  nombre: string;
  color: string;
  fijo: boolean;
  orden: number;
}

export function useTipos() {
  const [tiposCliente, setTiposCliente] = useLocalStorage<TipoCliente[]>('lexnotar_tipos_cliente', tiposClienteMock);
  const [tiposTrabajo, setTiposTrabajo] = useLocalStorage<TipoTrabajo[]>('lexnotar_tipos_trabajo_config', tiposTrabajoMock);
  const [estadosKanban, setEstadosKanban] = useLocalStorage<EstadoKanban[]>(
    'lexnotar_estados_kanban',
    estadosKanbanDefault.map((e, idx) => ({ ...e, id: e.id, orden: idx }))
  );

  // CRUD Tipos de Cliente
  const addTipoCliente = (tipo: Omit<TipoCliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const newTipo: TipoCliente = {
      ...tipo,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    setTiposCliente(prev => [...prev, newTipo]);
    return newTipo;
  };

  const updateTipoCliente = (id: string, updates: Partial<TipoCliente>) => {
    setTiposCliente(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, fechaActualizacion: new Date() } : t
    ));
  };

  const toggleTipoClienteActivo = (id: string) => {
    setTiposCliente(prev => prev.map(t => 
      t.id === id ? { ...t, activo: !t.activo, fechaActualizacion: new Date() } : t
    ));
  };

  const deleteTipoCliente = (id: string) => {
    setTiposCliente(prev => prev.filter(t => t.id !== id));
  };

  // CRUD Tipos de Trabajo
  const addTipoTrabajo = (tipo: Omit<TipoTrabajo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const newTipo: TipoTrabajo = {
      ...tipo,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    setTiposTrabajo(prev => [...prev, newTipo]);
    return newTipo;
  };

  const updateTipoTrabajo = (id: string, updates: Partial<TipoTrabajo>) => {
    setTiposTrabajo(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, fechaActualizacion: new Date() } : t
    ));
  };

  const toggleTipoTrabajoActivo = (id: string) => {
    setTiposTrabajo(prev => prev.map(t => 
      t.id === id ? { ...t, activo: !t.activo, fechaActualizacion: new Date() } : t
    ));
  };

  const deleteTipoTrabajo = (id: string) => {
    setTiposTrabajo(prev => prev.filter(t => t.id !== id));
  };

  const cloneTipoTrabajo = (id: string) => {
    const original = tiposTrabajo.find(t => t.id === id);
    if (!original) return null;
    
    const clone: TipoTrabajo = {
      ...original,
      id: Date.now().toString(),
      nombre: `${original.nombre} (copia)`,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    setTiposTrabajo(prev => [...prev, clone]);
    return clone;
  };

  // CRUD Estados Kanban
  const addEstadoKanban = (nombre: string, color: string) => {
    const newEstado: EstadoKanban = {
      id: Date.now().toString(),
      nombre,
      color,
      fijo: false,
      orden: estadosKanban.length - 1, // Antes de "Completado"
    };
    // Insertar antes del último (Completado)
    setEstadosKanban(prev => {
      const withoutLast = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      return [...withoutLast, newEstado, { ...last, orden: prev.length }];
    });
    return newEstado;
  };

  const updateEstadoKanban = (id: string, updates: Partial<EstadoKanban>) => {
    setEstadosKanban(prev => prev.map(e => 
      e.id === id && !e.fijo ? { ...e, ...updates } : e
    ));
  };

  const deleteEstadoKanban = (id: string) => {
    const estado = estadosKanban.find(e => e.id === id);
    if (estado?.fijo) return; // No eliminar estados fijos
    setEstadosKanban(prev => prev.filter(e => e.id !== id).map((e, idx) => ({ ...e, orden: idx })));
  };

  const reorderEstadosKanban = (newOrder: EstadoKanban[]) => {
    // Mantener Pendiente primero y Completado último
    const pendiente = newOrder.find(e => e.id === 'Pendiente');
    const completado = newOrder.find(e => e.id === 'Completado');
    const others = newOrder.filter(e => e.id !== 'Pendiente' && e.id !== 'Completado');
    
    if (pendiente && completado) {
      setEstadosKanban([pendiente, ...others, completado].map((e, idx) => ({ ...e, orden: idx })));
    }
  };

  return {
    // Tipos Cliente
    tiposCliente,
    addTipoCliente,
    updateTipoCliente,
    toggleTipoClienteActivo,
    deleteTipoCliente,
    
    // Tipos Trabajo
    tiposTrabajo,
    addTipoTrabajo,
    updateTipoTrabajo,
    toggleTipoTrabajoActivo,
    deleteTipoTrabajo,
    cloneTipoTrabajo,
    
    // Estados Kanban
    estadosKanban,
    addEstadoKanban,
    updateEstadoKanban,
    deleteEstadoKanban,
    reorderEstadosKanban,
    
    // Setters for backup
    setTiposCliente,
    setTiposTrabajo,
    setEstadosKanban,
  };
}
