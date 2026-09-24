import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Check, 
  Scale, 
  DollarSign, 
  Tag, 
  ChefHat, 
  X,
  Search,
  Image as ImageIcon,
  Sparkles,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Insumo, Producto, IngredienteReceta, UnidadMedidaInsumo } from '../types';
import { formatMoney, formatWeight } from '../utils/formatters';

// Preset artisan bakery photos
const PRESET_PRODUCT_IMAGES = [
  {
    nombre: 'Pan Campesino Dorado',
    url: '/src/assets/images/pan_campesino_1790122574934.jpg',
  },
  {
    nombre: 'Torta Esponjosa Vainilla',
    url: '/src/assets/images/torta_vainilla_1790122591613.jpg',
  },
  {
    nombre: 'Galletas de Mantequilla',
    url: '/src/assets/images/galletas_mantequilla_1790122604523.jpg',
  },
];

export const InventoryModule: React.FC = () => {
  const {
    insumos,
    productos,
    config,
    guardarInsumo,
    actualizarStockInsumo,
    eliminarInsumo,
    guardarProducto,
    eliminarProducto,
    calcularCostoMateriaPrimaPorKilo,
    calcularCostoOperativoFijoPorKilo,
    calcularCostoTotalPorKilo,
    calcularPrecioSugerido,
  } = useApp();

  const [subTab, setSubTab] = useState<'insumos' | 'productos'>('productos');
  const [busqueda, setBusqueda] = useState('');

  // Insumo modal
  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [insumoEdicion, setInsumoEdicion] = useState<Partial<Insumo> | null>(null);
  const [errorInsumo, setErrorInsumo] = useState<string | null>(null);

  // Product & Recipe modal
  const [productoModalOpen, setProductoModalOpen] = useState(false);
  const [productoEdicion, setProductoEdicion] = useState<{
    id?: string;
    codigo: string;
    nombre: string;
    categoria: string;
    descripcion: string;
    stock_disponible_kg: number;
    stock_minimo_kg: number;
    precio_venta_actual: number;
    margen_objetivo_pct: number;
    receta: IngredienteReceta[];
    imagen_url?: string;
  }>({
    codigo: '',
    nombre: '',
    categoria: 'Panadería',
    descripcion: '',
    stock_disponible_kg: 0,
    stock_minimo_kg: 10,
    precio_venta_actual: 15000,
    margen_objetivo_pct: 45,
    receta: [],
    imagen_url: '',
  });

  const [tieneImagen, setTieneImagen] = useState<boolean>(true);
  const [errorProducto, setErrorProducto] = useState<string | null>(null);

  // Filtered lists
  const insumosFiltrados = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Insumo Handlers
  const handleOpenNuevoInsumo = () => {
    setInsumoEdicion({
      codigo: `INS-${String(insumos.length + 1).padStart(3, '0')}`,
      nombre: '',
      categoria: 'Materia Prima',
      unidad_medida: 'kg',
      cantidad_stock_gramos: 10000,
      costo_por_kilo: 5000,
      stock_minimo_gramos: 5000,
      ultimo_proveedor: 'Proveedor Local',
    });
    setErrorInsumo(null);
    setInsumoModalOpen(true);
  };

  const handleOpenEditarInsumo = (insumo: Insumo) => {
    setInsumoEdicion({ ...insumo });
    setErrorInsumo(null);
    setInsumoModalOpen(true);
  };

  const handleGuardarInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoEdicion) return;

    if (!insumoEdicion.nombre?.trim()) {
      setErrorInsumo('El nombre del insumo es obligatorio.');
      return;
    }
    if ((insumoEdicion.cantidad_stock_gramos ?? 0) < 0) {
      setErrorInsumo('La cantidad de stock no puede ser un valor negativo.');
      return;
    }
    if ((insumoEdicion.costo_por_kilo ?? 0) < 0) {
      setErrorInsumo('El costo no puede ser negativo.');
      return;
    }

    try {
      guardarInsumo({
        id: insumoEdicion.id,
        codigo: insumoEdicion.codigo || `INS-${String(insumos.length + 1).padStart(3, '0')}`,
        nombre: insumoEdicion.nombre.trim(),
        categoria: insumoEdicion.categoria || 'General',
        unidad_medida: insumoEdicion.unidad_medida || 'kg',
        cantidad_stock_gramos: Number(insumoEdicion.cantidad_stock_gramos),
        costo_por_kilo: Number(insumoEdicion.costo_por_kilo),
        stock_minimo_gramos: Number(insumoEdicion.stock_minimo_gramos || 1000),
        ultimo_proveedor: insumoEdicion.ultimo_proveedor?.trim() || 'Proveedor Local',
      });
      setInsumoModalOpen(false);
    } catch (err: any) {
      setErrorInsumo(err.message || 'Error al guardar insumo');
    }
  };

  const handleEliminarInsumo = (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este insumo?')) return;
    const res = eliminarInsumo(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  // Product & Recipe Handlers
  const handleOpenNuevoProducto = () => {
    setProductoEdicion({
      codigo: `PRD-${String(productos.length + 1).padStart(3, '0')}`,
      nombre: '',
      categoria: 'Panadería',
      descripcion: '',
      stock_disponible_kg: 0,
      stock_minimo_kg: 10,
      precio_venta_actual: 18000,
      margen_objetivo_pct: 45,
      receta: insumos.length > 0 ? [{ insumo_id: insumos[0].id, insumo_nombre: insumos[0].nombre, gramos_por_kilo: 500 }] : [],
      imagen_url: PRESET_PRODUCT_IMAGES[0].url,
    });
    setTieneImagen(true);
    setErrorProducto(null);
    setProductoModalOpen(true);
  };

  const handleOpenEditarProducto = (prod: Producto) => {
    setProductoEdicion({
      id: prod.id,
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria,
      descripcion: prod.descripcion,
      stock_disponible_kg: prod.stock_disponible_kg,
      stock_minimo_kg: prod.stock_minimo_kg,
      precio_venta_actual: prod.precio_venta_actual,
      margen_objetivo_pct: prod.margen_objetivo_pct,
      receta: [...prod.receta],
      imagen_url: prod.imagen_url || '',
    });
    setTieneImagen(Boolean(prod.imagen_url));
    setErrorProducto(null);
    setProductoModalOpen(true);
  };

  const handleAgregarIngredienteAReceta = () => {
    if (insumos.length === 0) return;
    setProductoEdicion((prev) => ({
      ...prev,
      receta: [
        ...prev.receta,
        { insumo_id: insumos[0].id, insumo_nombre: insumos[0].nombre, gramos_por_kilo: 100 },
      ],
    }));
  };

  const handleRemoverIngredienteReceta = (index: number) => {
    setProductoEdicion((prev) => ({
      ...prev,
      receta: prev.receta.filter((_, idx) => idx !== index),
    }));
  };

  const handleIngredienteRecetaChange = (index: number, insumoId: string, gramos: number) => {
    const insumo = insumos.find((i) => i.id === insumoId);
    setProductoEdicion((prev) => {
      const nuevaReceta = [...prev.receta];
      nuevaReceta[index] = {
        insumo_id: insumoId,
        insumo_nombre: insumo?.nombre || 'Insumo',
        gramos_por_kilo: Math.max(0, gramos),
      };
      return { ...prev, receta: nuevaReceta };
    });
  };

  // Recipe cost calculation
  const costoRecetaEnEdicion = productoEdicion.receta.reduce((total, ing) => {
    const insumo = insumos.find((i) => i.id === ing.insumo_id);
    if (!insumo) return total;
    const costoGramo = insumo.costo_por_kilo / 1000;
    return total + ing.gramos_por_kilo * costoGramo;
  }, 0);

  const costoOperativoFijo = calcularCostoOperativoFijoPorKilo();
  const costoTotalEnEdicion = costoRecetaEnEdicion + costoOperativoFijo;
  const precioSugeridoEnEdicion = Math.round((costoTotalEnEdicion / (1 - productoEdicion.margen_objetivo_pct / 100)) / 100) * 100;

  const handleGuardarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEdicion.nombre.trim()) {
      setErrorProducto('El nombre del producto es obligatorio.');
      return;
    }
    if (productoEdicion.receta.length === 0) {
      setErrorProducto('Debes agregar al menos 1 insumo a la receta del producto.');
      return;
    }
    if (productoEdicion.stock_disponible_kg < 0 || productoEdicion.precio_venta_actual <= 0) {
      setErrorProducto('El stock no puede ser negativo y el precio debe ser mayor a 0.');
      return;
    }

    try {
      guardarProducto({
        id: productoEdicion.id,
        codigo: productoEdicion.codigo || `PRD-${String(productos.length + 1).padStart(3, '0')}`,
        nombre: productoEdicion.nombre.trim(),
        categoria: productoEdicion.categoria || 'General',
        descripcion: productoEdicion.descripcion.trim(),
        stock_disponible_kg: Number(productoEdicion.stock_disponible_kg),
        stock_minimo_kg: Number(productoEdicion.stock_minimo_kg || 5),
        precio_venta_actual: Number(productoEdicion.precio_venta_actual),
        margen_objetivo_pct: Number(productoEdicion.margen_objetivo_pct || 40),
        receta: productoEdicion.receta,
        imagen_url: tieneImagen && productoEdicion.imagen_url?.trim() ? productoEdicion.imagen_url.trim() : undefined,
      });
      setProductoModalOpen(false);
    } catch (err: any) {
      setErrorProducto(err.message || 'Error al guardar producto');
    }
  };

  const handleEliminarProducto = (id: string) => {
    if (!window.confirm('¿Deseas eliminar este producto del catálogo?')) return;
    const res = eliminarProducto(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar in Light Pastel */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">
                Bodega de Insumos & Catálogo de Productos con Fotos
              </h1>
              <p className="text-xs text-stone-500">
                Gestiona materias primas, costos y recetas en gramos/kilo. Asigna fotos a tus productos o déjalos sin imagen.
              </p>
            </div>
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs">
            <button
              onClick={() => setSubTab('productos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                subTab === 'productos'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold border border-stone-200/60'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-700" />
              <span>Catálogo & Recetas ({productos.length})</span>
            </button>
            <button
              onClick={() => setSubTab('insumos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                subTab === 'insumos'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold border border-stone-200/60'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Bodega de Insumos ({insumos.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar en ${subTab === 'insumos' ? 'insumos' : 'productos'}...`}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            {subTab === 'insumos' ? (
              <button
                onClick={handleOpenNuevoInsumo}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Insumo</span>
              </button>
            ) : (
              <button
                onClick={handleOpenNuevoProducto}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto con Receta</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUBTAB 1: PRODUCTOS & RECETAS WITH PHOTO SUPPORT */}
      {subTab === 'productos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {productosFiltrados.map((prod) => {
            const costoMP = calcularCostoMateriaPrimaPorKilo(prod.id);
            const costoFijo = calcularCostoOperativoFijoPorKilo();
            const costoTotal = calcularCostoTotalPorKilo(prod.id);
            const precioSugerido = calcularPrecioSugerido(prod.id, prod.margen_objetivo_pct);

            return (
              <div
                key={prod.id}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Product Image Header (If present) or Clean Pastel Placeholder */}
                  {prod.imagen_url ? (
                    <div className="relative h-40 w-full overflow-hidden bg-stone-100 border-b border-stone-200/80">
                      <img
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg text-3xs font-mono font-bold text-stone-700 shadow-2xs">
                        {prod.codigo}
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg text-3xs font-semibold text-stone-700 shadow-2xs">
                        {prod.categoria}
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 w-full bg-amber-50/70 border-b border-amber-100 flex items-center justify-between px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-white text-stone-600 font-bold border border-stone-200">
                            {prod.codigo}
                          </span>
                          <span className="text-3xs text-stone-500 ml-2 block">Sin foto asignada</span>
                        </div>
                      </div>
                      <span className="text-3xs px-2 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200 font-medium">
                        {prod.categoria}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-stone-900 text-base leading-snug">
                          {prod.nombre}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                          {prod.descripcion || 'Sin descripción adicional.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditarProducto(prod)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Editar producto, receta y foto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(prod.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stock & Selling Price in Soft Pastels */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                      <div>
                        <span className="text-stone-400 text-3xs font-medium">Stock en Bodega:</span>
                        <div className="font-bold text-stone-800 text-sm">
                          {prod.stock_disponible_kg} kg
                        </div>
                      </div>
                      <div>
                        <span className="text-stone-400 text-3xs font-medium">Precio Venta al Público:</span>
                        <div className="font-bold text-emerald-800 text-sm font-mono">
                          {formatMoney(prod.precio_venta_actual, config.moneda, config.simbolo_moneda)}/kg
                        </div>
                      </div>
                    </div>

                    {/* Recipe Formula in Grams per Kilo */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                        Receta ({prod.receta.length} ingredientes por 1 kg):
                      </span>
                      <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 text-xs space-y-1 max-h-32 overflow-y-auto">
                        {prod.receta.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center text-stone-600">
                            <span className="truncate pr-2">{ing.insumo_nombre}</span>
                            <span className="font-mono font-bold text-stone-800 shrink-0">
                              {ing.gramos_por_kilo} g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Analysis per 1 Kilo Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-2.5 border-t border-stone-100 text-xs space-y-1">
                    <div className="flex justify-between text-stone-500">
                      <span>Materia Prima (Insumos):</span>
                      <span className="font-mono font-medium">{formatMoney(costoMP)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Cuota Fijos + Nómina:</span>
                      <span className="font-mono font-medium">{formatMoney(costoFijo)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                      <span>Costo Real Total / Kilo:</span>
                      <span className="font-mono text-amber-800">{formatMoney(costoTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: BODEGA DE INSUMOS */}
      {subTab === 'insumos' && (
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Código / Insumo</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5 text-right">Existencia Actual</th>
                  <th className="p-3.5 text-right">Costo / Kilo o Unidad</th>
                  <th className="p-3.5 text-right">Stock Mínimo</th>
                  <th className="p-3.5">Proveedor</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {insumosFiltrados.map((ins) => {
                  const bajoStock = ins.cantidad_stock_gramos <= ins.stock_minimo_gramos;

                  return (
                    <tr key={ins.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-stone-500 text-3xs">
                          {ins.codigo}
                        </div>
                        <div className="font-bold text-stone-900 text-sm">
                          {ins.nombre}
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-3xs font-medium">
                          {ins.categoria}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold">
                        <span className={bajoStock ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200' : 'text-stone-800'}>
                          {formatWeight(ins.cantidad_stock_gramos)}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-stone-800">
                        {formatMoney(ins.costo_por_kilo, config.moneda, config.simbolo_moneda)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-stone-500">
                        {formatWeight(ins.stock_minimo_gramos)}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {ins.ultimo_proveedor}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditarInsumo(ins)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                            title="Editar insumo y costo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarInsumo(ins.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR PRODUCTO & RECETA WITH PHOTO TOGGLE */}
      {productoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-700" />
                {productoEdicion.id ? 'Editar Producto, Receta & Foto' : 'Crear Nuevo Producto con Receta & Foto'}
              </h3>
              <button
                onClick={() => setProductoModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarProducto} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={productoEdicion.codigo}
                    onChange={(e) => setProductoEdicion({ ...productoEdicion, codigo: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={productoEdicion.nombre}
                    onChange={(e) => setProductoEdicion({ ...productoEdicion, nombre: e.target.value })}
                    placeholder="Ej: Pan Tajado Especial"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={productoEdicion.categoria}
                    onChange={(e) => setProductoEdicion({ ...productoEdicion, categoria: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Actual (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={productoEdicion.stock_disponible_kg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setProductoEdicion({ ...productoEdicion, stock_disponible_kg: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Precio Venta ($/kg) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={productoEdicion.precio_venta_actual}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setProductoEdicion({ ...productoEdicion, precio_venta_actual: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* PRODUCT IMAGE SECTION: "Poder poner alguna imagen o no ponerla" */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-700" />
                    Fotografía del Producto
                  </span>

                  {/* Toggle button to include image or keep clean without image */}
                  <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-3xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTieneImagen(true);
                        if (!productoEdicion.imagen_url) {
                          setProductoEdicion((p) => ({ ...p, imagen_url: PRESET_PRODUCT_IMAGES[0].url }));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                        tieneImagen ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                      }`}
                    >
                      Con Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTieneImagen(false);
                        setProductoEdicion((p) => ({ ...p, imagen_url: '' }));
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                        !tieneImagen ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                      }`}
                    >
                      Sin Imagen
                    </button>
                  </div>
                </div>

                {tieneImagen && (
                  <div className="space-y-3 pt-1">
                    {/* Preset gallery selection */}
                    <div>
                      <span className="text-3xs text-stone-500 font-semibold block mb-1.5">
                        Selecciona una foto preset artesanal o ingresa tu URL:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProductoEdicion((p) => ({ ...p, imagen_url: preset.url }))}
                            className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                              productoEdicion.imagen_url === preset.url
                                ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                                : 'border-stone-200 bg-white hover:bg-stone-100'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.nombre}
                              className="w-full h-14 object-cover rounded-lg"
                            />
                            <span className="text-3xs font-medium text-stone-700 text-center truncate w-full">
                              {preset.nombre}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom URL Input */}
                    <div>
                      <label className="block text-3xs text-stone-500 mb-0.5">
                        O pega la URL directa de la imagen (Web / Host):
                      </label>
                      <input
                        type="url"
                        value={productoEdicion.imagen_url || ''}
                        onChange={(e) => setProductoEdicion({ ...productoEdicion, imagen_url: e.target.value })}
                        placeholder="https://ejemplo.com/foto-producto.jpg"
                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción del Producto</label>
                <input
                  type="text"
                  value={productoEdicion.descripcion}
                  onChange={(e) => setProductoEdicion({ ...productoEdicion, descripcion: e.target.value })}
                  placeholder="Ej: Pan rústico artesanal elaborado con masa madre..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              {/* RECIPE BUILDER SECTION */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-amber-700" />
                      Ingredientes de la Receta (Para 1 Kilo de Producto)
                    </h4>
                    <p className="text-3xs text-stone-500">
                      Define los gramos de cada insumo requeridos para producir 1 kg.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAgregarIngredienteAReceta}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-3xs cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Ingrediente</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {productoEdicion.receta.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <select
                        value={ing.insumo_id}
                        onChange={(e) => handleIngredienteRecetaChange(idx, e.target.value, ing.gramos_por_kilo)}
                        className="flex-1 bg-transparent border-0 text-xs font-semibold text-stone-800 focus:outline-none"
                      >
                        {insumos.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nombre} ({formatMoney(i.costo_por_kilo)}/kg)
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min="1"
                          step="5"
                          value={ing.gramos_por_kilo}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleIngredienteRecetaChange(idx, ing.insumo_id, isNaN(val) || val < 0 ? 0 : val);
                          }}
                          className="w-20 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-stone-900"
                        />
                        <span className="text-3xs text-stone-400 font-bold">g</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverIngredienteReceta(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live Real-time Cost Estimation */}
                <div className="pt-2 border-t border-amber-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-stone-500">Materia Prima: </span>
                    <strong className="text-stone-900 font-mono">{formatMoney(costoRecetaEnEdicion)}/kg</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">+ Cuota Fijos: </span>
                    <strong className="text-stone-700 font-mono">{formatMoney(costoOperativoFijo)}/kg</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">= Costo Real: </span>
                    <strong className="text-amber-800 font-mono font-bold">{formatMoney(costoTotalEnEdicion)}/kg</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Precio Sugerido: </span>
                    <strong className="text-emerald-800 font-mono font-bold">{formatMoney(precioSugeridoEnEdicion)}/kg</strong>
                  </div>
                </div>
              </div>

              {errorProducto && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorProducto}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setProductoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Producto & Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR INSUMO */}
      {insumoModalOpen && insumoEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
              <h3 className="font-bold text-stone-900 text-base">
                {insumoEdicion.id ? 'Editar Insumo de Bodega' : 'Registrar Nuevo Insumo'}
              </h3>
              <button
                onClick={() => setInsumoModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarInsumo} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={insumoEdicion.codigo || ''}
                    onChange={(e) => setInsumoEdicion({ ...insumoEdicion, codigo: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={insumoEdicion.categoria || ''}
                    onChange={(e) => setInsumoEdicion({ ...insumoEdicion, categoria: e.target.value })}
                    placeholder="Ej: Harinas, Grasas..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre del Insumo *</label>
                <input
                  type="text"
                  required
                  value={insumoEdicion.nombre || ''}
                  onChange={(e) => setInsumoEdicion({ ...insumoEdicion, nombre: e.target.value })}
                  placeholder="Ej: Azúcar Refinada"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Costo por Kilo ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={insumoEdicion.costo_por_kilo ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setInsumoEdicion({ ...insumoEdicion, costo_por_kilo: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stock en Gramos (o Unidades) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={insumoEdicion.cantidad_stock_gramos ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setInsumoEdicion({ ...insumoEdicion, cantidad_stock_gramos: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stock Mínimo Alerta (Gramos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={insumoEdicion.stock_minimo_gramos ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setInsumoEdicion({ ...insumoEdicion, stock_minimo_gramos: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Proveedor Habitual
                  </label>
                  <input
                    type="text"
                    value={insumoEdicion.ultimo_proveedor || ''}
                    onChange={(e) => setInsumoEdicion({ ...insumoEdicion, ultimo_proveedor: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              {errorInsumo && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorInsumo}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setInsumoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
