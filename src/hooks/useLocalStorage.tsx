import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado que se sincroniza con localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Revivir fechas si es un array de objetos
        if (Array.isArray(parsed)) {
          return parsed.map(reviveDates) as T;
        }
        return reviveDates(parsed) as T;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Guardar en localStorage cuando cambia el estado
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

// Helper para revivir fechas desde JSON
function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  // Check if it's a date string (ISO format)
  if (typeof obj === 'string' && isISODateString(obj)) {
    return new Date(obj);
  }
  
  // Recursively process arrays
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  
  // Recursively process objects
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'string' && isISODateString(value)) {
      result[key] = new Date(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function isISODateString(str: string): boolean {
  // Match ISO 8601 date format
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
}
