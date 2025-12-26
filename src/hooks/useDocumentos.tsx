import { useCallback } from 'react';
import { Documento } from '@/types';
import { toast } from 'sonner';
import { generateId } from '@/lib/calculations';
import { useLocalStorage } from './useLocalStorage';

// Utility functions for base64 handling
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const downloadFromBase64 = (doc: Documento) => {
  try {
    // Handle both with and without data URI prefix
    const base64Data = doc.archivoBase64.includes(',') 
      ? doc.archivoBase64.split(',')[1] 
      : doc.archivoBase64;
    
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: doc.mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = doc.nombre;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Error al descargar el archivo');
  }
};

export const getMimeType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

// Initial mock data - small base64 representations
const documentosMock: Documento[] = [
  {
    id: '1',
    nombre: 'CI Juan Carlos Pérez.pdf',
    tipo: 'CI',
    archivoBase64: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMjkKJSVFT0Y=',
    mimeType: 'application/pdf',
    size: 245,
    fechaSubida: new Date('2024-12-01'),
    fechaActualizacion: new Date('2024-12-01'),
    clienteId: '1',
    descripcion: 'Cédula de identidad del cliente',
    tags: ['identificación', 'cliente'],
  },
  {
    id: '2',
    nombre: 'Título Propiedad Lote 15.pdf',
    tipo: 'Título',
    archivoBase64: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMjkKJSVFT0Y=',
    mimeType: 'application/pdf',
    size: 1240,
    fechaSubida: new Date('2024-11-20'),
    fechaActualizacion: new Date('2024-11-20'),
    trabajoId: '2',
    descripcion: 'Título de propiedad del lote 15',
    tags: ['inmueble', 'título'],
  },
  {
    id: '3',
    nombre: 'Poder Especial Bancario.pdf',
    tipo: 'Poder',
    archivoBase64: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMjkKJSVFT0Y=',
    mimeType: 'application/pdf',
    size: 89,
    fechaSubida: new Date('2024-12-02'),
    fechaActualizacion: new Date('2024-12-02'),
    trabajoId: '1',
    clienteId: '1',
    descripcion: 'Poder especial para operar cuentas bancarias',
    tags: ['poder', 'banco'],
  },
];

interface CreateDocumentoData {
  tipo: string;
  clienteId?: string;
  trabajoId?: string;
  itemId?: string;
  descripcion?: string;
  tags?: string[];
  vigenciaHasta?: Date;
}

export function useDocumentos() {
  const [documentos, setDocumentos] = useLocalStorage<Documento[]>('lexnotar_documentos', documentosMock);

  const createDocumento = useCallback(async (file: File, metadata: CreateDocumentoData): Promise<Documento> => {
    try {
      // Validate file size (max 10MB)
      const maxSizeMB = 10;
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
      }
      
      const base64 = await fileToBase64(file);
      
      const newDoc: Documento = {
        id: generateId(),
        nombre: file.name,
        tipo: metadata.tipo,
        archivoBase64: base64,
        mimeType: file.type || getMimeType(file.name),
        size: Math.round(file.size / 1024), // KB
        fechaSubida: new Date(),
        fechaActualizacion: new Date(),
        clienteId: metadata.clienteId,
        trabajoId: metadata.trabajoId,
        itemId: metadata.itemId,
        descripcion: metadata.descripcion,
        tags: metadata.tags,
        vigenciaHasta: metadata.vigenciaHasta,
      };
      
      setDocumentos(prev => [...prev, newDoc]);
      toast.success('Documento subido exitosamente');
      return newDoc;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir documento';
      toast.error(message);
      throw error;
    }
  }, [setDocumentos]);

  const updateDocumento = useCallback(async (id: string, updates: Partial<Omit<Documento, 'id' | 'archivoBase64' | 'mimeType' | 'size' | 'fechaSubida'>>): Promise<void> => {
    setDocumentos(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, fechaActualizacion: new Date() }
        : doc
    ));
    
    toast.success('Documento actualizado');
  }, [setDocumentos]);

  const deleteDocumento = useCallback(async (id: string): Promise<boolean> => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id));
    toast.success('Documento eliminado');
    return true;
  }, [setDocumentos]);

  const getDocumentosByCliente = useCallback((clienteId: string): Documento[] => {
    return documentos.filter(doc => doc.clienteId === clienteId);
  }, [documentos]);

  const getDocumentosByTrabajo = useCallback((trabajoId: string): Documento[] => {
    return documentos.filter(doc => doc.trabajoId === trabajoId);
  }, [documentos]);

  const downloadDocumento = useCallback((doc: Documento): void => {
    downloadFromBase64(doc);
  }, []);

  return {
    documentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    getDocumentosByCliente,
    getDocumentosByTrabajo,
    downloadDocumento,
    setDocumentos,
  };
}
