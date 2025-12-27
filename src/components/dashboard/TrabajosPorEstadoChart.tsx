import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { PieChartIcon } from 'lucide-react';
import { Trabajo } from '@/types';

interface TrabajosPorEstadoChartProps {
  trabajos: Trabajo[];
}

const COLORS = {
  'Borrador': 'hsl(var(--muted-foreground))',
  'Pendiente': 'hsl(45, 93%, 47%)', // amber
  'En proceso': 'hsl(var(--primary))',
  'Completado': 'hsl(142, 76%, 36%)', // green
  'Cancelado': 'hsl(var(--destructive))',
};

export function TrabajosPorEstadoChart({ trabajos }: TrabajosPorEstadoChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    
    trabajos.forEach(t => {
      counts[t.estado] = (counts[t.estado] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([estado, cantidad]) => ({
        name: estado,
        value: cantidad,
        color: COLORS[estado as keyof typeof COLORS] || 'hsl(var(--muted))',
      }))
      .sort((a, b) => b.value - a.value);
  }, [trabajos]);

  const total = trabajos.length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <PieChartIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Trabajos por Estado</h3>
          <p className="text-sm text-muted-foreground">{total} trabajos totales</p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
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
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}:</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
