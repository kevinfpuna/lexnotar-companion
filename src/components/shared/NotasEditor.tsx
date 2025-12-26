import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotasEditorProps {
  notas: string;
  ultimaActualizacion?: Date;
  onSave: (notas: string) => void;
  placeholder?: string;
}

export function NotasEditor({ 
  notas, 
  ultimaActualizacion, 
  onSave,
  placeholder = 'Escribe notas internas...'
}: NotasEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(notas);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(notas);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-2">Notas Internas</h4>
            {notas ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {notas}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sin notas
              </p>
            )}
            {ultimaActualizacion && (
              <p className="text-xs text-muted-foreground mt-2">
                Última actualización: {format(ultimaActualizacion, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="font-medium text-sm mb-2">Editar Notas Internas</h4>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="mb-3"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Guardar
        </Button>
      </div>
    </Card>
  );
}
