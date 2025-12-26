import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ConfiguracionGeneral {
  usarIva: boolean;
  tasaIva: number;
  diasAlerta: number;
  monedaDefault: string;
  formatoFecha: string;
  notificacionesSoundEnabled: boolean;
  notificacionesPushEnabled: boolean;
  tema: 'light' | 'dark' | 'system';
}

const configDefault: ConfiguracionGeneral = {
  usarIva: true,
  tasaIva: 10,
  diasAlerta: 7,
  monedaDefault: 'PYG',
  formatoFecha: 'dd/MM/yyyy',
  notificacionesSoundEnabled: true,
  notificacionesPushEnabled: true,
  tema: 'system',
};

export function useConfiguracion() {
  const [config, setConfig] = useLocalStorage<ConfiguracionGeneral>(
    'lexnotar_config',
    configDefault
  );

  const updateConfig = useCallback((updates: Partial<ConfiguracionGeneral>, silent: boolean = false) => {
    setConfig(prev => ({ ...prev, ...updates }));
    if (!silent) {
      toast.success('Configuración actualizada');
    }
  }, [setConfig]);

  const resetConfig = useCallback(() => {
    setConfig(configDefault);
    toast.success('Configuración restablecida');
  }, [setConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
  };
}
