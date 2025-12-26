import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useEffect } from "react";

const themes = [
  {
    value: "light",
    label: "Claro",
    icon: Sun,
    description: "Tema claro para uso durante el día",
  },
  {
    value: "dark",
    label: "Oscuro",
    icon: Moon,
    description: "Tema oscuro para reducir fatiga visual",
  },
  {
    value: "system",
    label: "Sistema",
    icon: Monitor,
    description: "Sigue la preferencia de tu dispositivo",
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { config, updateConfig } = useConfiguracion();

  // Sync with useConfiguracion when theme changes
  const handleThemeChange = (value: string) => {
    setTheme(value);
    updateConfig({ tema: value as 'light' | 'dark' | 'system' }, true);
  };

  // Sync theme from config on mount
  useEffect(() => {
    if (config.tema && config.tema !== theme) {
      setTheme(config.tema);
    }
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Sun className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Apariencia</h3>
          <p className="text-sm text-muted-foreground">
            Personaliza el tema visual de la aplicación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.value;

          return (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                "hover:bg-muted/50",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  "p-3 rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="text-center">
                <Label className="font-medium cursor-pointer">{t.label}</Label>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {t.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
