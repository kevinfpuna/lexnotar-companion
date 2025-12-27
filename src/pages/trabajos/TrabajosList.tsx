import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  Calendar,
  ArrowUpRight,
  X,
  Trash2
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { TrabajoForm } from '@/components/forms/TrabajoForm';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { EstadoTrabajo } from '@/types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

const estadoOptions: EstadoTrabajo[] = ['Borrador', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'];

export default function TrabajosList() {
  const navigate = useNavigate();
  const { 
    trabajos, 
    clientes,
    tiposTrabajo,
    pagos,
    getClienteById,
    getTipoTrabajoById,
    getItemsByTrabajoId,
    createTrabajo,
    deleteTrabajo,
    setClientes,
    isLoading
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
      
      // Filtro de rango de fechas
      let matchesDateRange = true;
      if (dateRange?.from) {
        const trabajoDate = new Date(trabajo.fechaInicio);
        if (dateRange.to) {
          matchesDateRange = isWithinInterval(trabajoDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to)
          });
        } else {
          matchesDateRange = trabajoDate >= startOfDay(dateRange.from);
        }
      }

      return matchesSearch && matchesTipo && matchesEstado && matchesDateRange;
    });
  }, [trabajos, searchQuery, tipoFilter, estadoFilter, dateRange, getClienteById]);

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

  const handleDeleteTrabajo = async (e: React.MouseEvent, trabajoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trabajoPagos = pagos.filter(p => p.trabajoId === trabajoId);
    await deleteTrabajo(trabajoId, trabajoPagos, (clienteId, deuda) => {
      setClientes(prev => prev.map(c => 
        c.id === clienteId ? { ...c, deudaTotalActual: deuda } : c
      ));
    });
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
        <div className="flex gap-2 flex-wrap">
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
          
          {/* Filtro de rango de fechas */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yy", { locale: es })} -{" "}
                      {format(dateRange.to, "dd/MM/yy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: es })
                  )
                ) : (
                  <span>Rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          
          {dateRange && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDateRange(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros activos */}
      {(tipoFilter !== 'all' || estadoFilter !== 'all' || dateRange) && (
        <div className="flex gap-2 flex-wrap">
          {tipoFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {tiposTrabajo.find(t => t.id === tipoFilter)?.nombre}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setTipoFilter('all')} />
            </Badge>
          )}
          {estadoFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Estado: {estadoFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setEstadoFilter('all')} />
            </Badge>
          )}
          {dateRange && (
            <Badge variant="secondary" className="gap-1">
              Fechas: {dateRange.from && format(dateRange.from, "dd/MM/yy")}
              {dateRange.to && ` - ${format(dateRange.to, "dd/MM/yy")}`}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange(undefined)} />
            </Badge>
          )}
        </div>
      )}

      {/* Works list */}
      <div className="space-y-3">
        {filteredTrabajos.map((trabajo) => {
          const cliente = getClienteById(trabajo.clienteId);
          const tipoTrabajo = getTipoTrabajoById(trabajo.tipoTrabajoId);
          const progress = calculateProgress(trabajo.id);
          const items = getItemsByTrabajoId(trabajo.id);

          return (
            <Link
              key={trabajo.id}
              to={`/trabajos/${trabajo.id}`}
              className="card-elevated p-4 md:p-5 block hover:shadow-elevated transition-shadow group"
            >
              <div className="flex flex-col gap-3">
                {/* Top row: Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {trabajo.nombreTrabajo}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {cliente?.nombreCompleto} • {tipoTrabajo?.nombre}
                    </p>
                  </div>
                  <StatusBadge status={trabajo.estado} />
                </div>

                {/* Middle row: Progress (mobile visible) */}
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium whitespace-nowrap">{progress}%</span>
                </div>

                {/* Bottom row: Dates + Financial */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{formatDate(trabajo.fechaInicio)}</span>
                      <span className="sm:hidden">{formatDate(trabajo.fechaInicio)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(trabajo.fechaFinEstimada)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {trabajo.saldoPendiente > 0 && (
                      <span className="font-semibold text-destructive">
                        {formatCurrency(trabajo.saldoPendiente)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteTrabajo(e, trabajo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
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