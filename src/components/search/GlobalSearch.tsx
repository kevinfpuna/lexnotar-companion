import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { StatusBadge } from '@/components/ui/status-badge';
import { User, Briefcase, FileText } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { clientes, trabajos, items } = useApp();

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar clientes, trabajos, pasos..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados</CommandEmpty>

        <CommandGroup heading="Clientes">
          {clientes.slice(0, 5).map((cliente) => (
            <CommandItem
              key={cliente.id}
              onSelect={() => handleSelect(`/clientes/${cliente.id}`)}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{cliente.nombreCompleto}</div>
                <div className="text-xs text-muted-foreground">
                  {cliente.documentoIdentidad}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Trabajos">
          {trabajos.slice(0, 5).map((trabajo) => (
            <CommandItem
              key={trabajo.id}
              onSelect={() => handleSelect(`/trabajos/${trabajo.id}`)}
              className="cursor-pointer"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{trabajo.nombreTrabajo}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={trabajo.estado} />
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Pasos">
          {items.slice(0, 5).map((item) => {
            const trabajo = trabajos.find((t) => t.id === item.trabajoId);
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(`/trabajos/${item.trabajoId}`)}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.nombreItem}</div>
                  <div className="text-xs text-muted-foreground">
                    {trabajo?.nombreTrabajo}
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}