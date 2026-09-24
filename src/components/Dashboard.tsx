import React from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Scale,
  CreditCard,
  BarChart3,
  ChefHat
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, formatWeight } from '../utils/formatters';
import { ActiveTab } from './Header';

interface DashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    productos, 
    insumos, 
    config, 
    obtenerReporteFinanciero,
    calcularCostoMateriaPrimaPorKilo,
    calcularCostoOperativoFijoPorKilo,
    calcularCostoTotalPorKilo
  } = useApp();

  const reporteMes = obtenerReporteFinanciero('mes');

  // Insumos críticos (stock menor o igual al mínimo)
  const insumosCriticos = insumos.filter(
    (i) => i.cantidad_stock_gramos <= i.stock_minimo_gramos
  );

  const esRentable = reporteMes.utilidadNeta > 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero in Soft Pastel Amber & Stone */}
      <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-7 text-stone-900 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-3xs font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300/80">
                Control Operativo & Financiero en Tiempo Real
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Planta de Producción & Facturación
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Monitorea existencias de bodega, control de recetas en gramos, autocompletado de clientes en facturación y rentabilidad neta real libre de comisiones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('graficos')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-bold rounded-2xl text-xs transition-all shadow-2xs border border-stone-200 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-amber-700" />
              <span>Ver Gráficos</span>
            </button>
            <button
              onClick={() => onNavigate('produccion')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Producir Lote</span>
            </button>
            <button
              onClick={() => onNavigate('ventas')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Facturar Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts if any */}
      {insumosCriticos.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4.5 text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-amber-950">
                Alerta de Abastecimiento: {insumosCriticos.length} insumos en nivel crítico
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Los siguientes ingredientes están en o por debajo del stock mínimo. Esto podría detener tus próximas órdenes de producción:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {insumosCriticos.map((i) => (
                  <span
                    key={i.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-xs font-medium text-amber-900 shadow-2xs"
                  >
                    <span>{i.nombre}:</span>
                    <strong className="text-amber-950 font-bold">{formatWeight(i.cantidad_stock_gramos)}</strong>
                    <span className="text-amber-700 text-3xs">(Mín: {formatWeight(i.stock_minimo_gramos)})</span>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventario')}
              className="text-xs font-bold text-amber-900 hover:underline shrink-0 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300/80 cursor-pointer"
            >
              Ir a Bodega
            </button>
          </div>
        </div>
      )}

      {/* Financial Health Snapshot Cards in Soft Pastels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Netas */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Ventas Netas (Mes)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-stone-900">
            {formatMoney(reporteMes.ventasNetas, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-3xs text-stone-500">
            <span>{reporteMes.kilosVendidosTotales} kg despachados</span>
            <span>·</span>
            <span>Comisiones: {formatMoney(reporteMes.comisionesBancarias, config.moneda, config.simbolo_moneda)}</span>
          </div>
        </div>

        {/* Card 2: Costo Materia Prima (COGS) */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Insumos Consumidos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-stone-900">
            {formatMoney(reporteMes.costoMateriaPrima, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-3xs text-stone-500">
            <span>Margen Bruto: </span>
            <strong className="text-amber-800 font-bold">
              {formatMoney(reporteMes.utilidadBruta, config.moneda, config.simbolo_moneda)}
            </strong>
          </div>
        </div>

        {/* Card 3: Gastos Operativos (Fijos + Nómina) */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Fijos + Nómina (Mes)</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-stone-900">
            {formatMoney(reporteMes.totalGastosOperativos, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-3xs text-stone-500">
            <span>Recibos: {formatMoney(reporteMes.gastosFijosProrrateados, config.moneda, config.simbolo_moneda)}</span>
            <span>·</span>
            <span>Nómina: {formatMoney(reporteMes.nominaProrrateada, config.moneda, config.simbolo_moneda)}</span>
          </div>
        </div>

        {/* Card 4: Utilidad Neta Real */}
        <div className={`bg-white border rounded-2xl p-4.5 shadow-xs ${
          esRentable 
            ? 'border-emerald-200 bg-emerald-50/20' 
            : 'border-rose-200 bg-rose-50/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Utilidad Neta Real</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              esRentable 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {esRentable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className={`mt-2 font-mono text-2xl font-bold ${
            esRentable ? 'text-emerald-800' : 'text-rose-800'
          }`}>
            {formatMoney(reporteMes.utilidadNeta, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-stone-500 text-3xs">Margen Real: {reporteMes.margenNetoPct}%</span>
            <span className={`font-bold text-3xs px-2 py-0.5 rounded-full ${
              esRentable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {esRentable ? 'Ganando Plata' : 'Alerta Pérdida'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Products with Photos vs Ingredients in Warehouse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Finished Goods Catalog with Images & Stock */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700" />
                Catálogo de Productos: Stock Disponible para Venta
              </h2>
              <p className="text-xs text-stone-500">
                Kilos listos en bodega con receta y foto asignada
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventario')}
              className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Catálogo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {productos.map((prod) => {
              const costoMP = calcularCostoMateriaPrimaPorKilo(prod.id);
              const costoFijo = calcularCostoOperativoFijoPorKilo();
              const costoTotal = calcularCostoTotalPorKilo(prod.id);
              const margenEstimado = prod.precio_venta_actual > 0 
                ? Math.round(((prod.precio_venta_actual - costoTotal) / prod.precio_venta_actual) * 100) 
                : 0;
              const porcentajeStock = Math.min(100, Math.round((prod.stock_disponible_kg / (prod.stock_minimo_kg * 3)) * 100));

              return (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail Image or Pastel Icon */}
                    {prod.imagen_url ? (
                      <img
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold shrink-0">
                        <ChefHat className="w-6 h-6 text-amber-700" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {prod.nombre}
                          </span>
                          <span className="text-3xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono font-bold">
                            {prod.codigo}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold font-mono text-stone-900">
                            {prod.stock_disponible_kg} kg
                          </span>
                          <span className="text-3xs text-stone-400 block">listos en bodega</span>
                        </div>
                      </div>

                      {/* Stock Bar */}
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              prod.stock_disponible_kg <= prod.stock_minimo_kg
                                ? 'bg-rose-400'
                                : prod.stock_disponible_kg <= prod.stock_minimo_kg * 1.5
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.max(6, porcentajeStock)}%` }}
                          />
                        </div>
                      </div>

                      {/* Unit Price & Margin */}
                      <div className="mt-2 flex items-center justify-between text-3xs text-stone-500">
                        <span>
                          Venta: <strong className="text-stone-800 font-mono">{formatMoney(prod.precio_venta_actual)}/kg</strong> (Costo: {formatMoney(costoTotal)})
                        </span>
                        <span className={`font-bold ${margenEstimado >= 35 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          Margen: {margenEstimado}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Raw Materials Warehouse Status */}
        <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-700" />
                Bodega de Insumos (Ingredientes)
              </h2>
              <p className="text-xs text-stone-500">
                Existencias para formular recetas de producción
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventario')}
              className="text-xs text-sky-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Gestionar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto pr-1">
            {insumos.map((insumo) => {
              const estaBajo = insumo.cantidad_stock_gramos <= insumo.stock_minimo_gramos;

              return (
                <div key={insumo.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-stone-900 truncate">
                        {insumo.nombre}
                      </span>
                      {estaBajo && (
                        <span className="text-3xs px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          Bajo
                        </span>
                      )}
                    </div>
                    <span className="text-3xs text-stone-500">
                      Costo: {formatMoney(insumo.costo_por_kilo, config.moneda, config.simbolo_moneda)}/kg · {insumo.categoria}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold font-mono ${
                      estaBajo ? 'text-rose-700' : 'text-stone-800'
                    }`}>
                      {formatWeight(insumo.cantidad_stock_gramos)}
                    </span>
                    <div className="text-3xs text-stone-400">
                      Mín: {formatWeight(insumo.stock_minimo_gramos)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 bg-stone-50/80 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Validación automática antes de producir</span>
            </div>
            <button
              onClick={() => onNavigate('produccion')}
              className="text-amber-800 font-bold hover:underline cursor-pointer"
            >
              Verificar Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
