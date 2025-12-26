import { Download, X, ZoomIn, ZoomOut, Maximize2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Documento } from '@/types';
import { isImageFile, isPdfFile, downloadFromBase64 } from '@/hooks/useDocumentos';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentoViewerProps {
  documento: Documento | null;
  onClose: () => void;
  onEdit?: (documento: Documento) => void;
}

export function DocumentoViewer({ documento, onClose, onEdit }: DocumentoViewerProps) {
  const [zoom, setZoom] = useState(100);

  if (!documento) return null;

  const isImage = isImageFile(documento.mimeType);
  const isPdf = isPdfFile(documento.mimeType);

  const handleDownload = () => {
    downloadFromBase64(documento);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <Dialog open={!!documento} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{documento.nombre}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="secondary">{documento.tipo}</Badge>
                <span>{documento.size} KB</span>
                <span>•</span>
                <span>{format(documento.fechaSubida, 'PPP', { locale: es })}</span>
              </div>
              {documento.descripcion && (
                <p className="text-sm text-muted-foreground mt-2">
                  {documento.descripcion}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isImage && (
                <>
                  <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetZoom}>
                    {zoom}%
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onEdit && (
                <Button variant="outline" size="icon" onClick={() => onEdit(documento)} title="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleDownload} title="Descargar">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/50 rounded-lg">
          {isImage && (
            <div className="flex items-center justify-center min-h-full p-4">
              <img
                src={documento.archivoBase64}
                alt={documento.nombre}
                className="max-w-full h-auto transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          )}
          
          {isPdf && (
            <iframe
              src={documento.archivoBase64}
              className="w-full h-full border-0"
              title={documento.nombre}
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Maximize2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este tipo de archivo no puede mostrarse en el navegador.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
