import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Search,
  Filter,
  FolderOpen,
  Download,
  Trash2,
  Eye
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
import { Card } from '@/components/ui/card';
import { TipoDocumento } from '@/types';

const tiposDocumento: TipoDocumento[] = ['CI', 'Poder', 'Título', 'Contrato', 'Presupuesto', 'Acta', 'Sentencia', 'Comprobante pago', 'Otro'];

// Mock documents
const documentosMock = [
  { id: '1', nombre: 'CI Juan Carlos Pérez.pdf', tipo: 'CI' as TipoDocumento, cliente: 'Juan Carlos Pérez', fecha: new Date('2024-12-01'), size: 245 },
  { id: '2', nombre: 'Título Propiedad Lote 15.pdf', tipo: 'Título' as TipoDocumento, trabajo: 'Compraventa Lote 15', fecha: new Date('2024-11-20'), size: 1240 },
  { id: '3', nombre: 'Poder Especial Bancario.docx', tipo: 'Poder' as TipoDocumento, trabajo: 'Poder especial - Banco Continental', fecha: new Date('2024-12-02'), size: 89 },
  { id: '4', nombre: 'Presupuesto Sucesión.pdf', tipo: 'Presupuesto' as TipoDocumento, trabajo: 'Sucesión García Ramírez', fecha: new Date('2024-08-16'), size: 156 },
  { id: '5', nombre: 'Partida Defunción.pdf', tipo: 'Otro' as TipoDocumento, trabajo: 'Sucesión García Ramírez', fecha: new Date('2024-08-15'), size: 320 },
];

const getFileIcon = (nombre: string) => {
  if (nombre.endsWith('.pdf')) return FileText;
  if (nombre.match(/\.(jpg|jpeg|png|gif)$/i)) return Image;
  return File;
};

export default function DocumentosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');

  const filteredDocs = documentosMock.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.trabajo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || doc.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

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
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Filters */}
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
      </div>

      {/* Upload area */}
      <Card className="border-2 border-dashed border-border p-8">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Arrastra archivos aquí</h3>
          <p className="text-sm text-muted-foreground mb-4">
            o haz clic para seleccionar archivos desde tu computadora
          </p>
          <Button variant="outline">
            Seleccionar archivos
          </Button>
        </div>
      </Card>

      {/* Documents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.map((doc) => {
          const IconComponent = getFileIcon(doc.nombre);
          
          return (
            <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate" title={doc.nombre}>
                    {doc.nombre}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.tipo} • {doc.size} KB
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {doc.cliente || doc.trabajo}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {doc.fecha.toLocaleDateString('es-PY')}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron documentos</p>
        </div>
      )}
    </div>
  );
}
