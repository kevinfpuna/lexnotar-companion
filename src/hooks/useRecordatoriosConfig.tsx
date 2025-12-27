import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recordatorios-config';

export interface RecordatoriosConfig {
  horasAnticipacionDefault: number;
  soundEnabled: boolean;
  pushEventosEnabled: boolean;
  pushVencimientosEnabled: boolean;
  toastEventosEnabled: boolean;
  toastVencimientosEnabled: boolean;
}

const defaultConfig: RecordatoriosConfig = {
  horasAnticipacionDefault: 24,
  soundEnabled: true,
  pushEventosEnabled: true,
  pushVencimientosEnabled: true,
  toastEventosEnabled: true,
  toastVencimientosEnabled: true,
};

export function useRecordatoriosConfig() {
  const [config, setConfig] = useState<RecordatoriosConfig>(defaultConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      }
    } catch (error) {
      console.error('Error loading recordatorios config:', error);
    }
  }, []);

  // Save config to localStorage
  const saveConfig = useCallback((newConfig: Partial<RecordatoriosConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recordatorios config:', error);
      }
      return updated;
    });
  }, []);

  const setHorasAnticipacion = useCallback((horas: number) => {
    saveConfig({ horasAnticipacionDefault: horas });
  }, [saveConfig]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    saveConfig({ soundEnabled: enabled });
  }, [saveConfig]);

  const setPushEventosEnabled = useCallback((enabled: boolean) => {
    saveConfig({ pushEventosEnabled: enabled });
  }, [saveConfig]);

  const setPushVencimientosEnabled = useCallback((enabled: boolean) => {
    saveConfig({ pushVencimientosEnabled: enabled });
  }, [saveConfig]);

  const setToastEventosEnabled = useCallback((enabled: boolean) => {
    saveConfig({ toastEventosEnabled: enabled });
  }, [saveConfig]);

  const setToastVencimientosEnabled = useCallback((enabled: boolean) => {
    saveConfig({ toastVencimientosEnabled: enabled });
  }, [saveConfig]);

  return {
    config,
    setHorasAnticipacion,
    setSoundEnabled,
    setPushEventosEnabled,
    setPushVencimientosEnabled,
    setToastEventosEnabled,
    setToastVencimientosEnabled,
    saveConfig,
  };
}
