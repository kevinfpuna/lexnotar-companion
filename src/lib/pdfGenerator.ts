import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trabajo, Cliente, Item, Profesional } from '@/types';
import { formatCurrency, formatDate } from './mockData';

export interface PDFOptions {
  profesional: Profesional;
  cliente: Cliente;
  trabajo: Trabajo;
  items: Item[];
  tipo: 'presupuesto' | 'factura';
  incluirIVA: boolean;
  tasaIVA: number;
}

export function generateTrabajoPDF(options: PDFOptions): void {
  const { profesional, cliente, trabajo, items, tipo, incluirIVA, tasaIVA } = options;
  const doc = new jsPDF();

  // Colors
  const primaryColor: [number, number, number] = [34, 47, 82];
  const textColor: [number, number, number] = [50, 50, 50];

  // Header
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(tipo === 'presupuesto' ? 'PRESUPUESTO' : 'FACTURA', 105, 25, { align: 'center' });

  // Professional info
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profesional.nombre} ${profesional.apellido}`, 105, 35, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`CI: ${profesional.cedula}`, 105, 41, { align: 'center' });
  doc.text(`${profesional.telefono} | ${profesional.email}`, 105, 47, { align: 'center' });
  doc.text(profesional.domicilio, 105, 53, { align: 'center' });

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, 58, 196, 58);

  // Client info box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 62, 90, 35, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CLIENTE', 18, 70);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(cliente.nombreCompleto, 18, 78);
  doc.text(`Doc: ${cliente.documentoIdentidad}`, 18, 84);
  doc.text(`Tel: ${cliente.telefono}`, 18, 90);

  // Document info box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(110, 62, 86, 35, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DOCUMENTO', 114, 70);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(`Nº: ${trabajo.id.substring(0, 8).toUpperCase()}`, 114, 78);
  doc.text(`Fecha: ${formatDate(new Date())}`, 114, 84);
  doc.text(`Trabajo: ${trabajo.nombreTrabajo.substring(0, 30)}`, 114, 90);

  // Work description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DETALLE DEL TRABAJO', 14, 108);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  const splitDesc = doc.splitTextToSize(trabajo.descripcionTrabajo || 'Sin descripción', 180);
  doc.text(splitDesc, 14, 115);

  // Items table
  const tableData = items.map((item, index) => [
    (index + 1).toString(),
    item.nombreItem,
    item.descripcionItem?.substring(0, 50) || '-',
    `${item.diasEstimados} días`,
    formatCurrency(item.costoTotal),
  ]);

  const startY = 125 + (splitDesc.length * 4);

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Paso/Ítem', 'Descripción', 'Tiempo', 'Costo']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: primaryColor,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 70 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = items.reduce((sum, i) => sum + i.costoTotal, 0);
  const ivaAmount = incluirIVA ? subtotal * (tasaIVA / 100) : 0;
  const total = subtotal + ivaAmount;

  // Totals box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(120, finalY, 76, incluirIVA ? 32 : 22, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 125, finalY + 8);
  doc.text(formatCurrency(subtotal), 191, finalY + 8, { align: 'right' });

  if (incluirIVA) {
    doc.text(`IVA (${tasaIVA}%):`, 125, finalY + 16);
    doc.text(formatCurrency(ivaAmount), 191, finalY + 16, { align: 'right' });
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  const totalY = finalY + (incluirIVA ? 26 : 16);
  doc.text('TOTAL:', 125, totalY);
  doc.text(formatCurrency(total), 191, totalY, { align: 'right' });

  // Payment info (for invoice)
  if (tipo === 'factura') {
    const paymentY = finalY + (incluirIVA ? 45 : 35);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`Pagado: ${formatCurrency(trabajo.pagadoTotal)}`, 14, paymentY);
    doc.text(`Saldo pendiente: ${formatCurrency(trabajo.saldoPendiente)}`, 14, paymentY + 6);
  }

  // Footer
  const footerY = 280;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Este documento fue generado por LexNotar ERP', 105, footerY, { align: 'center' });
  doc.text(`Generado el ${formatDate(new Date())}`, 105, footerY + 4, { align: 'center' });

  // Signature area (for invoice)
  if (tipo === 'factura') {
    doc.setDrawColor(200, 200, 200);
    doc.line(70, footerY - 20, 140, footerY - 20);
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(`${profesional.nombre} ${profesional.apellido}`, 105, footerY - 14, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Firma', 105, footerY - 9, { align: 'center' });
  }

  // Save
  const safeNombre = trabajo.nombreTrabajo.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `${tipo}_${safeNombre}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
