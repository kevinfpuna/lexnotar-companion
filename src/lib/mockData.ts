import { 
  TipoCliente, 
  Cliente, 
  TipoTrabajo, 
  Trabajo, 
  Item, 
  Pago, 
  EventoCalendario,
  Profesional 
} from '@/types';

// Profesional
export const profesionalMock: Profesional = {
  id: '1',
  nombre: 'María',
  apellido: 'González',
  cedula: '1.234.567',
  telefono: '+595 981 234567',
  email: 'maria.gonzalez@lexnotar.com.py',
  domicilio: 'Avda. España 1234, Asunción',
  monedaDefault: 'PYG',
  formatoFecha: 'dd/MM/yyyy',
  fechaCreacion: new Date('2024-01-01'),
  fechaActualizacion: new Date('2024-12-01'),
};

// Tipos de Cliente
export const tiposClienteMock: TipoCliente[] = [
  {
    id: '1',
    nombre: 'Persona Física',
    descripcion: 'Cliente individual',
    camposCustom: {
      ci: { tipo: 'text', obligatorio: true, placeholder: 'Cédula de Identidad' },
      fechaNacimiento: { tipo: 'date', obligatorio: false },
      estadoCivil: { tipo: 'select', obligatorio: false, opciones: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a'] },
      profesion: { tipo: 'text', obligatorio: false, placeholder: 'Profesión u ocupación' },
    },
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
  {
    id: '2',
    nombre: 'Empresa',
    descripcion: 'Persona jurídica o empresa',
    camposCustom: {
      ruc: { tipo: 'text', obligatorio: true, placeholder: 'RUC' },
      razonSocial: { tipo: 'text', obligatorio: true, placeholder: 'Razón Social' },
      representanteLegal: { tipo: 'text', obligatorio: true, placeholder: 'Representante Legal' },
      ciRepresentante: { tipo: 'text', obligatorio: true, placeholder: 'CI del Representante' },
    },
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
  {
    id: '3',
    nombre: 'Extranjero',
    descripcion: 'Cliente extranjero residente o no residente',
    camposCustom: {
      pasaporte: { tipo: 'text', obligatorio: true, placeholder: 'Número de Pasaporte' },
      nacionalidad: { tipo: 'text', obligatorio: true, placeholder: 'Nacionalidad' },
      cedula: { tipo: 'text', obligatorio: false, placeholder: 'CI paraguaya (si tiene)' },
      residencia: { tipo: 'select', obligatorio: true, opciones: ['Residente', 'No residente'] },
    },
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
];

// Clientes
export const clientesMock: Cliente[] = [
  {
    id: '1',
    tipoClienteId: '1',
    nombreCompleto: 'Juan Carlos Pérez Martínez',
    documentoIdentidad: '3.456.789',
    telefono: '+595 981 555123',
    email: 'jcperez@gmail.com',
    domicilio: 'Calle Palma 567, Asunción',
    datosCustom: {
      ci: '3.456.789',
      fechaNacimiento: '1985-05-15',
      estadoCivil: 'Casado/a',
      profesion: 'Comerciante',
    },
    notasInternas: 'Cliente desde 2020. Puntual en pagos.',
    deudaTotalActual: 2500000,
    fechaRegistro: new Date('2020-03-15'),
    fechaUltimaActualizacion: new Date('2024-12-01'),
    estado: 'activo',
  },
  {
    id: '2',
    tipoClienteId: '2',
    nombreCompleto: 'Constructora del Este S.A.',
    documentoIdentidad: '80012345-6',
    telefono: '+595 21 445566',
    email: 'legal@constructoraeste.com.py',
    domicilio: 'Avda. Aviadores del Chaco 2500, Asunción',
    datosCustom: {
      ruc: '80012345-6',
      razonSocial: 'Constructora del Este S.A.',
      representanteLegal: 'Roberto Fernández',
      ciRepresentante: '1.234.567',
    },
    notasInternas: 'Empresa grande, varios trámites en curso.',
    deudaTotalActual: 15000000,
    fechaRegistro: new Date('2021-06-20'),
    fechaUltimaActualizacion: new Date('2024-12-15'),
    estado: 'activo',
  },
  {
    id: '3',
    tipoClienteId: '1',
    nombreCompleto: 'Ana María López de García',
    documentoIdentidad: '2.345.678',
    telefono: '+595 971 888999',
    email: 'analopez@hotmail.com',
    domicilio: 'Barrio San Roque, Fernando de la Mora',
    datosCustom: {
      ci: '2.345.678',
      estadoCivil: 'Viudo/a',
      profesion: 'Jubilada',
    },
    notasInternas: 'Sucesión de su esposo en proceso.',
    deudaTotalActual: 5000000,
    fechaRegistro: new Date('2024-08-10'),
    fechaUltimaActualizacion: new Date('2024-12-10'),
    estado: 'activo',
  },
  {
    id: '4',
    tipoClienteId: '3',
    nombreCompleto: 'Michael Johnson',
    documentoIdentidad: 'US123456789',
    telefono: '+595 991 777888',
    email: 'mjohnson@email.com',
    domicilio: 'Barrio Las Carmelitas, Asunción',
    datosCustom: {
      pasaporte: 'US123456789',
      nacionalidad: 'Estadounidense',
      cedula: '5.678.901',
      residencia: 'Residente',
    },
    notasInternas: 'Compra de inmueble en Paraguay.',
    deudaTotalActual: 0,
    fechaRegistro: new Date('2024-11-01'),
    fechaUltimaActualizacion: new Date('2024-12-01'),
    estado: 'activo',
  },
];

// Tipos de Trabajo
export const tiposTrabajoMock: TipoTrabajo[] = [
  {
    id: '1',
    nombre: 'Poder Especial',
    descripcion: 'Otorgamiento de poder especial para actos específicos',
    categoria: 'Notarial Unilateral',
    tiempoEstimadoDias: 3,
    precioSugerido: 500000,
    documentosRequeridos: ['CI del poderdante', 'CI del apoderado', 'Datos del acto a realizar'],
    pasosPredefinidos: [
      { numero: 1, nombre: 'Consulta inicial', estadoInicial: 'Pendiente', diasEstimados: 1, descripcion: 'Reunión con cliente', opcional: false },
      { numero: 2, nombre: 'Redacción del poder', estadoInicial: 'Pendiente', diasEstimados: 1, descripcion: 'Elaboración del documento', opcional: false },
      { numero: 3, nombre: 'Revisión y firma', estadoInicial: 'Pendiente', diasEstimados: 1, descripcion: 'Firma del poderdante', opcional: false },
      { numero: 4, nombre: 'Entrega de testimonios', estadoInicial: 'Pendiente', diasEstimados: 0, descripcion: 'Entrega al cliente', opcional: false },
    ],
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
  {
    id: '2',
    nombre: 'Escritura de Compraventa de Inmueble',
    descripcion: 'Transferencia de dominio de bien inmueble',
    categoria: 'Notarial Bilateral',
    tiempoEstimadoDias: 30,
    precioSugerido: 3000000,
    documentosRequeridos: ['Título de propiedad', 'CI vendedor', 'CI comprador', 'Certificado catastral', 'Libre deuda municipal', 'Libre deuda ANDE/ESSAP'],
    pasosPredefinidos: [
      { numero: 1, nombre: 'Recepción de documentos', estadoInicial: 'Pendiente', diasEstimados: 2, descripcion: 'Verificar documentación completa', opcional: false },
      { numero: 2, nombre: 'Estudio de títulos', estadoInicial: 'Pendiente', diasEstimados: 5, descripcion: 'Verificar cadena dominial', opcional: false },
      { numero: 3, nombre: 'Condición de dominio', estadoInicial: 'Pendiente', diasEstimados: 10, descripcion: 'Solicitar informe en Registro', opcional: false },
      { numero: 4, nombre: 'Redacción de escritura', estadoInicial: 'Pendiente', diasEstimados: 3, descripcion: 'Elaborar documento', opcional: false },
      { numero: 5, nombre: 'Firma de partes', estadoInicial: 'Pendiente', diasEstimados: 2, descripcion: 'Comparecencia y firma', opcional: false },
      { numero: 6, nombre: 'Inscripción en Registro', estadoInicial: 'Pendiente', diasEstimados: 15, descripcion: 'Presentar al Registro Público', opcional: false },
      { numero: 7, nombre: 'Retiro y entrega', estadoInicial: 'Pendiente', diasEstimados: 3, descripcion: 'Entregar título inscripto', opcional: false },
    ],
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
  {
    id: '3',
    nombre: 'Sucesión Intestada',
    descripcion: 'Proceso sucesorio sin testamento',
    categoria: 'Judicial',
    tiempoEstimadoDias: 180,
    precioSugerido: 8000000,
    documentosRequeridos: ['Certificado de defunción', 'Partida de matrimonio', 'Partidas de nacimiento herederos', 'Títulos de bienes'],
    pasosPredefinidos: [
      { numero: 1, nombre: 'Consulta y recopilación', estadoInicial: 'Pendiente', diasEstimados: 7, descripcion: 'Reunir documentación', opcional: false },
      { numero: 2, nombre: 'Presentación demanda', estadoInicial: 'Pendiente', diasEstimados: 3, descripcion: 'Presentar al juzgado', opcional: false },
      { numero: 3, nombre: 'Publicación edictos', estadoInicial: 'Pendiente', diasEstimados: 30, descripcion: 'Publicar en diario', opcional: false },
      { numero: 4, nombre: 'Declaratoria de herederos', estadoInicial: 'Pendiente', diasEstimados: 60, descripcion: 'Esperar resolución', opcional: false },
      { numero: 5, nombre: 'Inventario y avalúo', estadoInicial: 'Pendiente', diasEstimados: 30, descripcion: 'Listar y valorar bienes', opcional: false },
      { numero: 6, nombre: 'Partición', estadoInicial: 'Pendiente', diasEstimados: 30, descripcion: 'Dividir bienes', opcional: false },
      { numero: 7, nombre: 'Inscripciones registrales', estadoInicial: 'Pendiente', diasEstimados: 30, descripcion: 'Registrar a nombre herederos', opcional: false },
    ],
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
  {
    id: '4',
    nombre: 'Constitución de Sociedad S.R.L.',
    descripcion: 'Creación de sociedad de responsabilidad limitada',
    categoria: 'Notarial Bilateral',
    tiempoEstimadoDias: 45,
    precioSugerido: 5000000,
    documentosRequeridos: ['CI de socios', 'Datos de la sociedad', 'Capital social', 'Objeto social'],
    pasosPredefinidos: [
      { numero: 1, nombre: 'Consulta y planificación', estadoInicial: 'Pendiente', diasEstimados: 2, descripcion: 'Definir estructura', opcional: false },
      { numero: 2, nombre: 'Redacción estatutos', estadoInicial: 'Pendiente', diasEstimados: 5, descripcion: 'Elaborar contrato social', opcional: false },
      { numero: 3, nombre: 'Firma escritura', estadoInicial: 'Pendiente', diasEstimados: 2, descripcion: 'Otorgamiento notarial', opcional: false },
      { numero: 4, nombre: 'Inscripción Registro Público', estadoInicial: 'Pendiente', diasEstimados: 15, descripcion: 'Inscribir en comercio', opcional: false },
      { numero: 5, nombre: 'Obtención RUC', estadoInicial: 'Pendiente', diasEstimados: 5, descripcion: 'Tramitar ante SET', opcional: false },
      { numero: 6, nombre: 'Habilitación municipal', estadoInicial: 'Pendiente', diasEstimados: 10, descripcion: 'Patente comercial', opcional: true },
    ],
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01'),
    activo: true,
  },
];

// Trabajos
export const trabajosMock: Trabajo[] = [
  {
    id: '1',
    clienteId: '1',
    tipoTrabajoId: '1',
    nombreTrabajo: 'Poder especial - Banco Continental',
    descripcionTrabajo: 'Poder para operar cuentas bancarias',
    fechaInicio: new Date('2024-12-01'),
    fechaFinEstimada: new Date('2024-12-04'),
    estado: 'En proceso',
    presupuestoInicial: 500000,
    costoFinal: 500000,
    pagadoTotal: 250000,
    saldoPendiente: 250000,
    notasInternas: 'Cliente necesita con urgencia',
    fechaCreacion: new Date('2024-12-01'),
    fechaUltimaActualizacion: new Date('2024-12-20'),
  },
  {
    id: '2',
    clienteId: '2',
    tipoTrabajoId: '2',
    nombreTrabajo: 'Compraventa Lote 15 - Luque',
    descripcionTrabajo: 'Venta de terreno industrial',
    fechaInicio: new Date('2024-11-15'),
    fechaFinEstimada: new Date('2024-12-30'),
    estado: 'En proceso',
    presupuestoInicial: 3500000,
    costoFinal: 3500000,
    pagadoTotal: 2000000,
    saldoPendiente: 1500000,
    notasInternas: 'Condición de dominio en proceso',
    fechaCreacion: new Date('2024-11-15'),
    fechaUltimaActualizacion: new Date('2024-12-18'),
  },
  {
    id: '3',
    clienteId: '3',
    tipoTrabajoId: '3',
    nombreTrabajo: 'Sucesión García Ramírez',
    descripcionTrabajo: 'Sucesión intestada del Sr. Pedro García',
    fechaInicio: new Date('2024-08-15'),
    fechaFinEstimada: new Date('2025-02-15'),
    estado: 'En proceso',
    presupuestoInicial: 8000000,
    costoFinal: 8500000,
    pagadoTotal: 3500000,
    saldoPendiente: 5000000,
    notasInternas: 'Esperando declaratoria de herederos',
    fechaCreacion: new Date('2024-08-15'),
    fechaUltimaActualizacion: new Date('2024-12-10'),
  },
  {
    id: '4',
    clienteId: '4',
    tipoTrabajoId: '2',
    nombreTrabajo: 'Compraventa Depto Las Carmelitas',
    descripcionTrabajo: 'Compra de departamento',
    fechaInicio: new Date('2024-11-01'),
    fechaFinEstimada: new Date('2024-12-15'),
    fechaFinReal: new Date('2024-12-10'),
    estado: 'Completado',
    presupuestoInicial: 3000000,
    costoFinal: 3000000,
    pagadoTotal: 3000000,
    saldoPendiente: 0,
    notasInternas: 'Completado sin inconvenientes',
    fechaCreacion: new Date('2024-11-01'),
    fechaUltimaActualizacion: new Date('2024-12-10'),
  },
  {
    id: '5',
    clienteId: '2',
    tipoTrabajoId: '4',
    nombreTrabajo: 'Constitución Constructora Este II S.R.L.',
    descripcionTrabajo: 'Nueva subsidiaria',
    fechaInicio: new Date('2024-12-10'),
    fechaFinEstimada: new Date('2025-01-25'),
    estado: 'Pendiente',
    presupuestoInicial: 5000000,
    costoFinal: 5000000,
    pagadoTotal: 0,
    saldoPendiente: 5000000,
    notasInternas: 'Esperando documentación de socios',
    fechaCreacion: new Date('2024-12-10'),
    fechaUltimaActualizacion: new Date('2024-12-10'),
  },
];

// Items
export const itemsMock: Item[] = [
  // Trabajo 1 - Poder especial
  { id: '1', trabajoId: '1', numeroPaso: 1, nombreItem: 'Consulta inicial', descripcionItem: 'Reunión con cliente', estado: 'Completado', costoTotal: 0, pagado: 0, saldo: 0, diasEstimados: 1, fechaInicio: new Date('2024-12-01'), fechaFinReal: new Date('2024-12-01'), notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-12-01'), fechaActualizacion: new Date('2024-12-01') },
  { id: '2', trabajoId: '1', numeroPaso: 2, nombreItem: 'Redacción del poder', descripcionItem: 'Elaboración del documento', estado: 'Completado', costoTotal: 300000, pagado: 250000, saldo: 50000, diasEstimados: 1, fechaInicio: new Date('2024-12-02'), fechaFinReal: new Date('2024-12-02'), notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-12-01'), fechaActualizacion: new Date('2024-12-02') },
  { id: '3', trabajoId: '1', numeroPaso: 3, nombreItem: 'Revisión y firma', descripcionItem: 'Firma del poderdante', estado: 'En proceso', costoTotal: 200000, pagado: 0, saldo: 200000, diasEstimados: 1, notasItem: 'Esperando cita', documentosItem: [], fechaCreacion: new Date('2024-12-01'), fechaActualizacion: new Date('2024-12-20') },
  { id: '4', trabajoId: '1', numeroPaso: 4, nombreItem: 'Entrega de testimonios', descripcionItem: 'Entrega al cliente', estado: 'Pendiente', costoTotal: 0, pagado: 0, saldo: 0, diasEstimados: 0, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-12-01'), fechaActualizacion: new Date('2024-12-01') },
  
  // Trabajo 2 - Compraventa
  { id: '5', trabajoId: '2', numeroPaso: 1, nombreItem: 'Recepción de documentos', descripcionItem: 'Verificar documentación', estado: 'Completado', costoTotal: 0, pagado: 0, saldo: 0, diasEstimados: 2, fechaFinReal: new Date('2024-11-17'), notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-17') },
  { id: '6', trabajoId: '2', numeroPaso: 2, nombreItem: 'Estudio de títulos', descripcionItem: 'Verificar cadena dominial', estado: 'Completado', costoTotal: 500000, pagado: 500000, saldo: 0, diasEstimados: 5, fechaFinReal: new Date('2024-11-25'), notasItem: 'Todo en orden', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-25') },
  { id: '7', trabajoId: '2', numeroPaso: 3, nombreItem: 'Condición de dominio', descripcionItem: 'Solicitar informe en Registro', estado: 'Mesa entrada', costoTotal: 800000, pagado: 500000, saldo: 300000, diasEstimados: 10, fechaInicio: new Date('2024-11-26'), notasItem: 'Presentado el 26/11', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-12-18') },
  { id: '8', trabajoId: '2', numeroPaso: 4, nombreItem: 'Redacción de escritura', descripcionItem: 'Elaborar documento', estado: 'Pendiente', costoTotal: 1000000, pagado: 500000, saldo: 500000, diasEstimados: 3, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-15') },
  { id: '9', trabajoId: '2', numeroPaso: 5, nombreItem: 'Firma de partes', descripcionItem: 'Comparecencia y firma', estado: 'Pendiente', costoTotal: 500000, pagado: 500000, saldo: 0, diasEstimados: 2, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-15') },
  { id: '10', trabajoId: '2', numeroPaso: 6, nombreItem: 'Inscripción en Registro', descripcionItem: 'Presentar al Registro Público', estado: 'Pendiente', costoTotal: 500000, pagado: 0, saldo: 500000, diasEstimados: 15, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-15') },
  { id: '11', trabajoId: '2', numeroPaso: 7, nombreItem: 'Retiro y entrega', descripcionItem: 'Entregar título inscripto', estado: 'Pendiente', costoTotal: 200000, pagado: 0, saldo: 200000, diasEstimados: 3, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-11-15'), fechaActualizacion: new Date('2024-11-15') },
  
  // Trabajo 3 - Sucesión
  { id: '12', trabajoId: '3', numeroPaso: 1, nombreItem: 'Consulta y recopilación', descripcionItem: 'Reunir documentación', estado: 'Completado', costoTotal: 500000, pagado: 500000, saldo: 0, diasEstimados: 7, fechaFinReal: new Date('2024-08-22'), notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-08-22') },
  { id: '13', trabajoId: '3', numeroPaso: 2, nombreItem: 'Presentación demanda', descripcionItem: 'Presentar al juzgado', estado: 'Completado', costoTotal: 1000000, pagado: 1000000, saldo: 0, diasEstimados: 3, fechaFinReal: new Date('2024-08-28'), notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-08-28') },
  { id: '14', trabajoId: '3', numeroPaso: 3, nombreItem: 'Publicación edictos', descripcionItem: 'Publicar en diario', estado: 'Completado', costoTotal: 1500000, pagado: 1500000, saldo: 0, diasEstimados: 30, fechaFinReal: new Date('2024-10-01'), notasItem: 'ABC Color', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-10-01') },
  { id: '15', trabajoId: '3', numeroPaso: 4, nombreItem: 'Declaratoria de herederos', descripcionItem: 'Esperar resolución', estado: 'En proceso', costoTotal: 2000000, pagado: 500000, saldo: 1500000, diasEstimados: 60, fechaInicio: new Date('2024-10-02'), notasItem: 'Esperando resolución del juzgado', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-12-10') },
  { id: '16', trabajoId: '3', numeroPaso: 5, nombreItem: 'Inventario y avalúo', descripcionItem: 'Listar y valorar bienes', estado: 'Pendiente', costoTotal: 1500000, pagado: 0, saldo: 1500000, diasEstimados: 30, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-08-15') },
  { id: '17', trabajoId: '3', numeroPaso: 6, nombreItem: 'Partición', descripcionItem: 'Dividir bienes', estado: 'Pendiente', costoTotal: 1000000, pagado: 0, saldo: 1000000, diasEstimados: 30, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-08-15') },
  { id: '18', trabajoId: '3', numeroPaso: 7, nombreItem: 'Inscripciones registrales', descripcionItem: 'Registrar a nombre herederos', estado: 'Pendiente', costoTotal: 1000000, pagado: 0, saldo: 1000000, diasEstimados: 30, notasItem: '', documentosItem: [], fechaCreacion: new Date('2024-08-15'), fechaActualizacion: new Date('2024-08-15') },
];

// Pagos
export const pagosMock: Pago[] = [
  { id: '1', trabajoId: '1', itemId: '2', monto: 250000, fechaPago: new Date('2024-12-02'), metodoPago: 'Efectivo', referenciaPago: '', notasPago: 'Anticipo', fechaRegistro: new Date('2024-12-02') },
  { id: '2', trabajoId: '2', monto: 1000000, fechaPago: new Date('2024-11-16'), metodoPago: 'Transferencia', referenciaPago: 'TRF-001234', notasPago: 'Primer pago', fechaRegistro: new Date('2024-11-16') },
  { id: '3', trabajoId: '2', monto: 1000000, fechaPago: new Date('2024-12-01'), metodoPago: 'Transferencia', referenciaPago: 'TRF-001567', notasPago: 'Segundo pago', fechaRegistro: new Date('2024-12-01') },
  { id: '4', trabajoId: '3', monto: 2000000, fechaPago: new Date('2024-08-15'), metodoPago: 'Cheque', referenciaPago: 'CHQ-889900', notasPago: 'Anticipo sucesión', fechaRegistro: new Date('2024-08-15') },
  { id: '5', trabajoId: '3', monto: 1500000, fechaPago: new Date('2024-10-05'), metodoPago: 'Transferencia', referenciaPago: 'TRF-002345', notasPago: 'Pago edictos', fechaRegistro: new Date('2024-10-05') },
  { id: '6', trabajoId: '4', monto: 1500000, fechaPago: new Date('2024-11-05'), metodoPago: 'Transferencia', referenciaPago: 'TRF-003456', notasPago: 'Anticipo', fechaRegistro: new Date('2024-11-05') },
  { id: '7', trabajoId: '4', monto: 1500000, fechaPago: new Date('2024-12-10'), metodoPago: 'Transferencia', referenciaPago: 'TRF-004567', notasPago: 'Saldo final', fechaRegistro: new Date('2024-12-10') },
];

// Eventos
export const eventosMock: EventoCalendario[] = [
  { id: '1', trabajoId: '1', fechaEvento: new Date('2024-12-23'), tipoEvento: 'Recordatorio', tituloEvento: 'Confirmar cita firma poder', descripcion: 'Llamar a Juan Carlos para confirmar', recordatorioHorasAntes: 24, fechaCreacion: new Date('2024-12-20') },
  { id: '2', trabajoId: '2', fechaEvento: new Date('2024-12-30'), tipoEvento: 'Vencimiento', tituloEvento: 'Vence plazo condición de dominio', descripcion: 'Retirar informe del Registro', fechaCreacion: new Date('2024-11-26') },
  { id: '3', trabajoId: '3', fechaEvento: new Date('2025-02-15'), tipoEvento: 'Fin estimada', tituloEvento: 'Fin estimado sucesión García', descripcion: 'Revisar estado del proceso', fechaCreacion: new Date('2024-08-15') },
  { id: '4', fechaEvento: new Date('2024-12-27'), tipoEvento: 'Cita personal', tituloEvento: 'Reunión Colegio de Escribanos', descripcion: 'Asamblea anual', fechaCreacion: new Date('2024-12-01') },
  { id: '5', trabajoId: '5', fechaEvento: new Date('2025-01-25'), tipoEvento: 'Fin estimada', tituloEvento: 'Fin constitución sociedad', descripcion: 'Verificar documentación RUC', fechaCreacion: new Date('2024-12-10') },
];

// Helper functions
export const getClienteById = (id: string): Cliente | undefined => 
  clientesMock.find(c => c.id === id);

export const getTipoClienteById = (id: string): TipoCliente | undefined => 
  tiposClienteMock.find(t => t.id === id);

export const getTipoTrabajoById = (id: string): TipoTrabajo | undefined => 
  tiposTrabajoMock.find(t => t.id === id);

export const getTrabajoById = (id: string): Trabajo | undefined => 
  trabajosMock.find(t => t.id === id);

export const getItemsByTrabajoId = (trabajoId: string): Item[] => 
  itemsMock.filter(i => i.trabajoId === trabajoId);

export const getPagosByTrabajoId = (trabajoId: string): Pago[] => 
  pagosMock.filter(p => p.trabajoId === trabajoId);

export const getTrabajosByClienteId = (clienteId: string): Trabajo[] => 
  trabajosMock.filter(t => t.clienteId === clienteId);

export const getEventosByTrabajoId = (trabajoId: string): EventoCalendario[] => 
  eventosMock.filter(e => e.trabajoId === trabajoId);

// Format currency
export const formatCurrency = (amount: number, currency: 'PYG' | 'USD' = 'PYG'): string => {
  if (currency === 'PYG') {
    return new Intl.NumberFormat('es-PY', { 
      style: 'currency', 
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
};

// Format date
export const formatDate = (date: Date | undefined): string => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-PY', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
};
