export type UnidadMedidaInsumo = 'kg' | 'g' | 'litro' | 'ml' | 'unidad';
export type EstadoPago = 'Pagado' | 'Pendiente';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad_medida: UnidadMedidaInsumo;
  cantidad_stock_gramos: number; // Siempre normalizado en gramos o unidades base
  costo_por_kilo: number; // Costo por kg (o por litro / unidad)
  stock_minimo_gramos: number;
  ultimo_proveedor: string;
  fecha_actualizacion: string;
}

export interface IngredienteReceta {
  insumo_id: string;
  insumo_nombre: string;
  gramos_por_kilo: number; // Cantidad en gramos requerida para producir 1 kilo de producto
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  stock_disponible_kg: number; // Kilos listos para la venta
  stock_minimo_kg: number;
  precio_venta_actual: number; // Precio de venta por kilo al público
  margen_objetivo_pct: number; // Margen deseado (ej. 45%)
  receta: IngredienteReceta[];
  imagen_url?: string; // URL o asset de foto del producto (opcional)
  fecha_creacion: string;
}

export interface GastoFijo {
  id: string;
  concepto: 'Luz' | 'Agua' | 'Gas' | 'Arriendo' | 'Internet / Teléfono' | 'Mantenimiento' | 'Aseo y Seguridad' | 'Otro';
  descripcion_detalle?: string;
  monto_mensual: number;
  periodo: string; // YYYY-MM
  estado_pago: EstadoPago;
  fecha_registro: string;
  fecha_vencimiento: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  documento: string;
  cargo: string;
  salario_mensual: number;
  seguridad_social_prestaciones: number; // Aportes de ley
  estado: 'Activo' | 'Inactivo';
}

export interface DetalleInsumoUsado {
  insumo_id: string;
  insumo_nombre: string;
  gramos_requeridos: number;
  costo_total: number;
}

export interface OrdenProduccion {
  id: string;
  codigo_orden: string;
  producto_id: string;
  producto_nombre: string;
  kilos_producidos: number;
  costo_materia_prima: number;
  costo_unitario_materia_prima: number;
  insumos_consumidos: DetalleInsumoUsado[];
  responsable: string;
  fecha_produccion: string; // ISO string
  observaciones?: string;
}

export interface ClienteFacturacion {
  id: string;
  nombre: string;
  nit_cedula: string;
  celular: string;
  direccion: string;
  email: string;
  ciudad: string;
}

export interface VentaFactura {
  id: string;
  numero_factura: string;
  cliente: ClienteFacturacion;
  producto_id: string;
  producto_nombre: string;
  kilos_vendidos: number;
  precio_unitario_kg: number;
  subtotal_bruto: number;
  metodo_pago: MetodoPago;
  comision_pct: number;
  monto_comision: number;
  total_neto_recibido: number;
  costo_materia_prima_estimado: number;
  estado_pago: EstadoPago;
  fecha: string; // ISO string
  notas?: string;
}

export interface ConfiguracionPlanta {
  moneda: string;
  simbolo_moneda: string;
  capacidad_produccion_mensual_kg: number; // Para prorratear gastos fijos y mano de obra
  margen_meta_default: number;
}
