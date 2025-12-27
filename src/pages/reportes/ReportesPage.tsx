import { useState, useMemo, useEffect } from 'react';
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  clientesMock, 
  trabajosMock, 
  pagosMock,
  tiposTrabajoMock,
  formatCurrency,
} from '@/lib/mockData';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { X, Calendar, Download, FileSpreadsheet } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  exportIngresosToExcel, 
  exportClientesDeudaToExcel, 
  exportTrabajosToExcel,
  exportReporteCompleto 
} from '@/lib/excelExport';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

// Colors for charts
const COLORS = ['hsl(224, 76%, 33%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(0, 72%, 51%)'];

type Periodo = 'hoy' | 'semana' | 'mes' | 'año' | 'custom';

export default function ReportesPage() {
  const { clientes, trabajos, pagos, items } = useApp();
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  // Inicializar customRange cuando se selecciona 'custom'
  useEffect(() => {
    if (periodo === 'custom' && !customRange) {
      const defaultFrom = new Date();
      defaultFrom.setMonth(defaultFrom.getMonth() - 1);
      defaultFrom.setHours(0, 0, 0, 0);
      setCustomRange({
        from: defaultFrom,
        to: new Date()
      });
    }
  }, [periodo, customRange]);

  const getDateRange = (): { from: Date; to: Date } => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (periodo) {
      case 'hoy':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return { from: todayStart, to: today };
      case 'semana':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return { from: weekAgo, to: today };
      case 'mes':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        return { from: monthAgo, to: today };
      case 'año':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        yearAgo.setHours(0, 0, 0, 0);
        return { from: yearAgo, to: today };
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return { from: customRange.from, to: customRange.to };
        }
        const defaultMonth = new Date();
        defaultMonth.setMonth(defaultMonth.getMonth() - 1);
        return { from: defaultMonth, to: today };
      default:
        const defaultRange = new Date();
        defaultRange.setMonth(defaultRange.getMonth() - 1);
        return { from: defaultRange, to: today };
    }
  };

  const dateRange = getDateRange();

  // Filter data by date range - using app context data
  const filteredPagos = useMemo(() => {
    return pagos.filter(p => 
      p.fechaPago >= dateRange.from && p.fechaPago <= dateRange.to
    );
  }, [dateRange, pagos]);

  const filteredTrabajos = useMemo(() => {
    return trabajos.filter(t => 
      t.fechaInicio >= dateRange.from && t.fechaInicio <= dateRange.to
    );
  }, [dateRange, trabajos]);

  // Calculate monthly income data
  const monthlyIncome = useMemo(() => {
    const months: { [key: string]: number } = {};
    
    filteredPagos.forEach(p => {
      const monthKey = `${p.fechaPago.toLocaleString('es', { month: 'short' })} ${p.fechaPago.getFullYear()}`;
      months[monthKey] = (months[monthKey] || 0) + p.monto;
    });
    
    return Object.entries(months).map(([name, ingresos]) => ({ name, ingresos }));
  }, [filteredPagos]);

  // Works by status
  const worksByStatus = useMemo(() => {
    return [
      { name: 'Pendiente', value: filteredTrabajos.filter(t => t.estado === 'Pendiente').length },
      { name: 'En proceso', value: filteredTrabajos.filter(t => t.estado === 'En proceso').length },
      { name: 'Completado', value: filteredTrabajos.filter(t => t.estado === 'Completado').length },
      { name: 'Cancelado', value: filteredTrabajos.filter(t => t.estado === 'Cancelado').length },
    ].filter(s => s.value > 0);
  }, [filteredTrabajos]);

  // Payment methods
  const paymentMethods = useMemo(() => {
    return [
      { name: 'Efectivo', value: filteredPagos.filter(p => p.metodoPago === 'Efectivo').length },
      { name: 'Transferencia', value: filteredPagos.filter(p => p.metodoPago === 'Transferencia').length },
      { name: 'Tarjeta', value: filteredPagos.filter(p => p.metodoPago === 'Tarjeta').length },
      { name: 'Cheque', value: filteredPagos.filter(p => p.metodoPago === 'Cheque').length },
    ].filter(m => m.value > 0);
  }, [filteredPagos]);

  // Works by type
  const worksByType = useMemo(() => {
    return tiposTrabajoMock.map(tipo => ({
      name: tipo.nombre,
      cantidad: filteredTrabajos.filter(t => t.tipoTrabajoId === tipo.id).length,
      ingresos: filteredTrabajos
        .filter(t => t.tipoTrabajoId === tipo.id)
        .reduce((sum, t) => sum + t.pagadoTotal, 0)
    })).filter(t => t.cantidad > 0);
  }, [filteredTrabajos]);

  // Top clients - using context data
  const topClients = useMemo(() => {
    return [...clientes]
      .map(cliente => ({
        ...cliente,
        totalTrabajos: filteredTrabajos.filter(t => t.clienteId === cliente.id).length,
        totalFacturado: filteredTrabajos
          .filter(t => t.clienteId === cliente.id)
          .reduce((sum, t) => sum + t.costoFinal, 0)
      }))
      .filter(c => c.totalTrabajos > 0)
      .sort((a, b) => b.totalFacturado - a.totalFacturado)
      .slice(0, 5);
  }, [filteredTrabajos, clientes]);

  // Excel export handlers
  const handleExportIngresos = () => {
    const ingresosPorMes = monthlyIncome.map(m => ({ mes: m.name, total: m.ingresos }));
    exportIngresosToExcel(ingresosPorMes);
    toast.success('Ingresos exportados a Excel');
  };

  const handleExportDeudas = () => {
    exportClientesDeudaToExcel(clientes);
    toast.success('Deudas exportadas a Excel');
  };

  const handleExportTrabajos = () => {
    exportTrabajosToExcel(trabajos, clientes);
    toast.success('Trabajos exportados a Excel');
  };

  const handleExportCompleto = () => {
    exportReporteCompleto(pagos, trabajos, clientes, items);
    toast.success('Reporte completo exportado a Excel');
  };

  // Summary stats
  const totalIngresos = filteredPagos.reduce((sum, p) => sum + p.monto, 0);
  const totalTrabajos = filteredTrabajos.length;
  const trabajosCompletados = filteredTrabajos.filter(t => t.estado === 'Completado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Análisis de ingresos, trabajos y clientes
          </p>
        </div>

        {/* Period filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mes</SelectItem>
              <SelectItem value="año">Último año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {periodo === 'custom' && (
            <DatePickerWithRange
              value={customRange}
              onChange={setCustomRange}
            />
          )}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExportIngresos}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Ingresos
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportDeudas}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Deudas
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportTrabajos}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Trabajos
        </Button>
        <Button size="sm" onClick={handleExportCompleto}>
          <Download className="h-4 w-4 mr-2" />
          Reporte Completo
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ingresos del período</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalIngresos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Trabajos iniciados</p>
          <p className="text-2xl font-bold">{totalTrabajos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Trabajos completados</p>
          <p className="text-2xl font-bold text-primary">{trabajosCompletados}</p>
        </Card>
      </div>

      {/* Income chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Ingresos por Período</h3>
        <div className="h-80">
          {monthlyIncome.length > 0 ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No hay datos para el período seleccionado
            </div>
          )}
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Works by status */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Trabajos por Estado</h3>
          <div className="h-64">
            {worksByStatus.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos
              </div>
            )}
          </div>
        </Card>

        {/* Payment methods */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Métodos de Pago</h3>
          <div className="h-64">
            {paymentMethods.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Works by type */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Trabajos por Tipo</h3>
        <div className="h-64">
          {worksByType.length > 0 ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No hay datos
            </div>
          )}
        </div>
      </Card>

      {/* Top clients */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Top Clientes por Facturación</h3>
        <div className="space-y-4">
          {topClients.length > 0 ? (
            topClients.map((cliente, index) => (
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
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay datos para el período seleccionado
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
