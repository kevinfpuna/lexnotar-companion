import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recordatorios-config';

export interface RecordatoriosConfig {
  horasAnticipacionDefault: number;
  soundEnabled: boolean;
}

const defaultConfig: RecordatoriosConfig = {
  horasAnticipacionDefault: 24,
  soundEnabled: true,
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

  return {
    config,
    setHorasAnticipacion,
    setSoundEnabled,
    saveConfig,
  };
}
