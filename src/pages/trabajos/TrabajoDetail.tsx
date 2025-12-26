import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  Edit,
  Trash2,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getTrabajoById,
  getClienteById,
  getTipoTrabajoById,
  getItemsByTrabajoId,
  getPagosByTrabajoId,
  formatCurrency,
  formatDate 
} from '@/lib/mockData';
import { EstadoItem } from '@/types';

const estadoItemOptions: EstadoItem[] = ['Pendiente', 'En proceso', 'Mesa entrada', 'Mesa salida', 'Listo retirar', 'Completado'];

export default function TrabajoDetail() {
  const { id } = useParams<{ id: string }>();
  
  const trabajo = getTrabajoById(id || '');
  const cliente = trabajo ? getClienteById(trabajo.clienteId) : undefined;
  const tipoTrabajo = trabajo ? getTipoTrabajoById(trabajo.tipoTrabajoId) : undefined;
  const items = trabajo ? getItemsByTrabajoId(trabajo.id) : [];
  const pagos = trabajo ? getPagosByTrabajoId(trabajo.id) : [];

  if (!trabajo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Trabajo no encontrado</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/trabajos">Volver a trabajos</Link>
        </Button>
      </div>
    );
  }

  const completedItems = items.filter(i => i.estado === 'Completado').length;
  const progress = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit">
          <Link to="/trabajos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a trabajos
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{trabajo.nombreTrabajo}</h1>
              <StatusBadge status={trabajo.estado} />
            </div>
            <p className="text-muted-foreground mt-1">{trabajo.descripcionTrabajo}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Presupuesto PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Client */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span className="text-sm">Cliente</span>
          </div>
          <Link 
            to={`/clientes/${cliente?.id}`}
            className="font-semibold hover:text-primary transition-colors"
          >
            {cliente?.nombreCompleto}
          </Link>
          <p className="text-sm text-muted-foreground">{tipoTrabajo?.nombre}</p>
        </div>

        {/* Dates */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Fechas</span>
          </div>
          <p className="text-sm">
            <span className="text-muted-foreground">Inicio:</span> {formatDate(trabajo.fechaInicio)}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Fin estimado:</span> {formatDate(trabajo.fechaFinEstimada)}
          </p>
          {trabajo.fechaFinReal && (
            <p className="text-sm text-success">
              <span className="text-muted-foreground">Fin real:</span> {formatDate(trabajo.fechaFinReal)}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Progreso</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="font-semibold">{progress}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {completedItems} de {items.length} pasos completados
          </p>
        </div>

        {/* Financial */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Receipt className="h-4 w-4" />
            <span className="text-sm">Financiero</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Costo total:</span>
              <span className="font-medium">{formatCurrency(trabajo.costoFinal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pagado:</span>
              <span className="text-success font-medium">{formatCurrency(trabajo.pagadoTotal)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-1">
              <span className="text-muted-foreground">Saldo:</span>
              <span className={`font-bold ${trabajo.saldoPendiente > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(trabajo.saldoPendiente)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList>
          <TabsTrigger value="items">Pasos ({items.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({pagos.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        {/* Items tab */}
        <TabsContent value="items" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Pasos del Trabajo</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar paso
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Paso</TableHead>
                  <TableHead className="w-40">Estado</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="w-24">Días</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numeroPaso}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.nombreItem}</p>
                        <p className="text-sm text-muted-foreground">{item.descripcionItem}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={item.estado}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {estadoItemOptions.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.costoTotal)}</TableCell>
                    <TableCell className="text-right text-success">{formatCurrency(item.pagado)}</TableCell>
                    <TableCell className={`text-right font-medium ${item.saldo > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(item.saldo)}
                    </TableCell>
                    <TableCell>{item.diasEstimados}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pagos tab */}
        <TabsContent value="pagos" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Historial de Pagos</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Registrar pago
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  pagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                      <TableCell className="font-medium text-success">
                        {formatCurrency(pago.monto)}
                      </TableCell>
                      <TableCell>{pago.metodoPago}</TableCell>
                      <TableCell>{pago.referenciaPago || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{pago.notasPago || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Documentos tab */}
        <TabsContent value="documentos" className="mt-4">
          <div className="card-elevated p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Documentos del trabajo</h3>
            <p className="text-muted-foreground mb-4">
              Adjunta documentos relacionados a este trabajo
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Subir documento
            </Button>
          </div>
        </TabsContent>

        {/* Notas tab */}
        <TabsContent value="notas" className="mt-4">
          <div className="card-elevated p-6">
            <h3 className="font-semibold mb-4">Notas internas</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                {trabajo.notasInternas || 'Sin notas'}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
