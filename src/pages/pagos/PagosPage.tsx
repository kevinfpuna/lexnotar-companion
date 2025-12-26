import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  clientesMock, 
  trabajosMock,
  pagosMock,
  formatCurrency,
  formatDate,
  getClienteById,
  getTrabajoById
} from '@/lib/mockData';
import { MetodoPago } from '@/types';

const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'];

export default function PagosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [metodoFilter, setMetodoFilter] = useState<string>('all');

  // Calculate stats
  const deudaTotal = clientesMock.reduce((sum, c) => sum + c.deudaTotalActual, 0);
  const pagosMes = pagosMock.filter(p => {
    const now = new Date();
    return p.fechaPago.getMonth() === now.getMonth() && 
           p.fechaPago.getFullYear() === now.getFullYear();
  });
  const totalPagosMes = pagosMes.reduce((sum, p) => sum + p.monto, 0);
  const trabajosConDeuda = trabajosMock.filter(t => t.saldoPendiente > 0);
  const clientesConDeuda = clientesMock.filter(c => c.deudaTotalActual > 0);

  // Filter payments
  const filteredPagos = useMemo(() => {
    return pagosMock.filter((pago) => {
      const trabajo = getTrabajoById(pago.trabajoId);
      const cliente = trabajo ? getClienteById(trabajo.clienteId) : null;
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        trabajo?.nombreTrabajo.toLowerCase().includes(searchLower) ||
        cliente?.nombreCompleto.toLowerCase().includes(searchLower) ||
        pago.referenciaPago.toLowerCase().includes(searchLower);

      const matchesMetodo = metodoFilter === 'all' || pago.metodoPago === metodoFilter;

      return matchesSearch && matchesMetodo;
    });
  }, [searchQuery, metodoFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Pagos y Cuentas por Cobrar</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los cobros y revisa el estado financiero
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Deuda Total"
          value={formatCurrency(deudaTotal)}
          subtitle="Saldo pendiente"
          icon={Wallet}
          variant="destructive"
        />
        <StatCard
          title="Cobrado este Mes"
          value={formatCurrency(totalPagosMes)}
          subtitle={`${pagosMes.length} pagos recibidos`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Trabajos con Saldo"
          value={trabajosConDeuda.length}
          subtitle="Pendientes de pago"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Clientes Deudores"
          value={clientesConDeuda.length}
          subtitle="Con saldo pendiente"
          icon={Wallet}
          variant="primary"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cuentas" className="w-full">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="historial">Historial de Pagos</TabsTrigger>
        </TabsList>

        {/* Cuentas por cobrar */}
        <TabsContent value="cuentas" className="mt-4 space-y-6">
          {/* Clients with debt */}
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Clientes con Saldo Pendiente</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Trabajos Activos</TableHead>
                  <TableHead className="text-right">Deuda Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesConDeuda.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay clientes con deuda
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesConDeuda.map((cliente) => {
                    const trabajosCliente = trabajosMock.filter(
                      t => t.clienteId === cliente.id && t.saldoPendiente > 0
                    );
                    
                    return (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nombreCompleto}</TableCell>
                        <TableCell>{cliente.documentoIdentidad}</TableCell>
                        <TableCell>{trabajosCliente.length}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {formatCurrency(cliente.deudaTotalActual)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/clientes/${cliente.id}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Works with debt */}
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Trabajos con Saldo Pendiente</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Costo Total</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabajosConDeuda.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay trabajos con saldo pendiente
                    </TableCell>
                  </TableRow>
                ) : (
                  trabajosConDeuda.map((trabajo) => {
                    const cliente = getClienteById(trabajo.clienteId);
                    
                    return (
                      <TableRow key={trabajo.id}>
                        <TableCell className="font-medium">{trabajo.nombreTrabajo}</TableCell>
                        <TableCell>{cliente?.nombreCompleto}</TableCell>
                        <TableCell className="text-right">{formatCurrency(trabajo.costoFinal)}</TableCell>
                        <TableCell className="text-right text-success">
                          {formatCurrency(trabajo.pagadoTotal)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {formatCurrency(trabajo.saldoPendiente)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/trabajos/${trabajo.id}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Historial de pagos */}
        <TabsContent value="historial" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por trabajo, cliente o referencia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={metodoFilter} onValueChange={setMetodoFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                {metodosPago.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron pagos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPagos.map((pago) => {
                    const trabajo = getTrabajoById(pago.trabajoId);
                    const cliente = trabajo ? getClienteById(trabajo.clienteId) : null;
                    
                    return (
                      <TableRow key={pago.id}>
                        <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                        <TableCell className="font-medium">{trabajo?.nombreTrabajo}</TableCell>
                        <TableCell>{cliente?.nombreCompleto}</TableCell>
                        <TableCell>{pago.metodoPago}</TableCell>
                        <TableCell>{pago.referenciaPago || '-'}</TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          {formatCurrency(pago.monto)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
