export interface CuentaPUC {
  codigo: string;
  descripcion: string;
  nivel: number;
  naturaleza: 'DEUDORA' | 'ACREEDORA';
  tipo_cuenta: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'COSTO' | 'GASTO' | 'ORDEN';
  permite_movimiento: boolean;
  requiere_auxiliar?: boolean;
  requiere_documento?: boolean;
}

export const PUC_COMPLETO_VEN_NIF: CuentaPUC[] = [
  // ==========================================
  // 1. ACTIVOS
  // ==========================================
  { codigo: '1', descripcion: 'ACTIVOS', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  
  // 1.1 ACTIVOS CORRIENTES
  { codigo: '1.1', descripcion: 'ACTIVOS CORRIENTES', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  
  // 1.1.01 Efectivo y Equivalentes de Efectivo
  { codigo: '1.1.01', descripcion: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.01.001', descripcion: 'CAJA GENERAL (VES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.01.002', descripcion: 'CAJA CHICA / FONDOS FIJOS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.01.003', descripcion: 'CAJA MONEDA EXTRANJERA (USD EFECTIVO)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.01.004', descripcion: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.01.005', descripcion: 'BANCO DE VENEZUELA S.A. (CORRIENTE VES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.01.006', descripcion: 'BANESCO BANCO UNIVERSAL (CORRIENTE VES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.01.007', descripcion: 'BBVA BANCO PROVINCIAL (CORRIENTE VES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.01.008', descripcion: 'CUENTAS EN MONEDA EXTRANJERA (CUSTODIA NACIONAL USD)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.01.009', descripcion: 'BANCOS DEL EXTERIOR (USD INTERNACIONAL)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.1.02 Inversiones a Corto Plazo
  { codigo: '1.1.02', descripcion: 'INVERSIONES FINANCIERAS DE CORTO PLAZO', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.02.001', descripcion: 'COLOCACIONES BANCARIAS A PLAZO FIJO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.02.002', descripcion: 'VALORES NEGOCIABLES DE LIQUIDEZ INMEDIATA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.1.03 Cuentas por Cobrar Comerciales
  { codigo: '1.1.03', descripcion: 'CUENTAS POR COBRAR COMERCIALES Y OTRAS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.03.001', descripcion: 'CUENTAS POR COBRAR CLIENTES NACIONALES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true, requiere_documento: true },
  { codigo: '1.1.03.002', descripcion: 'CUENTAS POR COBRAR CLIENTES DEL EXTERIOR (USD)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true, requiere_documento: true },
  { codigo: '1.1.03.003', descripcion: 'EFECTOS Y GIROS POR COBRAR', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_documento: true },
  { codigo: '1.1.03.004', descripcion: 'CUENTAS POR COBRAR EMPLEADOS Y ACCIONISTAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.03.005', descripcion: 'ANTICIPOS ENTREGADOS A PROVEEDORES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.03.006', descripcion: 'PROVISION PARA CUENTAS INCOBRABLES (VALUACION)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.1.04 Créditos Fiscales y Tributos a Favor
  { codigo: '1.1.04', descripcion: 'CREDITOS FISCALES Y TRIBUTOS POR COMPENSAR', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.04.001', descripcion: 'CREDITO FISCAL IVA (16%)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.04.002', descripcion: 'CREDITO FISCAL IVA ALICUOTA ADICIONAL / SUNTUARIA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.04.003', descripcion: 'RETENCIONES DE IVA SOPORTADAS (COMPROBANTES 75%/100%)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true, requiere_documento: true },
  { codigo: '1.1.04.004', descripcion: 'ANTICIPOS QUINCENALES DE ISLR (SPE SENIAT)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.04.005', descripcion: 'RETENCIONES DE ISLR SOPORTADAS (CLIENTES)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '1.1.04.006', descripcion: 'CREDITO FISCAL IGTF RECUPERABLE', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.1.05 Inventarios
  { codigo: '1.1.05', descripcion: 'INVENTARIOS DE MERCANCIAS Y SUMINISTROS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.05.001', descripcion: 'INVENTARIO DE MERCANCIAS PARA LA VENTA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.05.002', descripcion: 'MERCANCIAS EN TRANSITO / IMPORTACIONES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.05.003', descripcion: 'MATERIALES, REPUESTOS Y SUMINISTROS DE OFICINA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.05.004', descripcion: 'PROVISION POR OBSOLESCENCIA O PERDIDA DE VNR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.1.06 Gastos Pagados por Anticipado
  { codigo: '1.1.06', descripcion: 'GASTOS PAGADOS POR ANTICIPADO', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.1.06.001', descripcion: 'POLIZAS DE SEGURO PAGADAS POR ANTICIPADO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.1.06.002', descripcion: 'ALQUILERES PAGADOS POR ANTICIPADO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.2 ACTIVOS NO CORRIENTES
  { codigo: '1.2', descripcion: 'ACTIVOS NO CORRIENTES', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.2.01', descripcion: 'PROPIEDADES, PLANTA Y EQUIPO (PPE)', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.2.01.001', descripcion: 'TERRENOS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.01.002', descripcion: 'EDIFICACIONES Y LOCALES COMERCIALES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.01.003', descripcion: 'MAQUINARIAS Y EQUIPOS OPERATIVOS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.01.004', descripcion: 'MOBILIARIO Y ENSERES DE OFICINA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.01.005', descripcion: 'EQUIPOS DE COMPUTACION Y TELECOMUNICACIONES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.01.006', descripcion: 'VEHICULOS Y UNIDADES DE TRANSPORTE', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.2.02 Depreciación Acumulada
  { codigo: '1.2.02', descripcion: 'DEPRECIACION ACUMULADA (VALUACION PPE)', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.2.02.001', descripcion: 'DEPREC. ACUM. EDIFICACIONES', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.02.002', descripcion: 'DEPREC. ACUM. MAQUINARIAS Y EQUIPOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.02.003', descripcion: 'DEPREC. ACUM. MOBILIARIO Y ENSERES', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.02.004', descripcion: 'DEPREC. ACUM. EQUIPOS DE COMPUTACION', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.02.005', descripcion: 'DEPREC. ACUM. VEHICULOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // 1.2.03 Intangibles y Otros
  { codigo: '1.2.03', descripcion: 'ACTIVOS INTANGIBLES Y OTROS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: false },
  { codigo: '1.2.03.001', descripcion: 'LICENCIAS DE SOFTWARE, ERP Y SISTEMAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.03.002', descripcion: 'MARCAS DE FABRICA Y PATENTES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.03.003', descripcion: 'AMORTIZACION ACUMULADA DE INTANGIBLES', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.03.004', descripcion: 'DEPOSITOS ENTREGADOS EN GARANTIA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },
  { codigo: '1.2.03.005', descripcion: 'ACTIVOS POR IMPUESTO SOBRE LA RENTA DIFERIDO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'ACTIVO', permite_movimiento: true },

  // ==========================================
  // 2. PASIVOS
  // ==========================================
  { codigo: '2', descripcion: 'PASIVOS', nivel: 1, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  
  // 2.1 PASIVOS CORRIENTES
  { codigo: '2.1', descripcion: 'PASIVOS CORRIENTES', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  
  // 2.1.01 Cuentas por Pagar Comerciales
  { codigo: '2.1.01', descripcion: 'CUENTAS Y DOCUMENTOS POR PAGAR COMERCIALES', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.1.01.001', descripcion: 'PROVEEDORES NACIONALES (VES)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true, requiere_documento: true },
  { codigo: '2.1.01.002', descripcion: 'PROVEEDORES EN DIVISAS / EXTERIOR (USD)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true, requiere_documento: true },
  { codigo: '2.1.01.003', descripcion: 'ANTICIPOS RECIBIDOS DE CLIENTES', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true },

  // 2.1.02 Obligaciones Financieras
  { codigo: '2.1.02', descripcion: 'OBLIGACIONES BANCARIAS Y PRESTAMOS A CORTO PLAZO', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.1.02.001', descripcion: 'PAGARES Y PRESTAMOS BANCARIOS POR PAGAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.02.002', descripcion: 'SOBREGIROS BANCARIOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },

  // 2.1.03 Tributos por Pagar y Retenciones SENIAT
  { codigo: '2.1.03', descripcion: 'TRIBUTOS POR PAGAR Y RETENCIONES FISCALES', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.1.03.001', descripcion: 'DEBITO FISCAL IVA (16%)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.03.002', descripcion: 'RETENCIONES DE IVA POR ENTERAR (PROVEEDORES 75%)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '2.1.03.003', descripcion: 'RETENCIONES DE IVA POR ENTERAR (PROVEEDORES 100%)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '2.1.03.004', descripcion: 'RETENCIONES DE ISLR POR ENTERAR (PROVEEDORES)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true, requiere_auxiliar: true },
  { codigo: '2.1.03.005', descripcion: 'RETENCIONES DE ISLR POR ENTERAR (SUELDOS Y SALARIOS)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.03.006', descripcion: 'IMPUESTO IGTF POR ENTERAR (3%)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.03.007', descripcion: 'IMPUESTOS MUNICIPALES POR PAGAR (ACTIVIDADES ECONOMICAS)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.03.008', descripcion: 'ISLR ESTIMADO Y DEFINITIVO POR PAGAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },

  // 2.1.04 Obligaciones Laborales y Parafiscales
  { codigo: '2.1.04', descripcion: 'OBLIGACIONES LABORALES Y PARAFISCALES', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.1.04.001', descripcion: 'SUELDOS Y SALARIOS POR PAGAR (NOMINA)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.002', descripcion: 'CESTATICKET SOCIAL POR PAGAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.003', descripcion: 'RETENCIONES LABORALES IVSS (SEGURO SOCIAL) POR ENTERAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.004', descripcion: 'RETENCIONES LABORALES FAOV (BANAVIH) POR ENTERAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.005', descripcion: 'RETENCIONES LABORALES RPE (PARO FORZOSO) POR ENTERAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.006', descripcion: 'APORTES PATRONALES PARAFISCALES POR ENTERAR (IVSS/FAOV/INCES)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.007', descripcion: 'UTILIDADES Y BONIFICACION DE FIN DE AÑO POR PAGAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.1.04.008', descripcion: 'VACACIONES Y BONO VACACIONAL POR PAGAR', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },

  // 2.2 PASIVOS NO CORRIENTES
  { codigo: '2.2', descripcion: 'PASIVOS NO CORRIENTES', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.2.01', descripcion: 'OBLIGACIONES A LARGO PLAZO Y PRESTACIONES SOCIALES', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: false },
  { codigo: '2.2.01.001', descripcion: 'PRESTAMOS BANCARIOS A LARGO PLAZO', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.2.01.002', descripcion: 'GARANTIA DE PRESTACIONES SOCIALES (LOTTT ART. 142)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.2.01.003', descripcion: 'INTERESES SOBRE PRESTACIONES SOCIALES ACUMULADOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },
  { codigo: '2.2.01.004', descripcion: 'PASIVOS POR IMPUESTO SOBRE LA RENTA DIFERIDO', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PASIVO', permite_movimiento: true },

  // ==========================================
  // 3. PATRIMONIO
  // ==========================================
  { codigo: '3', descripcion: 'PATRIMONIO NETO', nivel: 1, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.1', descripcion: 'CAPITAL CONTABLE', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.1.01', descripcion: 'CAPITAL SOCIAL', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.1.01.001', descripcion: 'CAPITAL SOCIAL SUSCRITO Y PAGADO', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },
  { codigo: '3.1.01.002', descripcion: 'ACTUALIZACION DE CAPITAL SOCIAL POR INFLACION (REME)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },

  { codigo: '3.2', descripcion: 'RESERVAS Y SUPERAVIT', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.2.01', descripcion: 'RESERVAS PATRIMONIALES', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.2.01.001', descripcion: 'RESERVA LEGAL (5% CODIGO DE COMERCIO)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },
  { codigo: '3.2.01.002', descripcion: 'RESERVAS ESTATUTARIAS Y VOLUNTARIAS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },

  { codigo: '3.3', descripcion: 'RESULTADOS ACUMULADOS', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.3.01', descripcion: 'RESULTADOS DE EJERCICIOS', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: false },
  { codigo: '3.3.01.001', descripcion: 'UTILIDADES NO DISTRIBUIDAS DE EJERCICIOS ANTERIORES', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },
  { codigo: '3.3.01.002', descripcion: 'PERDIDAS ACUMULADAS DE EJERCICIOS ANTERIORES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },
  { codigo: '3.3.01.003', descripcion: 'UTILIDAD O PERDIDA DEL EJERCICIO EN CURSO', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'PATRIMONIO', permite_movimiento: true },

  // ==========================================
  // 4. INGRESOS
  // ==========================================
  { codigo: '4', descripcion: 'INGRESOS', nivel: 1, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: false },
  { codigo: '4.1', descripcion: 'INGRESOS OPERACIONALES POR VENTAS Y SERVICIOS', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: false },
  { codigo: '4.1.01', descripcion: 'VENTAS DE MERCANCIAS', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: false },
  { codigo: '4.1.01.001', descripcion: 'VENTAS DE MERCANCIAS GRAVADAS CON IVA (16%)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.1.01.002', descripcion: 'VENTAS DE MERCANCIAS EXENTAS Y EXONERADAS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.1.01.003', descripcion: 'PRESTACION DE SERVICIOS Y ASESORIA PROFESIONAL', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.1.01.004', descripcion: 'DESCUENTOS Y REBAJAS EN VENTAS (DISMINUCION)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.1.01.005', descripcion: 'DEVOLUCIONES EN VENTAS (DISMINUCION)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },

  { codigo: '4.2', descripcion: 'OTROS INGRESOS Y BENEFICIOS', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: false },
  { codigo: '4.2.01', descripcion: 'INGRESOS FINANCIEROS Y NO OPERATIVOS', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: false },
  { codigo: '4.2.01.001', descripcion: 'INTERESES GANADOS SOBRE INSTRUMENTOS Y BANCOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.2.01.002', descripcion: 'GANANCIA EN DIFERENCIAL CAMBIARIO (BCV)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },
  { codigo: '4.2.01.003', descripcion: 'RECUPERACION DE CREDITOS MOROSOS Y OTROS INGRESOS', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'INGRESO', permite_movimiento: true },

  // ==========================================
  // 5. COSTOS DE VENTAS Y SERVICIOS
  // ==========================================
  { codigo: '5', descripcion: 'COSTOS DE VENTAS Y PRODUCCION', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: false },
  { codigo: '5.1', descripcion: 'COSTO DE VENTAS DE MERCANCIAS', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: false },
  { codigo: '5.1.01', descripcion: 'COSTO DE ADQUISICION DE BIENES VENDIDOS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: false },
  { codigo: '5.1.01.001', descripcion: 'COMPRAS DE MERCANCIAS NACIONALES GRAVADAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: true },
  { codigo: '5.1.01.002', descripcion: 'COMPRAS DE MERCANCIAS EXENTAS / EXONERADAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: true },
  { codigo: '5.1.01.003', descripcion: 'IMPORTACIONES DE MERCANCIAS (COSTO CIF)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: true },
  { codigo: '5.1.01.004', descripcion: 'FLETES Y ARANCELES DE IMPORTACION EN COMPRAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'COSTO', permite_movimiento: true },
  { codigo: '5.1.01.005', descripcion: 'DESCUENTOS Y DEVOLUCIONES EN COMPRAS (CREDITO)', nivel: 4, naturaleza: 'ACREEDORA', tipo_cuenta: 'COSTO', permite_movimiento: true },

  // ==========================================
  // 6. GASTOS OPERATIVOS
  // ==========================================
  { codigo: '6', descripcion: 'GASTOS OPERATIVOS (ADMINISTRACION Y VENTAS)', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  
  // 6.1 GASTOS DE PERSONAL
  { codigo: '6.1', descripcion: 'GASTOS DE PERSONAL Y BENEFICIOS SOCIALES', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.1.01', descripcion: 'SUELDOS, SALARIOS Y COMPENSACIONES', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.1.01.001', descripcion: 'GASTO DE SUELDOS Y SALARIOS (ADMINISTRACION)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.002', descripcion: 'GASTO DE SUELDOS Y SALARIOS (VENTAS Y COMERCIAL)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.003', descripcion: 'BENEFICIO DE ALIMENTACION (CESTATICKET LOTTT)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.004', descripcion: 'BONIFICACIONES COMPLEMENTARIAS EN DIVISAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.005', descripcion: 'APORTES PATRONALES AL SEGURO SOCIAL (IVSS)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.006', descripcion: 'APORTES PATRONALES AL FONDO DE VIVIENDA (FAOV)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.007', descripcion: 'APORTES PATRONALES AL INCES (2%)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.008', descripcion: 'GASTO DE PRESTACIONES SOCIALES (LOTTT ART. 142)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.009', descripcion: 'GASTO DE INTERESES SOBRE PRESTACIONES SOCIALES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.010', descripcion: 'GASTO DE UTILIDADES Y BONO DE FIN DE AÑO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.1.01.011', descripcion: 'GASTO DE VACACIONES Y BONO VACACIONAL', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // 6.2 GASTOS GENERALES Y ADMINISTRATIVOS
  { codigo: '6.2', descripcion: 'GASTOS GENERALES Y DE ADMINISTRACION', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.2.01', descripcion: 'SERVICIOS Y MANTENIMIENTO', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.2.01.001', descripcion: 'ALQUILER DE OFICINAS Y LOCALES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.002', descripcion: 'SERVICIOS PUBLICOS (ELECTRICIDAD, AGUA, ASEO URBANO)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.003', descripcion: 'TELEFONIA, INTERNET Y CONECTIVIDAD', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.004', descripcion: 'HONORARIOS PROFESIONALES CONTABLES, LEGALES Y AUDITORIA', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.005', descripcion: 'MANTENIMIENTO Y REPARACION DE EQUIPOS E INSTALACIONES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.006', descripcion: 'PAPELERIA, TONER Y UTILES DE ESCRITORIO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.007', descripcion: 'COMISIONES BANCARIAS Y GASTOS DE GESTION', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.008', descripcion: 'IMPUESTOS MUNICIPALES POR ACTIVIDADES ECONOMICAS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.009', descripcion: 'IMPUESTO A LAS GRANDES TRANSACCIONES FINANCIERAS (IGTF)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.2.01.010', descripcion: 'SUSCRIPCIONES, MEMBRESIAS Y SOFTWARE CLOUD', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // 6.3 GASTOS DE COMERCIALIZACION Y VENTAS
  { codigo: '6.3', descripcion: 'GASTOS DE VENTAS, MERCADEO Y DISTRIBUCION', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.3.01', descripcion: 'PUBLICIDAD Y FLETES', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.3.01.001', descripcion: 'COMISIONES SOBRE VENTAS A VENDEDORES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.3.01.002', descripcion: 'PUBLICIDAD, MERCADEO Y REDES SOCIALES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.3.01.003', descripcion: 'FLETES Y DESPACHOS A CLIENTES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // 6.4 DEPRECIACIONES Y AMORTIZACIONES
  { codigo: '6.4', descripcion: 'DEPRECIACIONES Y AMORTIZACIONES DEL EJERCICIO', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.4.01', descripcion: 'GASTO DE DEPRECIACION PPE', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '6.4.01.001', descripcion: 'GASTO DEPREC. EDIFICACIONES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.4.01.002', descripcion: 'GASTO DEPREC. MOBILIARIO Y EQUIPOS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.4.01.003', descripcion: 'GASTO DEPREC. EQUIPOS DE COMPUTACION', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.4.01.004', descripcion: 'GASTO DEPREC. VEHICULOS Y TRANSPORTE', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '6.4.01.005', descripcion: 'GASTO DE AMORTIZACION DE INTANGIBLES', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // ==========================================
  // 7. OTROS EGRESOS Y FINANCIAMIENTO
  // ==========================================
  { codigo: '7', descripcion: 'EGRESOS FINANCIEROS Y DIFERENCIAL CAMBIARIO', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '7.1', descripcion: 'GASTOS FINANCIEROS Y PERDIDAS NO OPERATIVAS', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '7.1.01', descripcion: 'FINANCIAMIENTO Y FLUCTUACIONES MONETARIAS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '7.1.01.001', descripcion: 'GASTOS POR INTERESES FINANCIEROS BANCARIOS', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '7.1.01.002', descripcion: 'PERDIDA EN DIFERENCIAL CAMBIARIO (BCV)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '7.1.01.003', descripcion: 'RESULTADO MONETARIO DEL EJERCICIO (REME / NIC 29)', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // ==========================================
  // 8. IMPUESTO SOBRE LA RENTA
  // ==========================================
  { codigo: '8', descripcion: 'IMPUESTO SOBRE LA RENTA (ISLR)', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '8.1', descripcion: 'PROVISION PARA IMPUESTO SOBRE LA RENTA', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '8.1.01', descripcion: 'GASTO DE ISLR', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: false },
  { codigo: '8.1.01.001', descripcion: 'GASTO DE ISLR CORRIENTE DEL EJERCICIO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },
  { codigo: '8.1.01.002', descripcion: 'GASTO / INGRESO POR ISLR DIFERIDO', nivel: 4, naturaleza: 'DEUDORA', tipo_cuenta: 'GASTO', permite_movimiento: true },

  // ==========================================
  // 9. CUENTAS DE ORDEN
  // ==========================================
  { codigo: '9', descripcion: 'CUENTAS DE ORDEN', nivel: 1, naturaleza: 'DEUDORA', tipo_cuenta: 'ORDEN', permite_movimiento: false },
  { codigo: '9.1', descripcion: 'CUENTAS DE ORDEN DEUDORAS', nivel: 2, naturaleza: 'DEUDORA', tipo_cuenta: 'ORDEN', permite_movimiento: false },
  { codigo: '9.1.01', descripcion: 'MERCANCIAS Y BIENES EN CONSIGNACION RECIBIDOS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ORDEN', permite_movimiento: true },
  { codigo: '9.1.02', descripcion: 'FIANZAS Y GARANTIAS BANCARIAS OTORGADAS', nivel: 3, naturaleza: 'DEUDORA', tipo_cuenta: 'ORDEN', permite_movimiento: true },
  { codigo: '9.2', descripcion: 'CUENTAS DE ORDEN ACREEDORAS (PER CONTRA)', nivel: 2, naturaleza: 'ACREEDORA', tipo_cuenta: 'ORDEN', permite_movimiento: false },
  { codigo: '9.2.01', descripcion: 'RESPONSABILIDADES POR MERCANCIAS EN CONSIGNACION', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'ORDEN', permite_movimiento: true },
  { codigo: '9.2.02', descripcion: 'RESPONSABILIDADES POR FIANZAS Y GARANTIAS', nivel: 3, naturaleza: 'ACREEDORA', tipo_cuenta: 'ORDEN', permite_movimiento: true },
];
