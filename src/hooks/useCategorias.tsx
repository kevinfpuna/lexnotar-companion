import { useState } from 'react';
import { CategoriaTrabajo } from '@/types';

// Categorías por defecto
export const categoriasDefault: CategoriaTrabajo[] = [
  {
    id: 'notarial-unilateral',
    nombre: 'Notarial Unilateral',
    descripcion: 'Actos notariales donde interviene una sola parte',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    orden: 0,
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
  },
  {
    id: 'notarial-bilateral',
    nombre: 'Notarial Bilateral',
    descripcion: 'Actos notariales donde intervienen dos o más partes',
    color: 'bg-green-100 text-green-800 border-green-200',
    orden: 1,
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
  },
  {
    id: 'judicial',
    nombre: 'Judicial',
    descripcion: 'Procesos ante el poder judicial',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    orden: 2,
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
  },
  {
    id: 'administrativo',
    nombre: 'Administrativo',
    descripcion: 'Trámites ante organismos administrativos',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    orden: 3,
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
  },
  {
    id: 'otro',
    nombre: 'Otro',
    descripcion: 'Otros tipos de trabajo',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    orden: 4,
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
  },
];

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaTrabajo[]>(categoriasDefault);

  const addCategoria = (nombre: string, descripcion: string, color: string) => {
    const newCategoria: CategoriaTrabajo = {
      id: Date.now().toString(),
      nombre,
      descripcion,
      color,
      orden: categorias.length,
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    setCategorias(prev => [...prev, newCategoria]);
    return newCategoria;
  };

  const updateCategoria = (id: string, updates: Partial<CategoriaTrabajo>) => {
    setCategorias(prev => 
      prev.map(c => 
        c.id === id ? { ...c, ...updates, fechaActualizacion: new Date() } : c
      )
    );
  };

  const deleteCategoria = (id: string) => {
    setCategorias(prev => 
      prev.filter(c => c.id !== id).map((c, idx) => ({ ...c, orden: idx }))
    );
  };

  const toggleCategoriaActivo = (id: string) => {
    setCategorias(prev =>
      prev.map(c =>
        c.id === id ? { ...c, activo: !c.activo, fechaActualizacion: new Date() } : c
      )
    );
  };

  const reorderCategorias = (newOrder: CategoriaTrabajo[]) => {
    setCategorias(newOrder.map((c, idx) => ({ ...c, orden: idx })));
  };

  return {
    categorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaActivo,
    reorderCategorias,
  };
}
