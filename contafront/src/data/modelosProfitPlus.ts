export interface RenglonModelo {
  codigo_cuenta: string;
  descripcion_cuenta: string;
  naturaleza: 'DEBE' | 'HABER';
  porcentaje_o_regla: string;
  requiere_auxiliar?: boolean;
}

export interface ComprobanteModeloProfit {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'OPERACIONES' | 'VENTAS' | 'COMPRAS' | 'NOMINA' | 'TRIBUTOS' | 'CIERRES' | 'AJUSTES';
  descripcion: string;
  modulo_origen: string;
  renglones: RenglonModelo[];
}

export const MODELOS_PROFIT_PLUS: ComprobanteModeloProfit[] = [
  {
    id: 'MOD-001',
    codigo: 'AS-APE-01',
    nombre: 'Apertura de Ejercicio / Integración de Capital Social',
    categoria: 'OPERACIONES',
    descripcion: 'Registro de aportes de socios a bancos y constitución del Capital Social Suscrito y Pagado.',
    modulo_origen: 'Bancos / Caja',
    renglones: [
      { codigo_cuenta: '1.1.01.004', descripcion_cuenta: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', naturaleza: 'DEBE', porcentaje_o_regla: '100% Aporte Socios' },
      { codigo_cuenta: '3.1.01.001', descripcion_cuenta: 'CAPITAL SOCIAL SUSCRITO Y PAGADO', naturaleza: 'HABER', porcentaje_o_regla: '100% Cuota de Capital' }
    ]
  },
  {
    id: 'MOD-002',
    codigo: 'AS-VEN-01',
    nombre: 'Ventas de Mercancías a Crédito con Débito Fiscal IVA',
    categoria: 'VENTAS',
    descripcion: 'Emisión de Factura Fiscal a crédito generando cuenta por cobrar comercial y Débito Fiscal IVA (16%).',
    modulo_origen: 'Facturación / Ventas Profit',
    renglones: [
      { codigo_cuenta: '1.1.03.001', descripcion_cuenta: 'CUENTAS POR COBRAR CLIENTES NACIONALES', naturaleza: 'DEBE', porcentaje_o_regla: '116% Total Factura', requiere_auxiliar: true },
      { codigo_cuenta: '4.1.01.001', descripcion_cuenta: 'VENTAS DE MERCANCIAS GRAVADAS CON IVA (16%)', naturaleza: 'HABER', porcentaje_o_regla: '100% Base Imponible' },
      { codigo_cuenta: '2.1.03.001', descripcion_cuenta: 'DEBITO FISCAL IVA (16%)', naturaleza: 'HABER', porcentaje_o_regla: '16% Alícuota General' }
    ]
  },
  {
    id: 'MOD-003',
    codigo: 'AS-VEN-02',
    nombre: 'Ventas de Contado con Depósito Bancario e IVA',
    categoria: 'VENTAS',
    descripcion: 'Venta con cobro inmediato mediante transferencia o punto de venta bancario.',
    modulo_origen: 'Punto de Venta / Caja Profit',
    renglones: [
      { codigo_cuenta: '1.1.01.005', descripcion_cuenta: 'BANCO DE VENEZUELA S.A. (CORRIENTE VES)', naturaleza: 'DEBE', porcentaje_o_regla: '116% Monto Recibido' },
      { codigo_cuenta: '4.1.01.001', descripcion_cuenta: 'VENTAS DE MERCANCIAS GRAVADAS CON IVA (16%)', naturaleza: 'HABER', porcentaje_o_regla: '100% Base Imponible' },
      { codigo_cuenta: '2.1.03.001', descripcion_cuenta: 'DEBITO FISCAL IVA (16%)', naturaleza: 'HABER', porcentaje_o_regla: '16% Alícuota General' }
    ]
  },
  {
    id: 'MOD-004',
    codigo: 'AS-COB-01',
    nombre: 'Cobranza a Clientes con Retención IVA (75%) e ISLR (2%)',
    categoria: 'VENTAS',
    descripcion: 'Cobro de factura a un Contribuyente Especial (SPE) con descuento de comprobantes de retención.',
    modulo_origen: 'Cuentas por Cobrar Profit',
    renglones: [
      { codigo_cuenta: '1.1.01.004', descripcion_cuenta: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', naturaleza: 'DEBE', porcentaje_o_regla: 'Neto Transferido' },
      { codigo_cuenta: '1.1.04.003', descripcion_cuenta: 'RETENCIONES DE IVA SOPORTADAS (COMPROBANTES 75%/100%)', naturaleza: 'DEBE', porcentaje_o_regla: '75% del IVA facturado' },
      { codigo_cuenta: '1.1.04.005', descripcion_cuenta: 'RETENCIONES DE ISLR SOPORTADAS (CLIENTES)', naturaleza: 'DEBE', porcentaje_o_regla: '2% Base Imponible' },
      { codigo_cuenta: '1.1.03.001', descripcion_cuenta: 'CUENTAS POR COBRAR CLIENTES NACIONALES', naturaleza: 'HABER', porcentaje_o_regla: '100% Cancelación Factura', requiere_auxiliar: true }
    ]
  },
  {
    id: 'MOD-005',
    codigo: 'AS-COM-01',
    nombre: 'Compras de Mercancías a Crédito con Crédito Fiscal IVA',
    categoria: 'COMPRAS',
    descripcion: 'Recepción de Factura de Proveedor a crédito con Crédito Fiscal IVA deducible.',
    modulo_origen: 'Compras / Cuentas por Pagar Profit',
    renglones: [
      { codigo_cuenta: '5.1.01.001', descripcion_cuenta: 'COMPRAS DE MERCANCIAS NACIONALES GRAVADAS', naturaleza: 'DEBE', porcentaje_o_regla: '100% Base Imponible' },
      { codigo_cuenta: '1.1.04.001', descripcion_cuenta: 'CREDITO FISCAL IVA (16%)', naturaleza: 'DEBE', porcentaje_o_regla: '16% Alícuota General' },
      { codigo_cuenta: '2.1.01.001', descripcion_cuenta: 'PROVEEDORES NACIONALES (VES)', naturaleza: 'HABER', porcentaje_o_regla: '116% Total Factura', requiere_auxiliar: true }
    ]
  },
  {
    id: 'MOD-006',
    codigo: 'AS-PAG-01',
    nombre: 'Pago a Proveedor con Retención de IVA (75%) e ISLR (3%)',
    categoria: 'COMPRAS',
    descripcion: 'Liquidación de factura a proveedor aplicando retención de IVA según Providencia SENIAT y retención de ISLR por servicios.',
    modulo_origen: 'Cuentas por Pagar / Tesorería Profit',
    renglones: [
      { codigo_cuenta: '2.1.01.001', descripcion_cuenta: 'PROVEEDORES NACIONALES (VES)', naturaleza: 'DEBE', porcentaje_o_regla: '100% Total Deuda Proveedor', requiere_auxiliar: true },
      { codigo_cuenta: '1.1.01.004', descripcion_cuenta: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', naturaleza: 'HABER', porcentaje_o_regla: 'Neto Pagado por Transferencia' },
      { codigo_cuenta: '2.1.03.002', descripcion_cuenta: 'RETENCIONES DE IVA POR ENTERAR (PROVEEDORES 75%)', naturaleza: 'HABER', porcentaje_o_regla: '75% del IVA de la compra' },
      { codigo_cuenta: '2.1.03.004', descripcion_cuenta: 'RETENCIONES DE ISLR POR ENTERAR (PROVEEDORES)', naturaleza: 'HABER', porcentaje_o_regla: '3% o 5% de la Base Imponible' }
    ]
  },
  {
    id: 'MOD-007',
    codigo: 'AS-NOM-01',
    nombre: 'Nómina Quincenal LOTTT (Sueldos y Retenciones Laborales)',
    categoria: 'NOMINA',
    descripcion: 'Causación y pago quincenal de salarios con retenciones obligatorias de IVSS, FAOV y Paro Forzoso.',
    modulo_origen: 'Kantio Nómina / Profit Nómina',
    renglones: [
      { codigo_cuenta: '6.1.01.001', descripcion_cuenta: 'GASTO DE SUELDOS Y SALARIOS (ADMINISTRACION)', naturaleza: 'DEBE', porcentaje_o_regla: 'Salario Bruto Devengado' },
      { codigo_cuenta: '2.1.04.003', descripcion_cuenta: 'RETENCIONES LABORALES IVSS (SEGURO SOCIAL) POR ENTERAR', naturaleza: 'HABER', porcentaje_o_regla: '4% Trabajador' },
      { codigo_cuenta: '2.1.04.004', descripcion_cuenta: 'RETENCIONES LABORALES FAOV (BANAVIH) POR ENTERAR', naturaleza: 'HABER', porcentaje_o_regla: '1% Trabajador' },
      { codigo_cuenta: '2.1.04.005', descripcion_cuenta: 'RETENCIONES LABORALES RPE (PARO FORZOSO) POR ENTERAR', naturaleza: 'HABER', porcentaje_o_regla: '0.5% Trabajador' },
      { codigo_cuenta: '1.1.01.004', descripcion_cuenta: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', naturaleza: 'HABER', porcentaje_o_regla: 'Sueldo Neto Dispersado' }
    ]
  },
  {
    id: 'MOD-008',
    codigo: 'AS-NOM-02',
    nombre: 'Aportes Patronales Parafiscales (IVSS, FAOV, INCES)',
    categoria: 'NOMINA',
    descripcion: 'Causación mensual de la carga parafiscal patronal sobre nómina según legislación venezolana.',
    modulo_origen: 'Kantio Nómina / Profit Nómina',
    renglones: [
      { codigo_cuenta: '6.1.01.005', descripcion_cuenta: 'APORTES PATRONALES AL SEGURO SOCIAL (IVSS)', naturaleza: 'DEBE', porcentaje_o_regla: '9% al 11% según riesgo' },
      { codigo_cuenta: '6.1.01.006', descripcion_cuenta: 'APORTES PATRONALES AL FONDO DE VIVIENDA (FAOV)', naturaleza: 'DEBE', porcentaje_o_regla: '2% Aporte Patronal' },
      { codigo_cuenta: '6.1.01.007', descripcion_cuenta: 'APORTES PATRONALES AL INCES (2%)', naturaleza: 'DEBE', porcentaje_o_regla: '2% Trimestral' },
      { codigo_cuenta: '2.1.04.006', descripcion_cuenta: 'APORTES PATRONALES PARAFISCALES POR ENTERAR (IVSS/FAOV/INCES)', naturaleza: 'HABER', porcentaje_o_regla: 'Total Pasivo Parafiscal' }
    ]
  },
  {
    id: 'MOD-009',
    codigo: 'AS-SEN-01',
    nombre: 'Enteramiento Quincenal de Retenciones IVA e ISLR al SENIAT',
    categoria: 'TRIBUTOS',
    descripcion: 'Pago en línea de las retenciones acumuladas en el portal SENIAT según calendario de Sujetos Pasivos Especiales.',
    modulo_origen: 'Gestión Tributaria / Tesorería',
    renglones: [
      { codigo_cuenta: '2.1.03.002', descripcion_cuenta: 'RETENCIONES DE IVA POR ENTERAR (PROVEEDORES 75%)', naturaleza: 'DEBE', porcentaje_o_regla: 'Total IVA Retenido' },
      { codigo_cuenta: '2.1.03.004', descripcion_cuenta: 'RETENCIONES DE ISLR POR ENTERAR (PROVEEDORES)', naturaleza: 'DEBE', porcentaje_o_regla: 'Total ISLR Retenido' },
      { codigo_cuenta: '1.1.01.005', descripcion_cuenta: 'BANCO DE VENEZUELA S.A. (CORRIENTE VES)', naturaleza: 'HABER', porcentaje_o_regla: 'Pago Débito Directo SENIAT' }
    ]
  },
  {
    id: 'MOD-010',
    codigo: 'AS-SEN-02',
    nombre: 'Declaración Mensual de IVA (Compensación Débito vs Crédito)',
    categoria: 'TRIBUTOS',
    descripcion: 'Cierre fiscal mensual de IVA: compensación de créditos fiscales contra débitos y determinación del impuesto a pagar o excedente.',
    modulo_origen: 'Fiscal / Cierres Mensuales',
    renglones: [
      { codigo_cuenta: '2.1.03.001', descripcion_cuenta: 'DEBITO FISCAL IVA (16%)', naturaleza: 'DEBE', porcentaje_o_regla: 'Total Débito Acumulado' },
      { codigo_cuenta: '1.1.04.001', descripcion_cuenta: 'CREDITO FISCAL IVA (16%)', naturaleza: 'HABER', porcentaje_o_regla: 'Total Crédito Compensado' },
      { codigo_cuenta: '1.1.04.003', descripcion_cuenta: 'RETENCIONES DE IVA SOPORTADAS (COMPROBANTES 75%/100%)', naturaleza: 'HABER', porcentaje_o_regla: 'Retenciones Descontadas' },
      { codigo_cuenta: '1.1.01.004', descripcion_cuenta: 'BANCO MERCANTIL C.A. (CORRIENTE VES)', naturaleza: 'HABER', porcentaje_o_regla: 'Impuesto Neto Cancelado SENIAT' }
    ]
  },
  {
    id: 'MOD-011',
    codigo: 'AS-DEP-01',
    nombre: 'Depreciación Mensual de Activos Fijos (PPE)',
    categoria: 'AJUSTES',
    descripcion: 'Cálculo y distribución mensual de la depreciación por línea recta de mobiliario, computación y vehículos.',
    modulo_origen: 'Activos Fijos Profit',
    renglones: [
      { codigo_cuenta: '6.4.01.002', descripcion_cuenta: 'GASTO DEPREC. MOBILIARIO Y EQUIPOS', naturaleza: 'DEBE', porcentaje_o_regla: 'Cuota Mensual (10% anual)' },
      { codigo_cuenta: '6.4.01.003', descripcion_cuenta: 'GASTO DEPREC. EQUIPOS DE COMPUTACION', naturaleza: 'DEBE', porcentaje_o_regla: 'Cuota Mensual (33% anual)' },
      { codigo_cuenta: '6.4.01.004', descripcion_cuenta: 'GASTO DEPREC. VEHICULOS Y TRANSPORTE', naturaleza: 'DEBE', porcentaje_o_regla: 'Cuota Mensual (20% anual)' },
      { codigo_cuenta: '1.2.02.003', descripcion_cuenta: 'DEPREC. ACUM. MOBILIARIO Y ENSERES', naturaleza: 'HABER', porcentaje_o_regla: 'Acumulado' },
      { codigo_cuenta: '1.2.02.004', descripcion_cuenta: 'DEPREC. ACUM. EQUIPOS DE COMPUTACION', naturaleza: 'HABER', porcentaje_o_regla: 'Acumulado' },
      { codigo_cuenta: '1.2.02.005', descripcion_cuenta: 'DEPREC. ACUM. VEHICULOS', naturaleza: 'HABER', porcentaje_o_regla: 'Acumulado' }
    ]
  },
  {
    id: 'MOD-012',
    codigo: 'AS-DIF-01',
    nombre: 'Ajuste por Diferencial Cambiario (Tasa Oficial BCV al Cierre)',
    categoria: 'AJUSTES',
    descripcion: 'Reexpresión mensual de saldos bancarios y cuentas en divisas a la tasa oficial BCV de fin de mes.',
    modulo_origen: 'Bancos / Cierres Bimonetarios',
    renglones: [
      { codigo_cuenta: '1.1.01.008', descripcion_cuenta: 'CUENTAS EN MONEDA EXTRANJERA (CUSTODIA NACIONAL USD)', naturaleza: 'DEBE', porcentaje_o_regla: 'Revalorización de Saldos en USD' },
      { codigo_cuenta: '4.2.01.002', descripcion_cuenta: 'GANANCIA EN DIFERENCIAL CAMBIARIO (BCV)', naturaleza: 'HABER', porcentaje_o_regla: 'Variación Positiva en Bs.' }
    ]
  },
  {
    id: 'MOD-013',
    codigo: 'AS-PRO-01',
    nombre: 'Provisión de Prestaciones Sociales e Intereses (LOTTT Art. 142)',
    categoria: 'AJUSTES',
    descripcion: 'Causación mensual de 15 días de salario integral trimestral y cálculo de intereses sobre fideicomiso.',
    modulo_origen: 'Kantio Nómina / Pasivos Laborales',
    renglones: [
      { codigo_cuenta: '6.1.01.008', descripcion_cuenta: 'GASTO DE PRESTACIONES SOCIALES (LOTTT ART. 142)', naturaleza: 'DEBE', porcentaje_o_regla: '5 días de salario integral mensual' },
      { codigo_cuenta: '6.1.01.009', descripcion_cuenta: 'GASTO DE INTERESES SOBRE PRESTACIONES SOCIALES', naturaleza: 'DEBE', porcentaje_o_regla: 'Tasa Activa BCV sobre acumulado' },
      { codigo_cuenta: '2.2.01.002', descripcion_cuenta: 'GARANTIA DE PRESTACIONES SOCIALES (LOTTT ART. 142)', naturaleza: 'HABER', porcentaje_o_regla: 'Fondo Acumulado de Antigüedad' },
      { codigo_cuenta: '2.2.01.003', descripcion_cuenta: 'INTERESES SOBRE PRESTACIONES SOCIALES ACUMULADOS', naturaleza: 'HABER', porcentaje_o_regla: 'Intereses Devengados' }
    ]
  },
  {
    id: 'MOD-014',
    codigo: 'AS-CIE-01',
    nombre: 'Cierre Anual de Cuentas Nominales (Pérdidas y Ganancias)',
    categoria: 'CIERRES',
    descripcion: 'Cancelación de saldos de Ingresos, Costos y Gastos trasladando la Utilidad Neta al Patrimonio.',
    modulo_origen: 'Cierre de Ejercicio Contable',
    renglones: [
      { codigo_cuenta: '4.1.01.001', descripcion_cuenta: 'VENTAS DE MERCANCIAS GRAVADAS CON IVA (16%)', naturaleza: 'DEBE', porcentaje_o_regla: '100% Saldo Acreedor' },
      { codigo_cuenta: '4.2.01.002', descripcion_cuenta: 'GANANCIA EN DIFERENCIAL CAMBIARIO (BCV)', naturaleza: 'DEBE', porcentaje_o_regla: '100% Saldo Acreedor' },
      { codigo_cuenta: '5.1.01.001', descripcion_cuenta: 'COMPRAS DE MERCANCIAS NACIONALES GRAVADAS', naturaleza: 'HABER', porcentaje_o_regla: '100% Saldo Deudor' },
      { codigo_cuenta: '6.1.01.001', descripcion_cuenta: 'GASTO DE SUELDOS Y SALARIOS (ADMINISTRACION)', naturaleza: 'HABER', porcentaje_o_regla: '100% Saldo Deudor' },
      { codigo_cuenta: '6.2.01.001', descripcion_cuenta: 'ALQUILER DE OFICINAS Y LOCALES', naturaleza: 'HABER', porcentaje_o_regla: '100% Saldo Deudor' },
      { codigo_cuenta: '3.3.01.003', descripcion_cuenta: 'UTILIDAD O PERDIDA DEL EJERCICIO EN CURSO', naturaleza: 'HABER', porcentaje_o_regla: 'Resultado Neto del Ejercicio' }
    ]
  }
];
