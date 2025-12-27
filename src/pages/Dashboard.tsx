import { useState } from 'react';
import { 
  Wallet, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatCurrencyCompact, formatDate } from '@/lib/mockData';
import { TrabajoForm } from '@/components/forms/TrabajoForm';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import { VencimientosWidget } from '@/components/dashboard/VencimientosWidget';
import { IngresosChart } from '@/components/dashboard/IngresosChart';
import { TrabajosPorEstadoChart } from '@/components/dashboard/TrabajosPorEstadoChart';
import { DeudasClienteChart } from '@/components/dashboard/DeudasClienteChart';
import { PeriodFilter, PeriodOption } from '@/components/dashboard/PeriodFilter';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clientes, trabajos, eventos, tiposTrabajo, items, pagos, createTrabajo, isLoading } = useApp();
  const [trabajoFormOpen, setTrabajoFormOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<PeriodOption>('6m');

  // Get tipo trabajo by id helper
  const getTipoTrabajoById = (id: string) => tiposTrabajo.find(t => t.id === id);
  const getClienteById = (id: string) => clientes.find(c => c.id === id);

  // Calculate stats
  const deudaTotal = clientes.reduce((sum, c) => sum + c.deudaTotalActual, 0);
  const trabajosActivos = trabajos.filter(t => t.estado === 'En proceso').length;
  const trabajosPendientes = trabajos.filter(t => t.estado === 'Pendiente').length;
  const trabajosCompletadosMes = trabajos.filter(t => {
    if (t.estado !== 'Completado' || !t.fechaFinReal) return false;
    const now = new Date();
    return t.fechaFinReal.getMonth() === now.getMonth() && 
           t.fechaFinReal.getFullYear() === now.getFullYear();
  }).length;

  // Get upcoming events
  const today = new Date();
  const proximosEventos = eventos
    .filter(e => e.fechaEvento >= today)
    .sort((a, b) => a.fechaEvento.getTime() - b.fechaEvento.getTime())
    .slice(0, 5);

  // Recent works
  const trabajosRecientes = [...trabajos]
    .sort((a, b) => b.fechaUltimaActualizacion.getTime() - a.fechaUltimaActualizacion.getTime())
    .slice(0, 5);

  // Handle create trabajo
  const handleCreateTrabajo = async (data: any, customItems?: any[]) => {
    const newTrabajo = await createTrabajo(data, customItems);
    setTrabajoFormOpen(false);
    navigate(`/trabajos/${newTrabajo.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission Banner */}
      <NotificationPermissionBanner />

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenida de nuevo. Aquí está el resumen de tu escritorio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTrabajoFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Trabajo
          </Button>
        </div>
      </div>

      {/* Stats grid - Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => navigate('/pagos')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Deuda Total"
            value={formatCurrencyCompact(deudaTotal)}
            subtitle="Pendiente"
            icon={Wallet}
            variant="destructive"
          />
        </div>
        <div 
          onClick={() => navigate('/trabajos?estado=En proceso')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Activos"
            value={trabajosActivos}
            subtitle="En proceso"
            icon={Briefcase}
            variant="primary"
          />
        </div>
        <div 
          onClick={() => navigate('/trabajos?estado=Pendiente')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Pendientes"
            value={trabajosPendientes}
            subtitle="Por iniciar"
            icon={Clock}
            variant="warning"
          />
        </div>
        <div 
          onClick={() => navigate('/trabajos?estado=Completado')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Completados"
            value={trabajosCompletadosMes}
            subtitle="Este mes"
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Análisis</h2>
        <PeriodFilter value={chartPeriod} onChange={setChartPeriod} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IngresosChart pagos={pagos} period={chartPeriod} />
        </div>
        <TrabajosPorEstadoChart trabajos={trabajos} period={chartPeriod} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeudasClienteChart clientes={clientes} />
        
        {/* Upcoming events */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Próximos Eventos</h3>
                <p className="text-sm text-muted-foreground">
                  {proximosEventos.length} eventos programados
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendario">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay eventos próximos
              </p>
            ) : (
              proximosEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate('/calendario')}
                >
                  <p className="font-medium text-sm">{evento.tituloEvento}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(evento.fechaEvento)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {evento.tipoEvento}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vencimientos Widget */}
      <VencimientosWidget trabajos={trabajos} items={items} />

      {/* Recent works + Clients with debt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent works */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Trabajos Recientes</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trabajos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {trabajosRecientes.map((trabajo) => {
              const cliente = getClienteById(trabajo.clienteId);
              const tipoTrabajo = getTipoTrabajoById(trabajo.tipoTrabajoId);
              
              return (
                <Link
                  key={trabajo.id}
                  to={`/trabajos/${trabajo.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {trabajo.nombreTrabajo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente?.nombreCompleto} • {tipoTrabajo?.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge status={trabajo.estado} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Clients with debt - compact version */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold">Clientes con Saldo</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pagos">
                Ver cuentas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {clientes
              .filter(c => c.deudaTotalActual > 0)
              .sort((a, b) => b.deudaTotalActual - a.deudaTotalActual)
              .slice(0, 5)
              .map((cliente) => (
                <Link
                  key={cliente.id}
                  to={`/clientes/${cliente.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors"
                >
                  <p className="font-medium text-sm truncate">{cliente.nombreCompleto}</p>
                  <p className="text-sm font-bold text-destructive">
                    {formatCurrency(cliente.deudaTotalActual)}
                  </p>
                </Link>
              ))}
            {clientes.filter(c => c.deudaTotalActual > 0).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay clientes con deuda
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trabajo Form */}
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
