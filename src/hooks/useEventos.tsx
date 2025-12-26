import { useCallback } from 'react';
import { EventoCalendario } from '@/types';
import { eventosMock as initialEventos } from '@/lib/mockData';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';
import { EventoFormData } from '@/lib/validations';
import { useLocalStorage } from './useLocalStorage';

export function useEventos() {
  const [eventos, setEventos] = useLocalStorage<EventoCalendario[]>('lexnotar_eventos', initialEventos);

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
    const newEvento: EventoCalendario = {
      id: generateId(),
      trabajoId: data.trabajoId || undefined,
      tituloEvento: data.tituloEvento,
      tipoEvento: data.tipoEvento,
      fechaEvento: data.fechaEvento,
      descripcion: data.descripcion || '',
      recordatorioHorasAntes: data.recordatorioHorasAntes,
      recordatorioMostrado: false, // Inicializar en false
      fechaCreacion: new Date(),
    };
    
    setEventos(prev => [...prev, newEvento]);
    toast.success('Evento creado exitosamente');
    return newEvento;
  }, [setEventos]);

  const updateEvento = useCallback(async (id: string, data: Partial<EventoFormData & Pick<EventoCalendario, 'recordatorioMostrado' | 'fechaEvento'>>): Promise<void> => {
    setEventos(prev => prev.map(e => 
      e.id === id ? { ...e, ...data } : e
    ));
    
    // Only show toast for user-initiated updates, not for recordatorio updates
    if (!('recordatorioMostrado' in data)) {
      toast.success('Evento actualizado');
    }
  }, [setEventos]);

  const deleteEvento = useCallback(async (id: string): Promise<boolean> => {
    setEventos(prev => prev.filter(e => e.id !== id));
    toast.success('Evento eliminado');
    return true;
  }, [setEventos]);

  return {
    eventos,
    getEventosByTrabajoId,
    getEventosByDateRange,
    getUpcomingEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    setEventos,
  };
}
