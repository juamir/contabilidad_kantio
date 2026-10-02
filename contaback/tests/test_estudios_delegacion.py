import pytest
import uuid
from datetime import date
from sqlalchemy import select
from app.models.empresa import Empresa
from app.models.estudio import EstudioContable, EmpresaEstudioDelegacion

@pytest.mark.asyncio
async def test_delegacion_and_revocacion_estudio(db_session):
    # 1. Crear Empresa
    empresa = Empresa(
        id=uuid.uuid4(),
        codigo="EMP-ABC",
        razon_social="Corporación ABC C.A.",
        rif="J-99999999-0",
        activo=True
    )
    db_session.add(empresa)

    # 2. Crear Estudio Contable
    estudio = EstudioContable(
        id=uuid.uuid4(),
        codigo="ESTUDIO-ALPHA",
        nombre="Despacho Contable Alpha & Asociados",
        rif="J-88888888-1",
        email_contacto="alpha@contadores.com",
        activo=True
    )
    db_session.add(estudio)
    await db_session.commit()

    # 3. Delegar Empresa a Estudio
    delegacion = EmpresaEstudioDelegacion(
        empresa_id=empresa.id,
        estudio_id=estudio.id,
        tipo_delegacion="OPERATIVO_COMPLETO",
        fecha_inicio=date.today(),
        estado="ACTIVA"
    )
    db_session.add(delegacion)
    await db_session.commit()

    # Verificar que está activa
    stmt = select(EmpresaEstudioDelegacion).where(
        EmpresaEstudioDelegacion.empresa_id == empresa.id,
        EmpresaEstudioDelegacion.estudio_id == estudio.id,
        EmpresaEstudioDelegacion.estado == "ACTIVA"
    )
    del_db = (await db_session.execute(stmt)).scalars().first()
    assert del_db is not None
    assert del_db.estado == "ACTIVA"

    # 4. Portabilidad Instantánea: Revocar delegación
    del_db.estado = "REVOCADA"
    await db_session.commit()

    # Verificar que ya no está activa
    del_activa = (await db_session.execute(stmt)).scalars().first()
    assert del_activa is None
