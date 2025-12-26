import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useTrabajos } from '@/hooks/useTrabajos';
import { usePagos } from '@/hooks/usePagos';
import { useEventos } from '@/hooks/useEventos';
import { useDocumentos } from '@/hooks/useDocumentos';

type AppContextType = ReturnType<typeof useClientes> & 
  ReturnType<typeof useTrabajos> & 
  ReturnType<typeof usePagos> &
  ReturnType<typeof useEventos> &
  ReturnType<typeof useDocumentos> & {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
  };

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const clientesHook = useClientes();
  const trabajosHook = useTrabajos();
  const pagosHook = usePagos();
  const eventosHook = useEventos();
  const documentosHook = useDocumentos();

  const value: AppContextType = {
    ...clientesHook,
    ...trabajosHook,
    ...pagosHook,
    ...eventosHook,
    ...documentosHook,
    isLoading,
    setIsLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
