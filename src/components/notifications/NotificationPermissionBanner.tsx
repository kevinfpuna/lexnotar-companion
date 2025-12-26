import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if user has previously dismissed the banner
  useEffect(() => {
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);
    
    if (granted) {
      toast.success('Notificaciones activadas', {
        description: 'Recibirás alertas de vencimientos próximos',
      });
      handleDismiss();
    } else {
      toast.error('Permiso denegado', {
        description: 'Puedes habilitarlo desde la configuración del navegador',
      });
    }
  };

  // Don't show if not supported, already granted, denied, or dismissed
  if (!isSupported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Activar notificaciones</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Recibe alertas cuando tengas vencimientos próximos, incluso cuando no estés en la aplicación.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleRequestPermission} disabled={isRequesting}>
              {isRequesting ? 'Solicitando...' : 'Activar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Ahora no
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -mt-1 -mr-1"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
