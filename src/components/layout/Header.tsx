import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, LogOut, Check, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { profesionalMock } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificaciones();
  
  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNotificationClick = (notificationId: string, link: string) => {
    markAsRead(notificationId);
    navigate(link);
  };

  const handleLogout = () => {
    logout();
  };

  // Show only first 5 in dropdown
  const displayNotifications = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border px-4 flex items-center justify-between gap-4">
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search - clickable to open command */}
      <div className="flex-1 max-w-md">
        <div 
          className="relative cursor-pointer"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar... (Ctrl+K)"
            className="pl-9 bg-background cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <ThemeToggle />
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Leer todas
                  </Button>
                )}
                <span className="text-xs text-muted-foreground font-normal">
                  {unreadCount} sin leer
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {displayNotifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No hay notificaciones
              </div>
            ) : (
              <>
                {displayNotifications.map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer",
                      !notif.readAt && "bg-muted/30"
                    )}
                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm truncate",
                          !notif.readAt && "font-semibold"
                        )}>
                          {notif.title}
                        </span>
                        {!notif.readAt && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notif.subtitle}
                      </span>
                    </div>
                    {!notif.readAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center text-primary font-medium"
                  onClick={() => navigate('/notificaciones')}
                >
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              <span>{usuario?.username || profesionalMock.nombre}</span>
              <span className="text-xs font-normal text-muted-foreground">{usuario?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracion')}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracion')}>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Command */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
