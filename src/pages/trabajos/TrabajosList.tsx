import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  Calendar,
  ArrowUpRight
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
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { TrabajoForm } from '@/components/forms/TrabajoForm';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { EstadoTrabajo } from '@/types';

const estadoOptions: EstadoTrabajo[] = ['Borrador', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'];

export default function TrabajosList() {
  const navigate = useNavigate();
  const { 
    trabajos, 
    clientes,
    tiposTrabajo,
    getClienteById,
    getTipoTrabajoById,
    getItemsByTrabajoId,
    createTrabajo,
    isLoading
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [trabajoFormOpen, setTrabajoFormOpen] = useState(false);

  const filteredTrabajos = useMemo(() => {
    return trabajos.filter((trabajo) => {
      const cliente = getClienteById(trabajo.clienteId);
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        trabajo.nombreTrabajo.toLowerCase().includes(searchLower) ||
        trabajo.descripcionTrabajo.toLowerCase().includes(searchLower) ||
        (cliente?.nombreCompleto.toLowerCase().includes(searchLower));

      const matchesTipo = tipoFilter === 'all' || trabajo.tipoTrabajoId === tipoFilter;
      const matchesEstado = estadoFilter === 'all' || trabajo.estado === estadoFilter;

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [trabajos, searchQuery, tipoFilter, estadoFilter, getClienteById]);

  const calculateProgress = (trabajoId: string): number => {
    const items = getItemsByTrabajoId(trabajoId);
    if (items.length === 0) return 0;
    const completed = items.filter(i => i.estado === 'Completado').length;
    return Math.round((completed / items.length) * 100);
  };

  const handleCreateTrabajo = async (data: any, items: any[]) => {
    const newTrabajo = await createTrabajo(data, items);
    setTrabajoFormOpen(false);
    navigate(`/trabajos/${newTrabajo.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Trabajos</h1>
          <p className="text-muted-foreground mt-1">
            {trabajos.length} trabajos en total
          </p>
        </div>
        <Button onClick={() => setTrabajoFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Trabajo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, descripción o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tiposTrabajo.map((tipo) => (
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
              {estadoOptions.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Works list */}
      <div className="space-y-4">
        {filteredTrabajos.map((trabajo) => {
          const cliente = getClienteById(trabajo.clienteId);
          const tipoTrabajo = getTipoTrabajoById(trabajo.tipoTrabajoId);
          const progress = calculateProgress(trabajo.id);
          const items = getItemsByTrabajoId(trabajo.id);

          return (
            <Link
              key={trabajo.id}
              to={`/trabajos/${trabajo.id}`}
              className="card-elevated p-5 block hover:shadow-elevated transition-shadow group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {trabajo.nombreTrabajo}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {cliente?.nombreCompleto} • {tipoTrabajo?.nombre}
                      </p>
                    </div>
                    <StatusBadge status={trabajo.estado} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                    {trabajo.descripcionTrabajo}
                  </p>
                </div>

                {/* Progress */}
                <div className="lg:w-48">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {items.filter(i => i.estado === 'Completado').length} de {items.length} pasos
                  </p>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 lg:gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(trabajo.fechaInicio)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(trabajo.fechaFinEstimada)}
                    </span>
                  </div>
                </div>

                {/* Financial */}
                <div className="flex items-center gap-4 lg:w-48 justify-between lg:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className={`font-semibold ${trabajo.saldoPendiente > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(trabajo.saldoPendiente)}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTrabajos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron trabajos</p>
        </div>
      )}

      {/* Trabajo Form Dialog */}
      <TrabajoForm
        open={trabajoFormOpen}
        onOpenChange={setTrabajoFormOpen}
        clientes={clientes}
        tiposTrabajo={tiposTrabajo}
        onSubmit={handleCreateTrabajo}
        isLoading={isLoading}
      />
    </div>
  );
}