import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Layers, 
  DollarSign, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, formatWeight } from '../utils/formatters';

export const VisualCharts: React.FC = () => {
  const { 
    productos, 
    ventas, 
    insumos, 
    config, 
    obtenerReporteFinanciero,
    calcularCostoMateriaPrimaPorKilo,
    calcularCostoOperativoFijoPorKilo
  } = useApp();

  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'todos'>('mes');
  const reporte = obtenerReporteFinanciero(periodo);

  // Sales per product aggregation
  const ventasPorProducto = productos.map((prod) => {
    const ventasProd = ventas.filter((v) => v.producto_id === prod.id);
    const kilosTotal = ventasProd.reduce((sum, v) => sum + v.kilos_vendidos, 0);
    const totalIngresos = ventasProd.reduce((sum, v) => sum + v.subtotal_bruto, 0);
    const totalNeto = ventasProd.reduce((sum, v) => sum + v.total_neto_recibido, 0);
    const costoMP = ventasProd.reduce((sum, v) => sum + v.costo_materia_prima_estimado, 0);
    const margenBruto = totalNeto - costoMP;

    return {
      id: prod.id,
      nombre: prod.nombre,
      categoria: prod.categoria,
      imagen_url: prod.imagen_url,
      kilosTotal,
      totalIngresos,
      totalNeto,
      costoMP,
      margenBruto,
      margenPct: totalIngresos > 0 ? Math.round((margenBruto / totalIngresos) * 100) : 0,
    };
  });

  const maxIngreso = Math.max(...ventasPorProducto.map((p) => p.totalIngresos), 100000);

  // Waterfall Steps for P&L
  const waterfallSteps = [
    { label: 'Ventas Brutas', valor: reporte.ventasBrutas, tipo: 'positivo', color: 'bg-emerald-200 text-emerald-900 border-emerald-300' },
    { label: 'Comisiones Banco', valor: -reporte.comisionesBancarias, tipo: 'negativo', color: 'bg-rose-200 text-rose-900 border-rose-300' },
    { label: 'Materia Prima (COGS)', valor: -reporte.costoMateriaPrima, tipo: 'negativo', color: 'bg-amber-200 text-amber-900 border-amber-300' },
    { label: 'Recibos y Arriendo', valor: -reporte.gastosFijosProrrateados, tipo: 'negativo', color: 'bg-indigo-200 text-indigo-900 border-indigo-300' },
    { label: 'Nómina y Aportes', valor: -reporte.nominaProrrateada, tipo: 'negativo', color: 'bg-sky-200 text-sky-900 border-sky-300' },
    { 
      label: 'Utilidad Neta Real', 
      valor: reporte.utilidadNeta, 
      tipo: reporte.utilidadNeta >= 0 ? 'total-positivo' : 'total-negativo',
      color: reporte.utilidadNeta >= 0 ? 'bg-teal-200 text-teal-900 border-teal-300 font-bold' : 'bg-red-300 text-red-950 border-red-400 font-bold'
    },
  ];

  const maxWaterfallVal = Math.max(reporte.ventasBrutas, 1);
  const cuotaFijaPorKilo = calcularCostoOperativoFijoPorKilo();

  return (
    <div className="space-y-6">
      {/* Header with Period Tabs */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">
              Métricas & Gráficos Visuales de Producción y Rentabilidad
            </h1>
            <p className="text-xs text-stone-500">
              Análisis visual de ventas, cascada de costos (P&L), absorción unitaria y niveles de inventario.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
          {(['dia', 'semana', 'mes', 'todos'] as const).map((p) => {
            const labels = { dia: 'Hoy', semana: '7 Días', mes: 'Mes', todos: 'Histórico' };
            return (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  periodo === p
                    ? 'bg-white text-stone-800 shadow-xs font-bold border border-stone-200/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP METRIC CARDS in Soft Pastels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Netas */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Ventas Netas ({periodo})</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-2">
            {formatMoney(reporte.ventasNetas, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="text-3xs text-emerald-700 mt-1">
            Bruto: {formatMoney(reporte.ventasBrutas)} (Comisión: -{formatMoney(reporte.comisionesBancarias)})
          </div>
        </div>

        {/* Card 2: Costo Materia Prima (COGS) */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Materia Prima Usada</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-2">
            {formatMoney(reporte.costoMateriaPrima, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="text-3xs text-amber-700 mt-1">
            En {reporte.kilosVendidosTotales} kg despachados al cliente
          </div>
        </div>

        {/* Card 3: Gastos Operativos Prorrateados */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Fijos + Nómina ({periodo})</span>
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-sky-900 mt-2">
            {formatMoney(reporte.totalGastosOperativos, config.moneda, config.simbolo_moneda)}
          </div>
          <div className="text-3xs text-sky-700 mt-1">
            Recibos: {formatMoney(reporte.gastosFijosProrrateados)} · Nómina: {formatMoney(reporte.nominaProrrateada)}
          </div>
        </div>

        {/* Card 4: Utilidad Neta Real */}
        <div className={`${reporte.utilidadNeta >= 0 ? 'bg-teal-50/80 border-teal-200/80' : 'bg-rose-50/80 border-rose-200/80'} border rounded-2xl p-4.5 shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${reporte.utilidadNeta >= 0 ? 'text-teal-800' : 'text-rose-800'}`}>
              Utilidad Neta Real
            </span>
            <span className={`p-1.5 rounded-lg ${reporte.utilidadNeta >= 0 ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
              {reporte.utilidadNeta >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono mt-2 ${reporte.utilidadNeta >= 0 ? 'text-teal-900' : 'text-rose-900'}`}>
            {formatMoney(reporte.utilidadNeta, config.moneda, config.simbolo_moneda)}
          </div>
          <div className={`text-3xs font-semibold mt-1 ${reporte.utilidadNeta >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
            Margen Neto: {reporte.margenNetoPct}% {reporte.utilidadNeta >= 0 ? '(Ganando plata)' : '(Alerta pérdida)'}
          </div>
        </div>
      </div>

      {/* 2 MAIN VISUAL CHARTS: WATERFALL P&L + SALES PER PRODUCT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: CASCADA VISUAL DE COSTOS Y UTILIDAD (WATERFALL P&L) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Gráfico de Cascada: Del Ingreso Bruto a la Ganancia Neta
              </h3>
              <p className="text-xs text-stone-500">
                Visualización paso a paso de cómo se descuenta cada rubro ({reporte.labelPeriodo})
              </p>
            </div>
            <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              P&L Visual
            </span>
          </div>

          {/* Visual Bars Container */}
          <div className="space-y-3 pt-1">
            {waterfallSteps.map((step, idx) => {
              const absVal = Math.abs(step.valor);
              const pct = Math.min(100, Math.round((absVal / maxWaterfallVal) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-stone-700 flex items-center gap-1.5">
                      {step.tipo === 'positivo' && <span className="text-emerald-600 font-bold">+</span>}
                      {step.tipo === 'negativo' && <span className="text-rose-500 font-bold">-</span>}
                      {step.tipo.startsWith('total') && <span className="text-teal-700 font-bold">=</span>}
                      {step.label}
                    </span>
                    <span className="font-mono font-bold text-stone-800">
                      {step.valor < 0 ? `-${formatMoney(absVal)}` : formatMoney(absVal)}
                    </span>
                  </div>

                  {/* Pastel Bar */}
                  <div className="h-6 w-full bg-stone-100 rounded-lg overflow-hidden flex items-center p-0.5">
                    <div
                      className={`h-full rounded-md transition-all duration-500 flex items-center px-2 text-3xs font-bold ${step.color}`}
                      style={{ width: `${Math.max(6, pct)}%` }}
                    >
                      {pct > 15 && `${pct}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-3xs text-stone-500">
            <span>* Los recibos y la nómina están prorrateados según el periodo seleccionado.</span>
            <span className="font-medium text-stone-600">Base mensual: {config.capacidad_produccion_mensual_kg} kg</span>
          </div>
        </div>

        {/* CHART 2: DISTRIBUCIÓN DE VENTAS POR PRODUCTO */}
        <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-600" />
                Ventas y Margen por Producto
              </h3>
              <p className="text-xs text-stone-500">
                Comparativa de ingresos y margen bruto generado
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {ventasPorProducto.map((item) => {
              const anchoPct = Math.min(100, Math.round((item.totalIngresos / maxIngreso) * 100));

              return (
                <div key={item.id} className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {item.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs text-stone-800">{item.nombre}</div>
                        <div className="text-3xs text-stone-500">{item.kilosTotal} kg vendidos</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs font-mono text-stone-800">
                        {formatMoney(item.totalIngresos)}
                      </div>
                      <div className="text-3xs font-semibold text-emerald-700">
                        Margen: {formatMoney(item.margenBruto)} ({item.margenPct}%)
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar: Gross Sales vs Raw Material Cost */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-stone-200/60 rounded-full overflow-hidden flex">
                      {/* Margen Bruto portion (Pastel Green) */}
                      <div
                        className="bg-emerald-300 h-full rounded-l-full"
                        style={{ width: `${Math.max(0, item.margenPct)}%` }}
                        title={`Margen Bruto: ${item.margenPct}%`}
                      />
                      {/* Costo MP portion (Pastel Amber) */}
                      <div
                        className="bg-amber-300 h-full rounded-r-full"
                        style={{ width: `${Math.max(0, 100 - item.margenPct)}%` }}
                        title={`Materia Prima: ${100 - item.margenPct}%`}
                      />
                    </div>

                    <div className="flex justify-between text-3xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />
                        Ganancia bruta
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />
                        Insumos consumidos
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHART 3 & 4: UNIT COST STRUCTURE + INGREDIENT WAREHOUSE GAUGES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 3: ESTRUCTURA UNITARIA DE COSTOS ($ / KG) */}
        <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-600" />
                Estructura de Costeo Unitario por Kilo ($/kg)
              </h3>
              <p className="text-xs text-stone-500">
                Desglose: Materia Prima + Absorción de Recibos/Nómina + Margen
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {productos.map((prod) => {
              const costoMP = calcularCostoMateriaPrimaPorKilo(prod.id);
              const costoTotal = costoMP + cuotaFijaPorKilo;
              const gananciaUnitaria = Math.max(0, prod.precio_venta_actual - costoTotal);

              const pctMP = Math.round((costoMP / prod.precio_venta_actual) * 100);
              const pctFijo = Math.round((cuotaFijaPorKilo / prod.precio_venta_actual) * 100);
              const pctGanancia = Math.max(0, 100 - pctMP - pctFijo);

              return (
                <div key={prod.id} className="p-3 rounded-xl bg-stone-50/60 border border-stone-200/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-800">{prod.nombre}</span>
                    <span className="font-mono font-bold text-stone-800">
                      {formatMoney(prod.precio_venta_actual)}/kg
                    </span>
                  </div>

                  {/* Multi-segment pastel progress bar */}
                  <div className="h-4 w-full bg-stone-200/50 rounded-lg overflow-hidden flex text-3xs font-bold text-stone-700">
                    <div
                      className="bg-amber-200 flex items-center justify-center border-r border-white/60"
                      style={{ width: `${pctMP}%` }}
                      title={`Insumos: ${formatMoney(costoMP)} (${pctMP}%)`}
                    >
                      {pctMP > 15 && `${pctMP}%`}
                    </div>
                    <div
                      className="bg-sky-200 flex items-center justify-center border-r border-white/60"
                      style={{ width: `${pctFijo}%` }}
                      title={`Fijos y Nómina: ${formatMoney(cuotaFijaPorKilo)} (${pctFijo}%)`}
                    >
                      {pctFijo > 15 && `${pctFijo}%`}
                    </div>
                    <div
                      className="bg-emerald-200 flex items-center justify-center"
                      style={{ width: `${pctGanancia}%` }}
                      title={`Ganancia neta: ${formatMoney(gananciaUnitaria)} (${pctGanancia}%)`}
                    >
                      {pctGanancia > 15 && `${pctGanancia}%`}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-3xs pt-0.5">
                    <div className="text-amber-800">
                      <span className="font-semibold block">Insumos:</span>
                      <span className="font-mono">{formatMoney(costoMP)}</span>
                    </div>
                    <div className="text-sky-800">
                      <span className="font-semibold block">Cuota Fija:</span>
                      <span className="font-mono">{formatMoney(cuotaFijaPorKilo)}</span>
                    </div>
                    <div className="text-emerald-800 text-right">
                      <span className="font-semibold block">Ganancia:</span>
                      <span className="font-mono font-bold">+{formatMoney(gananciaUnitaria)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: NIVELES DE STOCK DE BODEGA & SEMÁFORO DE REABASTECIMIENTO */}
        <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Semáforo de Bodega: Insumos vs Stock Mínimo
              </h3>
              <p className="text-xs text-stone-500">
                Monitoreo visual para prevenir detención de la producción
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {insumos.map((ins) => {
              const ratio = ins.stock_minimo_gramos > 0 ? ins.cantidad_stock_gramos / ins.stock_minimo_gramos : 2;
              const esCritico = ratio <= 1.0;
              const esPrecaucion = ratio > 1.0 && ratio <= 1.5;

              const porcentajeLlenado = Math.min(100, Math.round((ins.cantidad_stock_gramos / (ins.stock_minimo_gramos * 3)) * 100));

              return (
                <div key={ins.id} className="p-2.5 rounded-xl border border-stone-200/70 bg-stone-50/50 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-stone-800 truncate pr-2">{ins.nombre}</span>
                    <span className={`font-mono font-bold text-3xs px-2 py-0.5 rounded-full ${
                      esCritico
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : esPrecaucion
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {esCritico ? '¡Comprar Ya!' : esPrecaucion ? 'Stock Moderado' : 'Abastecido'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          esCritico ? 'bg-rose-400' : esPrecaucion ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.max(8, porcentajeLlenado)}%` }}
                      />
                    </div>
                    <span className="text-3xs font-mono font-bold text-stone-600 shrink-0">
                      {formatWeight(ins.cantidad_stock_gramos)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
