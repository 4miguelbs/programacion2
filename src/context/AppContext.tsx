import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Insumo,
  Producto,
  GastoFijo,
  Empleado,
  OrdenProduccion,
  VentaFactura,
  ConfiguracionPlanta,
  EstadoPago,
  MetodoPago,
  ClienteFacturacion,
} from '../types';
import {
  initialConfig,
  initialInsumos,
  initialProductos,
  initialGastosFijos,
  initialEmpleados,
  initialProducciones,
  initialVentas,
  initialClientes,
} from '../data/seedData';

export interface RequerimientoInsumoValidacion {
  insumo_id: string;
  nombre: string;
  unidad: string;
  requeridos_gramos: number;
  disponibles_gramos: number;
  suficiente: boolean;
  faltan_gramos: number;
  costo_estimado: number;
}

export interface ResultadoValidacionProduccion {
  puedeProducir: boolean;
  requerimientos: RequerimientoInsumoValidacion[];
  faltantes: RequerimientoInsumoValidacion[];
  costoTotalEstimadoMateriaPrima: number;
  costoPorKiloMateriaPrima: number;
}

export interface ReporteFinanciero {
  periodo: 'dia' | 'semana' | 'mes' | 'todos';
  labelPeriodo: string;
  ventasBrutas: number;
  comisionesBancarias: number;
  ventasNetas: number;
  costoMateriaPrima: number;
  utilidadBruta: number;
  gastosFijosProrrateados: number;
  nominaProrrateada: number;
  totalGastosOperativos: number;
  utilidadNeta: number;
  margenNetoPct: number;
  kilosVendidosTotales: number;
  kilosProducidosTotales: number;
  totalFacturasEmitidas: number;
  facturasPagadasMonto: number;
  facturasPendientesMonto: number;
}

interface AppContextType {
  insumos: Insumo[];
  productos: Producto[];
  gastosFijos: GastoFijo[];
  empleados: Empleado[];
  producciones: OrdenProduccion[];
  ventas: VentaFactura[];
  clientes: ClienteFacturacion[];
  config: ConfiguracionPlanta;
  
  // Clientes
  guardarCliente: (cliente: ClienteFacturacion) => void;

  // Costing calculations
  calcularCostoMateriaPrimaPorKilo: (productoId: string) => number;
  calcularTotalGastosFijosMensuales: () => number;
  calcularTotalNominaMensual: () => number;
  calcularCostoOperativoFijoPorKilo: () => number;
  calcularCostoTotalPorKilo: (productoId: string) => number;
  calcularPrecioSugerido: (productoId: string, margenPct?: number) => number;
  
  // Production validation & execution
  validarProduccion: (productoId: string, kilos: number) => ResultadoValidacionProduccion;
  ejecutarProduccion: (
    productoId: string,
    kilos: number,
    responsable: string,
    observaciones?: string
  ) => { success: boolean; mensaje: string; orden?: OrdenProduccion; error?: string };

  // Sales validation & execution
  validarVenta: (productoId: string, kilos: number) => { puedeVender: boolean; stockDisponible: number; faltanKilos: number };
  registrarVenta: (datos: {
    cliente: ClienteFacturacion;
    productoId: string;
    kilos: number;
    precioUnitario: number;
    metodoPago: MetodoPago;
    comisionPct: number;
    estadoPago: EstadoPago;
    notas?: string;
  }) => { success: boolean; mensaje: string; venta?: VentaFactura; error?: string };

  // Update sale status
  actualizarEstadoVenta: (ventaId: string, nuevoEstado: EstadoPago) => void;

  // Insumos CRUD
  guardarInsumo: (insumo: Omit<Insumo, 'id' | 'fecha_actualizacion'> & { id?: string }) => void;
  actualizarStockInsumo: (insumoId: string, nuevoStockGramos: number, nuevoCostoKg?: number) => void;
  eliminarInsumo: (insumoId: string) => { success: boolean; error?: string };

  // Productos CRUD
  guardarProducto: (producto: Omit<Producto, 'id' | 'fecha_creacion'> & { id?: string }) => void;
  eliminarProducto: (productoId: string) => { success: boolean; error?: string };

  // Gastos y Empleados CRUD
  guardarGastoFijo: (gasto: Omit<GastoFijo, 'id' | 'fecha_registro'> & { id?: string }) => void;
  eliminarGastoFijo: (gastoId: string) => void;
  guardarEmpleado: (empleado: Omit<Empleado, 'id'> & { id?: string }) => void;
  eliminarEmpleado: (empleadoId: string) => void;

  // Config & Reset
  actualizarConfig: (nuevaConfig: Partial<ConfiguracionPlanta>) => void;
  resetearDatosDemo: () => void;

  // Financial reporting
  obtenerReporteFinanciero: (periodo: 'dia' | 'semana' | 'mes' | 'todos') => ReporteFinanciero;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'fabricontrol_erp_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_insumos`);
      return saved ? JSON.parse(saved) : initialInsumos;
    } catch {
      return initialInsumos;
    }
  });

  const [productos, setProductos] = useState<Producto[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_productos`);
      return saved ? JSON.parse(saved) : initialProductos;
    } catch {
      return initialProductos;
    }
  });

  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gastos`);
      return saved ? JSON.parse(saved) : initialGastosFijos;
    } catch {
      return initialGastosFijos;
    }
  });

  const [empleados, setEmpleados] = useState<Empleado[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_empleados`);
      return saved ? JSON.parse(saved) : initialEmpleados;
    } catch {
      return initialEmpleados;
    }
  });

  const [producciones, setProducciones] = useState<OrdenProduccion[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_producciones`);
      return saved ? JSON.parse(saved) : initialProducciones;
    } catch {
      return initialProducciones;
    }
  });

  const [ventas, setVentas] = useState<VentaFactura[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ventas`);
      return saved ? JSON.parse(saved) : initialVentas;
    } catch {
      return initialVentas;
    }
  });

  const [clientes, setClientes] = useState<ClienteFacturacion[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clientes`);
      return saved ? JSON.parse(saved) : initialClientes;
    } catch {
      return initialClientes;
    }
  });

  const [config, setConfig] = useState<ConfiguracionPlanta>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_insumos`, JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_productos`, JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gastos`, JSON.stringify(gastosFijos));
  }, [gastosFijos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_empleados`, JSON.stringify(empleados));
  }, [empleados]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_producciones`, JSON.stringify(producciones));
  }, [producciones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ventas`, JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clientes`, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
  }, [config]);

  // Guardar o actualizar cliente en directorio
  const guardarCliente = (nuevoCliente: ClienteFacturacion) => {
    if (!nuevoCliente.nombre?.trim() || !nuevoCliente.nit_cedula?.trim()) return;
    setClientes((prev) => {
      const existe = prev.findIndex((c) => c.nit_cedula === nuevoCliente.nit_cedula || c.id === nuevoCliente.id);
      if (existe >= 0) {
        const actualizados = [...prev];
        actualizados[existe] = { ...actualizados[existe], ...nuevoCliente };
        return actualizados;
      }
      return [...prev, { ...nuevoCliente, id: nuevoCliente.id || `cli-${Date.now()}` }];
    });
  };

  // Calculations
  const calcularCostoMateriaPrimaPorKilo = (productoId: string): number => {
    const prod = productos.find((p) => p.id === productoId);
    if (!prod || !prod.receta) return 0;

    let costoTotalPorKilo = 0;
    for (const item of prod.receta) {
      const insumo = insumos.find((i) => i.id === item.insumo_id);
      if (insumo) {
        // costo_por_kilo es por cada 1000 gramos o 1 unidad
        const costoGramoOUnidad = insumo.costo_por_kilo / 1000;
        costoTotalPorKilo += item.gramos_por_kilo * costoGramoOUnidad;
      }
    }
    return Math.round(costoTotalPorKilo * 100) / 100;
  };

  const calcularTotalGastosFijosMensuales = (): number => {
    return gastosFijos.reduce((sum, g) => sum + g.monto_mensual, 0);
  };

  const calcularTotalNominaMensual = (): number => {
    return empleados
      .filter((e) => e.estado === 'Activo')
      .reduce((sum, e) => sum + e.salario_mensual + e.seguridad_social_prestaciones, 0);
  };

  const calcularCostoOperativoFijoPorKilo = (): number => {
    const totalFijo = calcularTotalGastosFijosMensuales() + calcularTotalNominaMensual();
    const capacidadKg = Math.max(1, config.capacidad_produccion_mensual_kg);
    return Math.round((totalFijo / capacidadKg) * 100) / 100;
  };

  const calcularCostoTotalPorKilo = (productoId: string): number => {
    const costoMP = calcularCostoMateriaPrimaPorKilo(productoId);
    const costoOperativo = calcularCostoOperativoFijoPorKilo();
    return Math.round((costoMP + costoOperativo) * 100) / 100;
  };

  const calcularPrecioSugerido = (productoId: string, margenPct?: number): number => {
    const prod = productos.find((p) => p.id === productoId);
    const margen = margenPct ?? (prod?.margen_objetivo_pct || config.margen_meta_default);
    const costoTotal = calcularCostoTotalPorKilo(productoId);
    
    if (margen >= 100) return costoTotal * 2;
    // Fórmula de margen sobre venta: Precio = Costo / (1 - Margen%)
    const divisor = 1 - margen / 100;
    return Math.round((costoTotal / divisor) / 100) * 100;
  };

  // Production validation
  const validarProduccion = (productoId: string, kilos: number): ResultadoValidacionProduccion => {
    if (kilos <= 0) {
      return {
        puedeProducir: false,
        requerimientos: [],
        faltantes: [],
        costoTotalEstimadoMateriaPrima: 0,
        costoPorKiloMateriaPrima: 0,
      };
    }

    const prod = productos.find((p) => p.id === productoId);
    if (!prod) {
      return {
        puedeProducir: false,
        requerimientos: [],
        faltantes: [],
        costoTotalEstimadoMateriaPrima: 0,
        costoPorKiloMateriaPrima: 0,
      };
    }

    const requerimientos: RequerimientoInsumoValidacion[] = [];
    const faltantes: RequerimientoInsumoValidacion[] = [];
    let costoTotalMP = 0;

    for (const ingrediente of prod.receta) {
      const insumo = insumos.find((i) => i.id === ingrediente.insumo_id);
      const totalRequerido = ingrediente.gramos_por_kilo * kilos;
      const disponible = insumo ? insumo.cantidad_stock_gramos : 0;
      const suficiente = disponible >= totalRequerido;
      const faltan = suficiente ? 0 : totalRequerido - disponible;

      const costoGramo = insumo ? insumo.costo_por_kilo / 1000 : 0;
      const costoEstimado = Math.round(totalRequerido * costoGramo);
      costoTotalMP += costoEstimado;

      const itemVal: RequerimientoInsumoValidacion = {
        insumo_id: ingrediente.insumo_id,
        nombre: ingrediente.insumo_nombre,
        unidad: insumo?.unidad_medida || 'g',
        requeridos_gramos: totalRequerido,
        disponibles_gramos: disponible,
        suficiente,
        faltan_gramos: faltan,
        costo_estimado: costoEstimado,
      };

      requerimientos.push(itemVal);
      if (!suficiente) {
        faltantes.push(itemVal);
      }
    }

    return {
      puedeProducir: faltantes.length === 0,
      requerimientos,
      faltantes,
      costoTotalEstimadoMateriaPrima: costoTotalMP,
      costoPorKiloMateriaPrima: Math.round(costoTotalMP / kilos),
    };
  };

  // Production execution
  const ejecutarProduccion = (
    productoId: string,
    kilos: number,
    responsable: string,
    observaciones?: string
  ): { success: boolean; mensaje: string; orden?: OrdenProduccion; error?: string } => {
    // 1. Anti-error: Non-positive kilos validation
    if (!kilos || kilos <= 0) {
      return {
        success: false,
        mensaje: 'Error de validación: La cantidad a producir debe ser un número positivo mayor a cero.',
        error: 'CANTIDAD_INVALIDA',
      };
    }

    const prod = productos.find((p) => p.id === productoId);
    if (!prod) {
      return {
        success: false,
        mensaje: 'Error: El producto seleccionado no existe en el catálogo.',
        error: 'PRODUCTO_NO_ENCONTRADO',
      };
    }

    if (!prod.receta || prod.receta.length === 0) {
      return {
        success: false,
        mensaje: `Error: El producto "${prod.nombre}" no tiene una receta configurada con insumos.`,
        error: 'RECETA_VACIA',
      };
    }

    // 2. Automated stock verification
    const validacion = validarProduccion(productoId, kilos);
    if (!validacion.puedeProducir) {
      const listaFaltantes = validacion.faltantes
        .map((f) => `• ${f.nombre}: necesitas ${(f.requeridos_gramos / 1000).toFixed(2)} kg, tienes ${(f.disponibles_gramos / 1000).toFixed(2)} kg (faltan ${(f.faltan_gramos / 1000).toFixed(2)} kg)`)
        .join('\n');
      return {
        success: false,
        mensaje: `¡PRODUCCIÓN DETENIDA POR FALTA DE INSUMOS!\nEl sistema verificó el inventario y detectó que no cuentas con los siguientes ingredientes:\n${listaFaltantes}\nPor favor abastece la bodega antes de iniciar este lote.`,
        error: 'STOCK_INSUMOS_INSUFICIENTE',
      };
    }

    // 3. Atomically discount raw materials & record order
    const insumosConsumidos: { insumo_id: string; insumo_nombre: string; gramos_requeridos: number; costo_total: number }[] = [];

    // Deduct stock from insumos
    setInsumos((prevInsumos) =>
      prevInsumos.map((insumo) => {
        const req = validacion.requerimientos.find((r) => r.insumo_id === insumo.id);
        if (req) {
          const nuevoStock = Math.max(0, insumo.cantidad_stock_gramos - req.requeridos_gramos);
          insumosConsumidos.push({
            insumo_id: insumo.id,
            insumo_nombre: insumo.nombre,
            gramos_requeridos: req.requeridos_gramos,
            costo_total: req.costo_estimado,
          });
          return {
            ...insumo,
            cantidad_stock_gramos: nuevoStock,
            fecha_actualizacion: new Date().toISOString(),
          };
        }
        return insumo;
      })
    );

    // Add produced kg to finished goods stock
    setProductos((prevProds) =>
      prevProds.map((p) => {
        if (p.id === productoId) {
          return {
            ...p,
            stock_disponible_kg: Math.round((p.stock_disponible_kg + kilos) * 100) / 100,
          };
        }
        return p;
      })
    );

    // Create production order log
    const nuevaOrden: OrdenProduccion = {
      id: `ord-${Date.now()}`,
      codigo_orden: `OP-${new Date().getFullYear()}-${String(producciones.length + 101).padStart(3, '0')}`,
      producto_id: prod.id,
      producto_nombre: prod.nombre,
      kilos_producidos: kilos,
      costo_materia_prima: validacion.costoTotalEstimadoMateriaPrima,
      costo_unitario_materia_prima: validacion.costoPorKiloMateriaPrima,
      insumos_consumidos: insumosConsumidos,
      responsable: responsable.trim() || 'Operario de Planta',
      fecha_produccion: new Date().toISOString(),
      observaciones: observaciones?.trim() || 'Producción procesada y validada correctamente por el sistema.',
    };

    setProducciones((prev) => [nuevaOrden, ...prev]);

    return {
      success: true,
      mensaje: `¡Lote producido con éxito! Se descontaron los insumos de bodega y se sumaron ${kilos} kg de "${prod.nombre}" listos para la venta.`,
      orden: nuevaOrden,
    };
  };

  // Sales validation
  const validarVenta = (productoId: string, kilos: number) => {
    const prod = productos.find((p) => p.id === productoId);
    if (!prod) return { puedeVender: false, stockDisponible: 0, faltanKilos: kilos };
    const puedeVender = prod.stock_disponible_kg >= kilos;
    return {
      puedeVender,
      stockDisponible: prod.stock_disponible_kg,
      faltanKilos: puedeVender ? 0 : Math.round((kilos - prod.stock_disponible_kg) * 100) / 100,
    };
  };

  // Sales execution
  const registrarVenta = (datos: {
    cliente: ClienteFacturacion;
    productoId: string;
    kilos: number;
    precioUnitario: number;
    metodoPago: MetodoPago;
    comisionPct: number;
    estadoPago: EstadoPago;
    notas?: string;
  }): { success: boolean; mensaje: string; venta?: VentaFactura; error?: string } => {
    // 1. Anti-error: Numbers must be strictly non-negative
    if (datos.kilos <= 0) {
      return { success: false, mensaje: 'La cantidad vendida debe ser mayor a 0 kg.', error: 'CANTIDAD_INVALIDA' };
    }
    if (datos.precioUnitario <= 0) {
      return { success: false, mensaje: 'El precio de venta unitario debe ser mayor a 0.', error: 'PRECIO_INVALIDO' };
    }
    if (datos.comisionPct < 0 || datos.comisionPct > 100) {
      return { success: false, mensaje: 'El porcentaje de comisión bancaria debe estar entre 0% y 100%.', error: 'COMISION_INVALIDA' };
    }

    // 2. Strict Enum check for EstadoPago
    if (datos.estadoPago !== 'Pagado' && datos.estadoPago !== 'Pendiente') {
      return { success: false, mensaje: 'Estado de pago inválido. Solo se permite "Pagado" o "Pendiente".', error: 'ESTADO_INVALIDO' };
    }

    // 3. Client information mandatory for electronic invoice readiness
    const { cliente } = datos;
    if (!cliente.nombre?.trim()) {
      return { success: false, mensaje: 'El nombre o razón social del comprador es obligatorio.', error: 'CLIENTE_INCOMPLETO' };
    }
    if (!cliente.nit_cedula?.trim()) {
      return { success: false, mensaje: 'El NIT o Cédula del comprador es obligatorio para la factura.', error: 'CLIENTE_INCOMPLETO' };
    }
    if (!cliente.celular?.trim()) {
      return { success: false, mensaje: 'El número de celular del comprador es obligatorio.', error: 'CLIENTE_INCOMPLETO' };
    }
    if (!cliente.direccion?.trim()) {
      return { success: false, mensaje: 'La dirección del comprador es obligatoria.', error: 'CLIENTE_INCOMPLETO' };
    }
    if (!cliente.email?.trim() || !cliente.email.includes('@')) {
      return { success: false, mensaje: 'Debes ingresar un correo electrónico válido para la factura electrónica.', error: 'CLIENTE_INCOMPLETO' };
    }

    // 4. Finished product stock validation
    const prod = productos.find((p) => p.id === datos.productoId);
    if (!prod) {
      return { success: false, mensaje: 'El producto seleccionado no existe.', error: 'PRODUCTO_NO_ENCONTRADO' };
    }

    if (prod.stock_disponible_kg < datos.kilos) {
      return {
        success: false,
        mensaje: `¡VENTA RECHAZADA POR FALTA DE STOCK!\nEl cliente solicita ${datos.kilos} kg de "${prod.nombre}", pero en bodega solo tienes ${prod.stock_disponible_kg} kg terminados.\nNo es posible vender lo que no existe. Programa un lote en Producción primero.`,
        error: 'STOCK_TERMINADO_INSUFICIENTE',
      };
    }

    // 5. Compute Financials
    const subtotalBruto = Math.round(datos.kilos * datos.precioUnitario);
    const montoComision = Math.round(subtotalBruto * (datos.comisionPct / 100));
    const totalNeto = subtotalBruto - montoComision;
    const costoMateriaPrimaKilo = calcularCostoMateriaPrimaPorKilo(prod.id);
    const costoTotalMateriaPrima = Math.round(costoMateriaPrimaKilo * datos.kilos);

    // 6. Deduct finished stock
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id === datos.productoId) {
          return {
            ...p,
            stock_disponible_kg: Math.round((p.stock_disponible_kg - datos.kilos) * 100) / 100,
          };
        }
        return p;
      })
    );

    // 7. Record Invoice
    const clienteGuardado: ClienteFacturacion = {
      id: cliente.id || `cli-${Date.now()}`,
      nombre: cliente.nombre.trim(),
      nit_cedula: cliente.nit_cedula.trim(),
      celular: cliente.celular.trim(),
      direccion: cliente.direccion.trim(),
      email: cliente.email.trim(),
      ciudad: cliente.ciudad?.trim() || 'Principal',
    };

    // Auto-upsert into customer directory for future autocompletion
    guardarCliente(clienteGuardado);

    const nuevaFactura: VentaFactura = {
      id: `vnt-${Date.now()}`,
      numero_factura: `FAC-${new Date().getFullYear()}-${String(ventas.length + 87).padStart(3, '0')}`,
      cliente: clienteGuardado,
      producto_id: prod.id,
      producto_nombre: prod.nombre,
      kilos_vendidos: datos.kilos,
      precio_unitario_kg: datos.precioUnitario,
      subtotal_bruto: subtotalBruto,
      metodo_pago: datos.metodoPago,
      comision_pct: datos.comisionPct,
      monto_comision: montoComision,
      total_neto_recibido: totalNeto,
      costo_materia_prima_estimado: costoTotalMateriaPrima,
      estado_pago: datos.estadoPago,
      fecha: new Date().toISOString(),
      notas: datos.notas?.trim(),
    };

    setVentas((prev) => [nuevaFactura, ...prev]);

    return {
      success: true,
      mensaje: `¡Factura ${nuevaFactura.numero_factura} emitida con éxito! Se descontaron ${datos.kilos} kg del inventario terminado.`,
      venta: nuevaFactura,
    };
  };

  const actualizarEstadoVenta = (ventaId: string, nuevoEstado: EstadoPago) => {
    if (nuevoEstado !== 'Pagado' && nuevoEstado !== 'Pendiente') return;
    setVentas((prev) =>
      prev.map((v) => (v.id === ventaId ? { ...v, estado_pago: nuevoEstado } : v))
    );
  };

  // Insumos CRUD
  const guardarInsumo = (insumoData: Omit<Insumo, 'id' | 'fecha_actualizacion'> & { id?: string }) => {
    // Non-negative checks
    if (insumoData.cantidad_stock_gramos < 0 || insumoData.costo_por_kilo < 0) {
      throw new Error('Las cantidades y costos de insumos no pueden ser negativos.');
    }

    if (insumoData.id) {
      // Edit
      setInsumos((prev) =>
        prev.map((item) =>
          item.id === insumoData.id
            ? {
                ...item,
                ...insumoData,
                fecha_actualizacion: new Date().toISOString(),
              }
            : item
        )
      );
    } else {
      // Create new
      const nuevo: Insumo = {
        ...insumoData,
        id: `ins-${Date.now()}`,
        codigo: insumoData.codigo || `INS-${String(insumos.length + 1).padStart(3, '0')}`,
        fecha_actualizacion: new Date().toISOString(),
      };
      setInsumos((prev) => [...prev, nuevo]);
    }
  };

  const actualizarStockInsumo = (insumoId: string, nuevoStockGramos: number, nuevoCostoKg?: number) => {
    if (nuevoStockGramos < 0) throw new Error('El stock no puede ser negativo');
    setInsumos((prev) =>
      prev.map((i) => {
        if (i.id === insumoId) {
          return {
            ...i,
            cantidad_stock_gramos: Math.max(0, nuevoStockGramos),
            ...(nuevoCostoKg !== undefined && nuevoCostoKg >= 0 ? { costo_por_kilo: nuevoCostoKg } : {}),
            fecha_actualizacion: new Date().toISOString(),
          };
        }
        return i;
      })
    );
  };

  const eliminarInsumo = (insumoId: string): { success: boolean; error?: string } => {
    // Check if used in any product recipe
    const usadoEn = productos.filter((p) => p.receta.some((r) => r.insumo_id === insumoId));
    if (usadoEn.length > 0) {
      return {
        success: false,
        error: `No puedes eliminar este insumo porque forma parte de la receta de: ${usadoEn.map((p) => p.nombre).join(', ')}. Modifica la receta primero.`,
      };
    }
    setInsumos((prev) => prev.filter((i) => i.id !== insumoId));
    return { success: true };
  };

  // Productos CRUD
  const guardarProducto = (prodData: Omit<Producto, 'id' | 'fecha_creacion'> & { id?: string }) => {
    if (prodData.stock_disponible_kg < 0 || prodData.precio_venta_actual < 0) {
      throw new Error('El stock disponible y el precio de venta no pueden ser negativos.');
    }

    if (prodData.id) {
      setProductos((prev) =>
        prev.map((p) => (p.id === prodData.id ? { ...p, ...prodData } : p))
      );
    } else {
      const nuevo: Producto = {
        ...prodData,
        id: `prod-${Date.now()}`,
        codigo: prodData.codigo || `PRD-${String(productos.length + 1).padStart(3, '0')}`,
        fecha_creacion: new Date().toISOString(),
      };
      setProductos((prev) => [...prev, nuevo]);
    }
  };

  const eliminarProducto = (productoId: string): { success: boolean; error?: string } => {
    const tieneVentas = ventas.some((v) => v.producto_id === productoId);
    if (tieneVentas) {
      return {
        success: false,
        error: 'No se puede eliminar un producto con historial de ventas registradas.',
      };
    }
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
    return { success: true };
  };

  // Gastos Fijos
  const guardarGastoFijo = (gastoData: Omit<GastoFijo, 'id' | 'fecha_registro'> & { id?: string }) => {
    if (gastoData.monto_mensual < 0) throw new Error('El monto del gasto no puede ser negativo.');
    if (gastoData.estado_pago !== 'Pagado' && gastoData.estado_pago !== 'Pendiente') {
      throw new Error('Estado de pago no válido.');
    }

    if (gastoData.id) {
      setGastosFijos((prev) =>
        prev.map((g) => (g.id === gastoData.id ? { ...g, ...gastoData } : g))
      );
    } else {
      const nuevo: GastoFijo = {
        ...gastoData,
        id: `gasto-${Date.now()}`,
        fecha_registro: new Date().toISOString(),
      };
      setGastosFijos((prev) => [...prev, nuevo]);
    }
  };

  const eliminarGastoFijo = (gastoId: string) => {
    setGastosFijos((prev) => prev.filter((g) => g.id !== gastoId));
  };

  // Empleados
  const guardarEmpleado = (empData: Omit<Empleado, 'id'> & { id?: string }) => {
    if (empData.salario_mensual < 0 || empData.seguridad_social_prestaciones < 0) {
      throw new Error('El salario y aportes no pueden ser negativos.');
    }
    if (empData.id) {
      setEmpleados((prev) =>
        prev.map((e) => (e.id === empData.id ? { ...e, ...empData } : e))
      );
    } else {
      const nuevo: Empleado = {
        ...empData,
        id: `emp-${Date.now()}`,
      };
      setEmpleados((prev) => [...prev, nuevo]);
    }
  };

  const eliminarEmpleado = (empleadoId: string) => {
    setEmpleados((prev) => prev.filter((e) => e.id !== empleadoId));
  };

  const actualizarConfig = (nuevaConfig: Partial<ConfiguracionPlanta>) => {
    if (nuevaConfig.capacidad_produccion_mensual_kg !== undefined && nuevaConfig.capacidad_produccion_mensual_kg <= 0) {
      throw new Error('La capacidad de producción mensual debe ser mayor a 0 kg.');
    }
    setConfig((prev) => ({ ...prev, ...nuevaConfig }));
  };

  const resetearDatosDemo = () => {
    setInsumos(initialInsumos);
    setProductos(initialProductos);
    setGastosFijos(initialGastosFijos);
    setEmpleados(initialEmpleados);
    setProducciones(initialProducciones);
    setVentas(initialVentas);
    setClientes(initialClientes);
    setConfig(initialConfig);
    localStorage.removeItem(`${STORAGE_KEY}_insumos`);
    localStorage.removeItem(`${STORAGE_KEY}_productos`);
    localStorage.removeItem(`${STORAGE_KEY}_gastos`);
    localStorage.removeItem(`${STORAGE_KEY}_empleados`);
    localStorage.removeItem(`${STORAGE_KEY}_producciones`);
    localStorage.removeItem(`${STORAGE_KEY}_ventas`);
    localStorage.removeItem(`${STORAGE_KEY}_clientes`);
    localStorage.removeItem(`${STORAGE_KEY}_config`);
  };

  // Financial reporting
  const obtenerReporteFinanciero = (periodo: 'dia' | 'semana' | 'mes' | 'todos'): ReporteFinanciero => {
    const ahora = new Date('2026-09-22T17:00:00Z'); // Consistent relative reference or dynamic
    let factorProrrateoDias = 30; // base mes = 30 días
    let label = 'Mes Actual (Septiembre 2026)';

    if (periodo === 'dia') {
      factorProrrateoDias = 1;
      label = 'Cierre Diario (Hoy)';
    } else if (periodo === 'semana') {
      factorProrrateoDias = 7;
      label = 'Últimos 7 Días (Semana)';
    } else if (periodo === 'mes') {
      factorProrrateoDias = 30;
      label = 'Mes Completo (30 Días)';
    } else {
      factorProrrateoDias = 30;
      label = 'Consolidado Histórico';
    }

    // Filter sales by date
    const ventasFiltradas = ventas.filter((v) => {
      if (periodo === 'todos') return true;
      const fechaVenta = new Date(v.fecha);
      const diffDias = (ahora.getTime() - fechaVenta.getTime()) / (1000 * 60 * 60 * 24);
      if (periodo === 'dia') return diffDias <= 1.5;
      if (periodo === 'semana') return diffDias <= 7.5;
      if (periodo === 'mes') return diffDias <= 31;
      return true;
    });

    const produccionesFiltradas = producciones.filter((p) => {
      if (periodo === 'todos') return true;
      const fechaProd = new Date(p.fecha_produccion);
      const diffDias = (ahora.getTime() - fechaProd.getTime()) / (1000 * 60 * 60 * 24);
      if (periodo === 'dia') return diffDias <= 1.5;
      if (periodo === 'semana') return diffDias <= 7.5;
      if (periodo === 'mes') return diffDias <= 31;
      return true;
    });

    const ventasBrutas = ventasFiltradas.reduce((sum, v) => sum + v.subtotal_bruto, 0);
    const comisionesBancarias = ventasFiltradas.reduce((sum, v) => sum + v.monto_comision, 0);
    const ventasNetas = ventasBrutas - comisionesBancarias;
    const costoMateriaPrima = ventasFiltradas.reduce((sum, v) => sum + v.costo_materia_prima_estimado, 0);
    const utilidadBruta = ventasNetas - costoMateriaPrima;

    // Prorate fixed costs: Monthly cost / 30 * days
    const totalGastosFijosMes = calcularTotalGastosFijosMensuales();
    const totalNominaMes = calcularTotalNominaMensual();

    const fraccion = factorProrrateoDias / 30;
    const gastosFijosProrrateados = Math.round(totalGastosFijosMes * fraccion);
    const nominaProrrateada = Math.round(totalNominaMes * fraccion);
    const totalGastosOperativos = gastosFijosProrrateados + nominaProrrateada;

    const utilidadNeta = utilidadBruta - totalGastosOperativos;
    const margenNetoPct = ventasBrutas > 0 ? Math.round((utilidadNeta / ventasBrutas) * 1000) / 10 : 0;

    const kilosVendidosTotales = ventasFiltradas.reduce((sum, v) => sum + v.kilos_vendidos, 0);
    const kilosProducidosTotales = produccionesFiltradas.reduce((sum, p) => sum + p.kilos_producidos, 0);

    const totalFacturasEmitidas = ventasFiltradas.length;
    const facturasPagadasMonto = ventasFiltradas
      .filter((v) => v.estado_pago === 'Pagado')
      .reduce((sum, v) => sum + v.total_neto_recibido, 0);
    const facturasPendientesMonto = ventasFiltradas
      .filter((v) => v.estado_pago === 'Pendiente')
      .reduce((sum, v) => sum + v.total_neto_recibido, 0);

    return {
      periodo,
      labelPeriodo: label,
      ventasBrutas,
      comisionesBancarias,
      ventasNetas,
      costoMateriaPrima,
      utilidadBruta,
      gastosFijosProrrateados,
      nominaProrrateada,
      totalGastosOperativos,
      utilidadNeta,
      margenNetoPct,
      kilosVendidosTotales,
      kilosProducidosTotales,
      totalFacturasEmitidas,
      facturasPagadasMonto,
      facturasPendientesMonto,
    };
  };

  return (
    <AppContext.Provider
      value={{
        insumos,
        productos,
        gastosFijos,
        empleados,
        producciones,
        ventas,
        clientes,
        config,
        guardarCliente,
        calcularCostoMateriaPrimaPorKilo,
        calcularTotalGastosFijosMensuales,
        calcularTotalNominaMensual,
        calcularCostoOperativoFijoPorKilo,
        calcularCostoTotalPorKilo,
        calcularPrecioSugerido,
        validarProduccion,
        ejecutarProduccion,
        validarVenta,
        registrarVenta,
        actualizarEstadoVenta,
        guardarInsumo,
        actualizarStockInsumo,
        eliminarInsumo,
        guardarProducto,
        eliminarProducto,
        guardarGastoFijo,
        eliminarGastoFijo,
        guardarEmpleado,
        eliminarEmpleado,
        actualizarConfig,
        resetearDatosDemo,
        obtenerReporteFinanciero,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
