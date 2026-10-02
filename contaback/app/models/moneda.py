import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Numeric, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class Moneda(Base):
    __tablename__ = "monedas"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo = Column(String(10), unique=True, nullable=False, index=True)  # VES, USD, EUR, USDT
    nombre = Column(String(50), nullable=False)
    simbolo = Column(String(10), nullable=False)
    es_moneda_nacional = Column(Boolean, default=False)
    activa = Column(Boolean, default=True)

class TasaCambio(Base):
    __tablename__ = "tasas_cambio"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    moneda_origen_id = Column(Uuid, ForeignKey("monedas.id"), nullable=False)
    moneda_destino_id = Column(Uuid, ForeignKey("monedas.id"), nullable=False)
    fecha = Column(Date, default=date.today, nullable=False, index=True)
    tipo_tasa = Column(String(30), default="BCV_OFICIAL", nullable=False)  # BCV_OFICIAL, PARALELO
    tasa = Column(Numeric(18, 6), nullable=False)
    fuente = Column(String(50), default="BCV")
    created_at = Column(DateTime, default=datetime.utcnow)

    moneda_origen = relationship("Moneda", foreign_keys=[moneda_origen_id])
    moneda_destino = relationship("Moneda", foreign_keys=[moneda_destino_id])

    __table_args__ = (
        UniqueConstraint("moneda_origen_id", "moneda_destino_id", "fecha", "tipo_tasa", name="uq_tasa_diaria"),
    )
