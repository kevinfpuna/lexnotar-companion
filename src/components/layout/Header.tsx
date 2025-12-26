import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, LogOut } from 'lucide-react';
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
import { profesionalMock, formatDate } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { eventos, trabajos, items, clientes } = useApp();
  const { usuario, logout } = useAuth();
  
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

  // Calculate dynamic notifications
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

  const notifications = [
    // Upcoming events (7 days)
    ...eventos
      .filter(e => e.fechaEvento >= today && e.fechaEvento <= nextWeek)
      .map(e => ({ 
        id: e.id, 
        type: 'evento' as const, 
        title: e.tituloEvento, 
        subtitle: `${formatDate(e.fechaEvento)} • ${e.tipoEvento}`,
        link: '/calendario'
      })),
    
    // Jobs with upcoming deadline
    ...trabajos
      .filter(t => t.fechaFinEstimada <= nextWeek && t.estado !== 'Completado' && t.estado !== 'Cancelado')
      .map(t => ({ 
        id: t.id, 
        type: 'vencimiento' as const, 
        title: `Vence: ${t.nombreTrabajo}`, 
        subtitle: formatDate(t.fechaFinEstimada),
        link: `/trabajos/${t.id}`
      })),
    
    // Items in "Listo retirar" > 3 days
    ...items
      .filter(i => i.estado === 'Listo retirar' && i.fechaActualizacion <= threeDaysAgo)
      .map(i => {
        const trabajo = trabajos.find(t => t.id === i.trabajoId);
        return { 
          id: i.id, 
          type: 'item-listo' as const, 
          title: `Listo para retirar: ${i.nombreItem}`, 
          subtitle: trabajo?.nombreTrabajo || '',
          link: `/trabajos/${i.trabajoId}`
        };
      }),
    
    // Clients with debt
    ...clientes
      .filter(c => c.deudaTotalActual > 50000000) // > 50M PYG
      .slice(0, 3)
      .map(c => ({ 
        id: c.id, 
        type: 'deuda' as const, 
        title: `Deuda alta: ${c.nombreCompleto}`, 
        subtitle: `Gs. ${c.deudaTotalActual.toLocaleString()}`,
        link: `/clientes/${c.id}`
      })),
  ].slice(0, 10);

  const handleLogout = () => {
    logout();
  };

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
              {notifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <span className="text-xs text-muted-foreground font-normal">
                {notifications.length} pendientes
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem 
                  key={`${notif.type}-${notif.id}`} 
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  onClick={() => navigate(notif.link)}
                >
                  <span className="font-medium text-sm">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {notif.subtitle}
                  </span>
                </DropdownMenuItem>
              ))
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
