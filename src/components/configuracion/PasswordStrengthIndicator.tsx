import { useMemo } from 'react';
import { validatePasswordStrength } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertTriangle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => {
    if (!password) return null;
    return validatePasswordStrength(password);
  }, [password]);

  if (!password) return null;

  const strengthConfig = {
    débil: { color: 'bg-destructive', progress: 33, text: 'Débil', textColor: 'text-destructive' },
    media: { color: 'bg-yellow-500', progress: 66, text: 'Media', textColor: 'text-yellow-500' },
    fuerte: { color: 'bg-green-500', progress: 100, text: 'Fuerte', textColor: 'text-green-500' },
  };

  const config = validation ? strengthConfig[validation.strength] : strengthConfig.débil;

  const requirements = [
    { label: 'Al menos 8 caracteres', met: password.length >= 8 },
    { label: 'Una letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
    { label: 'Un carácter especial (!@#$%^&*)', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-3 mt-2">
      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Fortaleza:</span>
          <span className={`font-medium ${config.textColor}`}>{config.text}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${config.color}`}
            style={{ width: `${config.progress}%` }}
          />
        </div>
      </div>

      {/* Requisitos */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Advertencia si es débil */}
      {validation?.strength === 'débil' && password.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive">
            La contraseña es muy débil. Usa una combinación más segura.
          </p>
        </div>
      )}
    </div>
  );
}
