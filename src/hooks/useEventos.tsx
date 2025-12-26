import { useState, useCallback } from 'react';
import { EventoCalendario } from '@/types';
import { eventosMock as initialEventos } from '@/lib/mockData';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';
import { EventoFormData } from '@/lib/validations';

export function useEventos() {
  const [eventos, setEventos] = useState<EventoCalendario[]>(initialEventos);
  const [isLoading, setIsLoading] = useState(false);

  const getEventosByTrabajoId = useCallback((trabajoId: string) => {
    return eventos.filter(e => e.trabajoId === trabajoId);
  }, [eventos]);

  const getEventosByDateRange = useCallback((start: Date, end: Date) => {
    return eventos.filter(e => e.fechaEvento >= start && e.fechaEvento <= end);
  }, [eventos]);

  const getUpcomingEventos = useCallback((days: number = 7) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return eventos.filter(e => e.fechaEvento >= now && e.fechaEvento <= future);
  }, [eventos]);

  const createEvento = useCallback(async (data: EventoFormData): Promise<EventoCalendario> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newEvento: EventoCalendario = {
      id: generateId(),
      trabajoId: data.trabajoId || undefined,
      tituloEvento: data.tituloEvento,
      tipoEvento: data.tipoEvento,
      fechaEvento: data.fechaEvento,
      descripcion: data.descripcion || '',
      recordatorioHorasAntes: data.recordatorioHorasAntes,
      fechaCreacion: new Date(),
    };
    
    setEventos(prev => [...prev, newEvento]);
    setIsLoading(false);
    toast.success('Evento creado exitosamente');
    return newEvento;
  }, []);

  const updateEvento = useCallback(async (id: string, data: Partial<EventoFormData & Pick<EventoCalendario, 'recordatorioMostrado' | 'fechaEvento'>>): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setEventos(prev => prev.map(e => 
      e.id === id ? { ...e, ...data } : e
    ));
    
    setIsLoading(false);
    // Only show toast for user-initiated updates, not for recordatorio updates
    if (!('recordatorioMostrado' in data)) {
      toast.success('Evento actualizado');
    }
  }, []);

  const deleteEvento = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setEventos(prev => prev.filter(e => e.id !== id));
    
    setIsLoading(false);
    toast.success('Evento eliminado');
    return true;
  }, []);

  return {
    eventos,
    isLoading,
    getEventosByTrabajoId,
    getEventosByDateRange,
    getUpcomingEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    setEventos,
  };
}
