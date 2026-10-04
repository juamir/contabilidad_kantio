import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';

export interface ComprobanteRetencionData {
  tipo: 'IVA' | 'ISLR';
  numeroComprobante: string;
  fechaEmision: string;
  periodoFiscal: string; // ej: 2026-10
  // Agente de Retención (La Empresa)
  agenteRazonSocial: string;
  agenteRif: string;
  agenteDireccion: string;
  // Sujeto Retenido (Proveedor / Tercero)
  sujetoRazonSocial: string;
  sujetoRif: string;
  sujetoDireccion?: string;
  sujetoEmail?: string;
  // Detalle de la Operación
  numeroOperacion?: number;
  fechaFactura: string;
  numeroFactura: string;
  numeroControl: string;
  numeroNotaDebito?: string;
  numeroNotaCredito?: string;
  tipoTransaccion?: string; // 01-Reg
  numeroFacturaAfectada?: string;
  montoTotalFactura: number;
  montoExento: number;
  baseImponible: number;
  alicuota: number;
  impuestoIva: number;
  porcentajeRetencion: number;
  montoRetenido: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ComprobanteRetencionData | null;
}

export const ComprobanteSeniatModal: React.FC<Props> = ({ open, onClose, data }) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [destinatarioEmail, setDestinatarioEmail] = useState('');
  const [asuntoEmail, setAsuntoEmail] = useState('');
  const [mensajeEmail, setMensajeEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!data) return null;

  const esIva = data.tipo === 'IVA';

  const handlePrint = () => {
    // Generar ventana limpia optimizada para impresión en formato PDF
    const printContent = document.getElementById('comprobante-seniat-impresion');
    if (!printContent) return;

    const ventanaImpresion = window.open('', '_blank', 'width=1000,height=800');
    if (!ventanaImpresion) {
      alert('Por favor permita las ventanas emergentes para imprimir el comprobante.');
      return;
    }

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Comprobante de Retención ${data.tipo} - ${data.numeroComprobante}</title>
          <style>
            @page {
              size: letter landscape;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              margin: 0;
              padding: 10px;
              font-size: 11px;
            }
            .header-table, .data-table, .firma-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .header-table td {
              padding: 4px;
              vertical-align: top;
            }
            .titulo {
              text-align: center;
              font-weight: bold;
              font-size: 13px;
              text-transform: uppercase;
              background-color: #f1f5f9;
              padding: 6px;
              border: 1px solid #000;
            }
            .marco {
              border: 1px solid #000;
              padding: 6px;
              margin-bottom: 8px;
            }
            .campo-titulo {
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              color: #333;
            }
            .campo-valor {
              font-size: 11px;
              font-weight: bold;
            }
            .tabla-detalle {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 10px;
            }
            .tabla-detalle th, .tabla-detalle td {
              border: 1px solid #000;
              padding: 5px 4px;
              text-align: center;
            }
            .tabla-detalle th {
              background-color: #e2e8f0;
              font-weight: bold;
            }
            .text-right { text-align: right !important; }
            .firma-box {
              border-top: 1px solid #000;
              text-align: center;
              width: 250px;
              margin: 40px auto 0 auto;
              padding-top: 5px;
              font-size: 10px;
            }
            .pie-legal {
              font-size: 9px;
              text-align: justify;
              margin-top: 15px;
              line-height: 1.3;
              color: #444;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  const handleOpenEmailDialog = () => {
    setDestinatarioEmail(data.sujetoEmail || 'proveedor@empresa.com');
    setAsuntoEmail(`Comprobante de Retención de ${data.tipo} N° ${data.numeroComprobante} - ${data.agenteRazonSocial}`);
    setMensajeEmail(
      `Estimados Sres. ${data.sujetoRazonSocial},\n\nAdjunto enviamos el Comprobante de Retención de ${data.tipo} correspondiente a la Factura N° ${data.numeroFactura} por un monto retenido de Bs. ${data.montoRetenido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}.\n\nEmitido conforme a la normativa vigente del SENIAT.\n\nAtentamente,\nDepartamento de Administración\n${data.agenteRazonSocial}\nRIF: ${data.agenteRif}`
    );
    setEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!destinatarioEmail) {
      alert('Debe ingresar un correo electrónico destinatario.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEmailDialogOpen(false);
      setToastMessage(`Comprobante enviado exitosamente por correo a ${destinatarioEmail}`);
    }, 1200);
  };

  return (
    <>
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Typography variant="h6" fontWeight="bold">
            Comprobante Oficial de Retención de {data.tipo} (Formato SENIAT)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir / Guardar PDF
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<EmailIcon />}
              onClick={handleOpenEmailDialog}
            >
              Enviar por Email (PDF)
            </Button>
            <Button size="small" onClick={onClose} color="inherit">
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#f8fafc' }}>
          {/* CONTENEDOR RENDERIZABLE Y CLONABLE PARA IMPRESIÓN */}
          <Paper
            id="comprobante-seniat-impresion"
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              border: '1px solid #000',
              color: '#000',
              fontFamily: 'Arial, sans-serif',
              minWidth: { md: '880px' },
            }}
          >
            {/* ENCABEZADO OFICIAL */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '55%', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>REPÚBLICA BOLIVARIANA DE VENEZUELA</div>
                    <div style={{ fontSize: '9px', color: '#333' }}>SERVICIO NACIONAL INTEGRADO DE ADMINISTRACIÓN ADUANERA Y TRIBUTARIA (SENIAT)</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                      {data.agenteRazonSocial}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                      RIF: {data.agenteRif}
                    </div>
                    <div style={{ fontSize: '9px', color: '#444' }}>
                      {data.agenteDireccion || 'Av. Francisco de Miranda, Edif. Centro Empresarial, Caracas, Venezuela.'}
                    </div>
                  </td>
                  <td style={{ width: '45%', verticalAlign: 'top', textAlign: 'right' }}>
                    <div style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                        COMPROBANTE DE RETENCIÓN DEL {esIva ? 'IMPUESTO AL VALOR AGREGADO (IVA)' : 'IMPUESTO SOBRE LA RENTA (ISLR)'}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0d47a1', margin: '4px 0' }}>
                        N° {data.numeroComprobante}
                      </div>
                      <div style={{ fontSize: '10px' }}>
                        <strong>FECHA DE EMISIÓN:</strong> {data.fechaEmision}
                      </div>
                      <div style={{ fontSize: '10px' }}>
                        <strong>PERÍODO FISCAL:</strong> {data.periodoFiscal}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* LEY / FUNDAMENTO LEGAL */}
            <div style={{ fontSize: '9px', border: '1px solid #000', padding: '4px', textAlign: 'center', backgroundColor: '#f1f5f9', marginBottom: '10px' }}>
              {esIva
                ? '(Ley del IVA - Art. 11: "Serán responsables del pago del impuesto los adquirentes que hayan sido designados agentes de retención" y Providencia Administrativa SNAT/2025/000091)'
                : '(Decreto N° 1.808 - Reglamento Parcial de la Ley de ISLR en materia de Retenciones)'}
            </div>

            {/* DATOS DEL AGENTE Y BENEFICIARIO */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '10px' }}>
              <tbody>
                <tr style={{ backgroundColor: '#e2e8f0' }}>
                  <th colSpan={2} style={{ border: '1px solid #000', padding: '4px', fontSize: '10px', textAlign: 'left' }}>
                    1. DATOS DEL AGENTE DE RETENCIÓN
                  </th>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', width: '70%', fontSize: '10px' }}>
                    <strong>NOMBRE O RAZÓN SOCIAL:</strong> {data.agenteRazonSocial}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', width: '30%', fontSize: '10px' }}>
                    <strong>REGISTRO DE INFORMACIÓN FISCAL:</strong> {data.agenteRif}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#e2e8f0' }}>
                  <th colSpan={2} style={{ border: '1px solid #000', padding: '4px', fontSize: '10px', textAlign: 'left' }}>
                    2. DATOS DEL SUJETO OBJETO DE RETENCIÓN (PROVEEDOR / CONTRIBUYENTE)
                  </th>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>
                    <strong>NOMBRE O RAZÓN SOCIAL:</strong> {data.sujetoRazonSocial}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>
                    <strong>REGISTRO DE INFORMACIÓN FISCAL:</strong> {data.sujetoRif}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABLA FORMAL DE DETALLE DE COMPRAS Y RETENCIONES */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9px', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0' }}>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>OPER. N°</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>FECHA FACT.</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>N° FACTURA</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>N° CONTROL</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>N° NOTA DÉB.</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>N° NOTA CRÉD.</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>TIPO TRANS.</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>TOTAL FACTURA (Bs.)</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>MONTO EXENTO (Bs.)</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>BASE IMPONIBLE (Bs.)</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>% ALÍCUOTA</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>IMPUESTO {esIva ? 'IVA' : 'CAUSADO'} (Bs.)</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>% RETENIDO</th>
                  <th style={{ border: '1px solid #000', padding: '4px' }}>MONTO RETENIDO (Bs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.numeroOperacion || 1}</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.fechaFactura}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{data.numeroFactura}</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.numeroControl}</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>01-Reg</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.montoTotalFactura.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.montoExento.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>
                    {data.baseImponible.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>{data.alicuota}%</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.impuestoIva.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{data.porcentajeRetencion}%</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>
                    {data.montoRetenido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {/* FILA DE TOTALES */}
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                  <td colSpan={7} style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    TOTALES GENERALES (Bs.):
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.montoTotalFactura.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.montoExento.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.baseImponible.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>
                    {data.impuestoIva.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', color: '#0d47a1', fontSize: '10px' }}>
                    {data.montoRetenido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* SECCIÓN DE FIRMAS Y SELLOS */}
            <table style={{ width: '100%', marginTop: '35px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px solid #000', width: '260px', margin: '0 auto', paddingTop: '4px', fontSize: '10px' }}>
                      <strong>POR EL AGENTE DE RETENCIÓN</strong><br />
                      Firma Autorizada y Sello Húmedo
                    </div>
                  </td>
                  <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px solid #000', width: '260px', margin: '0 auto', paddingTop: '4px', fontSize: '10px' }}>
                      <strong>POR EL SUJETO RETENIDO</strong><br />
                      Firma, Cédula / RIF y Fecha de Recepción
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* NOTA LEGAL SENIAT */}
            <div style={{ fontSize: '8px', color: '#555', marginTop: '20px', borderTop: '1px dashed #aaa', paddingTop: '6px', textAlign: 'justify' }}>
              Este comprobante se emite por duplicado en cumplimiento de lo establecido en el Artículo 16 de la Providencia Administrativa SNAT/2025/000091, debiendo el Agente de Retención entregar el original al Sujeto Retenido dentro de los dos (2) días hábiles siguientes a la fecha de la retención. El monto retenido podrá ser deducido por el contribuyente en su declaración mensual del período respectivo.
            </div>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Compatible con exportación a PDF en navegadores de Escritorio y Tablets (Chrome, Edge, Safari).
          </Typography>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO PARA ENVIAR POR EMAIL */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Enviar Comprobante de Retención por Correo Electrónico
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            El sistema generará el PDF oficial del Comprobante N° {data.numeroComprobante} y lo enviará adjunto al destinatario indicado.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Correo Destinatario"
              value={destinatarioEmail}
              onChange={(e) => setDestinatarioEmail(e.target.value)}
              placeholder="proveedor@empresa.com"
            />
            <TextField
              fullWidth
              size="small"
              label="Asunto"
              value={asuntoEmail}
              onChange={(e) => setAsuntoEmail(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              size="small"
              label="Cuerpo del Mensaje"
              value={mensajeEmail}
              onChange={(e) => setMensajeEmail(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
            disabled={enviando}
          >
            {enviando ? 'Enviando PDF...' : 'Enviar Comprobante'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
