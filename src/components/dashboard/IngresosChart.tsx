import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Pago } from '@/types';
import { format, subMonths, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { PeriodOption, getDateRangeFromPeriod } from './PeriodFilter';

interface IngresosChartProps {
  pagos: Pago[];
  period: PeriodOption;
}

export function IngresosChart({ pagos, period }: IngresosChartProps) {
  const data = useMemo(() => {
    const { start, end } = getDateRangeFromPeriod(period);
    
    // Filter pagos within range
    const filteredPagos = pagos.filter(p => {
      const fecha = new Date(p.fechaPago);
      return fecha >= start && fecha <= end;
    });

    // Determine grouping based on period
    if (period === '7d') {
      // Group by day
      const days = eachDayOfInterval({ start, end });
      return days.map(day => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const ingresos = filteredPagos
          .filter(p => {
            const fecha = new Date(p.fechaPago);
            return fecha >= dayStart && fecha <= dayEnd;
          })
          .reduce((sum, p) => sum + p.monto, 0);

        return {
          label: format(day, 'EEE', { locale: es }),
          labelCompleto: format(day, "EEEE d 'de' MMMM", { locale: es }),
          ingresos,
        };
      });
    } else if (period === '30d') {
      // Group by week
      const weeks = eachWeekOfInterval({ start, end }, { locale: es });
      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { locale: es });

        const ingresos = filteredPagos
          .filter(p => {
            const fecha = new Date(p.fechaPago);
            return fecha >= weekStart && fecha <= weekEnd;
          })
          .reduce((sum, p) => sum + p.monto, 0);

        return {
          label: `Sem ${format(weekStart, 'd/M')}`,
          labelCompleto: `Semana del ${format(weekStart, "d 'de' MMM", { locale: es })}`,
          ingresos,
        };
      });
    } else {
      // Group by month
      const months = eachMonthOfInterval({ start, end });
      return months.slice(-12).map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const ingresos = filteredPagos
          .filter(p => {
            const fecha = new Date(p.fechaPago);
            return fecha >= monthStart && fecha <= monthEnd;
          })
          .reduce((sum, p) => sum + p.monto, 0);

        return {
          label: format(month, 'MMM', { locale: es }),
          labelCompleto: format(month, 'MMMM yyyy', { locale: es }),
          ingresos,
        };
      });
    }
  }, [pagos, period]);

  const totalPeriodo = data.reduce((sum, d) => sum + d.ingresos, 0);
  const promedio = data.length > 0 ? totalPeriodo / data.length : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const periodLabel = {
    '7d': 'últimos 7 días',
    '30d': 'últimos 30 días',
    '3m': 'últimos 3 meses',
    '6m': 'últimos 6 meses',
    '1y': 'último año',
    'all': 'todo el período',
  }[period];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">Ingresos</h3>
            <p className="text-sm text-muted-foreground capitalize">{periodLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-500">
            ₲ {formatCurrency(totalPeriodo)}
          </p>
          <p className="text-xs text-muted-foreground">
            Promedio: ₲ {formatCurrency(promedio)}
          </p>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="label" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              width={45}
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
              labelFormatter={(label, payload) => payload[0]?.payload?.labelCompleto || label}
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
