import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, SmallInteger, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class CuentaContable(Base):
    __tablename__ = "cuentas_contables"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(50), nullable=False, index=True)  # Ej. 1.1.01.001
    descripcion = Column(String(255), nullable=False)
    nivel = Column(SmallInteger, nullable=False)  # 1 a 6
    naturaleza = Column(String(10), nullable=False)  # DEUDORA, ACREEDORA
    tipo_cuenta = Column(String(20), nullable=False)  # ACTIVO, PASIVO, PATRIMONIO, INGRESO, COSTO, GASTO, OTRO_INGRESO, OTRO_EGRESO, ORDEN
    permite_movimiento = Column(Boolean, default=False, nullable=False)
    parent_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=True)
    
    # Atributos dimensionales Profit/Modernos
    requiere_auxiliar = Column(Boolean, default=False)
    requiere_centro_costo = Column(Boolean, default=False)
    requiere_documento = Column(Boolean, default=False)
    moneda_restringida_id = Column(Uuid, ForeignKey("monedas.id"), nullable=True)
    
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="cuentas")
    parent = relationship("CuentaContable", remote_side=[id], backref="subcuentas")
    moneda_restringida = relationship("Moneda")

    __table_args__ = (
        UniqueConstraint("empresa_id", "codigo", name="uq_empresa_cuenta_codigo"),
    )
