// LexNotar ERP - Type Definitions

export interface Usuario {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  profesionalId: string;
  rol: 'admin' | 'usuario';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  fechaActualizacion?: Date;
}

export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  logoUrl?: string;
  firmaDigitalPath?: string;
  telefono: string;
  email: string;
  domicilio: string;
  monedaDefault: 'PYG' | 'USD';
  formatoFecha: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CampoCustom {
  tipo: 'text' | 'number' | 'date' | 'select' | 'textarea';
  obligatorio: boolean;
  opciones?: string[];
  placeholder?: string;
}

export interface TipoCliente {
  id: string;
  nombre: string;
  descripcion: string;
  camposCustom: Record<string, CampoCustom>;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}

export interface Cliente {
  id: string;
  tipoClienteId: string;
  nombreCompleto: string;
  documentoIdentidad: string;
  telefono: string;
  email: string;
  domicilio: string;
  datosCustom: Record<string, any>;
  notasInternas: string;
  deudaTotalActual: number;
  fechaRegistro: Date;
  fechaUltimaActualizacion: Date;
  estado: 'activo' | 'inactivo';
}

export interface PasoPredefinido {
  numero: number;
  nombre: string;
  estadoInicial: EstadoItem;
  diasEstimados: number;
  costoEstimado: number;
  descripcion: string;
  opcional: boolean;
}

export interface CategoriaTrabajo {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface TipoTrabajo {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'Notarial Unilateral' | 'Notarial Bilateral' | 'Judicial' | 'Administrativo' | 'Otro';
  tiempoEstimadoDias: number;
  precioSugerido: number;
  documentosRequeridos: string[];
  pasosPredefinidos: PasoPredefinido[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}

export type EstadoTrabajo = 'Borrador' | 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';

export interface Trabajo {
  id: string;
  clienteId: string;
  tipoTrabajoId: string;
  nombreTrabajo: string;
  descripcionTrabajo: string;
  fechaInicio: Date;
  fechaFinEstimada: Date;
  fechaFinReal?: Date;
  estado: EstadoTrabajo;
  presupuestoInicial: number;
  costoFinal: number;
  pagadoTotal: number;
  saldoPendiente: number;
  notasInternas: string;
  fechaCreacion: Date;
  fechaUltimaActualizacion: Date;
}

export type EstadoItem = 'Pendiente' | 'En proceso' | 'Mesa entrada' | 'Mesa salida' | 'Listo retirar' | 'Completado';

export interface Item {
  id: string;
  trabajoId: string;
  numeroPaso: number;
  nombreItem: string;
  descripcionItem: string;
  estado: EstadoItem;
  costoTotal: number;
  pagado: number;
  saldo: number;
  diasEstimados: number;
  fechaInicio?: Date;
  fechaFinEstimada?: Date;
  fechaFinReal?: Date;
  notasItem: string;
  documentosItem: string[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque';

export interface Pago {
  id: string;
  trabajoId: string;
  itemId?: string;
  monto: number;
  fechaPago: Date;
  metodoPago: MetodoPago;
  comprobanteAdjuntoPath?: string;
  referenciaPago: string;
  notasPago: string;
  fechaRegistro: Date;
}

export type TipoEvento = 'Inicio' | 'Fin estimada' | 'Fin real' | 'Recordatorio' | 'Cita personal' | 'Vencimiento';

export interface EventoCalendario {
  id: string;
  trabajoId?: string;
  fechaEvento: Date;
  horaEvento?: string; // "HH:mm" format
  tipoEvento: TipoEvento;
  tituloEvento: string;
  descripcion: string;
  recordatorioHorasAntes?: number;
  recordatorioMostrado?: boolean;
  fechaCreacion: Date;
}

export interface TipoDocumento {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  orden: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: string; // Referencia al nombre del TipoDocumento
  archivoBase64: string;
  mimeType: string;
  size: number; // KB
  fechaSubida: Date;
  fechaActualizacion: Date;
  clienteId?: string;
  trabajoId?: string;
  itemId?: string;
  descripcion?: string;
  tags?: string[];
  vigenciaHasta?: Date;
}


export interface Configuracion {
  id: string;
  clave: string;
  valor: string;
}

// Helper types for UI
export interface ClienteConTipo extends Cliente {
  tipoCliente?: TipoCliente;
}

export interface TrabajoConDetalles extends Trabajo {
  cliente?: Cliente;
  tipoTrabajo?: TipoTrabajo;
  items?: Item[];
  pagos?: Pago[];
}

export interface DashboardStats {
  deudaTotal: number;
  trabajosActivos: number;
  trabajosPendientes: number;
  trabajosCompletadosMes: number;
  ingresosMes: number;
  proximosVencimientos: EventoCalendario[];
}
