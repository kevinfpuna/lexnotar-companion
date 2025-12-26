import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card } from '@/components/ui/card';
import { 
  clientesMock, 
  trabajosMock, 
  pagosMock,
  tiposTrabajoMock,
  formatCurrency,
  getTipoTrabajoById
} from '@/lib/mockData';

// Colors for charts
const COLORS = ['hsl(224, 76%, 33%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(0, 72%, 51%)'];

export default function ReportesPage() {
  // Calculate monthly income data
  const monthlyIncome = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear();
    
    const monthPayments = pagosMock.filter(p => 
      p.fechaPago.getMonth() === date.getMonth() && 
      p.fechaPago.getFullYear() === date.getFullYear()
    );
    
    return {
      name: `${month} ${year}`,
      ingresos: monthPayments.reduce((sum, p) => sum + p.monto, 0)
    };
  });

  // Works by status
  const worksByStatus = [
    { name: 'Pendiente', value: trabajosMock.filter(t => t.estado === 'Pendiente').length },
    { name: 'En proceso', value: trabajosMock.filter(t => t.estado === 'En proceso').length },
    { name: 'Completado', value: trabajosMock.filter(t => t.estado === 'Completado').length },
    { name: 'Cancelado', value: trabajosMock.filter(t => t.estado === 'Cancelado').length },
  ].filter(s => s.value > 0);

  // Payment methods
  const paymentMethods = [
    { name: 'Efectivo', value: pagosMock.filter(p => p.metodoPago === 'Efectivo').length },
    { name: 'Transferencia', value: pagosMock.filter(p => p.metodoPago === 'Transferencia').length },
    { name: 'Tarjeta', value: pagosMock.filter(p => p.metodoPago === 'Tarjeta').length },
    { name: 'Cheque', value: pagosMock.filter(p => p.metodoPago === 'Cheque').length },
  ].filter(m => m.value > 0);

  // Works by type
  const worksByType = tiposTrabajoMock.map(tipo => ({
    name: tipo.nombre,
    cantidad: trabajosMock.filter(t => t.tipoTrabajoId === tipo.id).length,
    ingresos: trabajosMock
      .filter(t => t.tipoTrabajoId === tipo.id)
      .reduce((sum, t) => sum + t.pagadoTotal, 0)
  })).filter(t => t.cantidad > 0);

  // Top clients
  const topClients = [...clientesMock]
    .map(cliente => ({
      ...cliente,
      totalTrabajos: trabajosMock.filter(t => t.clienteId === cliente.id).length,
      totalFacturado: trabajosMock
        .filter(t => t.clienteId === cliente.id)
        .reduce((sum, t) => sum + t.costoFinal, 0)
    }))
    .sort((a, b) => b.totalFacturado - a.totalFacturado)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Análisis de ingresos, trabajos y clientes
        </p>
      </div>

      {/* Income chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Ingresos Mensuales</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="ingresos" fill="hsl(224, 76%, 33%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Works by status */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Trabajos por Estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={worksByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {worksByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment methods */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Métodos de Pago</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Works by type */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Trabajos por Tipo</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={worksByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={150}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cantidad" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top clients */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Top 5 Clientes por Facturación</h3>
        <div className="space-y-4">
          {topClients.map((cliente, index) => (
            <div key={cliente.id} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{cliente.nombreCompleto}</p>
                <p className="text-sm text-muted-foreground">
                  {cliente.totalTrabajos} trabajos
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(cliente.totalFacturado)}</p>
                {cliente.deudaTotalActual > 0 && (
                  <p className="text-sm text-destructive">
                    Deuda: {formatCurrency(cliente.deudaTotalActual)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
