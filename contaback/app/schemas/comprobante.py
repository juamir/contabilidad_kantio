from typing import Optional, List
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field, model_validator

class ComprobanteRenglonBase(BaseModel):
    numero_linea: int = Field(..., ge=1)
    cuenta_id: UUID
    descripcion: str = Field(..., max_length=255)
    auxiliar_id: Optional[UUID] = None
    centro_costo_id: Optional[UUID] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    monto_debito_base: float = 0.0
    monto_credito_base: float = 0.0
    monto_debito_divisa: float = 0.0
    monto_credito_divisa: float = 0.0

class ComprobanteRenglonCreate(ComprobanteRenglonBase):
    pass

class ComprobanteRenglonOut(ComprobanteRenglonBase):
    id: UUID
    comprobante_id: UUID
    empresa_id: UUID

    class Config:
        from_attributes = True

class ComprobanteBase(BaseModel):
    numero: str = Field(..., max_length=30)
    fecha: date = Field(default_factory=date.today)
    tipo: str = "DIARIO"
    concepto: str = Field(..., max_length=500)
    tasa_cambio: float = 1.0
    estado: str = "BORRADOR"  # BORRADOR, REVISADO, ASENTADO, ANULADO

class ComprobanteCreate(ComprobanteBase):
    renglones: List[ComprobanteRenglonCreate]

    @model_validator(mode='after')
    def validate_double_entry(self):
        if not self.renglones:
            raise ValueError("El comprobante debe contener al menos dos renglones.")
        if len(self.renglones) < 2:
            raise ValueError("Para cumplir el principio de partida doble, se requieren mínimo 2 renglones.")

        # Si se desea asentar inmediatamente, exigir cuadre estricto
        if self.estado == "ASENTADO":
            total_debito = sum(r.monto_debito_base for r in self.renglones)
            total_credito = sum(r.monto_credito_base for r in self.renglones)
            if round(abs(total_debito - total_credito), 2) > 0.01:
                raise ValueError(
                    f"Descuadre contable en Moneda Base: Débitos ({total_debito:.2f}) != Créditos ({total_credito:.2f})"
                )
            
            total_debito_divisa = sum(r.monto_debito_divisa for r in self.renglones)
            total_credito_divisa = sum(r.monto_credito_divisa for r in self.renglones)
            if round(abs(total_debito_divisa - total_credito_divisa), 2) > 0.01:
                raise ValueError(
                    f"Descuadre contable en Divisa: Débitos ({total_debito_divisa:.2f}) != Créditos ({total_credito_divisa:.2f})"
                )
        return self

class ComprobanteOut(ComprobanteBase):
    id: UUID
    empresa_id: UUID
    total_debito_base: float
    total_credito_base: float
    total_debito_divisa: float
    total_credito_divisa: float
    creado_por_usuario_id: UUID
    creado_tipo_usuario: str
    estudio_id: Optional[UUID] = None
    created_at: datetime
    asentado_at: Optional[datetime] = None
    renglones: List[ComprobanteRenglonOut] = []

    class Config:
        from_attributes = True

class ComprobanteListOut(ComprobanteBase):
    id: UUID
    empresa_id: UUID
    total_debito_base: float
    total_credito_base: float
    total_debito_divisa: float
    total_credito_divisa: float
    created_at: datetime

    class Config:
        from_attributes = True
