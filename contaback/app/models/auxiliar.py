import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class Auxiliar(Base):
    __tablename__ = "auxiliares"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(50), nullable=False)
    nombre_razon_social = Column(String(255), nullable=False)
    tipo_identificacion = Column(String(10), default="J", nullable=False)  # J, V, G, E
    rif_cedula = Column(String(20), nullable=False, index=True)
    tipo_auxiliar = Column(String(30), default="PROVEEDOR", nullable=False)  # CLIENTE, PROVEEDOR, EMPLEADO, SOCIO, OTRO
    email = Column(String(255), nullable=True)
    telefono = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="auxiliares")

    __table_args__ = (
        UniqueConstraint("empresa_id", "codigo", name="uq_empresa_auxiliar_codigo"),
    )
