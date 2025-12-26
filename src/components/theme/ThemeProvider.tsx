import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { useConfiguracion } from "@/hooks/useConfiguracion";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}

// Component to sync theme with useConfiguracion
function ThemeSync() {
  const { config, updateConfig } = useConfiguracion();
  
  // This component doesn't render anything, just syncs the theme
  useEffect(() => {
    // Initial sync is handled by next-themes storage
  }, [config.tema]);
  
  return null;
}
