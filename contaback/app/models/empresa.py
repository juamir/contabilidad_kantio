import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Numeric, Integer, SmallInteger, ForeignKey, UniqueConstraint, Uuid
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
    nit = Column(String(50), nullable=True)
    prioridad = Column(Integer, default=0)
    es_grupo_holding = Column(Boolean, default=False)
    grupo_id = Column(Uuid, ForeignKey("grupos_empresariales.id"), nullable=True)
    plan_suscripcion = Column(String(50), default="ESTANDAR")  # ESTANDAR, CORPORATIVO
    licencia_lease_token = Column(String, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    grupo = relationship("GrupoEmpresarial", back_populates="empresas", foreign_keys=[grupo_id])
    parametros = relationship("ParametrosEmpresa", back_populates="empresa", uselist=False, cascade="all, delete-orphan")
    delegaciones = relationship("EmpresaEstudioDelegacion", back_populates="empresa")
    cuentas = relationship("CuentaContable", back_populates="empresa")
    centros_costo = relationship("CentroCosto", back_populates="empresa")
    auxiliares = relationship("Auxiliar", back_populates="empresa")
    usuarios_asociados = relationship("UsuarioEmpresaAcceso", back_populates="empresa", cascade="all, delete-orphan")

class ParametrosEmpresa(Base):
    __tablename__ = "parametros_empresa"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Niveles y estructura del Plan de Cuentas (Lección Profit Plus 002)
    niveles: int = Column(SmallInteger, default=4, nullable=False)
    nivel_1: int = Column(SmallInteger, default=1, nullable=False)
    nivel_2: int = Column(SmallInteger, default=1, nullable=False)
    nivel_3: int = Column(SmallInteger, default=2, nullable=False)
    nivel_4: int = Column(SmallInteger, default=3, nullable=False)
    nivel_5: int = Column(SmallInteger, default=0, nullable=False)
    nivel_6: int = Column(SmallInteger, default=0, nullable=False)
    longitud_total: int = Column(SmallInteger, default=7, nullable=False)
    caracter_separacion: str = Column(String(5), default=".", nullable=False)
    mascara_formato: str = Column(String(50), default="X.X.XX.XXX", nullable=False)

    # Consecutivos y numeraciones
    consecutivo_contabilizacion: int = Column(Integer, default=1, nullable=False)
    consecutivo_depreciacion: int = Column(Integer, default=1, nullable=False)
    consecutivo_comprobante_cierre: int = Column(Integer, default=1, nullable=False)

    # Ejercicio fiscal
    inicio_ejercicio = Column(Date, default=date(2026, 1, 1), nullable=False)
    fin_ejercicio = Column(Date, default=date(2026, 12, 31), nullable=False)
    inicio_contabilidad = Column(Date, default=date(2026, 1, 1), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="parametros")

class UsuarioEmpresaAcceso(Base):
    __tablename__ = "usuario_empresa_accesos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    usuario_id = Column(Uuid, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    rol: str = Column(String(50), default="CONTADOR_SENIOR", nullable=False)
    activo: bool = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="empresas_permitidas")
    empresa = relationship("Empresa", back_populates="usuarios_asociados")

    __table_args__ = (
        UniqueConstraint("usuario_id", "empresa_id", name="uq_usuario_empresa"),
    )
