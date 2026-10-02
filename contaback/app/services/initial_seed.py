import uuid
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.empresa import Empresa, GrupoEmpresarial
from app.models.estudio import EstudioContable, EmpresaEstudioDelegacion
from app.models.usuario import Usuario
from app.models.moneda import Moneda, TasaCambio
from app.models.auxiliar import Auxiliar
from app.models.centro_costo import CentroCosto
from app.models.cuenta import CuentaContable
from app.models.comprobante import PeriodoContable, Comprobante, ComprobanteRenglon
from app.core.security import get_password_hash
from app.services.puc_seed import seed_puc_ven_nif

async def seed_initial_demo_data(db: AsyncSession) -> dict:
    """
    Inyecta datos precargados completos para demostración y puesta en marcha:
    1. Monedas Oficiales (VES, USD, EUR, USDT) y Tasas BCV históricas y del día.
    2. Grupo Empresarial ('GRUPO KANTIO HOLDING')
    3. Empresa Piloto ('EMPRESA DEMO KANTIO C.A.')
    4. Plan de Cuentas VEN-NIF oficial (50+ cuentas automáticas)
    5. Centros de Costo (Administración, Ventas, Operaciones)
    6. Auxiliares / Terceros (Proveedores, Clientes, Bancos Nacionales)
    7. Estudio Contable Outsourcing ('DESPACHO CONTABLE Y AUDITORES ALPHA')
    8. Delegación Operativa y de Auditoría Externa
    9. Usuarios listos para pruebas con credenciales predeterminadas:
       - Administrador de Plataforma (superadmin@kantio.online)
       - Administrador de Empresa (admin.demo@kantio.online)
       - Contador Senior del Despacho (contador.alpha@kantio.online)
       - Asistente Contable del Despacho (asistente.alpha@kantio.online)
       - Auditor Externo / Solo Lectura (auditor.externo@kantio.online)
    10. Comprobantes de prueba iniciales asentados (Apertura y Operaciones).
    """
    # 1. Monedas
    monedas_data = [
        {"codigo": "VES", "nombre": "Bolívar Digital", "simbolo": "Bs.", "es_moneda_nacional": True},
        {"codigo": "USD", "nombre": "Dólar Estadounidense", "simbolo": "$", "es_moneda_nacional": False},
        {"codigo": "EUR", "nombre": "Euro", "simbolo": "€", "es_moneda_nacional": False},
        {"codigo": "USDT", "nombre": "Tether USDT", "simbolo": "USDT", "es_moneda_nacional": False},
    ]
    monedas_map = {}
    for m in monedas_data:
        stmt = select(Moneda).where(Moneda.codigo == m["codigo"])
        mon = (await db.execute(stmt)).scalars().first()
        if not mon:
            mon = Moneda(**m, activa=True)
            db.add(mon)
            await db.flush()
        monedas_map[m["codigo"]] = mon

    # Tasas de Cambio BCV
    hoy = date.today()
    stmt_tasa = select(TasaCambio).where(
        TasaCambio.moneda_origen_id == monedas_map["USD"].id,
        TasaCambio.moneda_destino_id == monedas_map["VES"].id,
        TasaCambio.fecha == hoy
    )
    tasa_db = (await db.execute(stmt_tasa)).scalars().first()
    if not tasa_db:
        tasa_bcv = TasaCambio(
            moneda_origen_id=monedas_map["USD"].id,
            moneda_destino_id=monedas_map["VES"].id,
            fecha=hoy,
            tipo_tasa="BCV_OFICIAL",
            tasa=Decimal("40.000000"),
            fuente="Banco Central de Venezuela"
        )
        db.add(tasa_bcv)

    # 2. Grupo Empresarial
    stmt_grupo = select(GrupoEmpresarial).where(GrupoEmpresarial.codigo == "GRP-KANTIO")
    grupo = (await db.execute(stmt_grupo)).scalars().first()
    if not grupo:
        grupo = GrupoEmpresarial(
            codigo="GRP-KANTIO",
            nombre="GRUPO EMPRESARIAL KANTIO HOLDING",
            activo=True
        )
        db.add(grupo)
        await db.flush()

    # 3. Empresa Piloto
    stmt_emp = select(Empresa).where(Empresa.codigo == "EMP-DEMO")
    empresa = (await db.execute(stmt_emp)).scalars().first()
    if not empresa:
        empresa = Empresa(
            codigo="EMP-DEMO",
            razon_social="CORPORACION DEMO KANTIO C.A.",
            nombre_comercial="Kantio Comercial",
            rif="J-50123456-7",
            es_grupo_holding=False,
            grupo_id=grupo.id,
            plan_suscripcion="CORPORATIVO",
            activo=True
        )
        db.add(empresa)
        await db.flush()

    # 4. Inyección del PUC VEN-NIF (50+ Cuentas)
    await seed_puc_ven_nif(db, empresa.id)

    # 5. Centros de Costo
    centros_data = [
        {"codigo": "CC-ADM", "nombre": "Administración Central"},
        {"codigo": "CC-VEN", "nombre": "Ventas & Mercadeo"},
        {"codigo": "CC-OPS", "nombre": "Operaciones & Logística"},
    ]
    for cc in centros_data:
        stmt_cc = select(CentroCosto).where(CentroCosto.empresa_id == empresa.id, CentroCosto.codigo == cc["codigo"])
        if not (await db.execute(stmt_cc)).scalars().first():
            db.add(CentroCosto(empresa_id=empresa.id, activo=True, **cc))

    # 6. Auxiliares / Terceros
    auxiliares_data = [
        {"codigo": "J-00002961-0", "nombre_razon_social": "BANCO MERCANTIL C.A.", "tipo_identificacion": "J", "rif_cedula": "J-00002961-0", "tipo_auxiliar": "OTRO"},
        {"codigo": "J-20009997-6", "nombre_razon_social": "BANCO DE VENEZUELA S.A.", "tipo_identificacion": "G", "rif_cedula": "G-20009997-6", "tipo_auxiliar": "OTRO"},
        {"codigo": "J-30111222-3", "nombre_razon_social": "PROVEEDORA NACIONAL DE ALIMENTOS C.A.", "tipo_identificacion": "J", "rif_cedula": "J-30111222-3", "tipo_auxiliar": "PROVEEDOR"},
        {"codigo": "J-40998877-1", "nombre_razon_social": "DISTRIBUIDORA Y SUMINISTROS CARACAS S.A.", "tipo_identificacion": "J", "rif_cedula": "J-40998877-1", "tipo_auxiliar": "PROVEEDOR"},
        {"codigo": "V-14555666-0", "nombre_razon_social": "CLIENTE GENERAL DE CONTADO", "tipo_identificacion": "V", "rif_cedula": "V-14555666-0", "tipo_auxiliar": "CLIENTE"},
    ]
    for aux in auxiliares_data:
        stmt_a = select(Auxiliar).where(Auxiliar.empresa_id == empresa.id, Auxiliar.codigo == aux["codigo"])
        if not (await db.execute(stmt_a)).scalars().first():
            db.add(Auxiliar(empresa_id=empresa.id, activo=True, **aux))

    # 7. Estudio Contable
    stmt_est = select(EstudioContable).where(EstudioContable.codigo == "EST-ALPHA")
    estudio = (await db.execute(stmt_est)).scalars().first()
    if not estudio:
        estudio = EstudioContable(
            codigo="EST-ALPHA",
            nombre="DESPACHO CONTABLE Y AUDITORES ALPHA & ASOCIADOS",
            rif="J-31456789-0",
            email_contacto="contacto@despachoalpha.com",
            telefono="+58 212 5551234",
            activo=True
        )
        db.add(estudio)
        await db.flush()

    # 8. Delegación Operativa
    stmt_del = select(EmpresaEstudioDelegacion).where(
        EmpresaEstudioDelegacion.empresa_id == empresa.id,
        EmpresaEstudioDelegacion.estudio_id == estudio.id
    )
    if not (await db.execute(stmt_del)).scalars().first():
        delegacion = EmpresaEstudioDelegacion(
            empresa_id=empresa.id,
            estudio_id=estudio.id,
            tipo_delegacion="OPERATIVO_COMPLETO",
            fecha_inicio=hoy,
            estado="ACTIVA"
        )
        db.add(delegacion)

    # 9. Usuarios Listos para Pruebas
    password_comun = "Kantio2026!"
    hashed_pwd = get_password_hash(password_comun)

    usuarios_data = [
        {
            "email": "superadmin@kantio.online",
            "nombre_completo": "Super Administrador Kantio",
            "tipo_usuario": "KANTIO_ADMIN",
            "rol": "ADMIN_EMPRESA",
            "empresa_id": None,
            "estudio_id": None
        },
        {
            "email": "admin.demo@kantio.online",
            "nombre_completo": "Gerente General Demo",
            "tipo_usuario": "EMPRESA_INTERNO",
            "rol": "ADMIN_EMPRESA",
            "empresa_id": empresa.id,
            "estudio_id": None
        },
        {
            "email": "contador.alpha@kantio.online",
            "nombre_completo": "Lic. Carlos Méndez (Contador Senior)",
            "tipo_usuario": "ESTUDIO_MIEMBRO",
            "rol": "CONTADOR_SENIOR",
            "empresa_id": None,
            "estudio_id": estudio.id
        },
        {
            "email": "asistente.alpha@kantio.online",
            "nombre_completo": "T.S.U. María Pérez (Asistente de Carga)",
            "tipo_usuario": "ESTUDIO_MIEMBRO",
            "rol": "ASISTENTE_CONTABLE",
            "empresa_id": None,
            "estudio_id": estudio.id
        },
        {
            "email": "auditor.externo@kantio.online",
            "nombre_completo": "Dr. Fernando Ruiz (Auditor Forense)",
            "tipo_usuario": "ESTUDIO_MIEMBRO",
            "rol": "AUDITOR_EXTERNO",
            "empresa_id": None,
            "estudio_id": estudio.id
        }
    ]

    for u in usuarios_data:
        stmt_u = select(Usuario).where(Usuario.email == u["email"])
        if not (await db.execute(stmt_u)).scalars().first():
            db.add(Usuario(
                email=u["email"],
                hashed_password=hashed_pwd,
                nombre_completo=u["nombre_completo"],
                tipo_usuario=u["tipo_usuario"],
                rol=u["rol"],
                empresa_id=u["empresa_id"],
                estudio_id=u["estudio_id"],
                activo=True
            ))

    # 10. Periodo Contable y Comprobante de Asiento Inicial (Apertura)
    stmt_per = select(PeriodoContable).where(
        PeriodoContable.empresa_id == empresa.id,
        PeriodoContable.ano == hoy.year,
        PeriodoContable.mes == hoy.month
    )
    periodo = (await db.execute(stmt_per)).scalars().first()
    if not periodo:
        periodo = PeriodoContable(
            empresa_id=empresa.id,
            ano=hoy.year,
            mes=hoy.month,
            fecha_inicio=date(hoy.year, hoy.month, 1),
            fecha_fin=date(hoy.year, hoy.month, 28),
            cerrado=False
        )
        db.add(periodo)
        await db.flush()

    # Comprobante Asentado Inicial
    stmt_comp = select(Comprobante).where(Comprobante.empresa_id == empresa.id, Comprobante.numero == f"{hoy.year}-0001")
    if not (await db.execute(stmt_comp)).scalars().first():
        # Obtener IDs de cuentas
        async def get_acc(cod):
            res = await db.execute(select(CuentaContable).where(CuentaContable.empresa_id == empresa.id, CuentaContable.codigo == cod))
            return res.scalars().first()

        caja = await get_acc("1.1.01.001")
        banco = await get_acc("1.1.01.002")
        capital = await get_acc("3.1.01.001")

        if caja and banco and capital:
            comp_ini = Comprobante(
                empresa_id=empresa.id,
                numero=f"{hoy.year}-0001",
                fecha=hoy,
                periodo_id=periodo.id,
                tipo="APERTURA",
                concepto="Asiento de Apertura y Constitución de Capital Social",
                tasa_cambio=Decimal("40.00"),
                estado="ASENTADO",
                total_debito_base=Decimal("200000.00"),
                total_credito_base=Decimal("200000.00"),
                total_debito_divisa=Decimal("5000.00"),
                total_credito_divisa=Decimal("5000.00"),
                creado_por_usuario_id=uuid.uuid4(),
                creado_tipo_usuario="KANTIO_ADMIN",
                asentado_at=datetime.utcnow()
            )
            db.add(comp_ini)
            await db.flush()

            db.add_all([
                ComprobanteRenglon(comprobante_id=comp_ini.id, empresa_id=empresa.id, numero_linea=1, cuenta_id=caja.id, descripcion="Aporte Caja Inicial", monto_debito_base=50000.0, monto_debito_divisa=1250.0),
                ComprobanteRenglon(comprobante_id=comp_ini.id, empresa_id=empresa.id, numero_linea=2, cuenta_id=banco.id, descripcion="Depósito Bancario Cuenta Corriente", monto_debito_base=150000.0, monto_debito_divisa=3750.0),
                ComprobanteRenglon(comprobante_id=comp_ini.id, empresa_id=empresa.id, numero_linea=3, cuenta_id=capital.id, descripcion="Capital Social Suscrito y Pagado", monto_credito_base=200000.0, monto_credito_divisa=5000.0)
            ])

    await db.commit()
    return {
        "status": "success",
        "empresa": empresa.razon_social,
        "estudio": estudio.nombre,
        "usuarios_creados": len(usuarios_data)
    }
