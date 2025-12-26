import { useCallback } from 'react';
import { Cliente, TipoCliente } from '@/types';
import { 
  clientesMock as initialClientes, 
  tiposClienteMock,
} from '@/lib/mockData';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';
import { ClienteFormData } from '@/lib/validations';
import { useLocalStorage } from './useLocalStorage';

export function useClientes() {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('lexnotar_clientes', initialClientes);
  const [tiposCliente, setTiposCliente] = useLocalStorage<TipoCliente[]>('lexnotar_tipos_cliente', tiposClienteMock);

  const getClienteById = useCallback((id: string) => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  const getTipoClienteById = useCallback((id: string) => {
    return tiposCliente.find(t => t.id === id);
  }, [tiposCliente]);

  const createCliente = useCallback(async (data: ClienteFormData): Promise<Cliente> => {
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
    toast.success('Cliente creado exitosamente');
    return newCliente;
  }, [setClientes]);

  const updateCliente = useCallback(async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { 
            ...c, 
            ...data,
            fechaUltimaActualizacion: new Date() 
          }
        : c
    ));
    
    toast.success('Cliente actualizado exitosamente');
  }, [setClientes]);

  const toggleClienteEstado = useCallback(async (id: string, trabajos: { clienteId: string; estado: string }[]): Promise<boolean> => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) {
      toast.error('Cliente no encontrado');
      return false;
    }

    // If trying to deactivate, check for active trabajos
    if (cliente.estado === 'activo') {
      const trabajosActivos = trabajos.filter(
        t => t.clienteId === id && 
        (t.estado === 'En proceso' || t.estado === 'Pendiente')
      );
      if (trabajosActivos.length > 0) {
        toast.error('No se puede desactivar: el cliente tiene trabajos activos');
        return false;
      }
    }
    
    const newEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { ...c, estado: newEstado, fechaUltimaActualizacion: new Date() }
        : c
    ));
    
    toast.success(`Cliente ${newEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    return true;
  }, [clientes, setClientes]);

  const updateClienteDeuda = useCallback((id: string, deuda: number) => {
    setClientes(prev => prev.map(c => 
      c.id === id 
        ? { ...c, deudaTotalActual: deuda, fechaUltimaActualizacion: new Date() }
        : c
    ));
  }, [setClientes]);

  return {
    clientes,
    tiposCliente,
    getClienteById,
    getTipoClienteById,
    createCliente,
    updateCliente,
    toggleClienteEstado,
    updateClienteDeuda,
    setClientes,
    setTiposCliente,
  };
}
