import { useState } from 'react';
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
  Receipt,
  Download,
  ChevronDown,
  Upload,
  History
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
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatDate, profesionalMock } from '@/lib/mockData';
import { EstadoItem, EstadoTrabajo, TipoDocumento } from '@/types';
import { ItemForm } from '@/components/forms/ItemForm';
import { PagoForm } from '@/components/forms/PagoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DocumentoCard } from '@/components/documentos/DocumentoCard';
import { DocumentoUpload } from '@/components/documentos/DocumentoUpload';
import { DocumentoViewer } from '@/components/documentos/DocumentoViewer';
import { applyPagoToItem, distributeGeneralPago, calculateClienteDeuda } from '@/lib/calculations';
import { toast } from 'sonner';
import { generateTrabajoPDF } from '@/lib/pdfGenerator';
import { TrabajoTimeline } from '@/components/trabajo/TrabajoTimeline';
import { NotasEditor } from '@/components/shared/NotasEditor';
import { PresupuestoVersiones } from '@/components/trabajo/PresupuestoVersiones';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const estadoItemOptions: EstadoItem[] = ['Pendiente', 'En proceso', 'Mesa entrada', 'Mesa salida', 'Listo retirar', 'Completado'];
const estadoTrabajoOptions: EstadoTrabajo[] = ['Borrador', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'];

export default function TrabajoDetail() {
  const { id } = useParams<{ id: string }>();
  const { 
    getTrabajoById, 
    getItemsByTrabajoId,
    getTrabajosByClienteId,
    clientes,
    tiposTrabajo,
    pagos,
    items,
    trabajos,
    updateTrabajoEstado,
    updateItemEstado,
    updateTrabajo,
    addItem,
    updateItem,
    deleteItem,
    createPago,
    deletePago,
    recalculateTrabajo,
    updateCliente,
    setItems,
    documentos,
    getDocumentosByTrabajo,
    createDocumento,
    deleteDocumento,
    isLoading
  } = useApp();
  
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [pagoFormOpen, setPagoFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deletePagoId, setDeletePagoId] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfTipo, setPdfTipo] = useState<'presupuesto' | 'factura'>('presupuesto');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<typeof documentos[0] | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  
  const trabajo = getTrabajoById(id || '');
  const cliente = trabajo ? clientes.find(c => c.id === trabajo.clienteId) : undefined;
  const tipoTrabajo = trabajo ? tiposTrabajo.find(t => t.id === trabajo.tipoTrabajoId) : undefined;
  const trabajoItems = trabajo ? getItemsByTrabajoId(trabajo.id) : [];
  const trabajoPagos = trabajo ? pagos.filter(p => p.trabajoId === trabajo.id) : [];
  const trabajoDocumentos = trabajo ? getDocumentosByTrabajo(trabajo.id) : [];

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

  const completedItems = trabajoItems.filter(i => i.estado === 'Completado').length;
  const progress = trabajoItems.length > 0 ? Math.round((completedItems / trabajoItems.length) * 100) : 0;

  // Handle estado change for trabajo
  const handleEstadoTrabajoChange = async (newEstado: EstadoTrabajo) => {
    await updateTrabajoEstado(trabajo.id, newEstado);
  };

  // Handle estado change for item
  const handleEstadoItemChange = async (itemId: string, newEstado: EstadoItem) => {
    await updateItemEstado(itemId, newEstado);
  };

  // Handle add item
  const handleAddItem = async (data: any) => {
    await addItem(trabajo.id, data);
    setItemFormOpen(false);
  };

  // Handle edit item
  const handleEditItem = async (data: any) => {
    if (editingItem) {
      await updateItem(editingItem, data);
      setEditingItem(null);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (deleteItemId) {
      const success = await deleteItem(deleteItemId, pagos);
      if (success) {
        setDeleteItemId(null);
      }
    }
  };

  // Recalculate client debt - done via setClientes in hook

  // Handle pago creation with balance updates
  const handleCreatePago = async (data: any) => {
    await createPago(data, (trabajoId, monto, itemId) => {
      if (itemId) {
        // Apply to specific item
        const newItems = applyPagoToItem(items, itemId, monto);
        setItems(newItems);
      } else {
        // Distribute among items with balance
        const trabajoItemsWithBalance = items.filter(i => i.trabajoId === trabajoId && i.saldo > 0);
        if (trabajoItemsWithBalance.length > 0) {
          const updatedItems = distributeGeneralPago(trabajoItemsWithBalance, monto);
          setItems(prev => prev.map(i => {
            const updated = updatedItems.find(ui => ui.id === i.id);
            return updated || i;
          }));
        }
      }
      
      // Recalculate trabajo totals
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
          // Reverse from specific item (monto is negative)
          const newItems = applyPagoToItem(items, itemId, monto);
          setItems(newItems);
        } else {
          // Can't easily reverse distributed, just recalc
        }
        
        setTimeout(() => {
          recalculateTrabajo(trabajoId);
        }, 100);
      });
      setDeletePagoId(null);
    }
  };

  const handleGeneratePDF = () => {
    if (!trabajo || !cliente) return;
    
    generateTrabajoPDF({
      profesional: profesionalMock,
      cliente,
      trabajo,
      items: trabajoItems,
      tipo: pdfTipo,
      incluirIVA: true,
      tasaIVA: 10,
    });
    
    toast.success(`${pdfTipo === 'presupuesto' ? 'Presupuesto' : 'Factura'} generado exitosamente`);
    setPdfDialogOpen(false);
  };

  const editingItemData = editingItem ? trabajoItems.find(i => i.id === editingItem) : null;

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
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{trabajo.nombreTrabajo}</h1>
              <Select value={trabajo.estado} onValueChange={handleEstadoTrabajoChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadoTrabajoOptions.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground mt-1">{trabajo.descripcionTrabajo}</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setPdfTipo('presupuesto'); setPdfDialogOpen(true); }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Presupuesto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setPdfTipo('factura'); setPdfDialogOpen(true); }}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Factura / Recibo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            {completedItems} de {trabajoItems.length} pasos completados
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="items">Pasos ({trabajoItems.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({trabajoPagos.length})</TabsTrigger>
          <TabsTrigger value="presupuestos">Presupuestos</TabsTrigger>
          <TabsTrigger value="historial">
            <History className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        {/* Items tab */}
        <TabsContent value="items" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Pasos del Trabajo</h3>
              <Button size="sm" onClick={() => setItemFormOpen(true)}>
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
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabajoItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numeroPaso}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.nombreItem}</p>
                        <p className="text-sm text-muted-foreground">{item.descripcionItem}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.estado} 
                        onValueChange={(value) => handleEstadoItemChange(item.id, value as EstadoItem)}
                      >
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
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingItem(item.id)}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setDeleteItemId(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {trabajoItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay pasos. Agrega el primer paso del trabajo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pagos tab */}
        <TabsContent value="pagos" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Historial de Pagos</h3>
              <Button size="sm" onClick={() => setPagoFormOpen(true)} disabled={trabajo.saldoPendiente <= 0}>
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
                  <TableHead>Aplicado a</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabajoPagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  trabajoPagos.map((pago) => {
                    const itemPago = pago.itemId ? trabajoItems.find(i => i.id === pago.itemId) : null;
                    return (
                      <TableRow key={pago.id}>
                        <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                        <TableCell className="font-medium text-success">
                          {formatCurrency(pago.monto)}
                        </TableCell>
                        <TableCell>{pago.metodoPago}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {itemPago ? itemPago.nombreItem : 'General'}
                        </TableCell>
                        <TableCell>{pago.referenciaPago || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{pago.notasPago || '-'}</TableCell>
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
        </TabsContent>

        {/* Presupuestos tab */}
        <TabsContent value="presupuestos" className="mt-4">
          <div className="card-elevated p-6">
            <PresupuestoVersiones trabajo={trabajo} items={trabajoItems} />
          </div>
        </TabsContent>

        {/* Historial/Timeline tab */}
        <TabsContent value="historial" className="mt-4">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Historial del Trabajo</h3>
            </div>
            <TrabajoTimeline 
              trabajo={trabajo} 
              items={trabajoItems} 
              pagos={trabajoPagos}
              clienteNombre={cliente?.nombreCompleto}
            />
          </div>
        </TabsContent>

        {/* Documentos tab */}
        <TabsContent value="documentos" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Documentos del trabajo</h3>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir documento
              </Button>
            </div>
            
            {trabajoDocumentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {trabajoDocumentos.map((doc) => (
                  <DocumentoCard
                    key={doc.id}
                    documento={doc}
                    showAssociations={false}
                    onView={setViewingDoc}
                    onDelete={(d) => setDeleteDocId(d.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Sin documentos</h3>
                <p className="text-muted-foreground mb-4">
                  Adjunta documentos relacionados a este trabajo
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir documento
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notas tab */}
        <TabsContent value="notas" className="mt-4">
          <NotasEditor
            notas={trabajo.notasInternas || ''}
            onSave={async (notas) => {
              await updateTrabajo(trabajo.id, { notasInternas: notas });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Item Form - Create */}
      <ItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSubmit={handleAddItem}
        isLoading={isLoading}
        mode="create"
      />

      {/* Item Form - Edit */}
      <ItemForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSubmit={handleEditItem}
        isLoading={isLoading}
        mode="edit"
        defaultValues={editingItemData ? {
          nombreItem: editingItemData.nombreItem,
          descripcionItem: editingItemData.descripcionItem,
          costoTotal: editingItemData.costoTotal,
          diasEstimados: editingItemData.diasEstimados,
        } : undefined}
      />

      {/* Pago Form */}
      <PagoForm
        open={pagoFormOpen}
        onOpenChange={setPagoFormOpen}
        trabajos={[trabajo]}
        onSubmit={handleCreatePago}
        isLoading={isLoading}
      />

      {/* Delete Item Confirm */}
      <DeleteConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Eliminar paso"
        description="¿Estás seguro de que deseas eliminar este paso? Esta acción no se puede deshacer."
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

      {/* PDF Generation Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Generar {pdfTipo === 'presupuesto' ? 'Presupuesto' : 'Factura'}
            </DialogTitle>
            <DialogDescription>
              Se generará un PDF con los datos del trabajo y los ítems asociados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{cliente?.nombreCompleto}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trabajo:</span>
              <span className="font-medium">{trabajo.nombreTrabajo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total ítems:</span>
              <span className="font-medium">{trabajoItems.length}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Monto total:</span>
              <span className="font-bold">{formatCurrency(trabajo.costoFinal)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 mr-2" />
              Generar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documento Upload */}
      <DocumentoUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={async (files, metadata) => {
          for (const file of files) {
            await createDocumento(file, {
              tipo: metadata.tipo,
              descripcion: metadata.descripcion,
              trabajoId: trabajo.id,
            });
          }
        }}
        trabajoId={trabajo.id}
        isLoading={isLoading}
      />

      {/* Documento Viewer */}
      <DocumentoViewer
        documento={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />

      {/* Delete Documento Confirm */}
      <DeleteConfirmDialog
        open={!!deleteDocId}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
        onConfirm={async () => {
          if (deleteDocId) {
            await deleteDocumento(deleteDocId);
            setDeleteDocId(null);
          }
        }}
        title="Eliminar documento"
        description="¿Estás seguro de que deseas eliminar este documento?"
        isLoading={isLoading}
      />
    </div>
  );
}
