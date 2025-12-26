import { Bell, BellOff, BellRing, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  soundEnabled?: boolean;
  onSoundEnabledChange?: (enabled: boolean) => void;
}

export function NotificationSettings({ 
  soundEnabled = true, 
  onSoundEnabledChange 
}: NotificationSettingsProps) {
  const { permission, isSupported, requestPermission, showNotification } = usePushNotifications();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notificaciones activadas');
    } else {
      toast.error('No se pudo activar las notificaciones');
    }
  };

  const handleTestNotification = () => {
    showNotification('Prueba de notificación', {
      body: 'Las notificaciones están funcionando correctamente',
      tag: 'test-notification',
    });
    toast.success('Notificación de prueba enviada');
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <Check className="h-3 w-3 mr-1" />
            Activadas
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <BellOff className="h-3 w-3 mr-1" />
            Bloqueadas
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No soportado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Bell className="h-3 w-3 mr-1" />
            Sin configurar
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <BellRing className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Notificaciones Push</h3>
          <p className="text-sm text-muted-foreground">
            Recibe alertas de vencimientos en tu navegador
          </p>
        </div>
        {getPermissionBadge()}
      </div>

      <div className="space-y-4">
        {!isSupported && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning-foreground">
              Tu navegador no soporta notificaciones push. Prueba con Chrome, Firefox o Edge.
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Las notificaciones están bloqueadas. Para activarlas, haz clic en el icono de candado 
              en la barra de direcciones y permite las notificaciones.
            </p>
          </div>
        )}

        {permission === 'default' && isSupported && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Activar notificaciones</p>
              <p className="text-xs text-muted-foreground">
                Recibirás alertas cuando tengas eventos próximos
              </p>
            </div>
            <Button onClick={handleRequestPermission}>
              <Bell className="h-4 w-4 mr-2" />
              Activar
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label htmlFor="sound-notifications" className="cursor-pointer">
                  Sonido de notificación
                </Label>
              </div>
              <Switch
                id="sound-notifications"
                checked={soundEnabled}
                onCheckedChange={onSoundEnabledChange}
              />
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleTestNotification}>
                <BellRing className="h-4 w-4 mr-2" />
                Enviar notificación de prueba
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
