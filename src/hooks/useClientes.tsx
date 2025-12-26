import { useState, useCallback } from 'react';
import { Cliente, TipoCliente } from '@/types';
import { 
  clientesMock as initialClientes, 
  tiposClienteMock,
  trabajosMock 
} from '@/lib/mockData';
import { toast } from 'sonner';
import { generateId, canDeleteCliente } from '@/lib/calculations';
import { ClienteFormData } from '@/lib/validations';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [tiposCliente] = useState<TipoCliente[]>(tiposClienteMock);
  const [isLoading, setIsLoading] = useState(false);

  const getClienteById = useCallback((id: string) => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  const getTipoClienteById = useCallback((id: string) => {
    return tiposCliente.find(t => t.id === id);
  }, [tiposCliente]);

  const createCliente = useCallback(async (data: ClienteFormData): Promise<Cliente> => {
    setIsLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCliente: Cliente = {
      id: generateId(),
      tipoClienteId: data.tipoClienteId,
      nombreCompleto: data.nombreCompleto,
      documentoIdentidad: data.documentoIdentidad,
      telefono: data.telefono,
      email: data.email || '',
      domicilio: data.domicilio || '',
      datosCustom: data.datosCustom || {},
      notasInternas: data.notasInternas || '',
      deudaTotalActual: 0,
      fechaRegistro: new Date(),
      fechaUltimaActualizacion: new Date(),
      estado: 'activo',
    };
    
    setClientes(prev => [...prev, newCliente]);
    setIsLoading(false);
    toast.success('Cliente creado exitosamente');
    return newCliente;
  }, []);

  const updateCliente = useCallback(async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { 
            ...c, 
            ...data,
            fechaUltimaActualizacion: new Date() 
          }
        : c
    ));
    
    setIsLoading(false);
    toast.success('Cliente actualizado exitosamente');
  }, []);

  const toggleClienteEstado = useCallback(async (id: string): Promise<boolean> => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) {
      toast.error('Cliente no encontrado');
      return false;
    }

    // If trying to deactivate, check for active trabajos
    if (cliente.estado === 'activo') {
      if (!canDeleteCliente(id, trabajosMock)) {
        toast.error('No se puede desactivar: el cliente tiene trabajos activos');
        return false;
      }
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { ...c, estado: newEstado, fechaUltimaActualizacion: new Date() }
        : c
    ));
    
    setIsLoading(false);
    toast.success(`Cliente ${newEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    return true;
  }, [clientes]);

  const updateClienteDeuda = useCallback((id: string, deuda: number) => {
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { ...c, deudaTotalActual: deuda, fechaUltimaActualizacion: new Date() }
        : c
    ));
  }, []);

  return {
    clientes,
    tiposCliente,
    isLoading,
    getClienteById,
    getTipoClienteById,
    createCliente,
    updateCliente,
    toggleClienteEstado,
    updateClienteDeuda,
  };
}
