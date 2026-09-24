import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Layers, 
  Check, 
  Copy, 
  FileCode, 
  Server, 
  Monitor, 
  ShieldCheck,
  Terminal,
  Cpu
} from 'lucide-react';

export const TechnicalDocsView: React.FC = () => {
  const [seccion, setSeccion] = useState<'arquitectura' | 'sql' | 'python' | 'frontend'>('arquitectura');
  const [copiado, setCopiado] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2500);
    });
  };

  const sqlCode = `-- ==========================================================
-- FABRICONTROL ERP - ESQUEMA RELACIONAL POSTGRESQL
-- Reglas: Anti-números negativos (CHECK >= 0), Enums estrictos
-- ==========================================================

-- 1. Tipos ENUM estrictos para prevenir errores contables
CREATE TYPE estado_pago_enum AS ENUM ('Pagado', 'Pendiente');
CREATE TYPE metodo_pago_enum AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia');
CREATE TYPE estado_orden_enum AS ENUM ('Completado', 'Cancelado', 'En_Proceso');

-- 2. TABLA: INSUMOS (BODEGA DE MATERIAS PRIMAS)
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'kg', -- 'kg', 'g', 'litro', 'unidad'
    cantidad_stock_gramos NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cantidad_stock_gramos >= 0),
    costo_por_kilo NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (costo_por_kilo >= 0),
    stock_minimo_gramos NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_minimo_gramos >= 0),
    ultimo_proveedor VARCHAR(255),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: PRODUCTOS (CATÁLOGO TERMINADO)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    stock_disponible_kg NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_disponible_kg >= 0),
    stock_minimo_kg NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_minimo_kg >= 0),
    precio_venta_actual NUMERIC(12, 2) NOT NULL CHECK (precio_venta_actual >= 0),
    margen_objetivo_pct NUMERIC(5, 2) NOT NULL DEFAULT 40.0 CHECK (margen_objetivo_pct >= 0 AND margen_objetivo_pct < 100),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: PRODUCTOS_RECETAS (FORMULACIÓN EN GRAMOS POR CADA 1 KG)
CREATE TABLE productos_recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    gramos_por_kilo NUMERIC(12, 2) NOT NULL CHECK (gramos_por_kilo > 0),
    CONSTRAINT uk_producto_insumo UNIQUE (producto_id, insumo_id)
);

-- 5. TABLA: GASTOS_FIJOS (RECIBOS DEL MES: LUZ, AGUA, GAS, ARRIENDO)
CREATE TABLE gastos_fijos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto VARCHAR(100) NOT NULL, -- 'Luz', 'Agua', 'Gas', 'Arriendo', etc.
    descripcion_detalle TEXT,
    monto_mensual NUMERIC(12, 2) NOT NULL CHECK (monto_mensual >= 0),
    periodo VARCHAR(7) NOT NULL, -- Formato 'YYYY-MM'
    estado_pago estado_pago_enum NOT NULL DEFAULT 'Pendiente',
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL
);

-- 6. TABLA: EMPLEADOS (NÓMINA INDIVIDUAL)
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    salario_mensual NUMERIC(12, 2) NOT NULL CHECK (salario_mensual >= 0),
    seguridad_social_prestaciones NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (seguridad_social_prestaciones >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- 7. TABLA: CLIENTES_FACTURACION (BASE DE DATOS FISCAL/DIAN)
CREATE TABLE clientes_facturacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    nit_cedula VARCHAR(50) UNIQUE NOT NULL,
    celular VARCHAR(50) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'Principal',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: PRODUCCION (HISTORIAL DE LOTES Y AUDITORÍA)
CREATE TABLE produccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_orden VARCHAR(50) UNIQUE NOT NULL,
    producto_id UUID NOT NULL REFERENCES productos(id),
    kilos_producidos NUMERIC(12, 2) NOT NULL CHECK (kilos_producidos > 0),
    costo_materia_prima_total NUMERIC(12, 2) NOT NULL CHECK (costo_materia_prima_total >= 0),
    costo_unitario_materia_prima NUMERIC(12, 2) NOT NULL CHECK (costo_unitario_materia_prima >= 0),
    responsable VARCHAR(255) NOT NULL,
    estado estado_orden_enum NOT NULL DEFAULT 'Completado',
    observaciones TEXT,
    fecha_produccion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: PRODUCCION_DETALLE_INSUMOS (DESCUENTO ATÓMICO)
CREATE TABLE produccion_detalle_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produccion_id UUID NOT NULL REFERENCES produccion(id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES insumos(id),
    gramos_consumidos NUMERIC(12, 2) NOT NULL CHECK (gramos_consumidos > 0),
    costo_total NUMERIC(12, 2) NOT NULL CHECK (costo_total >= 0)
);

-- 10. TABLA: VENTAS_FACTURAS
CREATE TABLE ventas_facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes_facturacion(id),
    producto_id UUID NOT NULL REFERENCES productos(id),
    kilos_vendidos NUMERIC(12, 2) NOT NULL CHECK (kilos_vendidos > 0),
    precio_unitario_kg NUMERIC(12, 2) NOT NULL CHECK (precio_unitario_kg > 0),
    subtotal_bruto NUMERIC(12, 2) NOT NULL CHECK (subtotal_bruto >= 0),
    metodo_pago metodo_pago_enum NOT NULL,
    comision_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (comision_pct >= 0 AND comision_pct <= 100),
    monto_comision NUMERIC(12, 2) NOT NULL DEFAULT 0.0 CHECK (monto_comision >= 0),
    total_neto_recibido NUMERIC(12, 2) NOT NULL CHECK (total_neto_recibido >= 0),
    costo_materia_prima_estimado NUMERIC(12, 2) NOT NULL CHECK (costo_materia_prima_estimado >= 0),
    estado_pago estado_pago_enum NOT NULL DEFAULT 'Pagado',
    notas TEXT,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA RENDIMIENTO OPERATIVO
CREATE INDEX idx_ventas_fecha ON ventas_facturas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas_facturas(estado_pago);
CREATE INDEX idx_produccion_fecha ON produccion(fecha_produccion);
CREATE INDEX idx_insumos_stock ON insumos(cantidad_stock_gramos);
`;

  const pythonCode = `"""
=============================================================================
FABRICONTROL ERP - LÓGICA CENTRAL DE BACKEND EN PYTHON
Framework recomendado: FastAPI / Flask con SQLAlchemy o Pydantic
Control de: Producción, Validación de Recetas, Facturación Electrónica y P&L
=============================================================================
"""

from decimal import Decimal
from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, validator

# ---------------------------------------------------------------------------
# 1. ENUMS ESTRICTOS Y MODELOS DE VALIDACIÓN ANTI-ERROR
# ---------------------------------------------------------------------------

class EstadoPago(str, Enum):
    PAGADO = "Pagado"
    PENDIENTE = "Pendiente"

class MetodoPago(str, Enum):
    EFECTIVO = "Efectivo"
    TARJETA = "Tarjeta"
    TRANSFERENCIA = "Transferencia"

class ClienteSchema(BaseModel):
    nombre: str = Field(..., min_length=2, description="Nombre o Razón Social obligatoria")
    nit_cedula: str = Field(..., min_length=5, description="NIT o Cédula fiscal requerida")
    celular: str = Field(..., min_length=7, description="Celular de contacto")
    direccion: str = Field(..., min_length=5, description="Dirección física de entrega")
    email: EmailStr = Field(..., description="Email válido para factura electrónica")
    ciudad: str = "Principal"

class OrdenProduccionRequest(BaseModel):
    producto_id: str
    kilos_a_producir: Decimal = Field(..., gt=0, description="Kilos estrictamente mayores a 0")
    responsable: str
    observaciones: Optional[str] = None

class VentaRequest(BaseModel):
    cliente: ClienteSchema
    producto_id: str
    kilos_a_vender: Decimal = Field(..., gt=0, description="Kilos estrictamente mayores a 0")
    precio_unitario_kg: Decimal = Field(..., gt=0, description="Precio estrictamente mayor a 0")
    metodo_pago: MetodoPago
    comision_pct: Decimal = Field(default=Decimal("0.0"), ge=0, le=100)
    estado_pago: EstadoPago
    notas: Optional[str] = None


# ---------------------------------------------------------------------------
# 2. SERVICIO DE PRODUCCIÓN: INSPECCIÓN DE STOCK POR RECETA Y DETENCIÓN
# ---------------------------------------------------------------------------

class ProductionService:
    def __init__(self, db_session):
        self.db = db_session

    def validar_y_ejecutar_produccion(self, req: OrdenProduccionRequest) -> Dict[str, Any]:
        """
        Inspecciona el inventario contra la receta del producto.
        Si falta aunque sea 1 gramo de insumo, DETIENE y CANCELA la producción.
        Si todo está disponible, descuenta insumos y suma los kilos terminados.
        """
        # A. Obtener producto y su receta en gramos por kilo
        producto = self.db.query("SELECT * FROM productos WHERE id = :id", id=req.producto_id)
        if not producto:
            raise ValueError("El producto no existe en el catálogo.")

        receta = self.db.query(
            """
            SELECT pr.insumo_id, i.nombre, pr.gramos_por_kilo, i.cantidad_stock_gramos, i.costo_por_kilo
            FROM productos_recetas pr
            JOIN insumos i ON i.id = pr.insumo_id
            WHERE pr.producto_id = :producto_id
            """,
            producto_id=req.producto_id
        )

        if not receta:
            raise ValueError(f"El producto '{producto.nombre}' no tiene una receta configurada.")

        # B. Comprobar disponibilidad de cada ingrediente
        faltantes = []
        requerimientos = []
        costo_total_materia_prima = Decimal("0.0")

        for item in receta:
            total_gramos_requeridos = Decimal(item.gramos_por_kilo) * req.kilos_a_producir
            stock_actual = Decimal(item.cantidad_stock_gramos)
            costo_gramo = Decimal(item.costo_por_kilo) / Decimal("1000.0")
            costo_item = total_gramos_requeridos * costo_gramo
            costo_total_materia_prima += costo_item

            if stock_actual < total_gramos_requeridos:
                deficit = total_gramos_requeridos - stock_actual
                faltantes.append({
                    "insumo_id": item.insumo_id,
                    "nombre": item.nombre,
                    "requerido_gramos": float(total_gramos_requeridos),
                    "disponible_gramos": float(stock_actual),
                    "faltan_gramos": float(deficit),
                    "faltan_kilos": float(deficit / Decimal("1000.0"))
                })
            else:
                requerimientos.append({
                    "insumo_id": item.insumo_id,
                    "nombre": item.nombre,
                    "gramos_a_descontar": total_gramos_requeridos,
                    "costo": costo_item
                })

        # C. REGLA CLAVE: FRENO Y CANCELACIÓN SI FALTAN INSUMOS
        if faltantes:
            return {
                "success": False,
                "status": "BLOQUEADO_POR_STOCK_INSUFICIENTE",
                "mensaje": f"Producción cancelada: Faltan {len(faltantes)} ingredientes en bodega.",
                "faltantes": faltantes,
                "requiere_compra": True
            }

        # D. TRANSACCIÓN ATÓMICA: Descontar insumos de bodega y sumar producto terminado
        try:
            # 1. Descontar stock de cada insumo
            for req_insumo in requerimientos:
                self.db.execute(
                    """
                    UPDATE insumos
                    SET cantidad_stock_gramos = cantidad_stock_gramos - :gramos,
                        fecha_actualizacion = NOW()
                    WHERE id = :id
                    """,
                    gramos=req_insumo["gramos_a_descontar"],
                    id=req_insumo["insumo_id"]
                )

            # 2. Sumar kilos listos para la venta al producto
            self.db.execute(
                """
                UPDATE productos
                SET stock_disponible_kg = stock_disponible_kg + :kilos
                WHERE id = :id
                """,
                kilos=req.kilos_a_producir,
                id=req.producto_id
            )

            # 3. Guardar orden de producción en historial
            codigo_orden = f"OP-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp())}"
            self.db.execute(
                """
                INSERT INTO produccion (codigo_orden, producto_id, kilos_producidos,
                                       costo_materia_prima_total, costo_unitario_materia_prima,
                                       responsable, observaciones)
                VALUES (:codigo, :prod_id, :kilos, :costo_total, :costo_unit, :resp, :obs)
                """,
                codigo=codigo_orden,
                prod_id=req.producto_id,
                kilos=req.kilos_a_producir,
                costo_total=costo_total_materia_prima,
                costo_unit=costo_total_materia_prima / req.kilos_a_producir,
                resp=req.responsable,
                obs=req.observaciones
            )

            self.db.commit()

            return {
                "success": True,
                "status": "PRODUCCION_COMPLETADA",
                "codigo_orden": codigo_orden,
                "kilos_sumados": float(req.kilos_a_producir),
                "costo_materia_prima": float(costo_total_materia_prima),
                "mensaje": f"Se produjeron {req.kilos_a_producir} kg de {producto.nombre} exitosamente."
            }

        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"Falla crítica en producción: {str(e)}")


# ---------------------------------------------------------------------------
# 3. SERVICIO DE VENTAS: REVISIÓN DE STOCK REAL, FACTURA Y COMISIÓN BANCARIA
# ---------------------------------------------------------------------------

class SalesService:
    def __init__(self, db_session):
        self.db = db_session

    def registrar_venta_y_factura(self, req: VentaRequest) -> Dict[str, Any]:
        """
        Verifica existencia de stock de producto terminado.
        Calcula comisión de pasarela o banco y guarda cliente para factura electrónica.
        """
        # A. Revisión estricta de stock disponible terminado
        producto = self.db.query("SELECT * FROM productos WHERE id = :id", id=req.producto_id)
        if not producto:
            raise ValueError("Producto no encontrado.")

        stock_actual = Decimal(producto.stock_disponible_kg)
        if stock_actual < req.kilos_a_vender:
            deficit = req.kilos_a_vender - stock_actual
            return {
                "success": False,
                "status": "STOCK_INSUFICIENTE_PARA_VENTA",
                "mensaje": f"No puedes vender lo que no existe. Solicitados: {req.kilos_a_vender} kg | En bodega: {stock_actual} kg (Faltan {deficit} kg)."
            }

        # B. Cálculo financiero de importes y comisiones
        subtotal_bruto = req.kilos_a_vender * req.precio_unitario_kg
        monto_comision = subtotal_bruto * (req.comision_pct / Decimal("100.0"))
        total_neto = subtotal_bruto - monto_comision

        # C. Costo de materia prima estimada (para margen bruto)
        costo_mp_kilo = self.db.query_scalar(
            """
            SELECT COALESCE(SUM((pr.gramos_por_kilo / 1000.0) * i.costo_por_kilo), 0)
            FROM productos_recetas pr
            JOIN insumos i ON i.id = pr.insumo_id
            WHERE pr.producto_id = :prod_id
            """,
            prod_id=req.producto_id
        ) or Decimal("0.0")
        costo_mp_total = Decimal(costo_mp_kilo) * req.kilos_a_vender

        try:
            # 1. Upsert o inserción del cliente para facturación electrónica
            cliente_id = self.db.query_scalar(
                "SELECT id FROM clientes_facturacion WHERE nit_cedula = :nit",
                nit=req.cliente.nit_cedula
            )
            if not cliente_id:
                cliente_id = self.db.execute(
                    """
                    INSERT INTO clientes_facturacion (nombre, nit_cedula, celular, direccion, email, ciudad)
                    VALUES (:nombre, :nit, :celular, :dir, :email, :ciudad)
                    RETURNING id
                    """,
                    nombre=req.cliente.nombre,
                    nit=req.cliente.nit_cedula,
                    celular=req.cliente.celular,
                    dir=req.cliente.direccion,
                    email=req.cliente.email,
                    ciudad=req.cliente.ciudad
                )

            # 2. Descontar stock terminado de la bodega
            self.db.execute(
                """
                UPDATE productos
                SET stock_disponible_kg = stock_disponible_kg - :kilos
                WHERE id = :id
                """,
                kilos=req.kilos_a_vender,
                id=req.producto_id
            )

            # 3. Emitir Factura
            numero_fac = f"FAC-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp())}"
            self.db.execute(
                """
                INSERT INTO ventas_facturas (numero_factura, cliente_id, producto_id, kilos_vendidos,
                                            precio_unitario_kg, subtotal_bruto, metodo_pago,
                                            comision_pct, monto_comision, total_neto_recibido,
                                            costo_materia_prima_estimado, estado_pago, notas)
                VALUES (:fac, :cli, :prod, :kilos, :precio, :subtotal, :metodo,
                        :com_pct, :com_monto, :neto, :costo_mp, :estado, :notas)
                """,
                fac=numero_fac,
                cli=cliente_id,
                prod=req.producto_id,
                kilos=req.kilos_a_vender,
                precio=req.precio_unitario_kg,
                subtotal=subtotal_bruto,
                metodo=req.metodo_pago.value,
                com_pct=req.comision_pct,
                com_monto=monto_comision,
                neto=total_neto,
                costo_mp=costo_mp_total,
                estado=req.estado_pago.value,
                notas=req.notas
            )

            self.db.commit()

            return {
                "success": True,
                "numero_factura": numero_fac,
                "subtotal_bruto": float(subtotal_bruto),
                "comision_descontada": float(monto_comision),
                "total_neto_recibido": float(total_neto),
                "mensaje": f"Factura {numero_fac} emitida. Se despacharon {req.kilos_a_vender} kg de bodega."
            }

        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"Error al registrar venta: {str(e)}")


# ---------------------------------------------------------------------------
# 4. SERVICIO DE REPORTES Y CIERRE (P&L: GANANCIA O PÉRDIDA REAL)
# ---------------------------------------------------------------------------

class FinancialReportService:
    def __init__(self, db_session):
        self.db = db_session

    def generar_reporte_rentabilidad(self, fecha_inicio: datetime, fecha_fin: datetime, dias_periodo: int = 30) -> Dict[str, Any]:
        """
        Cruza: Ventas Brutas - Comisiones - Materia Prima Gastada - Prorrateo de Recibos y Nómina.
        Retorna la Utilidad Neta Real y el veredicto de si estás ganando o perdiendo plata.
        """
        # A. Totales de Ventas y Comisiones en el rango
        ventas_data = self.db.query_one(
            """
            SELECT 
                COALESCE(SUM(subtotal_bruto), 0) as ventas_brutas,
                COALESCE(SUM(monto_comision), 0) as comisiones_bancarias,
                COALESCE(SUM(total_neto_recibido), 0) as ventas_netas,
                COALESCE(SUM(costo_materia_prima_estimado), 0) as cogs,
                COALESCE(SUM(kilos_vendidos), 0) as kilos_totales
            FROM ventas_facturas
            WHERE fecha_venta BETWEEN :inicio AND :fin
            """,
            inicio=fecha_inicio,
            fin=fecha_fin
        )

        ventas_brutas = Decimal(ventas_data["ventas_brutas"])
        comisiones = Decimal(ventas_data["comisiones_bancarias"])
        ventas_netas = Decimal(ventas_data["ventas_netas"])
        cogs = Decimal(ventas_data["cogs"])
        utilidad_bruta = ventas_netas - cogs

        # B. Costos Fijos y Nómina del mes actual
        total_recibos_mes = self.db.query_scalar(
            "SELECT COALESCE(SUM(monto_mensual), 0) FROM gastos_fijos WHERE periodo = :periodo",
            periodo=fecha_inicio.strftime("%Y-%m")
        ) or Decimal("0.0")

        total_nomina_mes = self.db.query_scalar(
            "SELECT COALESCE(SUM(salario_mensual + seguridad_social_prestaciones), 0) FROM empleados WHERE estado = 'Activo'"
        ) or Decimal("0.0")

        # C. Prorrateo proporcional (1 día = 1/30, 7 días = 7/30, 30 días = 1)
        fraccion_dias = Decimal(dias_periodo) / Decimal("30.0")
        recibos_prorrateados = Decimal(total_recibos_mes) * fraccion_dias
        nomina_prorrateada = Decimal(total_nomina_mes) * fraccion_dias
        total_gastos_operativos = recibos_prorrateados + nomina_prorrateada

        # D. UTILIDAD NETA REAL
        utilidad_neta = utilidad_bruta - total_gastos_operativos
        margen_neto_pct = (utilidad_neta / ventas_brutas * Decimal("100.0")) if ventas_brutas > 0 else Decimal("0.0")

        es_rentable = utilidad_neta > Decimal("0.0")

        return {
            "periodo_dias": dias_periodo,
            "ventas_brutas": float(ventas_brutas),
            "comisiones_bancarias": float(comisiones),
            "ventas_netas": float(ventas_netas),
            "costo_materia_prima_usada": float(cogs),
            "utilidad_bruta": float(utilidad_bruta),
            "cuota_recibos_arriendo": float(recibos_prorrateados),
            "cuota_nomina_empleados": float(nomina_prorrateada),
            "total_costos_fijos_absorbidos": float(total_gastos_operativos),
            "utilidad_neta_real": float(utilidad_neta),
            "margen_neto_pct": float(round(margen_neto_pct, 2)),
            "diagnostico": "GANANDO DINERO" if es_rentable else "EN PÉRDIDA NETA",
            "mensaje_operativo": (
                f"¡Estás ganando plata! Tu margen neto real es de {round(margen_neto_pct, 1)}%."
                if es_rentable else
                "¡Alerta de pérdida! Las ventas de este periodo no cubren la materia prima y la cuota fija."
            )
        }
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Entregables Técnicos: Arquitectura, SQL & Backend Python
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documentación técnica y código fuente listo para producción con PostgreSQL, FastAPI/Flask y React.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSeccion('arquitectura')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              seccion === 'arquitectura'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Arquitectura
          </button>
          <button
            onClick={() => setSeccion('sql')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              seccion === 'sql'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Base de Datos (SQL)
          </button>
          <button
            onClick={() => setSeccion('python')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              seccion === 'python'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3. Código Python
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: ARQUITECTURA */}
      {seccion === 'arquitectura' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Backend Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Backend: FastAPI o Flask (Python 3.11+)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>¿Por qué se recomienda?</strong> FastAPI ofrece validación automática de esquemas con Pydantic, impidiendo que el cliente o el frontend envíen números negativos o tipos de datos erróneos. Soporta transacciones atómicas de base de datos con SQLAlchemy para asegurar que el descuento de insumos y el aumento de producto terminado ocurran juntos.
              </p>
              <ul className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• <strong>Validación:</strong> Pydantic v2 (tipado fuerte, Enums)</li>
                <li>• <strong>ORM:</strong> SQLAlchemy 2.0 / Alembic (migraciones)</li>
                <li>• <strong>Seguridad:</strong> JWT y control de roles por operario</li>
              </ul>
            </div>

            {/* Database Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Base de Datos: PostgreSQL 16 Relacional
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>¿Por qué relacional?</strong> Una planta de producción requiere integridad referencial estricta: un insumo no puede eliminarse si está en una receta activa, y las restricciones <code>CHECK (cantidad &gt;= 0)</code> a nivel de motor de base de datos garantizan que ningún bug de código meta stock negativo.
              </p>
              <ul className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• <strong>Restricciones CHECK:</strong> Imposible saldo negativo</li>
                <li>• <strong>Tipos ENUM:</strong> 'Pagado' / 'Pendiente' nativos</li>
                <li>• <strong>Transacciones ACID:</strong> Consistencia de bodega</li>
              </ul>
            </div>

            {/* Frontend Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Frontend: React + Vite + Tailwind CSS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>¿Por qué una SPA moderna?</strong> Para el operario de planta y el cajero, la velocidad es crítica: verificar la receta en tiempo real conforme se digitan los kilos a producir requiere reactividad instantánea sin recargar la página web.
              </p>
              <ul className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• <strong>Diseño UI/UX:</strong> Tailwind CSS limpio sin elementos AI-slop</li>
                <li>• <strong>Impresión:</strong> Facturas listas para PDF / papel térmico</li>
                <li>• <strong>Auditoría visual:</strong> Semáforos de stock en vivo</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Arquitectura de Doble Candado (Frontend + Backend + DB)
            </h4>
            <p className="text-slate-300">
              Para cumplir la exigencia de que <em>"el sistema sea a prueba de errores"</em>, la validación se implementa en tres capas simultáneas:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-2">
              <li><strong>Capa 1 (Frontend):</strong> Inputs numéricos con <code>min="0"</code>, selectores dropdown cerrados para 'Pagado'/'Pendiente' y bloqueo visual de botones si falta inventario.</li>
              <li><strong>Capa 2 (Backend Python):</strong> Modelos Pydantic con validadores <code>Field(..., gt=0)</code> y métodos transaccionales que verifican stock antes de confirmar órdenes.</li>
              <li><strong>Capa 3 (PostgreSQL):</strong> Restricciones <code>CHECK (cantidad &gt;= 0)</code> en las columnas de base de datos. Si una operación intenta dejar un inventario en negativo, la base de datos aborta la transacción automáticamente.</li>
            </ol>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: BASE DE DATOS (SQL) */}
      {seccion === 'sql' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Esquema DDL completo con 6+ tablas relacionales, llaves foráneas y restricciones CHECK:
            </span>
            <button
              onClick={() => handleCopy(sqlCode, 'sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {copiado === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado === 'sql' ? '¡Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            <pre>{sqlCode}</pre>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: CÓDIGO PYTHON */}
      {seccion === 'python' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Lógica central en Python: Validación de producción, registro de ventas con comisión y cálculo de P&L:
            </span>
            <button
              onClick={() => handleCopy(pythonCode, 'python')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {copiado === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado === 'python' ? '¡Copiado!' : 'Copiar Código Python'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            <pre>{pythonCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
