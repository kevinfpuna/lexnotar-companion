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
import { formatCurrency, formatDate } from '@/lib/mockData';
import { TrabajoForm } from '@/components/forms/TrabajoForm';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clientes, trabajos, eventos, tiposTrabajo, createTrabajo, isLoading } = useApp();
  const [trabajoFormOpen, setTrabajoFormOpen] = useState(false);

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

  // Clients with debt
  const clientesConDeuda = clientes
    .filter(c => c.deudaTotalActual > 0)
    .sort((a, b) => b.deudaTotalActual - a.deudaTotalActual)
    .slice(0, 5);

  // Handle create trabajo
  const handleCreateTrabajo = async (data: any, customItems?: any[]) => {
    const newTrabajo = await createTrabajo(data, customItems);
    setTrabajoFormOpen(false);
    navigate(`/trabajos/${newTrabajo.id}`);
  };

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/pagos')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Deuda Total"
            value={formatCurrency(deudaTotal)}
            subtitle="Saldo pendiente de cobro"
            icon={Wallet}
            variant="destructive"
          />
        </div>
        <div 
          onClick={() => navigate('/trabajos?estado=En proceso')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Trabajos Activos"
            value={trabajosActivos}
            subtitle="En proceso actualmente"
            icon={Briefcase}
            variant="primary"
          />
        </div>
        <div 
          onClick={() => navigate('/trabajos?estado=Pendiente')}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
        >
          <StatCard
            title="Trabajos Pendientes"
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
            title="Completados este Mes"
            value={trabajosCompletadosMes}
            subtitle="Trabajos finalizados"
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent works */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Trabajos Recientes</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trabajos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {trabajosRecientes.map((trabajo) => {
              const cliente = getClienteById(trabajo.clienteId);
              const tipoTrabajo = getTipoTrabajoById(trabajo.tipoTrabajoId);
              
              return (
                <Link
                  key={trabajo.id}
                  to={`/trabajos/${trabajo.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {trabajo.nombreTrabajo}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {cliente?.nombreCompleto} • {tipoTrabajo?.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <StatusBadge status={trabajo.estado} />
                    {trabajo.saldoPendiente > 0 && (
                      <span className="text-sm font-medium text-destructive hidden sm:block">
                        {formatCurrency(trabajo.saldoPendiente)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Próximos Eventos</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendario">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
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

      {/* Clients with debt */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Clientes con Saldo Pendiente</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pagos">
              Ver cuentas por cobrar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {clientesConDeuda.map((cliente) => (
            <Link
              key={cliente.id}
              to={`/clientes/${cliente.id}`}
              className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors"
            >
              <p className="font-medium text-sm truncate">{cliente.nombreCompleto}</p>
              <p className="text-lg font-bold text-destructive mt-1">
                {formatCurrency(cliente.deudaTotalActual)}
              </p>
            </Link>
          ))}
          {clientesConDeuda.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-4">
              No hay clientes con deuda
            </p>
          )}
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
