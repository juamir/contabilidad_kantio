import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class EstudioContable(Base):
    __tablename__ = "estudios_contables"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    rif = Column(String(20), nullable=False)
    email_contacto = Column(String(255), nullable=False)
    telefono = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    delegaciones = relationship("EmpresaEstudioDelegacion", back_populates="estudio")
    usuarios = relationship("Usuario", back_populates="estudio")

class EmpresaEstudioDelegacion(Base):
    __tablename__ = "empresa_estudio_delegaciones"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=False, index=True)
    estudio_id = Column(Uuid, ForeignKey("estudios_contables.id"), nullable=False, index=True)
    tipo_delegacion = Column(String(30), nullable=False, default="OPERATIVO_COMPLETO")  # OPERATIVO_COMPLETO, AUDITORIA_LECTURA
    fecha_inicio = Column(Date, default=date.today, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    estado = Column(String(20), default="ACTIVA")  # ACTIVA, REVOCADA, SUSPENDIDA
    revocado_por_usuario_id = Column(Uuid, nullable=True)
    revocado_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="delegaciones")
    estudio = relationship("EstudioContable", back_populates="delegaciones")
