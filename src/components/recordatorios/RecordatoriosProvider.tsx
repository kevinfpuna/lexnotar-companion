import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useRecordatorios } from '@/hooks/useRecordatorios';

export function RecordatoriosProvider() {
  const { eventos, updateEvento } = useApp();
  const navigate = useNavigate();

  const handleEventoRecordado = async (eventoId: string) => {
    // Mark as shown and navigate to calendar
    await updateEvento(eventoId, { recordatorioMostrado: true });
    navigate('/calendario');
  };

  useRecordatorios({
    eventos,
    onEventoRecordado: handleEventoRecordado,
    checkIntervalMs: 60000, // Check every minute
    enabled: true,
  });

  return null; // This component only provides functionality, no UI
}
