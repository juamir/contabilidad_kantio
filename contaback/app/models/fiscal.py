import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Numeric, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class FacturaFiscal(Base):
    __tablename__ = "facturas_fiscales"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    tipo_operacion = Column(String(10), default="COMPRA", nullable=False)  # COMPRA, VENTA
    fecha_emision = Column(Date, default=date.today, nullable=False, index=True)
    auxiliar_id = Column(Uuid, ForeignKey("auxiliares.id"), nullable=True)
    
    numero_factura = Column(String(50), nullable=False)
    numero_control = Column(String(50), nullable=False)
    
    monto_exento = Column(Numeric(18, 2), default=0.00, nullable=False)
    base_imponible = Column(Numeric(18, 2), default=0.00, nullable=False)
    alicuota_iva = Column(Numeric(5, 2), default=16.00, nullable=False)  # 16.00%
    monto_iva = Column(Numeric(18, 2), default=0.00, nullable=False)
    monto_total = Column(Numeric(18, 2), default=0.00, nullable=False)
    
    # Retención IVA
    porcentaje_retencion_iva = Column(Numeric(5, 2), default=75.00, nullable=False)  # 75% o 100%
    monto_retencion_iva = Column(Numeric(18, 2), default=0.00, nullable=False)
    
    # Retención ISLR
    codigo_concepto_islr = Column(String(20), nullable=True)
    porcentaje_retencion_islr = Column(Numeric(5, 2), default=0.00, nullable=False)
    sustraendo_islr = Column(Numeric(18, 2), default=0.00, nullable=False)
    monto_retencion_islr = Column(Numeric(18, 2), default=0.00, nullable=False)
    
    comprobante_contable_id = Column(Uuid, ForeignKey("comprobantes.id"), nullable=True)
    imagen_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    auxiliar = relationship("Auxiliar")
    comprobante = relationship("Comprobante")

class ComprobanteRetencionIva(Base):
    __tablename__ = "comprobantes_retencion_iva"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    numero_comprobante = Column(String(14), nullable=False, index=True)  # AAAAMMNº
    periodo_fiscal = Column(String(6), nullable=False, index=True)  # AAAAMM
    fecha = Column(Date, default=date.today, nullable=False)
    factura_id = Column(Uuid, ForeignKey("facturas_fiscales.id"), nullable=False)
    monto_retenido = Column(Numeric(18, 2), nullable=False)
    declarado_seniat = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    factura = relationship("FacturaFiscal")
