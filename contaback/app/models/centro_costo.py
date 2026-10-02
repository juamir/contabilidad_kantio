import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class CentroCosto(Base):
    __tablename__ = "centros_costo"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(50), nullable=False)
    nombre = Column(String(255), nullable=False)
    parent_id = Column(Uuid, ForeignKey("centros_costo.id"), nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="centros_costo")

    __table_args__ = (
        UniqueConstraint("empresa_id", "codigo", name="uq_empresa_centro_costo"),
    )
