import { format } from 'date-fns';
import { toast } from 'sonner';

interface BackupData {
  version: string;
  timestamp: string;
  clientes: any[];
  trabajos: any[];
  items: any[];
  pagos: any[];
  eventos: any[];
  documentos: any[];
  tiposCliente: any[];
  tiposTrabajo: any[];
  categorias: any[];
  estadosKanban: any[];
}

export const exportBackup = (data: Omit<BackupData, 'version' | 'timestamp'>) => {
  try {
    const backup: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...data,
      // Omitir archivos base64 de documentos para reducir tamaño
      documentos: data.documentos.map(doc => ({
        ...doc,
        archivoBase64: '[OMITIDO_EN_BACKUP]',
      })),
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lexnotar-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success('Respaldo exportado correctamente');
  } catch (error) {
    console.error('Error exporting backup:', error);
    toast.error('Error al exportar respaldo');
  }
};

export const importBackup = async (
  file: File,
  onSuccess: (data: BackupData) => void
): Promise<void> => {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);

    // Validar estructura básica
    if (!backup.version || !backup.timestamp) {
      throw new Error('Archivo de respaldo inválido');
    }

    // Confirmar con usuario
    const confirmed = window.confirm(
      `¿Estás seguro de restaurar el respaldo del ${format(new Date(backup.timestamp), 'dd/MM/yyyy HH:mm')}?\n\n` +
      `Esto reemplazará todos los datos actuales.\n\n` +
      `Clientes: ${backup.clientes?.length || 0}\n` +
      `Trabajos: ${backup.trabajos?.length || 0}\n` +
      `Pagos: ${backup.pagos?.length || 0}\n` +
      `Eventos: ${backup.eventos?.length || 0}`
    );

    if (!confirmed) return;

    onSuccess(backup);
    toast.success('Respaldo restaurado correctamente. Recargando...');
    
    // Recargar para aplicar cambios
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('Error importing backup:', error);
    toast.error('Error al importar respaldo. Verifica que el archivo sea válido.');
  }
};
