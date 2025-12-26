import { useState, useMemo } from 'react';
import { 
  Upload, 
  FileText, 
  Search,
  Filter,
  X
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
import { useApp } from '@/contexts/AppContext';
import { DocumentoCard } from '@/components/documentos/DocumentoCard';
import { DocumentoUpload } from '@/components/documentos/DocumentoUpload';
import { DocumentoViewer } from '@/components/documentos/DocumentoViewer';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';

const tiposDocumento = ['CI', 'Poder', 'Título', 'Contrato', 'Presupuesto', 'Acta', 'Sentencia', 'Comprobante pago', 'Otro'];

export default function DocumentosPage() {
  const { 
    documentos, 
    clientes, 
    trabajos, 
    createDocumento, 
    deleteDocumento,
    isLoading 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [trabajoFilter, setTrabajoFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<typeof documentos[0] | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Get client/trabajo names for display
  const getClienteNombre = (clienteId?: string) => {
    if (!clienteId) return undefined;
    return clientes.find(c => c.id === clienteId)?.nombreCompleto;
  };

  const getTrabajoNombre = (trabajoId?: string) => {
    if (!trabajoId) return undefined;
    return trabajos.find(t => t.id === trabajoId)?.nombreTrabajo;
  };

  // Filter documents
  const filteredDocs = useMemo(() => {
    return documentos.filter(doc => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        doc.nombre.toLowerCase().includes(searchLower) ||
        doc.descripcion?.toLowerCase().includes(searchLower) ||
        getClienteNombre(doc.clienteId)?.toLowerCase().includes(searchLower) ||
        getTrabajoNombre(doc.trabajoId)?.toLowerCase().includes(searchLower);
      
      // Type filter
      const matchesTipo = tipoFilter === 'all' || doc.tipo === tipoFilter;
      
      // Client filter
      const matchesCliente = clienteFilter === 'all' || doc.clienteId === clienteFilter;
      
      // Trabajo filter
      const matchesTrabajo = trabajoFilter === 'all' || doc.trabajoId === trabajoFilter;
      
      // Date range filter
      const matchesDate = !dateRange?.from || !dateRange?.to || (
        doc.fechaSubida >= dateRange.from && 
        doc.fechaSubida <= dateRange.to
      );
      
      return matchesSearch && matchesTipo && matchesCliente && matchesTrabajo && matchesDate;
    });
  }, [documentos, searchQuery, tipoFilter, clienteFilter, trabajoFilter, dateRange, clientes, trabajos]);

  const hasActiveFilters = tipoFilter !== 'all' || clienteFilter !== 'all' || trabajoFilter !== 'all' || dateRange !== undefined;

  const clearFilters = () => {
    setTipoFilter('all');
    setClienteFilter('all');
    setTrabajoFilter('all');
    setDateRange(undefined);
    setSearchQuery('');
  };

  const handleUpload = async (files: File[], metadata: { tipo: string; descripcion?: string }) => {
    for (const file of files) {
      await createDocumento(file, {
        tipo: metadata.tipo,
        descripcion: metadata.descripcion,
      });
    }
  };

  const handleDelete = async () => {
    if (deleteDocId) {
      await deleteDocumento(deleteDocId);
      setDeleteDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos los documentos de clientes y trabajos
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tiposDocumento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={clienteFilter} onValueChange={setClienteFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombreCompleto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={trabajoFilter} onValueChange={setTrabajoFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los trabajos</SelectItem>
              {trabajos.map((trabajo) => (
                <SelectItem key={trabajo.id} value={trabajo.id}>
                  {trabajo.nombreTrabajo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Documents grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentoCard
              key={doc.id}
              documento={doc}
              clienteNombre={getClienteNombre(doc.clienteId)}
              trabajoNombre={getTrabajoNombre(doc.trabajoId)}
              onView={setViewingDoc}
              onDelete={(d) => setDeleteDocId(d.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">
            {documentos.length === 0 ? 'No hay documentos' : 'No se encontraron documentos'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {documentos.length === 0 
              ? 'Sube tu primer documento para comenzar'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {documentos.length === 0 && (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          )}
        </div>
      )}

      {/* Upload dialog */}
      <DocumentoUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
        isLoading={isLoading}
      />

      {/* Viewer */}
      <DocumentoViewer
        documento={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={!!deleteDocId}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        description="¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer."
        isLoading={isLoading}
      />
    </div>
  );
}
