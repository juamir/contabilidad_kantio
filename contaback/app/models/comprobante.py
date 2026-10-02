import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, SmallInteger, Integer, DateTime, Date, Numeric, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class PeriodoContable(Base):
    __tablename__ = "periodos_contables"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    ano = Column(Integer, nullable=False)
    mes = Column(SmallInteger, nullable=False)  # 1 a 12
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    cerrado = Column(Boolean, default=False, nullable=False)
    cerrado_por_usuario_id = Column(Uuid, nullable=True)
    cerrado_at = Column(DateTime, nullable=True)

    comprobantes = relationship("Comprobante", back_populates="periodo")

    __table_args__ = (
        UniqueConstraint("empresa_id", "ano", "mes", name="uq_empresa_periodo"),
    )

class Comprobante(Base):
    __tablename__ = "comprobantes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    numero = Column(String(30), nullable=False)
    fecha = Column(Date, default=date.today, nullable=False, index=True)
    periodo_id = Column(Uuid, ForeignKey("periodos_contables.id"), nullable=True)
    tipo = Column(String(30), default="DIARIO", nullable=False)  # DIARIO, AJUSTE, CIERRE, APERTURA, etc.
    concepto = Column(String(500), nullable=False)
    tasa_cambio = Column(Numeric(18, 6), default=1.0, nullable=False)
    
    estado = Column(String(20), default="BORRADOR", nullable=False)  # BORRADOR, REVISADO, ASENTADO, ANULADO
    total_debito_base = Column(Numeric(18, 2), default=0.00, nullable=False)
    total_credito_base = Column(Numeric(18, 2), default=0.00, nullable=False)
    total_debito_divisa = Column(Numeric(18, 2), default=0.00, nullable=False)
    total_credito_divisa = Column(Numeric(18, 2), default=0.00, nullable=False)
    
    creado_por_usuario_id = Column(Uuid, nullable=False)
    creado_tipo_usuario = Column(String(30), default="EMPRESA_INTERNO", nullable=False)
    estudio_id = Column(Uuid, nullable=True)  # Si lo hizo un estudio contable delegado
    
    created_at = Column(DateTime, default=datetime.utcnow)
    asentado_at = Column(DateTime, nullable=True)

    periodo = relationship("PeriodoContable", back_populates="comprobantes")
    renglones = relationship("ComprobanteRenglon", back_populates="comprobante", cascade="all, delete-orphan", order_by="ComprobanteRenglon.numero_linea")

    __table_args__ = (
        UniqueConstraint("empresa_id", "numero", name="uq_empresa_comprobante_numero"),
    )

class ComprobanteRenglon(Base):
    __tablename__ = "comprobante_renglones"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    comprobante_id = Column(Uuid, ForeignKey("comprobantes.id", ondelete="CASCADE"), nullable=False, index=True)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    numero_linea = Column(SmallInteger, nullable=False)
    cuenta_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=False, index=True)
    descripcion = Column(String(255), nullable=False)
    
    auxiliar_id = Column(Uuid, ForeignKey("auxiliares.id"), nullable=True)
    centro_costo_id = Column(Uuid, ForeignKey("centros_costo.id"), nullable=True)
    tipo_documento = Column(String(20), nullable=True)  # FACT, NC, ND, CHQ, TRANSF
    numero_documento = Column(String(50), nullable=True)
    
    monto_debito_base = Column(Numeric(18, 2), default=0.00, nullable=False)
    monto_credito_base = Column(Numeric(18, 2), default=0.00, nullable=False)
    monto_debito_divisa = Column(Numeric(18, 2), default=0.00, nullable=False)
    monto_credito_divisa = Column(Numeric(18, 2), default=0.00, nullable=False)

    comprobante = relationship("Comprobante", back_populates="renglones")
    cuenta = relationship("CuentaContable")
    auxiliar = relationship("Auxiliar")
    centro_costo = relationship("CentroCosto")

class ComprobanteModelo(Base):
    __tablename__ = "comprobantes_modelo"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(30), nullable=False)
    descripcion = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    renglones = relationship("ComprobanteModeloRenglon", back_populates="modelo", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("empresa_id", "codigo", name="uq_empresa_modelo_codigo"),
    )

class ComprobanteModeloRenglon(Base):
    __tablename__ = "comprobante_modelo_renglones"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    modelo_id = Column(Uuid, ForeignKey("comprobantes_modelo.id", ondelete="CASCADE"), nullable=False)
    numero_linea = Column(SmallInteger, nullable=False)
    cuenta_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=False)
    descripcion = Column(String(255), nullable=False)
    es_debito = Column(Boolean, default=True, nullable=False)
    porcentaje = Column(Numeric(5, 2), nullable=True)

    modelo = relationship("ComprobanteModelo", back_populates="renglones")
    cuenta = relationship("CuentaContable")
