import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Pago } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface IngresosChartProps {
  pagos: Pago[];
}

export function IngresosChart({ pagos }: IngresosChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months = [];
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const ingresosMes = pagos
        .filter(p => {
          const fechaPago = new Date(p.fechaPago);
          return isWithinInterval(fechaPago, { start, end });
        })
        .reduce((sum, p) => sum + p.monto, 0);
      
      months.push({
        mes: format(date, 'MMM', { locale: es }),
        mesCompleto: format(date, 'MMMM yyyy', { locale: es }),
        ingresos: ingresosMes,
      });
    }
    
    return months;
  }, [pagos]);

  const totalPeriodo = data.reduce((sum, d) => sum + d.ingresos, 0);
  const promedioMensual = totalPeriodo / 6;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">Ingresos Mensuales</h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-500">
            ₲ {formatCurrency(totalPeriodo)}
          </p>
          <p className="text-xs text-muted-foreground">
            Promedio: ₲ {formatCurrency(promedioMensual)}/mes
          </p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="mes" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`₲ ${value.toLocaleString()}`, 'Ingresos']}
              labelFormatter={(label, payload) => payload[0]?.payload?.mesCompleto || label}
            />
            <Bar 
              dataKey="ingresos" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
