import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Layers, 
  Scale, 
  CreditCard, 
  PieChart,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';

export const FinancialReportsModule: React.FC = () => {
  const { config, obtenerReporteFinanciero } = useApp();
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'todos'>('mes');

  const reporte = obtenerReporteFinanciero(periodo);
  const esRentable = reporte.utilidadNeta > 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Cierre Financiero & Reportes de Rentabilidad Real
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cruce exhaustivo: Ventas - Insumos - Comisiones - Pedacito proporcional de Recibos y Nómina.
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setPeriodo('dia')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              periodo === 'dia'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hoy (Día)
          </button>
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              periodo === 'semana'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semana (7 Días)
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              periodo === 'mes'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mes Completo
          </button>
          <button
            onClick={() => setPeriodo('todos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              periodo === 'todos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Histórico Total
          </button>
        </div>
      </div>

      {/* VEREDICTO DE RENTABILIDAD CARD */}
      <div
        className={`border rounded-2xl p-6 shadow-md transition-all ${
          esRentable
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 text-white'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30 text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                esRentable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {esRentable ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xs uppercase font-bold tracking-wider text-slate-400">
                  {reporte.labelPeriodo}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    esRentable
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {esRentable ? '¡ESTÁS GANANDO PLATA!' : '¡ALERTA: ESTÁS EN PÉRDIDA!'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Utilidad Neta Real:{' '}
                <span className={esRentable ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatMoney(reporte.utilidadNeta, config.moneda, config.simbolo_moneda)}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {esRentable
                  ? `Felicidades. Tras descontar la materia prima que gastaste, las comisiones de datáfonos y el pedazo proporcional del arriendo, luz y sueldos de tus empleados, te queda un margen neto del ${reporte.margenNetoPct}%.`
                  : `Tus ventas netas en este periodo no alcanzan a pagar la materia prima consumida y la cuota de recibos y nómina. Necesitas producir y vender más volumen para absorber los costos fijos.`}
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
            <span className="text-3xs uppercase font-bold text-slate-400 block">
              Margen Neto Sobre Ventas
            </span>
            <div className={`text-3xl font-extrabold font-mono ${esRentable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {reporte.margenNetoPct}%
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">
              {reporte.kilosVendidosTotales} kg facturados
            </div>
          </div>
        </div>
      </div>

      {/* P&L WATERFALL BREAKDOWN TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detailed Income Statement (Estado de Resultados Integral) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Estado de Resultados Operativo (P&L)
              </h3>
              <p className="text-xs text-slate-500">
                Estructura contable desglosada paso a paso
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {reporte.labelPeriodo}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            {/* 1. Ventas Brutas */}
            <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  (+) Ventas Brutas Totales
                </span>
                <span className="text-3xs text-slate-400">
                  ({reporte.totalFacturasEmitidas} facturas emitidas)
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatMoney(reporte.ventasBrutas, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 2. Comisiones Pasarelas */}
            <div className="flex justify-between items-center py-1.5 px-3 text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2 pl-4">
                <span>(-) Comisiones de Tarjeta / Pasarelas Bancarias</span>
              </div>
              <span className="font-mono font-semibold">
                -{formatMoney(reporte.comisionesBancarias, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 3. Ventas Netas */}
            <div className="flex justify-between items-center py-2 px-3 border-t border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              <span>(=) Ventas Netas Efectivas</span>
              <span className="font-mono">
                {formatMoney(reporte.ventasNetas, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 4. Costo Materia Prima (COGS) */}
            <div className="flex justify-between items-center py-1.5 px-3 text-cyan-600 dark:text-cyan-400">
              <div className="flex items-center gap-2 pl-4">
                <span>(-) Materia Prima Gastada en los Kilos Vendidos (COGS)</span>
              </div>
              <span className="font-mono font-semibold">
                -{formatMoney(reporte.costoMateriaPrima, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 5. Utilidad Bruta */}
            <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
              <span>(=) Utilidad Bruta</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">
                {formatMoney(reporte.utilidadBruta, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 6. Cuota Proporcional Recibos */}
            <div className="flex justify-between items-center py-1.5 px-3 text-indigo-600 dark:text-indigo-400">
              <div className="flex items-center gap-2 pl-4">
                <span>(-) Cuota Proporcional Recibos (Luz, Agua, Gas, Arriendo)</span>
              </div>
              <span className="font-mono font-semibold">
                -{formatMoney(reporte.gastosFijosProrrateados, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 7. Cuota Proporcional Nómina */}
            <div className="flex justify-between items-center py-1.5 px-3 text-indigo-600 dark:text-indigo-400">
              <div className="flex items-center gap-2 pl-4">
                <span>(-) Cuota Proporcional Nómina y Prestaciones de Empleados</span>
              </div>
              <span className="font-mono font-semibold">
                -{formatMoney(reporte.nominaProrrateada, config.moneda, config.simbolo_moneda)}
              </span>
            </div>

            {/* 8. RESULTADO NETO FINAL */}
            <div
              className={`flex justify-between items-center p-4 rounded-xl border font-bold text-base mt-4 ${
                esRentable
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div>
                <span>(=) UTILIDAD NETA REAL FINAL</span>
                <span className="block text-3xs font-normal opacity-80">
                  Dinero limpio que le queda al negocio después de cubrir absolutamente todo
                </span>
              </div>
              <span className="font-mono text-xl">
                {formatMoney(reporte.utilidadNeta, config.moneda, config.simbolo_moneda)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Cashflow & Accounts Receivable */}
        <div className="lg:col-span-4 space-y-4">
          {/* Box 1: Flujo de Caja (Cobrado vs Pendiente) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Estado de Cobro en Caja
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                    Facturas Pagadas (En Caja)
                  </span>
                  <span className="text-3xs text-emerald-600/80">Recibido en efectivo/banco</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {formatMoney(reporte.facturasPagadasMonto, config.moneda, config.simbolo_moneda)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 block">
                    Facturas Pendientes (Crédito)
                  </span>
                  <span className="text-3xs text-amber-600/80">Cuentas por cobrar a clientes</span>
                </div>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-sm">
                  {formatMoney(reporte.facturasPendientesMonto, config.moneda, config.simbolo_moneda)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Quick Rules / Summary Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              Reglas de Negocio Verificadas
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400 text-3xs">
              <li>✓ <strong>Sin números negativos:</strong> validado en todas las entradas de bodega y ventas.</li>
              <li>✓ <strong>Palabras clave estrictas:</strong> estados limitados por enum a 'Pagado' o 'Pendiente'.</li>
              <li>✓ <strong>Verificación automática:</strong> producción frenada si falta aunque sea 1 gramo de receta.</li>
              <li>✓ <strong>Cero ventas fantasma:</strong> rechaza pedidos si la bodega no tiene los kilos listos.</li>
              <li>✓ <strong>Descuento real de pasarelas:</strong> comisiones deducidas para no inflar la utilidad.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
