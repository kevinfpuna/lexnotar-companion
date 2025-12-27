import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/mockData';

export interface Notificacion {
  id: string;
  type: 'evento' | 'vencimiento' | 'item-listo' | 'deuda';
  title: string;
  subtitle: string;
  link: string;
  createdAt: Date;
  readAt?: Date;
}

interface NotificacionesState {
  readIds: string[];
  dismissedIds: string[];
}

export function useNotificaciones() {
  const { eventos, trabajos, items, clientes } = useApp();
  const [state, setState] = useLocalStorage<NotificacionesState>('notificaciones-state', {
    readIds: [],
    dismissedIds: [],
  });

  // Generate notifications dynamically
  const allNotifications = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

    const notifications: Notificacion[] = [
      // Upcoming events (7 days)
      ...eventos
        .filter(e => e.fechaEvento >= today && e.fechaEvento <= nextWeek)
        .map(e => ({
          id: `evento-${e.id}`,
          type: 'evento' as const,
          title: e.tituloEvento,
          subtitle: `${formatDate(e.fechaEvento)} • ${e.tipoEvento}`,
          link: '/calendario',
          createdAt: new Date(),
        })),

      // Jobs with upcoming deadline
      ...trabajos
        .filter(t => t.fechaFinEstimada <= nextWeek && t.estado !== 'Completado' && t.estado !== 'Cancelado')
        .map(t => ({
          id: `vencimiento-${t.id}`,
          type: 'vencimiento' as const,
          title: `Vence: ${t.nombreTrabajo}`,
          subtitle: formatDate(t.fechaFinEstimada),
          link: `/trabajos/${t.id}`,
          createdAt: new Date(),
        })),

      // Items in "Listo retirar" > 3 days
      ...items
        .filter(i => i.estado === 'Listo retirar' && i.fechaActualizacion <= threeDaysAgo)
        .map(i => {
          const trabajo = trabajos.find(t => t.id === i.trabajoId);
          return {
            id: `item-${i.id}`,
            type: 'item-listo' as const,
            title: `Listo para retirar: ${i.nombreItem}`,
            subtitle: trabajo?.nombreTrabajo || '',
            link: `/trabajos/${i.trabajoId}`,
            createdAt: new Date(),
          };
        }),

      // Clients with debt
      ...clientes
        .filter(c => c.deudaTotalActual > 50000000) // > 50M PYG
        .slice(0, 5)
        .map(c => ({
          id: `deuda-${c.id}`,
          type: 'deuda' as const,
          title: `Deuda alta: ${c.nombreCompleto}`,
          subtitle: `Gs. ${c.deudaTotalActual.toLocaleString()}`,
          link: `/clientes/${c.id}`,
          createdAt: new Date(),
        })),
    ];

    // Filter out dismissed notifications and add read status
    return notifications
      .filter(n => !state.dismissedIds.includes(n.id))
      .map(n => ({
        ...n,
        readAt: state.readIds.includes(n.id) ? new Date() : undefined,
      }));
  }, [eventos, trabajos, items, clientes, state.readIds, state.dismissedIds]);

  // Unread notifications
  const unreadNotifications = useMemo(
    () => allNotifications.filter(n => !n.readAt),
    [allNotifications]
  );

  // Mark single notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      readIds: prev.readIds.includes(notificationId)
        ? prev.readIds
        : [...prev.readIds, notificationId],
    }));
  }, [setState]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      readIds: [...new Set([...prev.readIds, ...allNotifications.map(n => n.id)])],
    }));
  }, [setState, allNotifications]);

  // Dismiss a notification (won't show again)
  const dismissNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      dismissedIds: [...prev.dismissedIds, notificationId],
    }));
  }, [setState]);

  // Clear all dismissed (show all again)
  const clearDismissed = useCallback(() => {
    setState(prev => ({
      ...prev,
      dismissedIds: [],
    }));
  }, [setState]);

  return {
    notifications: allNotifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearDismissed,
  };
}
