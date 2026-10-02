/**
 * Utilidad para formatear y autocompletar códigos contables según la máscara configurada.
 * Inspirado en la parametrización de niveles de Profit Plus Contabilidad (002).
 */

export interface MascaraContableConfig {
  niveles: number;
  nivel_1: number;
  nivel_2: number;
  nivel_3: number;
  nivel_4: number;
  nivel_5: number;
  nivel_6: number;
  caracter_separacion: string;
}

export const CONFIG_MASCARA_DEFAULT: MascaraContableConfig = {
  niveles: 4,
  nivel_1: 1,
  nivel_2: 1,
  nivel_3: 2,
  nivel_4: 3,
  nivel_5: 0,
  nivel_6: 0,
  caracter_separacion: '.',
};

/**
 * Recibe un código escrito por el usuario (ej: "1.1.1.6" o "1-1-1-6")
 * y lo expande con ceros a la izquierda según la longitud definida en cada nivel (ej: "1.1.01.006").
 */
export function formatearCodigoContable(
  rawCode: string,
  config: MascaraContableConfig = CONFIG_MASCARA_DEFAULT
): string {
  if (!rawCode) return '';
  const sep = config.caracter_separacion || '.';

  // Normalizar separadores permitiendo '.', '-', '/', ' '
  const cleaned = rawCode.replace(/[-/ ]/g, sep);
  const segments = cleaned.split(sep).filter((s) => s.trim() !== '');

  const longitudes = [
    config.nivel_1,
    config.nivel_2,
    config.nivel_3,
    config.nivel_4,
    config.nivel_5,
    config.nivel_6,
  ].slice(0, config.niveles);

  const formattedSegments = segments.map((seg, idx) => {
    const targetLen = idx < longitudes.length ? longitudes[idx] : seg.length;
    if (targetLen > 0 && seg.length < targetLen) {
      return seg.padStart(targetLen, '0');
    }
    return seg;
  });

  return formattedSegments.join(sep);
}

/**
 * Infiere automáticamente el tipo de cuenta y la naturaleza contable
 * a partir del primer dígito del código (Normativa VEN-NIF / Profit Plus).
 */
export function inferirClaseContable(codigo: string): {
  tipo_cuenta: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'COSTO' | 'GASTO' | 'ORDEN';
  naturaleza: 'DEUDORA' | 'ACREEDORA';
  nombre_clase: string;
} {
  const firstDigit = codigo ? codigo.trim().charAt(0) : '1';
  switch (firstDigit) {
    case '1':
      return { tipo_cuenta: 'ACTIVO', naturaleza: 'DEUDORA', nombre_clase: '1. Activo (Naturaleza Deudora)' };
    case '2':
      return { tipo_cuenta: 'PASIVO', naturaleza: 'ACREEDORA', nombre_clase: '2. Pasivo (Naturaleza Acreedora)' };
    case '3':
      return { tipo_cuenta: 'PATRIMONIO', naturaleza: 'ACREEDORA', nombre_clase: '3. Patrimonio (Naturaleza Acreedora)' };
    case '4':
      return { tipo_cuenta: 'INGRESO', naturaleza: 'ACREEDORA', nombre_clase: '4. Ingresos (Naturaleza Acreedora)' };
    case '5':
      return { tipo_cuenta: 'COSTO', naturaleza: 'DEUDORA', nombre_clase: '5. Costos de Venta (Naturaleza Deudora)' };
    case '6':
      return { tipo_cuenta: 'GASTO', naturaleza: 'DEUDORA', nombre_clase: '6. Gastos Operativos (Naturaleza Deudora)' };
    case '7':
      return { tipo_cuenta: 'INGRESO', naturaleza: 'ACREEDORA', nombre_clase: '7. Otros Ingresos (Naturaleza Acreedora)' };
    case '8':
      return { tipo_cuenta: 'GASTO', naturaleza: 'DEUDORA', nombre_clase: '8. Otros Egresos (Naturaleza Deudora)' };
    case '9':
      return { tipo_cuenta: 'ORDEN', naturaleza: 'DEUDORA', nombre_clase: '9. Cuentas de Orden (Naturaleza Deudora)' };
    default:
      return { tipo_cuenta: 'ACTIVO', naturaleza: 'DEUDORA', nombre_clase: '1. Activo (Naturaleza Deudora)' };
  }
}
