import { useMemo } from 'react';
import { Trabajo, Item } from '@/types';
import { useConfiguracion } from './useConfiguracion';
import { differenceInDays, isPast } from 'date-fns';

export interface Vencimiento {
  id: string;
  tipo: 'trabajo' | 'item';
  titulo: string;
  fechaVencimiento: Date;
  estado: 'vencido' | 'proximo' | 'urgente';
  diasRestantes: number;
  trabajoId?: string;
  itemId?: string;
}

export function useVencimientos(trabajos: Trabajo[], items: Item[]) {
  const { config } = useConfiguracion();

  const vencimientos = useMemo(() => {
    const hoy = new Date();
    const resultado: Vencimiento[] = [];

    // Vencimientos de trabajos
    trabajos
      .filter(t => 
        t.fechaFinEstimada && 
        t.estado !== 'Completado' && 
        t.estado !== 'Cancelado'
      )
      .forEach(trabajo => {
        const fechaVencimiento = new Date(trabajo.fechaFinEstimada);
        const diasRestantes = differenceInDays(fechaVencimiento, hoy);
        
        let estado: Vencimiento['estado'];
        if (isPast(fechaVencimiento) && diasRestantes < 0) {
          estado = 'vencido';
        } else if (diasRestantes <= 1) {
          estado = 'urgente';
        } else if (diasRestantes <= config.diasAlerta) {
          estado = 'proximo';
        } else {
          return;
        }

        resultado.push({
          id: trabajo.id,
          tipo: 'trabajo',
          titulo: trabajo.nombreTrabajo,
          fechaVencimiento,
          estado,
          diasRestantes,
          trabajoId: trabajo.id,
        });
      });

    // Vencimientos de items
    items
      .filter(i => 
        i.fechaFinEstimada && 
        i.estado !== 'Completado'
      )
      .forEach(item => {
        const fechaVencimiento = new Date(item.fechaFinEstimada!);
        const diasRestantes = differenceInDays(fechaVencimiento, hoy);
        
        let estado: Vencimiento['estado'];
        if (isPast(fechaVencimiento) && diasRestantes < 0) {
          estado = 'vencido';
        } else if (diasRestantes <= 1) {
          estado = 'urgente';
        } else if (diasRestantes <= config.diasAlerta) {
          estado = 'proximo';
        } else {
          return;
        }

        resultado.push({
          id: item.id,
          tipo: 'item',
          titulo: item.nombreItem,
          fechaVencimiento,
          estado,
          diasRestantes,
          trabajoId: item.trabajoId,
          itemId: item.id,
        });
      });

    return resultado.sort((a, b) => 
      a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()
    );
  }, [trabajos, items, config.diasAlerta]);

  const vencidos = vencimientos.filter(v => v.estado === 'vencido');
  const urgentes = vencimientos.filter(v => v.estado === 'urgente');
  const proximos = vencimientos.filter(v => v.estado === 'proximo');

  return {
    vencimientos,
    vencidos,
    urgentes,
    proximos,
    totalVencimientos: vencimientos.length,
  };
}
