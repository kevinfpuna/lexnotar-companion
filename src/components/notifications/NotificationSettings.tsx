import { Bell, BellOff, BellRing, Check, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRecordatoriosConfig } from '@/hooks/useRecordatoriosConfig';
import { toast } from 'sonner';

export function NotificationSettings() {
  const { permission, isSupported, requestPermission, showNotification } = usePushNotifications();
  const { config, setHorasAnticipacion, setSoundEnabled } = useRecordatoriosConfig();

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

  const handleHorasChange = (value: string) => {
    setHorasAnticipacion(parseInt(value, 10));
    toast.success('Tiempo de anticipación actualizado');
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
          <h3 className="font-semibold">Notificaciones y Recordatorios</h3>
          <p className="text-sm text-muted-foreground">
            Configura alertas y recordatorios de eventos
          </p>
        </div>
        {getPermissionBadge()}
      </div>

      <div className="space-y-4">
        {/* Configuración de tiempo de anticipación */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="font-medium">Tiempo de anticipación</Label>
          </div>
          <div className="flex items-center gap-4">
            <Select 
              value={config.horasAnticipacionDefault.toString()} 
              onValueChange={handleHorasChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hora antes</SelectItem>
                <SelectItem value="2">2 horas antes</SelectItem>
                <SelectItem value="4">4 horas antes</SelectItem>
                <SelectItem value="12">12 horas antes</SelectItem>
                <SelectItem value="24">1 día antes</SelectItem>
                <SelectItem value="48">2 días antes</SelectItem>
                <SelectItem value="72">3 días antes</SelectItem>
                <SelectItem value="168">1 semana antes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Se aplicará a nuevos eventos
            </p>
          </div>
        </div>

        <Separator />

        {/* Notificaciones push */}
        <div className="space-y-3">
          <Label className="font-medium">Notificaciones Push</Label>
          
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label htmlFor="sound-notifications" className="cursor-pointer">
                    Sonido de notificación
                  </Label>
                </div>
                <Switch
                  id="sound-notifications"
                  checked={config.soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <BellRing className="h-4 w-4 mr-2" />
                  Enviar notificación de prueba
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}