import React from 'react';
import { Box, useTheme, type SxProps, type Theme } from '@mui/material';

export interface KantioIconProps {
  /** Componente de icono importado directamente desde reicon-react */
  icon: React.ComponentType<{ size?: number | string; color?: string; strokeWidth?: number | string; className?: string }>;
  /** Tamaño del icono: 'small' (18px), 'medium' (22px), 'large' (28px) o valor numérico en px */
  size?: 'small' | 'medium' | 'large' | number;
  /** Color del icono: 'inherit', 'primary', 'secondary', 'error', 'warning', 'info', 'success' o string hexadecimal */
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | string;
  /** Grosor del trazo (stroke width) */
  strokeWidth?: number | string;
  /** Estilos adicionales de MUI Sx */
  sx?: SxProps<Theme>;
  className?: string;
}

/**
 * Adaptador visual estándar de Kantio para la librería Reicon (https://reicon.dev / reicon-react).
 * Integra los iconos SVG de Reicon con el Theming de Material UI en Contabilidad.
 *
 * @example
 * ```tsx
 * import { FileText, Calculator, Building } from 'reicon-react';
 * import { KantioIcon } from '../components/KantioIcon';
 *
 * <KantioIcon icon={FileText} size="medium" color="primary" />
 * ```
 */
export const KantioIcon: React.FC<KantioIconProps> = ({
  icon: IconComponent,
  size = 'medium',
  color = 'inherit',
  strokeWidth = 1.75,
  sx,
  className,
}) => {
  const theme = useTheme();

  const computedSize =
    typeof size === 'number'
      ? size
      : size === 'small'
      ? 18
      : size === 'large'
      ? 28
      : 22;

  let computedColor = color;
  if (color === 'inherit') {
    computedColor = 'currentColor';
  } else if (color === 'primary') {
    computedColor = theme.palette.primary.main;
  } else if (color === 'secondary') {
    computedColor = theme.palette.secondary.main;
  } else if (color === 'error') {
    computedColor = theme.palette.error.main;
  } else if (color === 'warning') {
    computedColor = theme.palette.warning.main;
  } else if (color === 'info') {
    computedColor = theme.palette.info.main;
  } else if (color === 'success') {
    computedColor = theme.palette.success.main;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        lineHeight: 1,
        ...sx,
      }}
      className={className}
    >
      <IconComponent
        size={computedSize}
        color={computedColor}
        strokeWidth={strokeWidth}
      />
    </Box>
  );
};
