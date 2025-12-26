import { FileText, Image, File, Eye, Download, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Documento } from '@/types';
import { isImageFile, isPdfFile, downloadFromBase64 } from '@/hooks/useDocumentos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface DocumentoCardProps {
  documento: Documento;
  clienteNombre?: string;
  trabajoNombre?: string;
  onView: (documento: Documento) => void;
  onEdit?: (documento: Documento) => void;
  onDelete: (documento: Documento) => void;
  showAssociations?: boolean;
}

const getFileIcon = (mimeType: string) => {
  if (isImageFile(mimeType)) return Image;
  if (isPdfFile(mimeType)) return FileText;
  return File;
};

const formatFileSize = (sizeKB: number): string => {
  if (sizeKB < 1024) return `${sizeKB} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
};

export function DocumentoCard({
  documento,
  clienteNombre,
  trabajoNombre,
  onView,
  onEdit,
  onDelete,
  showAssociations = true,
}: DocumentoCardProps) {
  const IconComponent = getFileIcon(documento.mimeType);
  const isImage = isImageFile(documento.mimeType);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFromBase64(documento);
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => onView(documento)}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail or Icon */}
        {isImage ? (
          <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={documento.archivoBase64}
              alt={documento.nombre}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" title={documento.nombre}>
            {documento.nombre}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {documento.tipo}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(documento.size)}
            </span>
          </div>
          
          {/* Associations */}
          {showAssociations && (
            <div className="mt-2 text-xs text-muted-foreground truncate">
              {documento.clienteId && clienteNombre && (
                <Link 
                  to={`/clientes/${documento.clienteId}`}
                  className="hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {clienteNombre}
                </Link>
              )}
              {documento.clienteId && documento.trabajoId && ' • '}
              {documento.trabajoId && trabajoNombre && (
                <Link 
                  to={`/trabajos/${documento.trabajoId}`}
                  className="hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {trabajoNombre}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {format(documento.fechaSubida, 'dd/MM/yyyy', { locale: es })}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onView(documento); }}
            title="Ver"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleDownload}
            title="Descargar"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onEdit(documento); }}
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(documento); }}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
