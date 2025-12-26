import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  User,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { ClienteForm } from '@/components/forms/ClienteForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { formatCurrency } from '@/lib/mockData';
import { Cliente } from '@/types';

const clienteTypeIcons: Record<string, typeof User> = {
  'Persona Física': User,
  'Empresa': Building2,
  'Extranjero': Globe,
};

export default function ClientesList() {
  const { 
    clientes, 
    tiposCliente,
    createCliente,
    updateCliente,
    toggleClienteEstado,
    getTrabajosByClienteId,
    getTipoClienteById,
    isLoading 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [togglingClienteId, setTogglingClienteId] = useState<string | null>(null);

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        cliente.nombreCompleto.toLowerCase().includes(searchLower) ||
        cliente.documentoIdentidad.toLowerCase().includes(searchLower) ||
        cliente.email.toLowerCase().includes(searchLower) ||
        cliente.telefono.includes(searchQuery);

      const matchesTipo = tipoFilter === 'all' || cliente.tipoClienteId === tipoFilter;
      const matchesEstado = estadoFilter === 'all' || cliente.estado === estadoFilter;

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [clientes, searchQuery, tipoFilter, estadoFilter]);

  const handleOpenEdit = (cliente: Cliente, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCliente(cliente);
    setClienteFormOpen(true);
  };

  const handleToggleEstado = async (clienteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTogglingClienteId(clienteId);
  };

  const confirmToggleEstado = async () => {
    if (togglingClienteId) {
      await toggleClienteEstado(togglingClienteId);
      setTogglingClienteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setClienteFormOpen(open);
    if (!open) setEditingCliente(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingCliente) {
      await updateCliente(editingCliente.id, data);
    } else {
      await createCliente(data);
    }
    setClienteFormOpen(false);
    setEditingCliente(null);
  };

  const clienteToToggle = togglingClienteId ? clientes.find(c => c.id === togglingClienteId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            {clientes.length} clientes registrados
          </p>
        </div>
        <Button onClick={() => setClienteFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, documento, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tiposCliente.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClientes.map((cliente) => {
          const tipoCliente = getTipoClienteById(cliente.tipoClienteId);
          const trabajos = getTrabajosByClienteId(cliente.id);
          const trabajosActivos = trabajos.filter(t => t.estado === 'En proceso' || t.estado === 'Pendiente').length;
          const IconComponent = tipoCliente ? clienteTypeIcons[tipoCliente.nombre] || User : User;

          return (
            <Link
              key={cliente.id}
              to={`/clientes/${cliente.id}`}
              className="card-elevated p-5 hover:shadow-elevated transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {cliente.nombreCompleto}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tipoCliente?.nombre} • {cliente.documentoIdentidad}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleOpenEdit(cliente, e)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/clientes/${cliente.id}`}>Ver trabajos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => handleToggleEstado(cliente.id, e)}
                      className={cliente.estado === 'activo' ? 'text-destructive' : 'text-success'}
                    >
                      {cliente.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {trabajosActivos > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {trabajosActivos} trabajo{trabajosActivos > 1 ? 's' : ''} activo{trabajosActivos > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge 
                    variant={cliente.estado === 'activo' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {cliente.estado}
                  </Badge>
                </div>
                {cliente.deudaTotalActual > 0 && (
                  <span className="text-sm font-semibold text-destructive">
                    {formatCurrency(cliente.deudaTotalActual)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}

      {/* Cliente Form Dialog */}
      <ClienteForm
        open={clienteFormOpen}
        onOpenChange={handleFormClose}
        tiposCliente={tiposCliente}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        defaultValues={editingCliente || undefined}
        mode={editingCliente ? 'edit' : 'create'}
      />

      {/* Toggle Estado Confirmation */}
      <DeleteConfirmDialog
        open={!!togglingClienteId}
        onOpenChange={(open) => !open && setTogglingClienteId(null)}
        title={clienteToToggle?.estado === 'activo' ? 'Desactivar cliente' : 'Activar cliente'}
        description={
          clienteToToggle?.estado === 'activo'
            ? '¿Estás seguro de desactivar este cliente? No podrás crear nuevos trabajos para él.'
            : '¿Estás seguro de activar este cliente?'
        }
        onConfirm={confirmToggleEstado}
        isLoading={isLoading}
        confirmText={clienteToToggle?.estado === 'activo' ? 'Desactivar' : 'Activar'}
      />
    </div>
  );
}