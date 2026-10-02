from datetime import datetime
from sqlalchemy import Column, String, BigInteger, DateTime, Text, JSON, Uuid
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    empresa_id = Column(Uuid, nullable=False, index=True)
    usuario_id = Column(Uuid, nullable=False, index=True)
    tipo_usuario = Column(String(30), nullable=False)
    estudio_id = Column(Uuid, nullable=True)
    accion = Column(String(100), nullable=False)  # ASIENTO_CREAR, ASIENTO_ANULAR, CIERRE_MES, etc.
    recurso_tipo = Column(String(50), nullable=False)
    recurso_id = Column(String(100), nullable=False)
    payload_anterior = Column(JSON, nullable=True)
    payload_nuevo = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
