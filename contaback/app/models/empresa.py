import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class GrupoEmpresarial(Base):
    __tablename__ = "grupos_empresariales"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    empresas = relationship("Empresa", back_populates="grupo", foreign_keys="Empresa.grupo_id")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    razon_social = Column(String(255), nullable=False)
    nombre_comercial = Column(String(255), nullable=True)
    rif = Column(String(20), nullable=False, index=True)
    es_grupo_holding = Column(Boolean, default=False)
    grupo_id = Column(Uuid, ForeignKey("grupos_empresariales.id"), nullable=True)
    plan_suscripcion = Column(String(50), default="ESTANDAR")  # ESTANDAR, CORPORATIVO
    licencia_lease_token = Column(String, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    grupo = relationship("GrupoEmpresarial", back_populates="empresas", foreign_keys=[grupo_id])
    delegaciones = relationship("EmpresaEstudioDelegacion", back_populates="empresa")
    cuentas = relationship("CuentaContable", back_populates="empresa")
    centros_costo = relationship("CentroCosto", back_populates="empresa")
    auxiliares = relationship("Auxiliar", back_populates="empresa")
