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
import { TipoTrabajo, PasoPredefinido, EstadoItem, CategoriaTrabajo } from '@/types';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/mockData';

interface TipoTrabajoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoTrabajo?: TipoTrabajo | null;
  categorias: CategoriaTrabajo[];
  onSubmit: (data: Omit<TipoTrabajo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
}

const estadosIniciales: EstadoItem[] = ['Pendiente', 'En proceso'];

export function TipoTrabajoForm({ open, onOpenChange, tipoTrabajo, categorias, onSubmit }: TipoTrabajoFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<TipoTrabajo['categoria']>('Notarial Unilateral');
  const [tiempoEstimadoDias, setTiempoEstimadoDias] = useState('30');
  const [precioSugerido, setPrecioSugerido] = useState('');
  const [activo, setActivo] = useState(true);
  const [documentosRequeridos, setDocumentosRequeridos] = useState('');
  const [pasos, setPasos] = useState<PasoPredefinido[]>([]);

  useEffect(() => {
    if (tipoTrabajo) {
      setNombre(tipoTrabajo.nombre);
      setDescripcion(tipoTrabajo.descripcion);
      setCategoria(tipoTrabajo.categoria);
      setTiempoEstimadoDias(tipoTrabajo.tiempoEstimadoDias.toString());
      setPrecioSugerido(tipoTrabajo.precioSugerido.toString());
      setActivo(tipoTrabajo.activo);
      setDocumentosRequeridos(tipoTrabajo.documentosRequeridos.join('\n'));
      setPasos(tipoTrabajo.pasosPredefinidos);
    } else {
      setNombre('');
      setDescripcion('');
      setCategoria('Notarial Unilateral');
      setTiempoEstimadoDias('30');
      setPrecioSugerido('');
      setActivo(true);
      setDocumentosRequeridos('');
      setPasos([]);
    }
  }, [tipoTrabajo, open]);

  const addPaso = () => {
    setPasos(prev => [...prev, {
      numero: prev.length + 1,
      nombre: '',
      estadoInicial: 'Pendiente',
      diasEstimados: 1,
      costoEstimado: 0,
      descripcion: '',
      opcional: false,
    }]);
  };

  const updatePaso = (index: number, updates: Partial<PasoPredefinido>) => {
    setPasos(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const removePaso = (index: number) => {
    setPasos(prev => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, numero: i + 1 })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria,
      tiempoEstimadoDias: parseInt(tiempoEstimadoDias) || 30,
      precioSugerido: parseInt(precioSugerido) || 0,
      activo,
      documentosRequeridos: documentosRequeridos.split('\n').map(d => d.trim()).filter(Boolean),
      pasosPredefinidos: pasos.filter(p => p.nombre.trim()),
    });

    onOpenChange(false);
    toast.success(tipoTrabajo ? 'Tipo de trabajo actualizado' : 'Tipo de trabajo creado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tipoTrabajo ? 'Editar Tipo de Trabajo' : 'Nuevo Tipo de Trabajo'}
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
                placeholder="Ej: Poder Especial"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as TipoTrabajo['categoria'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter(c => c.activo).map(c => (
                    <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del tipo de trabajo..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tiempo">Tiempo estimado (días)</Label>
              <Input
                id="tiempo"
                type="number"
                value={tiempoEstimadoDias}
                onChange={(e) => setTiempoEstimadoDias(e.target.value)}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio sugerido (Gs.)</Label>
              <Input
                id="precio"
                type="number"
                value={precioSugerido}
                onChange={(e) => setPrecioSugerido(e.target.value)}
                placeholder="500000"
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              <Switch checked={activo} onCheckedChange={setActivo} />
              <Label>Activo</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentos">Documentos requeridos (uno por línea)</Label>
            <Textarea
              id="documentos"
              value={documentosRequeridos}
              onChange={(e) => setDocumentosRequeridos(e.target.value)}
              placeholder="CI del cliente&#10;Título de propiedad&#10;Certificado catastral"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Pasos Predefinidos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPaso}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar paso
              </Button>
            </div>

            {pasos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                No hay pasos predefinidos. Haz clic en "Agregar paso" para crear uno.
              </p>
            )}

            {pasos.map((paso, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Paso {paso.numero}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Nombre del paso</Label>
                    <Input
                      value={paso.nombre}
                      onChange={(e) => updatePaso(index, { nombre: e.target.value })}
                      placeholder="Ej: Consulta inicial"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Estado inicial</Label>
                    <Select value={paso.estadoInicial} onValueChange={(v) => updatePaso(index, { estadoInicial: v as EstadoItem })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosIniciales.map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Días estimados</Label>
                    <Input
                      type="number"
                      value={paso.diasEstimados}
                      onChange={(e) => updatePaso(index, { diasEstimados: parseInt(e.target.value) || 1 })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input
                      value={paso.descripcion}
                      onChange={(e) => updatePaso(index, { descripcion: e.target.value })}
                      placeholder="Descripción breve del paso..."
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Costo estimado (Gs.)</Label>
                    <Input
                      type="number"
                      value={paso.costoEstimado || 0}
                      onChange={(e) => updatePaso(index, { costoEstimado: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={paso.opcional} 
                      onCheckedChange={(v) => updatePaso(index, { opcional: v })}
                    />
                    <Label className="text-sm">Opcional</Label>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => removePaso(index)}
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
              {tipoTrabajo ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
