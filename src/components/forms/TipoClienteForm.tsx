import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TipoCliente, CampoCustom } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TipoClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCliente?: TipoCliente | null;
  onSubmit: (data: Omit<TipoCliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
}

interface CampoForm {
  key: string;
  tipo: CampoCustom['tipo'];
  obligatorio: boolean;
  placeholder: string;
  opciones: string;
}

const tiposCampo: { value: CampoCustom['tipo']; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección' },
  { value: 'textarea', label: 'Área de texto' },
];

export function TipoClienteForm({ open, onOpenChange, tipoCliente, onSubmit }: TipoClienteFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);
  const [campos, setCampos] = useState<CampoForm[]>([]);

  useEffect(() => {
    if (tipoCliente) {
      setNombre(tipoCliente.nombre);
      setDescripcion(tipoCliente.descripcion);
      setActivo(tipoCliente.activo);
      setCampos(
        Object.entries(tipoCliente.camposCustom).map(([key, campo]) => ({
          key,
          tipo: campo.tipo,
          obligatorio: campo.obligatorio,
          placeholder: campo.placeholder || '',
          opciones: campo.opciones?.join(', ') || '',
        }))
      );
    } else {
      setNombre('');
      setDescripcion('');
      setActivo(true);
      setCampos([]);
    }
  }, [tipoCliente, open]);

  const addCampo = () => {
    setCampos(prev => [...prev, {
      key: '',
      tipo: 'text',
      obligatorio: false,
      placeholder: '',
      opciones: '',
    }]);
  };

  const updateCampo = (index: number, updates: Partial<CampoForm>) => {
    setCampos(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const removeCampo = (index: number) => {
    setCampos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const camposCustom: Record<string, CampoCustom> = {};
    for (const campo of campos) {
      if (!campo.key.trim()) continue;
      
      camposCustom[campo.key] = {
        tipo: campo.tipo,
        obligatorio: campo.obligatorio,
        placeholder: campo.placeholder || undefined,
        opciones: campo.tipo === 'select' && campo.opciones 
          ? campo.opciones.split(',').map(o => o.trim()).filter(Boolean)
          : undefined,
      };
    }

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      activo,
      camposCustom,
    });

    onOpenChange(false);
    toast.success(tipoCliente ? 'Tipo de cliente actualizado' : 'Tipo de cliente creado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tipoCliente ? 'Editar Tipo de Cliente' : 'Nuevo Tipo de Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Persona Física"
              />
            </div>
            
            <div className="flex items-center gap-4 pt-6">
              <Switch checked={activo} onCheckedChange={setActivo} />
              <Label>Activo</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del tipo de cliente..."
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Campos Personalizados</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCampo}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar campo
              </Button>
            </div>

            {campos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                No hay campos personalizados. Haz clic en "Agregar campo" para crear uno.
              </p>
            )}

            {campos.map((campo, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre del campo</Label>
                    <Input
                      value={campo.key}
                      onChange={(e) => updateCampo(index, { key: e.target.value })}
                      placeholder="Ej: ci, ruc, etc."
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={campo.tipo} onValueChange={(v) => updateCampo(index, { tipo: v as CampoCustom['tipo'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposCampo.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={campo.placeholder}
                      onChange={(e) => updateCampo(index, { placeholder: e.target.value })}
                      placeholder="Texto de ayuda..."
                    />
                  </div>
                </div>

                {campo.tipo === 'select' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Opciones (separadas por coma)</Label>
                    <Input
                      value={campo.opciones}
                      onChange={(e) => updateCampo(index, { opciones: e.target.value })}
                      placeholder="Opción 1, Opción 2, Opción 3"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={campo.obligatorio} 
                      onCheckedChange={(v) => updateCampo(index, { obligatorio: v })}
                    />
                    <Label className="text-sm">Obligatorio</Label>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => removeCampo(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {tipoCliente ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
