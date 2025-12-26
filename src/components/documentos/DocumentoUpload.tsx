import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { TipoDocumento } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const tiposDocumento: TipoDocumento[] = [
  'CI', 'Poder', 'Título', 'Contrato', 'Presupuesto', 
  'Acta', 'Sentencia', 'Comprobante pago', 'Otro'
];

interface DocumentoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], metadata: {
    tipo: TipoDocumento;
    descripcion?: string;
    clienteId?: string;
    trabajoId?: string;
  }) => Promise<void>;
  clienteId?: string;
  trabajoId?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
}

interface SelectedFile {
  file: File;
  preview?: string;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return Image;
  if (file.type === 'application/pdf') return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DocumentoUpload({
  open,
  onOpenChange,
  onUpload,
  clienteId,
  trabajoId,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx',
  maxSizeMB = 10,
  isLoading,
}: DocumentoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [tipo, setTipo] = useState<TipoDocumento>('Otro');
  const [descripcion, setDescripcion] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles: SelectedFile[] = [];
    
    Array.from(files).forEach(file => {
      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" excede ${maxSizeMB}MB`);
        return;
      }
      
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      validFiles.push({ file, preview });
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }
    
    try {
      await onUpload(
        selectedFiles.map(f => f.file),
        {
          tipo,
          descripcion: descripcion || undefined,
          clienteId,
          trabajoId,
        }
      );
      
      // Cleanup
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setSelectedFiles([]);
      setTipo('Otro');
      setDescripcion('');
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    selectedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    setTipo('Otro');
    setDescripcion('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir Documentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Upload className={cn(
              "h-10 w-10 mx-auto mb-3",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="font-medium">
              {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, imágenes, Word, Excel (máx. {maxSizeMB}MB)
            </p>
          </div>

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos seleccionados ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((item, index) => {
                  const IconComponent = getFileIcon(item.file);
                  return (
                    <Card key={index} className="p-2 flex items-center gap-3">
                      {item.preview ? (
                        <img 
                          src={item.preview} 
                          alt={item.file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <Label>Tipo de documento *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoDocumento)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del documento..."
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedFiles.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subir {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
