import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class CuentaBancaria(Base):
    """
    Cuentas Bancarias y Tesorería Bimonetaria de la Empresa.
    Soporte para cuentas corrientes en Bolívares y cuentas de custodia en divisas autorizadas por Sudeban.
    """
    __tablename__ = "cuentas_bancarias"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    codigo = Column(String(20), nullable=False, index=True)
    banco = Column(String(100), nullable=False)
    numero_cuenta = Column(String(30), nullable=False)
    tipo = Column(String(50), default="CORRIENTE VES", nullable=False)
    moneda = Column(String(10), default="VES", nullable=False)
    saldo_libros_ves = Column(Numeric(18, 2), default=0.00, nullable=False)
    saldo_banco_ves = Column(Numeric(18, 2), default=0.00, nullable=False)
    saldo_usd = Column(Numeric(18, 2), default=0.00, nullable=False)
    estado_conciliacion = Column(String(30), default="CONCILIADO", nullable=False)
    cuenta_contable_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa")
    cuenta_contable = relationship("CuentaContable")
