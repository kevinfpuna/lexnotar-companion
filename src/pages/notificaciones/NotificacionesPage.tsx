import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Trash2, Calendar, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificaciones, Notificacion } from '@/hooks/useNotificaciones';
import { cn } from '@/lib/utils';

const typeConfig: Record<Notificacion['type'], { icon: typeof Bell; color: string; label: string }> = {
  evento: { icon: Calendar, color: 'text-blue-500', label: 'Evento' },
  vencimiento: { icon: Clock, color: 'text-orange-500', label: 'Vencimiento' },
  'item-listo': { icon: AlertTriangle, color: 'text-yellow-500', label: 'Item Listo' },
  deuda: { icon: DollarSign, color: 'text-red-500', label: 'Deuda Alta' },
};

export default function NotificacionesPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearDismissed,
  } = useNotificaciones();

  const handleNotificationClick = (notification: Notificacion) => {
    markAsRead(notification.id);
    navigate(notification.link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones han sido leídas'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
          <Button variant="ghost" onClick={clearDismissed}>
            <Trash2 className="h-4 w-4 mr-2" />
            Restaurar descartadas
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las notificaciones</CardTitle>
          <CardDescription>
            Haz clic en una notificación para ir a los detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                const isRead = !!notification.readAt;

                return (
                  <div key={notification.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <div
                      className={cn(
                        "flex items-start gap-4 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
                        !isRead && "bg-muted/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon */}
                      <div className={cn("p-2 rounded-full bg-muted", config.color)}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", !isRead && "font-semibold")}>
                            {notification.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {!isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.subtitle}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          title="Descartar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
