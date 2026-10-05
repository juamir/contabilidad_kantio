import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre_completo = Column(String(255), nullable=False)
    telefono = Column(String(50), nullable=True)
    tipo_usuario = Column(String(30), nullable=False)  # KANTIO_ADMIN, EMPRESA_INTERNO, ESTUDIO_MIEMBRO
    empresa_id = Column(Uuid, ForeignKey("empresas.id"), nullable=True, index=True)
    estudio_id = Column(Uuid, ForeignKey("estudios_contables.id"), nullable=True, index=True)
    rol = Column(String(50), nullable=False)  # ADMIN_EMPRESA, TESORERIA, SOCIO_ESTUDIO, CONTADOR_SENIOR, ASISTENTE_CONTABLE, AUDITOR_EXTERNO
    avatar_url = Column(String, nullable=True)  # Base64 avatar data URI
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", foreign_keys=[empresa_id])
    estudio = relationship("EstudioContable", back_populates="usuarios", foreign_keys=[estudio_id])
    empresas_permitidas = relationship("UsuarioEmpresaAcceso", back_populates="usuario", cascade="all, delete-orphan")
