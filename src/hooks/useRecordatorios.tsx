import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { EventoCalendario } from '@/types';
import { differenceInMinutes, format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Calendar, Clock } from 'lucide-react';
import { usePushNotifications } from './usePushNotifications';

interface UseRecordatoriosOptions {
  eventos: EventoCalendario[];
  onEventoRecordado?: (eventoId: string) => void;
  checkIntervalMs?: number;
  enabled?: boolean;
  pushNotificationsEnabled?: boolean;
}

export function useRecordatorios({
  eventos,
  onEventoRecordado,
  checkIntervalMs = 60000, // Check every minute
  enabled = true,
  pushNotificationsEnabled = true,
}: UseRecordatoriosOptions) {
  const shownRecordatorios = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { permission, showNotification } = usePushNotifications();

  const formatTimeDisplay = useCallback((eventoDate: Date, minutesUntilEvent: number, hoursUntilEvent: number) => {
    if (minutesUntilEvent < 60) {
      return `en ${minutesUntilEvent} minutos`;
    } else if (hoursUntilEvent < 24) {
      return `en ${Math.round(hoursUntilEvent)} horas`;
    } else if (isToday(eventoDate)) {
      return 'hoy';
    } else if (isTomorrow(eventoDate)) {
      return 'mañana';
    } else {
      return format(eventoDate, "EEEE d 'de' MMMM", { locale: es });
    }
  }, []);

  const showPushNotification = useCallback((evento: EventoCalendario, timeDisplay: string, isUrgent: boolean = false) => {
    if (!pushNotificationsEnabled || permission !== 'granted') return;

    const title = isUrgent 
      ? `¡${evento.tituloEvento} es ahora!`
      : `Recordatorio: ${evento.tituloEvento}`;
    
    const body = isUrgent
      ? evento.descripcion || 'El evento está ocurriendo ahora'
      : `${timeDisplay}${evento.horaEvento ? ` • ${evento.horaEvento}` : ''}${evento.descripcion ? `\n${evento.descripcion}` : ''}`;

    showNotification(title, {
      body,
      tag: `evento-${evento.id}`,
      requireInteraction: isUrgent,
      silent: false,
    });
  }, [pushNotificationsEnabled, permission, showNotification]);

  const checkRecordatorios = useCallback(() => {
    if (!enabled || eventos.length === 0) return;

    const now = new Date();

    eventos.forEach((evento) => {
      // Skip if already shown
      if (shownRecordatorios.current.has(evento.id)) return;
      if (evento.recordatorioMostrado) return;

      const eventoDate = new Date(evento.fechaEvento);
      
      // If evento has a specific time, use it
      if (evento.horaEvento) {
        const [hours, minutes] = evento.horaEvento.split(':').map(Number);
        eventoDate.setHours(hours, minutes, 0, 0);
      } else {
        // Default to 9:00 AM if no time specified
        eventoDate.setHours(9, 0, 0, 0);
      }

      const minutesUntilEvent = differenceInMinutes(eventoDate, now);
      const hoursUntilEvent = minutesUntilEvent / 60;

      // Determine if we should show reminder based on recordatorioHorasAntes
      const reminderHours = evento.recordatorioHorasAntes || 24;
      
      // Show reminder if we're within the reminder window but event hasn't passed
      if (minutesUntilEvent > 0 && hoursUntilEvent <= reminderHours) {
        shownRecordatorios.current.add(evento.id);
        
        const timeDisplay = formatTimeDisplay(eventoDate, minutesUntilEvent, hoursUntilEvent);

        // Show push notification
        showPushNotification(evento, timeDisplay, false);

        // Show toast notification
        toast(evento.tituloEvento, {
          description: (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                <span>{timeDisplay}</span>
                {evento.horaEvento && (
                  <span className="text-muted-foreground">• {evento.horaEvento}</span>
                )}
              </div>
              {evento.descripcion && (
                <p className="text-xs text-muted-foreground mt-1">{evento.descripcion}</p>
              )}
            </div>
          ),
          icon: <Bell className="h-4 w-4 text-primary" />,
          duration: 10000,
          action: {
            label: 'Ver',
            onClick: () => onEventoRecordado?.(evento.id),
          },
        });
      }

      // Also show notification for events happening right now (within 5 minutes)
      if (minutesUntilEvent >= -5 && minutesUntilEvent <= 5 && !shownRecordatorios.current.has(`now-${evento.id}`)) {
        shownRecordatorios.current.add(`now-${evento.id}`);
        
        // Show urgent push notification
        showPushNotification(evento, '', true);
        
        toast.warning(`¡${evento.tituloEvento} es ahora!`, {
          description: evento.descripcion,
          icon: <Calendar className="h-4 w-4" />,
          duration: 15000,
        });
      }
    });
  }, [eventos, enabled, onEventoRecordado, formatTimeDisplay, showPushNotification]);

  // Initial check and interval setup
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkRecordatorios();

    // Set up interval
    intervalRef.current = setInterval(checkRecordatorios, checkIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkRecordatorios, checkIntervalMs, enabled]);

  // Reset shown recordatorios when eventos change
  useEffect(() => {
    // Only keep recordatorios that still exist
    const currentIds = new Set(eventos.map(e => e.id));
    shownRecordatorios.current = new Set(
      [...shownRecordatorios.current].filter(id => 
        currentIds.has(id) || currentIds.has(id.replace('now-', ''))
      )
    );
  }, [eventos]);

  return {
    checkNow: checkRecordatorios,
    clearShown: () => shownRecordatorios.current.clear(),
  };
}
