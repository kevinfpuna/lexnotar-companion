import React, { createContext, useContext, ReactNode } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useTrabajos } from '@/hooks/useTrabajos';
import { usePagos } from '@/hooks/usePagos';
import { useEventos } from '@/hooks/useEventos';

type AppContextType = ReturnType<typeof useClientes> & 
  ReturnType<typeof useTrabajos> & 
  ReturnType<typeof usePagos> &
  ReturnType<typeof useEventos>;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const clientesHook = useClientes();
  const trabajosHook = useTrabajos();
  const pagosHook = usePagos();
  const eventosHook = useEventos();

  const value: AppContextType = {
    ...clientesHook,
    ...trabajosHook,
    ...pagosHook,
    ...eventosHook,
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
