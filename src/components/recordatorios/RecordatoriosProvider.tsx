import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { useVencimientos } from '@/hooks/useVencimientos';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRecordatoriosConfig } from '@/hooks/useRecordatoriosConfig';
import { toast } from 'sonner';
import { AlertTriangle, Clock } from 'lucide-react';

export function RecordatoriosProvider() {
  const { eventos, trabajos, items, updateEvento } = useApp();
  const navigate = useNavigate();
  const { permission, showNotification } = usePushNotifications();
  const { config } = useRecordatoriosConfig();
  const { urgentes, vencidos } = useVencimientos(trabajos, items);
  const shownVencimientos = useRef<Set<string>>(new Set());
  const lastCheckDate = useRef<string>(new Date().toDateString());

  const handleEventoRecordado = async (eventoId: string) => {
    // Mark as shown and navigate to calendar
    await updateEvento(eventoId, { recordatorioMostrado: true });
    navigate('/calendario');
  };

  // Use recordatorios hook for calendar events
  useRecordatorios({
    eventos,
    onEventoRecordado: handleEventoRecordado,
    checkIntervalMs: 60000, // Check every minute
    enabled: config.toastEventosEnabled,
    pushNotificationsEnabled: permission === 'granted' && config.pushEventosEnabled,
  });

  // Check and notify for vencimientos
  const checkVencimientos = useCallback(() => {
    // Skip if notifications disabled
    if (!config.toastVencimientosEnabled && !config.pushVencimientosEnabled) return;

    const today = new Date().toDateString();
    
    // Reset shown vencimientos on new day
    if (today !== lastCheckDate.current) {
      shownVencimientos.current.clear();
      lastCheckDate.current = today;
    }

    // Show notifications for urgent and overdue items
    [...vencidos, ...urgentes].forEach((vencimiento) => {
      const notifKey = `${vencimiento.tipo}-${vencimiento.id}-${today}`;
      
      if (shownVencimientos.current.has(notifKey)) return;
      shownVencimientos.current.add(notifKey);

      const isOverdue = vencimiento.estado === 'vencido';
      const title = isOverdue 
        ? `¡Vencido! ${vencimiento.titulo}`
        : `Vence pronto: ${vencimiento.titulo}`;
      
      const description = isOverdue
        ? `Venció hace ${Math.abs(vencimiento.diasRestantes)} día${Math.abs(vencimiento.diasRestantes) !== 1 ? 's' : ''}`
        : vencimiento.diasRestantes === 0 
          ? 'Vence hoy'
          : vencimiento.diasRestantes === 1 
            ? 'Vence mañana'
            : `Vence en ${vencimiento.diasRestantes} días`;

      // Show push notification if enabled
      if (permission === 'granted' && config.pushVencimientosEnabled) {
        showNotification(title, {
          body: description,
          tag: notifKey,
          requireInteraction: isOverdue,
        });
      }

      // Show toast notification if enabled
      if (config.toastVencimientosEnabled) {
        if (isOverdue) {
          toast.error(title, {
            description,
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 10000,
            action: {
              label: 'Ver',
              onClick: () => {
                if (vencimiento.trabajoId) {
                  navigate(`/trabajos/${vencimiento.trabajoId}`);
                }
              },
            },
          });
        } else {
          toast.warning(title, {
            description,
            icon: <Clock className="h-4 w-4" />,
            duration: 8000,
            action: {
              label: 'Ver',
              onClick: () => {
                if (vencimiento.trabajoId) {
                  navigate(`/trabajos/${vencimiento.trabajoId}`);
                }
              },
            },
          });
        }
      }
    });
  }, [vencidos, urgentes, permission, showNotification, navigate, config.toastVencimientosEnabled, config.pushVencimientosEnabled]);

  // Check vencimientos on mount and every 5 minutes
  useEffect(() => {
    // Initial check after a small delay to allow data to load
    const initialTimeout = setTimeout(checkVencimientos, 2000);
    
    // Set up interval
    const intervalId = setInterval(checkVencimientos, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [checkVencimientos]);

  return null; // This component only provides functionality, no UI
}
