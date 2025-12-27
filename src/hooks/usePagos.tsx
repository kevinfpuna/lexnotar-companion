import { useCallback } from 'react';
import { Pago, Trabajo, Item } from '@/types';
import { pagosMock as initialPagos, formatCurrency } from '@/lib/mockData';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';
import { PagoFormData } from '@/lib/validations';
import { useLocalStorage } from './useLocalStorage';

export function usePagos() {
  const [pagos, setPagos] = useLocalStorage<Pago[]>('lexnotar_pagos', initialPagos);

  const getPagosByTrabajoId = useCallback((trabajoId: string) => {
    return pagos.filter(p => p.trabajoId === trabajoId);
  }, [pagos]);

  const getPagosByItemId = useCallback((itemId: string) => {
    return pagos.filter(p => p.itemId === itemId);
  }, [pagos]);

  const createPago = useCallback(async (
    data: PagoFormData,
    onUpdateTrabajo?: (trabajoId: string, monto: number, itemId?: string) => void,
    trabajos?: Trabajo[],
    items?: Item[]
  ): Promise<Pago> => {
    // Validar que el trabajo existe si se proporcionan trabajos
    if (trabajos) {
      const trabajo = trabajos.find(t => t.id === data.trabajoId);
      if (!trabajo) {
        toast.error('Trabajo no encontrado');
        throw new Error('Trabajo no encontrado');
      }

      // Validar saldo disponible
      let saldoDisponible = trabajo.saldoPendiente;
      let itemAfectado: Item | undefined;

      if (data.itemId && items) {
        itemAfectado = items.find(i => i.id === data.itemId);
        if (!itemAfectado) {
          toast.error('Ítem no encontrado');
          throw new Error('Ítem no encontrado');
        }
        saldoDisponible = itemAfectado.saldo;
      }

      // ✅ VALIDACIÓN: Pago no debe exceder saldo
      if (data.monto > saldoDisponible) {
        toast.error(
          `El monto (${formatCurrency(data.monto)}) excede el saldo disponible (${formatCurrency(saldoDisponible)})`,
          { duration: 5000 }
        );
        throw new Error('Monto excede saldo disponible');
      }
    }

    const newPago: Pago = {
      id: generateId(),
      trabajoId: data.trabajoId,
      itemId: data.itemId || undefined,
      monto: data.monto,
      fechaPago: data.fechaPago,
      metodoPago: data.metodoPago,
      referenciaPago: data.referenciaPago || '',
      notasPago: data.notasPago || '',
      fechaRegistro: new Date(),
    };
    
    setPagos(prev => [...prev, newPago]);
    
    // ✅ RECALCULAR en cascada
    if (onUpdateTrabajo) {
      onUpdateTrabajo(data.trabajoId, data.monto, data.itemId);
    }
    
    toast.success('Pago registrado exitosamente');
    return newPago;
  }, [setPagos]);

  const deletePago = useCallback(async (
    pagoId: string,
    onUpdateTrabajo?: (trabajoId: string, monto: number, itemId?: string) => void
  ): Promise<boolean> => {
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) {
      toast.error('Pago no encontrado');
      return false;
    }
    
    setPagos(prev => prev.filter(p => p.id !== pagoId));
    
    // ✅ RECALCULAR en cascada (monto negativo para revertir)
    if (onUpdateTrabajo) {
      onUpdateTrabajo(pago.trabajoId, -pago.monto, pago.itemId);
    }
    
    toast.success('Pago eliminado exitosamente');
    return true;
  }, [pagos, setPagos]);

  return {
    pagos,
    getPagosByTrabajoId,
    getPagosByItemId,
    createPago,
    deletePago,
    setPagos,
  };
}
