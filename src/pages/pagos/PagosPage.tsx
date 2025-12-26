import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  Plus,
  Trash2
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
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { MetodoPago } from '@/types';
import { PagoForm } from '@/components/forms/PagoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { applyPagoToItem, distributeGeneralPago, calculateClienteDeuda } from '@/lib/calculations';

const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'];

export default function PagosPage() {
  const { 
    clientes, 
    trabajos, 
    pagos, 
    items,
    createPago, 
    deletePago,
    recalculateTrabajo,
    updateCliente,
    getTrabajosByClienteId,
    setItems,
    isLoading 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [metodoFilter, setMetodoFilter] = useState<string>('all');
  const [pagoFormOpen, setPagoFormOpen] = useState(false);
  const [deletePagoId, setDeletePagoId] = useState<string | null>(null);

  // Calculate stats
  const deudaTotal = clientes.reduce((sum, c) => sum + c.deudaTotalActual, 0);
  const pagosMes = pagos.filter(p => {
    const now = new Date();
    return p.fechaPago.getMonth() === now.getMonth() && 
           p.fechaPago.getFullYear() === now.getFullYear();
  });
  const totalPagosMes = pagosMes.reduce((sum, p) => sum + p.monto, 0);
  const trabajosConDeuda = trabajos.filter(t => t.saldoPendiente > 0 && t.estado !== 'Cancelado');
  const clientesConDeuda = clientes.filter(c => c.deudaTotalActual > 0);

  // Get trabajo by id helper
  const getTrabajoById = (id: string) => trabajos.find(t => t.id === id);
  const getClienteById = (id: string) => clientes.find(c => c.id === id);

  // Filter payments
  const filteredPagos = useMemo(() => {
    return pagos.filter((pago) => {
      const trabajo = getTrabajoById(pago.trabajoId);
      const cliente = trabajo ? getClienteById(trabajo.clienteId) : null;
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = 
        trabajo?.nombreTrabajo.toLowerCase().includes(searchLower) ||
        cliente?.nombreCompleto.toLowerCase().includes(searchLower) ||
        pago.referenciaPago.toLowerCase().includes(searchLower);

      const matchesMetodo = metodoFilter === 'all' || pago.metodoPago === metodoFilter;

      return matchesSearch && matchesMetodo;
    }).sort((a, b) => b.fechaPago.getTime() - a.fechaPago.getTime());
  }, [pagos, searchQuery, metodoFilter, trabajos, clientes]);

  // Handle pago creation
  const handleCreatePago = async (data: any) => {
    await createPago(data, (trabajoId, monto, itemId) => {
      if (itemId) {
        const newItems = applyPagoToItem(items, itemId, monto);
        setItems(newItems);
      } else {
        const trabajoItemsWithBalance = items.filter(i => i.trabajoId === trabajoId && i.saldo > 0);
        if (trabajoItemsWithBalance.length > 0) {
          const updatedItems = distributeGeneralPago(trabajoItemsWithBalance, monto);
          setItems(prev => prev.map(i => {
            const updated = updatedItems.find(ui => ui.id === i.id);
            return updated || i;
          }));
        }
      }
      
      setTimeout(() => {
        recalculateTrabajo(trabajoId);
      }, 100);
    });
    setPagoFormOpen(false);
  };

  // Handle pago deletion
  const handleDeletePago = async () => {
    if (deletePagoId) {
      await deletePago(deletePagoId, (trabajoId, monto, itemId) => {
        if (itemId) {
          const newItems = applyPagoToItem(items, itemId, monto);
          setItems(newItems);
        }
        
        setTimeout(() => {
          recalculateTrabajo(trabajoId);
        }, 100);
      });
      setDeletePagoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pagos y Cuentas por Cobrar</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los cobros y revisa el estado financiero
          </p>
        </div>
        <Button onClick={() => setPagoFormOpen(true)} disabled={trabajosConDeuda.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pago
        </Button>
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
                    const trabajosCliente = trabajos.filter(
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
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeletePagoId(pago.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
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
      </Tabs>

      {/* Pago Form */}
      <PagoForm
        open={pagoFormOpen}
        onOpenChange={setPagoFormOpen}
        trabajos={trabajosConDeuda}
        onSubmit={handleCreatePago}
        isLoading={isLoading}
      />

      {/* Delete Pago Confirm */}
      <DeleteConfirmDialog
        open={!!deletePagoId}
        onOpenChange={(open) => !open && setDeletePagoId(null)}
        onConfirm={handleDeletePago}
        title="Eliminar pago"
        description="¿Estás seguro de que deseas eliminar este pago? Se recalcularán los saldos."
        isLoading={isLoading}
      />
    </div>
  );
}
