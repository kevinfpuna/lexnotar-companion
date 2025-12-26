import { useState, useCallback } from 'react';
import { Trabajo, Item, TipoTrabajo, EstadoTrabajo, EstadoItem } from '@/types';
import { 
  trabajosMock as initialTrabajos, 
  itemsMock as initialItems,
  tiposTrabajoMock 
} from '@/lib/mockData';
import { toast } from 'sonner';
import { 
  generateId, 
  calculateTrabajoTotals, 
  calculateTrabajoProgress,
  areAllItemsCompleted 
} from '@/lib/calculations';
import { TrabajoFormData, ItemFormData } from '@/lib/validations';

export function useTrabajos() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>(initialTrabajos);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [tiposTrabajo] = useState<TipoTrabajo[]>(tiposTrabajoMock);
  const [isLoading, setIsLoading] = useState(false);

  const getTrabajoById = useCallback((id: string) => {
    return trabajos.find(t => t.id === id);
  }, [trabajos]);

  const getTipoTrabajoById = useCallback((id: string) => {
    return tiposTrabajo.find(t => t.id === id);
  }, [tiposTrabajo]);

  const getItemsByTrabajoId = useCallback((trabajoId: string) => {
    return items.filter(i => i.trabajoId === trabajoId).sort((a, b) => a.numeroPaso - b.numeroPaso);
  }, [items]);

  const getTrabajosByClienteId = useCallback((clienteId: string) => {
    return trabajos.filter(t => t.clienteId === clienteId);
  }, [trabajos]);

  const createTrabajo = useCallback(async (
    data: TrabajoFormData,
    customItems?: Partial<Item>[]
  ): Promise<Trabajo> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tipoTrabajo = tiposTrabajo.find(t => t.id === data.tipoTrabajoId);
    const trabajoId = generateId();
    
    // Create items from template or custom
    const newItems: Item[] = customItems 
      ? customItems.map((item, index) => ({
          id: generateId(),
          trabajoId,
          numeroPaso: index + 1,
          nombreItem: item.nombreItem || '',
          descripcionItem: item.descripcionItem || '',
          estado: 'Pendiente' as EstadoItem,
          costoTotal: item.costoTotal || 0,
          pagado: 0,
          saldo: item.costoTotal || 0,
          diasEstimados: item.diasEstimados || 0,
          notasItem: '',
          documentosItem: [],
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        }))
      : (tipoTrabajo?.pasosPredefinidos || []).map((paso) => ({
          id: generateId(),
          trabajoId,
          numeroPaso: paso.numero,
          nombreItem: paso.nombre,
          descripcionItem: paso.descripcion,
          estado: paso.estadoInicial,
          costoTotal: 0,
          pagado: 0,
          saldo: 0,
          diasEstimados: paso.diasEstimados,
          notasItem: '',
          documentosItem: [],
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        }));

    const totals = calculateTrabajoTotals(newItems);
    
    const newTrabajo: Trabajo = {
      id: trabajoId,
      clienteId: data.clienteId,
      tipoTrabajoId: data.tipoTrabajoId,
      nombreTrabajo: data.nombreTrabajo,
      descripcionTrabajo: data.descripcionTrabajo || '',
      fechaInicio: data.fechaInicio,
      fechaFinEstimada: data.fechaFinEstimada,
      estado: 'Pendiente',
      presupuestoInicial: data.presupuestoInicial,
      costoFinal: totals.costoFinal || data.presupuestoInicial,
      pagadoTotal: 0,
      saldoPendiente: totals.costoFinal || data.presupuestoInicial,
      notasInternas: data.notasInternas || '',
      fechaCreacion: new Date(),
      fechaUltimaActualizacion: new Date(),
    };
    
    setTrabajos(prev => [...prev, newTrabajo]);
    setItems(prev => [...prev, ...newItems]);
    setIsLoading(false);
    toast.success('Trabajo creado exitosamente');
    return newTrabajo;
  }, [tiposTrabajo]);

  const updateTrabajo = useCallback(async (id: string, data: Partial<Trabajo>): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTrabajos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...data, fechaUltimaActualizacion: new Date() }
        : t
    ));
    
    setIsLoading(false);
    toast.success('Trabajo actualizado exitosamente');
  }, []);

  const updateTrabajoEstado = useCallback(async (id: string, estado: EstadoTrabajo): Promise<void> => {
    const trabajo = trabajos.find(t => t.id === id);
    const trabajoItems = items.filter(i => i.trabajoId === id);
    
    // Warnings for completion
    if (estado === 'Completado') {
      if (!areAllItemsCompleted(trabajoItems)) {
        toast.warning('Algunos pasos no están completados');
      }
      if (trabajo && trabajo.saldoPendiente > 0) {
        toast.warning('El trabajo tiene saldo pendiente');
      }
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updates: Partial<Trabajo> = { 
      estado,
      fechaUltimaActualizacion: new Date(),
    };
    
    if (estado === 'Completado') {
      updates.fechaFinReal = new Date();
    }
    
    setTrabajos(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
    
    setIsLoading(false);
    toast.success('Estado actualizado');
  }, [trabajos, items]);

  const addItem = useCallback(async (trabajoId: string, data: ItemFormData): Promise<Item> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trabajoItems = items.filter(i => i.trabajoId === trabajoId);
    const maxPaso = Math.max(0, ...trabajoItems.map(i => i.numeroPaso));
    
    const newItem: Item = {
      id: generateId(),
      trabajoId,
      numeroPaso: maxPaso + 1,
      nombreItem: data.nombreItem,
      descripcionItem: data.descripcionItem || '',
      estado: 'Pendiente',
      costoTotal: data.costoTotal,
      pagado: 0,
      saldo: data.costoTotal,
      diasEstimados: data.diasEstimados,
      notasItem: '',
      documentosItem: [],
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    
    setItems(prev => [...prev, newItem]);
    
    // Recalculate trabajo totals
    const allItems = [...items.filter(i => i.trabajoId === trabajoId), newItem];
    const totals = calculateTrabajoTotals(allItems);
    
    setTrabajos(prev => prev.map(t => 
      t.id === trabajoId 
        ? { ...t, ...totals, fechaUltimaActualizacion: new Date() }
        : t
    ));
    
    setIsLoading(false);
    toast.success('Paso agregado exitosamente');
    return newItem;
  }, [items]);

  const updateItem = useCallback(async (itemId: string, data: Partial<Item>): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let trabajoId = '';
    
    setItems(prev => prev.map(i => {
      if (i.id === itemId) {
        trabajoId = i.trabajoId;
        const newCostoTotal = data.costoTotal ?? i.costoTotal;
        return { 
          ...i, 
          ...data,
          saldo: newCostoTotal - i.pagado,
          fechaActualizacion: new Date() 
        };
      }
      return i;
    }));
    
    // Recalculate trabajo totals
    if (trabajoId) {
      const trabajoItems = items.filter(i => i.trabajoId === trabajoId);
      const totals = calculateTrabajoTotals(trabajoItems);
      
      setTrabajos(prev => prev.map(t => 
        t.id === trabajoId 
          ? { ...t, ...totals, fechaUltimaActualizacion: new Date() }
          : t
      ));
    }
    
    setIsLoading(false);
    toast.success('Paso actualizado');
  }, [items]);

  const updateItemEstado = useCallback(async (itemId: string, estado: EstadoItem): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const item = items.find(i => i.id === itemId);
    
    // Warning if completing with balance
    if (estado === 'Completado' && item && item.saldo > 0) {
      toast.warning('Este paso tiene saldo pendiente');
    }
    
    const updates: Partial<Item> = { 
      estado,
      fechaActualizacion: new Date(),
    };
    
    if (estado === 'Completado') {
      updates.fechaFinReal = new Date();
    }
    
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, ...updates } : i
    ));
    
    setIsLoading(false);
    toast.success('Estado actualizado');
  }, [items]);

  const deleteItem = useCallback(async (itemId: string, pagos: { itemId?: string }[]): Promise<boolean> => {
    const hasPagos = pagos.some(p => p.itemId === itemId);
    
    if (hasPagos) {
      toast.error('No se puede eliminar: el paso tiene pagos asociados');
      return false;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const item = items.find(i => i.id === itemId);
    const trabajoId = item?.trabajoId;
    
    setItems(prev => prev.filter(i => i.id !== itemId));
    
    // Recalculate trabajo totals
    if (trabajoId) {
      const remainingItems = items.filter(i => i.trabajoId === trabajoId && i.id !== itemId);
      const totals = calculateTrabajoTotals(remainingItems);
      
      setTrabajos(prev => prev.map(t => 
        t.id === trabajoId 
          ? { ...t, ...totals, fechaUltimaActualizacion: new Date() }
          : t
      ));
    }
    
    setIsLoading(false);
    toast.success('Paso eliminado');
    return true;
  }, [items]);

  // Update trabajo and client when payment is made
  const recalculateTrabajo = useCallback((trabajoId: string) => {
    const trabajoItems = items.filter(i => i.trabajoId === trabajoId);
    const totals = calculateTrabajoTotals(trabajoItems);
    
    setTrabajos(prev => prev.map(t => 
      t.id === trabajoId 
        ? { ...t, ...totals, fechaUltimaActualizacion: new Date() }
        : t
    ));
    
    return totals;
  }, [items]);

  return {
    trabajos,
    items,
    tiposTrabajo,
    isLoading,
    getTrabajoById,
    getTipoTrabajoById,
    getItemsByTrabajoId,
    getTrabajosByClienteId,
    createTrabajo,
    updateTrabajo,
    updateTrabajoEstado,
    addItem,
    updateItem,
    updateItemEstado,
    deleteItem,
    recalculateTrabajo,
    setItems,
    setTrabajos,
  };
}
