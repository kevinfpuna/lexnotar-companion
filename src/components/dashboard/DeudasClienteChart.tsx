import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Cliente } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DeudasClienteChartProps {
  clientes: Cliente[];
}

export function DeudasClienteChart({ clientes }: DeudasClienteChartProps) {
  const navigate = useNavigate();

  const data = useMemo(() => {
    return clientes
      .filter(c => c.deudaTotalActual > 0)
      .sort((a, b) => b.deudaTotalActual - a.deudaTotalActual)
      .slice(0, 8)
      .map(c => ({
        id: c.id,
        nombre: c.nombreCompleto.length > 15 
          ? c.nombreCompleto.substring(0, 15) + '...' 
          : c.nombreCompleto,
        nombreCompleto: c.nombreCompleto,
        deuda: c.deudaTotalActual,
      }));
  }, [clientes]);

  const totalDeuda = clientes.reduce((sum, c) => sum + c.deudaTotalActual, 0);
  const clientesConDeuda = clientes.filter(c => c.deudaTotalActual > 0).length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Color gradient based on debt amount
  const getColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.7) return 'hsl(var(--destructive))';
    if (intensity > 0.4) return 'hsl(25, 95%, 53%)'; // orange
    return 'hsl(45, 93%, 47%)'; // amber
  };

  const maxDeuda = Math.max(...data.map(d => d.deuda), 1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Deudas por Cliente</h3>
            <p className="text-sm text-muted-foreground">
              {clientesConDeuda} clientes con saldo
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-destructive">
            ₲ {formatCurrency(totalDeuda)}
          </p>
          <p className="text-xs text-muted-foreground">Deuda total</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground">No hay clientes con deuda</p>
        </div>
      ) : (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis 
                type="number"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category"
                dataKey="nombre"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`₲ ${value.toLocaleString()}`, 'Deuda']}
                labelFormatter={(label, payload) => payload[0]?.payload?.nombreCompleto || label}
              />
              <Bar 
                dataKey="deuda" 
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => navigate(`/clientes/${data.id}`)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.deuda, maxDeuda)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick summary */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mayor deudor:</span>
            <span className="font-medium">{data[0]?.nombreCompleto}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Su deuda:</span>
            <span className="font-medium text-destructive">
              ₲ {data[0]?.deuda.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
