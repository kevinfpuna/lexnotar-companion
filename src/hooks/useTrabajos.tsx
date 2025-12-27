import { useCallback } from 'react';
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
  areAllItemsCompleted 
} from '@/lib/calculations';
import { TrabajoFormData, ItemFormData } from '@/lib/validations';
import { useLocalStorage } from './useLocalStorage';

export function useTrabajos() {
  const [trabajos, setTrabajos] = useLocalStorage<Trabajo[]>('lexnotar_trabajos', initialTrabajos);
  const [items, setItems] = useLocalStorage<Item[]>('lexnotar_items', initialItems);
  const [tiposTrabajo, setTiposTrabajo] = useLocalStorage<TipoTrabajo[]>('lexnotar_tipos_trabajo', tiposTrabajoMock);

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
    toast.success('Trabajo creado exitosamente');
    return newTrabajo;
  }, [tiposTrabajo, setTrabajos, setItems]);

  const updateTrabajo = useCallback(async (id: string, data: Partial<Trabajo>): Promise<void> => {
    setTrabajos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...data, fechaUltimaActualizacion: new Date() }
        : t
    ));
    
    toast.success('Trabajo actualizado exitosamente');
  }, [setTrabajos]);

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
    
    toast.success('Estado actualizado');
  }, [trabajos, items, setTrabajos]);

  const addItem = useCallback(async (trabajoId: string, data: ItemFormData): Promise<Item> => {
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
    
    toast.success('Paso agregado exitosamente');
    return newItem;
  }, [items, setItems, setTrabajos]);

  const updateItem = useCallback(async (itemId: string, data: Partial<Item>): Promise<void> => {
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
    
    toast.success('Paso actualizado');
  }, [items, setItems, setTrabajos]);

  const updateItemEstado = useCallback(async (itemId: string, estado: EstadoItem): Promise<void> => {
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
    
    toast.success('Estado actualizado');
  }, [items, setItems]);

  const deleteItem = useCallback(async (itemId: string, pagos: { itemId?: string }[]): Promise<boolean> => {
    const hasPagos = pagos.some(p => p.itemId === itemId);
    
    if (hasPagos) {
      toast.error('No se puede eliminar: el paso tiene pagos asociados');
      return false;
    }
    
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
    
    toast.success('Paso eliminado');
    return true;
  }, [items, setItems, setTrabajos]);

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
  }, [items, setTrabajos]);

  // ✅ Delete trabajo with validations
  const deleteTrabajo = useCallback(async (
    id: string,
    pagosDelTrabajo: { id: string; trabajoId: string }[],
    updateClienteDeuda?: (clienteId: string, deuda: number) => void
  ): Promise<boolean> => {
    const trabajo = trabajos.find(t => t.id === id);
    if (!trabajo) {
      toast.error('Trabajo no encontrado');
      return false;
    }

    const trabajoItems = items.filter(i => i.trabajoId === id);

    // ✅ VALIDACIÓN 1: No eliminar si hay ítems con saldo pendiente
    const itemsConSaldo = trabajoItems.filter(i => i.saldo > 0);
    if (itemsConSaldo.length > 0) {
      toast.error(
        `No se puede eliminar: hay ${itemsConSaldo.length} ítem(s) con saldo pendiente`,
        {
          description: 'Debes completar o eliminar los pagos primero',
          duration: 5000
        }
      );
      return false;
    }

    // ✅ VALIDACIÓN 2: No eliminar si tiene pagos registrados
    if (pagosDelTrabajo.length > 0) {
      toast.error(
        'No se puede eliminar: el trabajo tiene pagos registrados',
        {
          description: `Total de pagos: ${pagosDelTrabajo.length}`,
          duration: 5000
        }
      );
      return false;
    }

    // ✅ VALIDACIÓN 3: Confirmar con el usuario
    const confirmado = window.confirm(
      `¿Estás seguro de eliminar el trabajo "${trabajo.nombreTrabajo}"?\n\n` +
      `Esto eliminará:\n` +
      `- ${trabajoItems.length} ítems\n` +
      `- Eventos relacionados\n` +
      `- Documentos vinculados\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmado) return false;

    // Eliminar en cascada
    // 1. Eliminar ítems
    setItems(prev => prev.filter(i => i.trabajoId !== id));

    // 2. Eliminar el trabajo
    setTrabajos(prev => prev.filter(t => t.id !== id));

    // 3. Recalcular deuda del cliente
    if (updateClienteDeuda) {
      const clienteTrabajos = trabajos.filter(
        t => t.clienteId === trabajo.clienteId && t.id !== id
      );
      const deudaTotal = clienteTrabajos.reduce((sum, t) => sum + t.saldoPendiente, 0);
      updateClienteDeuda(trabajo.clienteId, deudaTotal);
    }

    toast.success('Trabajo eliminado exitosamente');
    return true;
  }, [trabajos, items, setTrabajos, setItems]);

  return {
    trabajos,
    items,
    tiposTrabajo,
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
    deleteTrabajo,
    recalculateTrabajo,
    setItems,
    setTrabajos,
    setTiposTrabajo,
  };
}
