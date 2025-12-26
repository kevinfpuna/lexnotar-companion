import { EventoCalendario } from '@/types';
import { format } from 'date-fns';

export const exportToICS = (eventos: EventoCalendario[], month?: Date) => {
  let filtered = eventos;

  // Filtrar por mes si se especifica
  if (month) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    filtered = eventos.filter(e => {
      const fecha = new Date(e.fechaEvento);
      return fecha >= startOfMonth && fecha <= endOfMonth;
    });
  }

  // Generar ICS
  const icsEvents = filtered.map(evento => {
    const fechaEvento = new Date(evento.fechaEvento);
    const start = format(fechaEvento, "yyyyMMdd'T'HHmmss");
    const end = format(
      new Date(fechaEvento.getTime() + 60 * 60 * 1000),
      "yyyyMMdd'T'HHmmss"
    );

    return [
      'BEGIN:VEVENT',
      `UID:${evento.id}@lexnotar.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${evento.tituloEvento}`,
      evento.descripcion ? `DESCRIPTION:${evento.descripcion.replace(/\n/g, '\\n')}` : '',
      `STATUS:CONFIRMED`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  }).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexNotar ERP//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  // Descargar
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `calendario-lexnotar-${format(month || new Date(), 'yyyy-MM')}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
};
