import { Trabajo, Item } from '@/types';

// Calculate balance for a single item
export function calculateItemBalance(item: Item): number {
  return item.costoTotal - item.pagado;
}

// Calculate totals for a trabajo based on its items
export function calculateTrabajoTotals(items: Item[]): {
  costoFinal: number;
  pagadoTotal: number;
  saldoPendiente: number;
} {
  const costoFinal = items.reduce((sum, item) => sum + item.costoTotal, 0);
  const pagadoTotal = items.reduce((sum, item) => sum + item.pagado, 0);
  const saldoPendiente = costoFinal - pagadoTotal;
  
  return { costoFinal, pagadoTotal, saldoPendiente };
}

// Calculate progress percentage for a trabajo
export function calculateTrabajoProgress(items: Item[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter(i => i.estado === 'Completado').length;
  return Math.round((completed / items.length) * 100);
}

// Calculate total debt for a client based on their trabajos
export function calculateClienteDeuda(clienteId: string, trabajos: Trabajo[]): number {
  return trabajos
    .filter(t => t.clienteId === clienteId && t.estado !== 'Cancelado' && t.estado !== 'Borrador')
    .reduce((sum, t) => sum + t.saldoPendiente, 0);
}

// Apply a payment and recalculate balances
export function applyPagoToItem(
  items: Item[],
  itemId: string,
  monto: number
): Item[] {
  return items.map(item => {
    if (item.id === itemId) {
      const newPagado = item.pagado + monto;
      return {
        ...item,
        pagado: newPagado,
        saldo: item.costoTotal - newPagado,
        fechaActualizacion: new Date(),
      };
    }
    return item;
  });
}

// Distribute a general payment across items with balance
export function distributeGeneralPago(
  items: Item[],
  monto: number
): Item[] {
  let remaining = monto;
  
  return items.map(item => {
    if (remaining <= 0 || item.saldo <= 0) return item;
    
    const toApply = Math.min(remaining, item.saldo);
    remaining -= toApply;
    
    return {
      ...item,
      pagado: item.pagado + toApply,
      saldo: item.costoTotal - (item.pagado + toApply),
      fechaActualizacion: new Date(),
    };
  });
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Check if a cliente can be deleted (no active trabajos)
export function canDeleteCliente(clienteId: string, trabajos: Trabajo[]): boolean {
  const trabajosActivos = trabajos.filter(
    t => t.clienteId === clienteId && 
    (t.estado === 'En proceso' || t.estado === 'Pendiente')
  );
  return trabajosActivos.length === 0;
}

// Check if an item can be deleted (no pagos associated)
export function canDeleteItem(itemId: string, pagos: { itemId?: string }[]): boolean {
  return !pagos.some(p => p.itemId === itemId);
}

// Check if all items are completed
export function areAllItemsCompleted(items: Item[]): boolean {
  return items.length > 0 && items.every(i => i.estado === 'Completado');
}

// Get items with pending balance
export function getItemsWithBalance(items: Item[]): Item[] {
  return items.filter(i => i.saldo > 0);
}
