import React, { useState } from 'react';
import { 
  Factory, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Scale, 
  DollarSign, 
  ShoppingCart, 
  Copy, 
  Check, 
  History,
  Info,
  ChefHat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatMoney, formatWeight, formatDate } from '../utils/formatters';

export const ProductionModule: React.FC = () => {
  const {
    productos,
    insumos,
    producciones,
    config,
    validarProduccion,
    ejecutarProduccion,
    calcularCostoMateriaPrimaPorKilo,
  } = useApp();

  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>(
    productos[0]?.id || ''
  );
  const [kilosInput, setKilosInput] = useState<number>(10);
  const [responsableInput, setResponsableInput] = useState<string>('Carlos Mario (Jefe de Planta)');
  const [observacionesInput, setObservacionesInput] = useState<string>('');
  
  const [mensajeResultado, setMensajeResultado] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);

  const [copiadoLista, setCopiadoLista] = useState(false);

  const productoActual = productos.find((p) => p.id === productoSeleccionadoId);
  const validacion = validarProduccion(productoSeleccionadoId, kilosInput);

  const handleKilosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      setKilosInput(0);
    } else if (val < 0) {
      setKilosInput(0);
    } else {
      setKilosInput(val);
    }
    setMensajeResultado(null);
  };

  const handleEjecutarProduccion = () => {
    setMensajeResultado(null);

    if (kilosInput <= 0) {
      setMensajeResultado({
        tipo: 'error',
        texto: 'Por favor ingresa una cantidad de kilos mayor a 0.',
      });
      return;
    }

    const res = ejecutarProduccion(
      productoSeleccionadoId,
      kilosInput,
      responsableInput,
      observacionesInput
    );

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setMensajeResultado({
        tipo: 'success',
        texto: res.mensaje,
      });
      setObservacionesInput('');
    } else {
      setMensajeResultado({
        tipo: 'error',
        texto: res.mensaje,
      });
    }
  };

  const copiarListaFaltantes = () => {
    if (!validacion.faltantes.length) return;
    const texto = `LISTA DE COMPRAS - FALTANTES PARA PRODUCCIÓN (${kilosInput} kg de ${productoActual?.nombre}):\n` +
      validacion.faltantes
        .map(
          (f) =>
            `• ${f.nombre}: Se requieren ${(f.requeridos_gramos / 1000).toFixed(2)} kg | Faltan ${(f.faltan_gramos / 1000).toFixed(2)} kg`
        )
        .join('\n');

    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoLista(true);
      setTimeout(() => setCopiadoLista(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Description in Light Pastel */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">
                Módulo de Producción & Verificación de Recetas
              </h1>
              <p className="text-xs text-stone-500">
                El sistema inspecciona tu inventario automáticamente antes de autorizar la orden de horneado o preparación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Regla anti-errores: Insumos descontados y kilos sumados a bodega al instante.</span>
          </div>
        </div>
      </div>

      {/* Main Production Launch Form & Recipe Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls with Product Thumbnail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Scale className="w-4 h-4 text-amber-700" />
              1. Parámetros del Lote
            </h2>

            {/* Select Product with thumbnail preview */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Selecciona el Producto a Elaborar
              </label>

              <div className="flex items-center gap-2 mb-2">
                {productoActual?.imagen_url ? (
                  <img
                    src={productoActual.imagen_url}
                    alt={productoActual.nombre}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <ChefHat className="w-5 h-5 text-amber-700" />
                  </div>
                )}

                <select
                  value={productoSeleccionadoId}
                  onChange={(e) => {
                    setProductoSeleccionadoId(e.target.value);
                    setMensajeResultado(null);
                  }}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre} (Stock: {prod.stock_disponible_kg} kg)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kilos to Produce with Anti-negative validation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Kilos a Producir (kg)
                </label>
                <span className="text-3xs text-amber-700 font-semibold">
                  *Solo números positivos
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={kilosInput || ''}
                  onChange={handleKilosChange}
                  placeholder="Ej: 20"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-base font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300 pr-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  KG
                </span>
              </div>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Responsable de Producción
              </label>
              <input
                type="text"
                value={responsableInput}
                onChange={(e) => setResponsableInput(e.target.value)}
                placeholder="Nombre del operario"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notas / Observaciones del Lote (Opcional)
              </label>
              <textarea
                rows={2}
                value={observacionesInput}
                onChange={(e) => setObservacionesInput(e.target.value)}
                placeholder="Ej: Fermentación de 12 horas, lote para clientes mayoristas..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Summary Box */}
            {productoActual && (
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Stock actual en bodega:</span>
                  <strong className="text-stone-900 font-mono">{productoActual.stock_disponible_kg} kg</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Stock resultante tras producir:</span>
                  <strong className="text-emerald-700 font-bold font-mono">
                    {(productoActual.stock_disponible_kg + (kilosInput > 0 ? kilosInput : 0)).toFixed(1)} kg
                  </strong>
                </div>
                <div className="flex justify-between text-stone-600 pt-1.5 border-t border-stone-200">
                  <span>Costo Materia Prima del lote:</span>
                  <strong className="text-stone-900 font-mono">
                    {formatMoney(validacion.costoTotalEstimadoMateriaPrima, config.moneda, config.simbolo_moneda)}
                  </strong>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-2">
              {validacion.puedeProducir && kilosInput > 0 ? (
                <button
                  type="button"
                  onClick={handleEjecutarProduccion}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Producir {kilosInput} kg de {productoActual?.nombre}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 px-4 bg-stone-200 text-stone-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                  <span>Producción Bloqueada: Faltan Insumos</span>
                </button>
              )}
            </div>

            {/* Notification alert message */}
            {mensajeResultado && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium whitespace-pre-line ${
                  mensajeResultado.tipo === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mensajeResultado.texto}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Recipe & Ingredient Stock Checker */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  2. Verificación de Receta en Tiempo Real ({productoActual?.nombre})
                </h2>
                <p className="text-xs text-stone-500">
                  El sistema evalúa cada gramo requerido para {kilosInput} kg de producción contra el inventario real en bodega.
                </p>
              </div>

              {/* Status Indicator */}
              <div>
                {validacion.puedeProducir && kilosInput > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Inventario Completo (100%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold">
                    <XCircle className="w-4 h-4" />
                    Faltan {validacion.faltantes.length} Insumos
                  </span>
                )}
              </div>
            </div>

            {/* Alert if halted */}
            {!validacion.puedeProducir && validacion.faltantes.length > 0 && (
              <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-rose-900">
                        ¡Alto! Producción detenida automáticamente por falta de stock
                      </h3>
                      <p className="text-xs mt-1 text-rose-700 leading-relaxed">
                        No puedes iniciar este lote porque agotarías tus ingredientes. El sistema frenó la orden para evitar descuadres en bodega. 
                        Compra los insumos faltantes antes de producir.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={copiarListaFaltantes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    {copiadoLista ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiadoLista ? '¡Copiado!' : 'Copiar para Compras'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ingredients Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                    <th className="p-2.5">Ingrediente</th>
                    <th className="p-2.5 text-right">Por Kilo</th>
                    <th className="p-2.5 text-right">Requerido ({kilosInput} kg)</th>
                    <th className="p-2.5 text-right">Stock en Bodega</th>
                    <th className="p-2.5 text-right">Estado / Faltante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {validacion.requerimientos.map((req) => {
                    const insumoOrig = insumos.find((i) => i.id === req.insumo_id);
                    return (
                      <tr
                        key={req.insumo_id}
                        className={`hover:bg-stone-50 transition-colors ${
                          !req.suficiente ? 'bg-rose-50/60' : ''
                        }`}
                      >
                        <td className="p-2.5 font-medium text-stone-900">
                          <div>{req.nombre}</div>
                          <span className="text-3xs text-stone-400">
                            Costo: {formatMoney(insumoOrig?.costo_por_kilo || 0, config.moneda, config.simbolo_moneda)}/kg
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-stone-600">
                          {productoActual?.receta.find((r) => r.insumo_id === req.insumo_id)?.gramos_por_kilo || 0} g
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                          {formatWeight(req.requeridos_gramos)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-stone-600">
                          {formatWeight(req.disponibles_gramos)}
                        </td>
                        <td className="p-2.5 text-right">
                          {req.suficiente ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-3xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Disponible</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 text-3xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Faltan {formatWeight(req.faltan_gramos)}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Production History */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-stone-400" />
              Historial de Órdenes de Producción Completadas
            </h3>

            <div className="space-y-2.5">
              {producciones.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">
                        {ord.codigo_orden}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="font-semibold text-stone-800">
                        {ord.producto_nombre}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-3xs border border-emerald-200">
                        +{ord.kilos_producidos} kg
                      </span>
                    </div>
                    <div className="text-stone-500 mt-1 flex items-center gap-2 text-3xs">
                      <span>Responsable: {ord.responsable}</span>
                      <span>·</span>
                      <span>{formatDate(ord.fecha_produccion)}</span>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <div className="font-bold text-stone-900 font-mono">
                      Costo MP: {formatMoney(ord.costo_materia_prima, config.moneda, config.simbolo_moneda)}
                    </div>
                    <div className="text-3xs text-stone-400">
                      ({formatMoney(ord.costo_unitario_materia_prima)}/kg)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
