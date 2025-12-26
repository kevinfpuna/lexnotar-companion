import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Edit,
  Briefcase,
  Receipt,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApp } from '@/contexts/AppContext';
import { ClienteForm } from '@/components/forms/ClienteForm';
import { TrabajoForm } from '@/components/forms/TrabajoForm';
import { formatCurrency, formatDate } from '@/lib/mockData';

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getClienteById,
    getTipoClienteById,
    getTrabajosByClienteId,
    getTipoTrabajoById,
    pagos,
    clientes,
    tiposCliente,
    tiposTrabajo,
    updateCliente,
    createTrabajo,
    isLoading
  } = useApp();

  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [trabajoFormOpen, setTrabajoFormOpen] = useState(false);
  
  const cliente = getClienteById(id || '');
  const tipoCliente = cliente ? getTipoClienteById(cliente.tipoClienteId) : undefined;
  const trabajos = cliente ? getTrabajosByClienteId(cliente.id) : [];
  const pagosCliente = pagos.filter(p => 
    trabajos.some(t => t.id === p.trabajoId)
  );

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/clientes">Volver a clientes</Link>
        </Button>
      </div>
    );
  }

  const handleUpdateCliente = async (data: any) => {
    await updateCliente(cliente.id, data);
    setClienteFormOpen(false);
  };

  const handleCreateTrabajo = async (data: any, items: any[]) => {
    const newTrabajo = await createTrabajo(data, items);
    setTrabajoFormOpen(false);
    navigate(`/trabajos/${newTrabajo.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit">
          <Link to="/clientes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a clientes
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {cliente.nombreCompleto.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">{cliente.nombreCompleto}</h1>
                <Badge variant={cliente.estado === 'activo' ? 'default' : 'secondary'}>
                  {cliente.estado}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {tipoCliente?.nombre} • {cliente.documentoIdentidad}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setClienteFormOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Contact info & debt */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-medium">{cliente.telefono}</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium truncate">{cliente.email}</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Domicilio</p>
            <p className="font-medium truncate">{cliente.domicilio}</p>
          </div>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Deuda Total</p>
          <p className={`text-2xl font-bold ${cliente.deudaTotalActual > 0 ? 'text-destructive' : 'text-success'}`}>
            {formatCurrency(cliente.deudaTotalActual)}
          </p>
        </div>
      </div>

      {/* Custom fields */}
      {Object.keys(cliente.datosCustom).length > 0 && (
        <div className="card-elevated p-6">
          <h3 className="font-semibold mb-4">Datos adicionales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(cliente.datosCustom).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-medium">{String(value) || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="trabajos" className="w-full">
        <TabsList>
          <TabsTrigger value="trabajos">
            <Briefcase className="h-4 w-4 mr-2" />
            Trabajos ({trabajos.length})
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <Receipt className="h-4 w-4 mr-2" />
            Pagos ({pagosCliente.length})
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Trabajos */}
        <TabsContent value="trabajos" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Trabajos del cliente</h3>
              <Button size="sm" onClick={() => setTrabajoFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo trabajo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabajos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay trabajos para este cliente
                    </TableCell>
                  </TableRow>
                ) : (
                  trabajos.map((trabajo) => {
                    const tipoTrabajo = getTipoTrabajoById(trabajo.tipoTrabajoId);
                    return (
                      <TableRow key={trabajo.id}>
                        <TableCell>
                          <Link 
                            to={`/trabajos/${trabajo.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {trabajo.nombreTrabajo}
                          </Link>
                        </TableCell>
                        <TableCell>{tipoTrabajo?.nombre}</TableCell>
                        <TableCell>
                          <StatusBadge status={trabajo.estado} />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(trabajo.costoFinal)}</TableCell>
                        <TableCell className={`text-right font-medium ${trabajo.saldoPendiente > 0 ? 'text-destructive' : 'text-success'}`}>
                          {formatCurrency(trabajo.saldoPendiente)}
                        </TableCell>
                        <TableCell>{formatDate(trabajo.fechaInicio)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pagos */}
        <TabsContent value="pagos" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosCliente.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  pagosCliente.map((pago) => {
                    const trabajo = trabajos.find(t => t.id === pago.trabajoId);
                    return (
                      <TableRow key={pago.id}>
                        <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                        <TableCell>{trabajo?.nombreTrabajo}</TableCell>
                        <TableCell>{pago.metodoPago}</TableCell>
                        <TableCell>{pago.referenciaPago || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-success">
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

        {/* Documentos */}
        <TabsContent value="documentos" className="mt-4">
          <div className="card-elevated p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Documentos del cliente</h3>
            <p className="text-muted-foreground mb-4">
              Adjunta documentos como CI, poderes, contratos, etc.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Subir documento
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {cliente.notasInternas && (
        <div className="card-elevated p-6">
          <h3 className="font-semibold mb-2">Notas internas</h3>
          <p className="text-muted-foreground">{cliente.notasInternas}</p>
        </div>
      )}

      {/* Cliente Form Dialog */}
      <ClienteForm
        open={clienteFormOpen}
        onOpenChange={setClienteFormOpen}
        tiposCliente={tiposCliente}
        onSubmit={handleUpdateCliente}
        isLoading={isLoading}
        defaultValues={cliente}
        mode="edit"
      />

      {/* Trabajo Form Dialog */}
      <TrabajoForm
        open={trabajoFormOpen}
        onOpenChange={setTrabajoFormOpen}
        clientes={clientes.filter(c => c.id === cliente.id)}
        tiposTrabajo={tiposTrabajo}
        onSubmit={handleCreateTrabajo}
        isLoading={isLoading}
      />
    </div>
  );
}