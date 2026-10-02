import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Numeric, Integer, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class GrupoActivoFijo(Base):
    """
    Grupos de Activos Fijos (Profit Plus Contabilidad 009)
    Ej: 0001 - EQUIPOS ELECTRONICOS, 0002 - MOBILIARIO, 0003 - VEHICULOS
    """
    __tablename__ = "grupos_activos_fijos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    codigo = Column(String(20), nullable=False, index=True)
    descripcion = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UbicacionActivoFijo(Base):
    """
    Ubicación de Activos Fijos (Profit Plus Contabilidad 010)
    Ej: OFIC - OFICINA, PLAN - PLANTA, SUCC - SUCURSAL
    """
    __tablename__ = "ubicaciones_activos_fijos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    codigo = Column(String(20), nullable=False, index=True)
    descripcion = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivoFijo(Base):
    """
    Ficha de Activo Fijo y Depreciación (Profit Plus Contabilidad 008)
    """
    __tablename__ = "activos_fijos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False, index=True)
    codigo = Column(String(30), nullable=False, index=True)
    descripcion = Column(String(255), nullable=False)
    serial = Column(String(100), nullable=True)
    fecha_adquisicion = Column(Date, default=date.today, nullable=False)
    inicio_depreciacion = Column(Date, default=date.today, nullable=False)
    desincorporado = Column(Boolean, default=False, nullable=False)

    grupo_id = Column(Uuid, ForeignKey("grupos_activos_fijos.id"), nullable=True)
    ubicacion_id = Column(Uuid, ForeignKey("ubicaciones_activos_fijos.id"), nullable=True)
    centro_costo_id = Column(Uuid, ForeignKey("centros_costo.id"), nullable=True)

    # Datos de depreciación
    vida_util_anos = Column(Integer, default=5, nullable=False)
    vida_util_meses = Column(Integer, default=0, nullable=False)
    metodo = Column(String(30), default="LINEA_RECTA", nullable=False)
    valor_adquisicion = Column(Numeric(18, 2), default=0.0, nullable=False)
    valor_salvamento = Column(Numeric(18, 2), default=0.0, nullable=False)
    depreciacion_acumulada = Column(Numeric(18, 2), default=0.0, nullable=False)
    valor_contable = Column(Numeric(18, 2), default=0.0, nullable=False)
    monto_ultima_depreciacion = Column(Numeric(18, 2), default=0.0, nullable=False)
    fecha_ultima_depreciacion = Column(Date, nullable=True)

    # Cuentas asociadas
    cuenta_activo_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=True)
    cuenta_depreciacion_acumulada_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=True)
    cuenta_gasto_depreciacion_id = Column(Uuid, ForeignKey("cuentas_contables.id"), nullable=True)

    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    grupo = relationship("GrupoActivoFijo")
    ubicacion = relationship("UbicacionActivoFijo")
    centro_costo = relationship("CentroCosto")
    cuenta_activo = relationship("CuentaContable", foreign_keys=[cuenta_activo_id])
    cuenta_depreciacion_acumulada = relationship("CuentaContable", foreign_keys=[cuenta_depreciacion_acumulada_id])
    cuenta_gasto_depreciacion = relationship("CuentaContable", foreign_keys=[cuenta_gasto_depreciacion_id])
