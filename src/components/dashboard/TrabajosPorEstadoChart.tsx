import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { PieChartIcon } from 'lucide-react';
import { Trabajo } from '@/types';
import { PeriodOption, getDateRangeFromPeriod } from './PeriodFilter';

interface TrabajosPorEstadoChartProps {
  trabajos: Trabajo[];
  period: PeriodOption;
}

const COLORS = {
  'Borrador': 'hsl(var(--muted-foreground))',
  'Pendiente': 'hsl(45, 93%, 47%)', // amber
  'En proceso': 'hsl(var(--primary))',
  'Completado': 'hsl(142, 76%, 36%)', // green
  'Cancelado': 'hsl(var(--destructive))',
};

export function TrabajosPorEstadoChart({ trabajos, period }: TrabajosPorEstadoChartProps) {
  const { filteredTrabajos, data } = useMemo(() => {
    const { start, end } = getDateRangeFromPeriod(period);
    
    // Filter trabajos by creation or update date within period
    const filtered = trabajos.filter(t => {
      const fecha = new Date(t.fechaUltimaActualizacion || t.fechaCreacion);
      return fecha >= start && fecha <= end;
    });

    const counts: Record<string, number> = {};
    
    filtered.forEach(t => {
      counts[t.estado] = (counts[t.estado] || 0) + 1;
    });
    
    const chartData = Object.entries(counts)
      .map(([estado, cantidad]) => ({
        name: estado,
        value: cantidad,
        color: COLORS[estado as keyof typeof COLORS] || 'hsl(var(--muted))',
      }))
      .sort((a, b) => b.value - a.value);

    return { filteredTrabajos: filtered, data: chartData };
  }, [trabajos, period]);

  const total = filteredTrabajos.length;

  const periodLabel = {
    '7d': 'últimos 7 días',
    '30d': 'últimos 30 días',
    '3m': 'últimos 3 meses',
    '6m': 'últimos 6 meses',
    '1y': 'último año',
    'all': 'todos',
  }[period];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <PieChartIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Trabajos por Estado</h3>
          <p className="text-sm text-muted-foreground">{total} trabajos ({periodLabel})</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Sin datos en este período</p>
        </div>
      ) : (
        <>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / total) * 100).toFixed(0)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t">
            {data.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{item.name}:</span>
                <span className="text-xs font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
