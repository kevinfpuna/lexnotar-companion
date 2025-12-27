import * as XLSX from 'xlsx';
import { Pago, Trabajo, Cliente, Item } from '@/types';
import { formatCurrency, formatDate } from './mockData';

/**
 * Exportar lista de pagos a Excel
 */
export function exportPagosToExcel(
  pagos: Pago[],
  trabajos: Trabajo[],
  clientes: Cliente[]
) {
  const data = pagos.map(p => {
    const trabajo = trabajos.find(t => t.id === p.trabajoId);
    const cliente = clientes.find(c => c.id === trabajo?.clienteId);

    return {
      'Fecha': formatDate(p.fechaPago),
      'Cliente': cliente?.nombreCompleto ?? '-',
      'Documento': cliente?.documentoIdentidad ?? '-',
      'Trabajo': trabajo?.nombreTrabajo ?? '-',
      'Monto': p.monto,
      'Método': p.metodoPago,
      'Referencia': p.referenciaPago ?? '-',
      'Notas': p.notasPago ?? '-'
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 12 }, // Fecha
    { wch: 25 }, // Cliente
    { wch: 15 }, // Documento
    { wch: 30 }, // Trabajo
    { wch: 15 }, // Monto
    { wch: 15 }, // Método
    { wch: 20 }, // Referencia
    { wch: 30 }  // Notas
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos');

  const fileName = `pagos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar ingresos mensuales a Excel
 */
export function exportIngresosToExcel(
  ingresosPorMes: { mes: string; total: number }[]
) {
  const data = ingresosPorMes.map(item => ({
    'Mes': item.mes,
    'Ingresos': item.total
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 20 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');

  const fileName = `ingresos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar clientes con deuda a Excel
 */
export function exportClientesDeudaToExcel(clientes: Cliente[]) {
  const data = clientes
    .filter(c => c.deudaTotalActual > 0)
    .sort((a, b) => b.deudaTotalActual - a.deudaTotalActual)
    .map(c => ({
      'Cliente': c.nombreCompleto,
      'Documento': c.documentoIdentidad,
      'Deuda': c.deudaTotalActual,
      'Teléfono': c.telefono,
      'Email': c.email,
      'Estado': c.estado
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 10 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Deudas');

  const fileName = `deudas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar trabajos a Excel
 */
export function exportTrabajosToExcel(
  trabajos: Trabajo[],
  clientes: Cliente[]
) {
  const data = trabajos.map(t => {
    const cliente = clientes.find(c => c.id === t.clienteId);

    return {
      'Cliente': cliente?.nombreCompleto ?? '-',
      'Trabajo': t.nombreTrabajo,
      'Estado': t.estado,
      'Fecha Inicio': formatDate(t.fechaInicio),
      'Fecha Fin Estimada': t.fechaFinEstimada ? formatDate(t.fechaFinEstimada) : '-',
      'Fecha Fin Real': t.fechaFinReal ? formatDate(t.fechaFinReal) : '-',
      'Presupuesto': t.presupuestoInicial,
      'Costo Final': t.costoFinal,
      'Pagado': t.pagadoTotal,
      'Saldo': t.saldoPendiente
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Trabajos');

  const fileName = `trabajos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar reporte completo (múltiples hojas)
 */
export function exportReporteCompleto(
  pagos: Pago[],
  trabajos: Trabajo[],
  clientes: Cliente[],
  items: Item[]
) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen
  const resumen = [
    { 'Métrica': 'Total Clientes', 'Valor': clientes.length },
    { 'Métrica': 'Clientes Activos', 'Valor': clientes.filter(c => c.estado === 'activo').length },
    { 'Métrica': 'Total Trabajos', 'Valor': trabajos.length },
    { 'Métrica': 'Trabajos Activos', 'Valor': trabajos.filter(t => t.estado === 'En proceso').length },
    { 'Métrica': 'Deuda Total', 'Valor': clientes.reduce((sum, c) => sum + c.deudaTotalActual, 0) },
    { 'Métrica': 'Total Pagado', 'Valor': pagos.reduce((sum, p) => sum + p.monto, 0) }
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumen);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Pagos
  const dataPagos = pagos.map(p => {
    const trabajo = trabajos.find(t => t.id === p.trabajoId);
    const cliente = clientes.find(c => c.id === trabajo?.clienteId);
    return {
      'Fecha': formatDate(p.fechaPago),
      'Cliente': cliente?.nombreCompleto ?? '-',
      'Trabajo': trabajo?.nombreTrabajo ?? '-',
      'Monto': p.monto,
      'Método': p.metodoPago
    };
  });
  const wsPagos = XLSX.utils.json_to_sheet(dataPagos);
  XLSX.utils.book_append_sheet(wb, wsPagos, 'Pagos');

  // Hoja 3: Trabajos
  const dataTrabajos = trabajos.map(t => ({
    'Cliente': clientes.find(c => c.id === t.clienteId)?.nombreCompleto ?? '-',
    'Trabajo': t.nombreTrabajo,
    'Estado': t.estado,
    'Costo': t.costoFinal,
    'Pagado': t.pagadoTotal,
    'Saldo': t.saldoPendiente
  }));
  const wsTrabajos = XLSX.utils.json_to_sheet(dataTrabajos);
  XLSX.utils.book_append_sheet(wb, wsTrabajos, 'Trabajos');

  // Hoja 4: Clientes con deuda
  const dataDeudas = clientes
    .filter(c => c.deudaTotalActual > 0)
    .map(c => ({
      'Cliente': c.nombreCompleto,
      'Deuda': c.deudaTotalActual,
      'Teléfono': c.telefono,
      'Email': c.email
    }));
  const wsDeudas = XLSX.utils.json_to_sheet(dataDeudas);
  XLSX.utils.book_append_sheet(wb, wsDeudas, 'Deudas');

  const fileName = `reporte_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
