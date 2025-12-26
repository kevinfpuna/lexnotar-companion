import { useCallback } from 'react';
import { Pago } from '@/types';
import { pagosMock as initialPagos } from '@/lib/mockData';
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
    onUpdateTrabajo?: (trabajoId: string, monto: number, itemId?: string) => void
  ): Promise<Pago> => {
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
    
    // Callback to update trabajo/item balances
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
    
    // Callback to update trabajo/item balances (negative to reverse)
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
