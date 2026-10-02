import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class TipoDocumento(Base):
    """
    Maestro de Tipos de Documento soporte (Profit Plus Contabilidad 007).
    Ejemplos: FACT (Factura), DEPC (Depósitos de Caja), DEVC (Devolución Clientes),
    GIRO, RETIVA (Retención IVA), RETISLR (Retención ISLR), etc.
    """
    __tablename__ = "tipos_documento"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    codigo = Column(String(20), nullable=False, index=True)
    descripcion = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa")
