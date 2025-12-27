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
  Trash2,
  Download,
  FileSpreadsheet
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
import { formatCurrency, formatCurrencyCompact, formatDate } from '@/lib/mockData';
import { MetodoPago } from '@/types';
import { PagoForm } from '@/components/forms/PagoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { applyPagoToItem, distributeGeneralPago, calculateClienteDeuda } from '@/lib/calculations';
import { exportPagosToExcel, exportClientesDeudaToExcel } from '@/lib/excelExport';
import { toast } from 'sonner';

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

  // Handle Excel exports
  const handleExportPagos = () => {
    exportPagosToExcel(pagos, trabajos, clientes);
    toast.success('Pagos exportados a Excel');
  };

  const handleExportDeudas = () => {
    exportClientesDeudaToExcel(clientes);
    toast.success('Deudas exportadas a Excel');
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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportPagos}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Pagos
          </Button>
          <Button variant="outline" onClick={handleExportDeudas}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Deudas
          </Button>
          <Button onClick={() => setPagoFormOpen(true)} disabled={trabajosConDeuda.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pago
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Deuda Total"
          value={formatCurrencyCompact(deudaTotal)}
          subtitle="Pendiente"
          icon={Wallet}
          variant="destructive"
        />
        <StatCard
          title="Cobrado"
          value={formatCurrencyCompact(totalPagosMes)}
          subtitle={`${pagosMes.length} pagos`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Con Saldo"
          value={trabajosConDeuda.length}
          subtitle="Trabajos"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Deudores"
          value={clientesConDeuda.length}
          subtitle="Clientes"
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
            <div className="p-3 md:p-4 border-b border-border">
              <h3 className="font-semibold text-sm md:text-base">Clientes con Saldo Pendiente</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="min-w-[150px]">Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Documento</TableHead>
                    <TableHead className="hidden md:table-cell">Trabajos</TableHead>
                    <TableHead className="text-right">Deuda</TableHead>
                    <TableHead className="w-10"></TableHead>
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
                          <TableCell className="font-medium text-sm">{cliente.nombreCompleto}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{cliente.documentoIdentidad}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{trabajosCliente.length}</TableCell>
                          <TableCell className="text-right font-semibold text-destructive text-sm">
                            {formatCurrency(cliente.deudaTotalActual)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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
          </div>

          {/* Works with debt */}
          <div className="card-elevated overflow-hidden">
            <div className="p-3 md:p-4 border-b border-border">
              <h3 className="font-semibold text-sm md:text-base">Trabajos con Saldo Pendiente</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="min-w-[150px]">Trabajo</TableHead>
                    <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Costo</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Pagado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-10"></TableHead>
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
                          <TableCell className="font-medium text-sm">{trabajo.nombreTrabajo}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{cliente?.nombreCompleto}</TableCell>
                          <TableCell className="text-right hidden md:table-cell text-sm">{formatCurrency(trabajo.costoFinal)}</TableCell>
                          <TableCell className="text-right text-success hidden lg:table-cell text-sm">
                            {formatCurrency(trabajo.pagadoTotal)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-destructive text-sm">
                            {formatCurrency(trabajo.saldoPendiente)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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
          </div>
        </TabsContent>

        {/* Historial de pagos */}
        <TabsContent value="historial" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={metodoFilter} onValueChange={setMetodoFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {metodosPago.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="min-w-[80px]">Fecha</TableHead>
                    <TableHead className="min-w-[120px]">Trabajo</TableHead>
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Método</TableHead>
                    <TableHead className="hidden lg:table-cell">Ref.</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-10"></TableHead>
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
                          <TableCell className="text-sm">{formatDate(pago.fechaPago)}</TableCell>
                          <TableCell className="font-medium text-sm">{trabajo?.nombreTrabajo}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{cliente?.nombreCompleto}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{pago.metodoPago}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{pago.referenciaPago || '-'}</TableCell>
                          <TableCell className="text-right font-semibold text-success text-sm">
                            {formatCurrency(pago.monto)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
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
