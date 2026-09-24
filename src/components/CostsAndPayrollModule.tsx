import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Receipt, 
  Plus, 
  Edit3, 
  Trash2, 
  Scale, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  X,
  Building,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GastoFijo, Empleado, EstadoPago } from '../types';
import { formatMoney } from '../utils/formatters';

export const CostsAndPayrollModule: React.FC = () => {
  const {
    gastosFijos,
    empleados,
    config,
    guardarGastoFijo,
    eliminarGastoFijo,
    guardarEmpleado,
    eliminarEmpleado,
    actualizarConfig,
    calcularTotalGastosFijosMensuales,
    calcularTotalNominaMensual,
    calcularCostoOperativoFijoPorKilo,
  } = useApp();

  // Modals state
  const [gastoModalOpen, setGastoModalOpen] = useState(false);
  const [gastoEdicion, setGastoEdicion] = useState<Partial<GastoFijo> | null>(null);
  const [errorGasto, setErrorGasto] = useState<string | null>(null);

  const [empleadoModalOpen, setEmpleadoModalOpen] = useState(false);
  const [empleadoEdicion, setEmpleadoEdicion] = useState<Partial<Empleado> | null>(null);
  const [errorEmpleado, setErrorEmpleado] = useState<string | null>(null);

  // Totals
  const totalGastosFijos = calcularTotalGastosFijosMensuales();
  const totalNomina = calcularTotalNominaMensual();
  const totalCargaMensual = totalGastosFijos + totalNomina;
  const costoFijoPorKilo = calcularCostoOperativoFijoPorKilo();

  // Gasto handlers
  const handleOpenNuevoGasto = () => {
    setGastoEdicion({
      concepto: 'Luz',
      descripcion_detalle: '',
      monto_mensual: 250000,
      periodo: '2026-09',
      estado_pago: 'Pendiente',
      fecha_vencimiento: '2026-09-30',
    });
    setErrorGasto(null);
    setGastoModalOpen(true);
  };

  const handleOpenEditarGasto = (g: GastoFijo) => {
    setGastoEdicion({ ...g });
    setErrorGasto(null);
    setGastoModalOpen(true);
  };

  const handleGuardarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoEdicion) return;
    if ((gastoEdicion.monto_mensual ?? 0) < 0) {
      setErrorGasto('El monto del gasto no puede ser negativo.');
      return;
    }
    if (gastoEdicion.estado_pago !== 'Pagado' && gastoEdicion.estado_pago !== 'Pendiente') {
      setErrorGasto('El estado debe ser estrictamente "Pagado" o "Pendiente".');
      return;
    }

    try {
      guardarGastoFijo({
        id: gastoEdicion.id,
        concepto: gastoEdicion.concepto as any || 'Otro',
        descripcion_detalle: gastoEdicion.descripcion_detalle?.trim(),
        monto_mensual: Number(gastoEdicion.monto_mensual),
        periodo: gastoEdicion.periodo || '2026-09',
        estado_pago: gastoEdicion.estado_pago,
        fecha_vencimiento: gastoEdicion.fecha_vencimiento || '2026-09-30',
      });
      setGastoModalOpen(false);
    } catch (err: any) {
      setErrorGasto(err.message || 'Error al guardar gasto');
    }
  };

  // Empleado handlers
  const handleOpenNuevoEmpleado = () => {
    setEmpleadoEdicion({
      nombre: '',
      documento: '',
      cargo: 'Operario de Planta',
      salario_mensual: 1400000,
      seguridad_social_prestaciones: 560000,
      estado: 'Activo',
    });
    setErrorEmpleado(null);
    setEmpleadoModalOpen(true);
  };

  const handleOpenEditarEmpleado = (emp: Empleado) => {
    setEmpleadoEdicion({ ...emp });
    setErrorEmpleado(null);
    setEmpleadoModalOpen(true);
  };

  const handleGuardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoEdicion) return;
    if (!empleadoEdicion.nombre?.trim()) {
      setErrorEmpleado('El nombre del empleado es obligatorio.');
      return;
    }
    if ((empleadoEdicion.salario_mensual ?? 0) < 0) {
      setErrorEmpleado('El salario no puede ser negativo.');
      return;
    }

    try {
      guardarEmpleado({
        id: empleadoEdicion.id,
        nombre: empleadoEdicion.nombre.trim(),
        documento: empleadoEdicion.documento?.trim() || 'CC S/N',
        cargo: empleadoEdicion.cargo?.trim() || 'Operario',
        salario_mensual: Number(empleadoEdicion.salario_mensual),
        seguridad_social_prestaciones: Number(empleadoEdicion.seguridad_social_prestaciones || 0),
        estado: empleadoEdicion.estado || 'Activo',
      });
      setEmpleadoModalOpen(false);
    } catch (err: any) {
      setErrorEmpleado(err.message || 'Error al guardar empleado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Control de la Plata: Recibos del Mes & Nómina
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra arriendo, servicios públicos y salarios para calcular exactamente cuánto le carga cada gasto a 1 kilo producido.
            </p>
          </div>
        </div>
      </div>

      {/* Top Cost Absorption Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Fórmula de Costeo Unitario por Kilo
            </span>
            <h2 className="text-xl font-bold mt-0.5">
              Absorción de Gastos Fijos y Nómina en tu Producción
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Para no perder plata, cada kilo producido debe absorber un pedacito del arriendo, la luz y los sueldos. 
              Aquí prorrateamos el total según tu capacidad mensual.
            </p>
          </div>

          {/* Plant Capacity input */}
          <div className="bg-slate-800/80 border border-indigo-500/30 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
            <div>
              <span className="text-3xs uppercase font-bold text-indigo-300 block">
                Meta Producción Mensual
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={config.capacidad_produccion_mensual_kg}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 0) {
                      actualizarConfig({ capacidad_produccion_mensual_kg: val });
                    }
                  }}
                  className="w-24 bg-slate-900 border border-indigo-500/40 rounded-lg px-2 py-1 text-sm font-bold font-mono text-indigo-200 text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <span className="text-xs font-bold text-slate-400">KG/MES</span>
              </div>
            </div>

            <div className="border-l border-slate-700 pl-3">
              <span className="text-3xs uppercase font-bold text-slate-400 block">
                Cuota Fija por Kilo
              </span>
              <div className="text-lg font-bold font-mono text-amber-400">
                {formatMoney(costoFijoPorKilo, config.moneda, config.simbolo_moneda)}/kg
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60">
            <span className="text-slate-400">Recibos y Servicios ({gastosFijos.length}):</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {formatMoney(totalGastosFijos, config.moneda, config.simbolo_moneda)}
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60">
            <span className="text-slate-400">Nómina y Prestaciones ({empleados.length}):</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {formatMoney(totalNomina, config.moneda, config.simbolo_moneda)}
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60">
            <span className="text-slate-400">Total Carga Operativa Mensual:</span>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {formatMoney(totalCargaMensual, config.moneda, config.simbolo_moneda)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left (Bills & Services) vs Right (Employees & Payroll) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monthly Fixed Bills (Recibos del Mes) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-500" />
                Recibos del Mes (Arriendo, Luz, Agua, Gas...)
              </h2>
              <p className="text-xs text-slate-500">
                Gastos fijos recurrentes de operación de la planta
              </p>
            </div>
            <button
              onClick={handleOpenNuevoGasto}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Recibo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {gastosFijos.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {g.concepto}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-3xs ${
                        g.estado_pago === 'Pagado'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {g.estado_pago}
                    </span>
                  </div>
                  {g.descripcion_detalle && (
                    <p className="text-3xs text-slate-400 mt-0.5">
                      {g.descripcion_detalle}
                    </p>
                  )}
                  <span className="text-3xs text-slate-400">
                    Periodo: {g.periodo} · Vence: {g.fecha_vencimiento}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {formatMoney(g.monto_mensual, config.moneda, config.simbolo_moneda)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditarGasto(g)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => eliminarGastoFijo(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Employees & Salaries */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Nómina de Empleados
              </h2>
              <p className="text-xs text-slate-500">
                Sueldo exacto y aportes de cada integrante del equipo
              </p>
            </div>
            <button
              onClick={handleOpenNuevoEmpleado}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Empleado</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {empleados.map((emp) => {
              const costoTotalEmpleado = emp.salario_mensual + emp.seguridad_social_prestaciones;
              return (
                <div key={emp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {emp.nombre}
                      </span>
                      <span className="text-3xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {emp.cargo}
                      </span>
                    </div>
                    <div className="text-3xs text-slate-400 mt-0.5">
                      Doc: {emp.documento} · Salario básico: {formatMoney(emp.salario_mensual)} + Prestaciones: {formatMoney(emp.seguridad_social_prestaciones)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        {formatMoney(costoTotalEmpleado, config.moneda, config.simbolo_moneda)}
                      </span>
                      <span className="text-3xs text-slate-400 block">costo empresa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditarEmpleado(emp)}
                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => eliminarEmpleado(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL GASTO FIJO */}
      {gastoModalOpen && gastoEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {gastoEdicion.id ? 'Editar Recibo / Gasto Fijo' : 'Registrar Nuevo Recibo del Mes'}
              </h3>
              <button
                onClick={() => setGastoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarGasto} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Concepto *</label>
                  <select
                    value={gastoEdicion.concepto}
                    onChange={(e) => setGastoEdicion({ ...gastoEdicion, concepto: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Luz">Luz</option>
                    <option value="Agua">Agua</option>
                    <option value="Gas">Gas</option>
                    <option value="Arriendo">Arriendo</option>
                    <option value="Internet / Teléfono">Internet / Teléfono</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Aseo y Seguridad">Aseo y Seguridad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado de Pago *</label>
                  <select
                    value={gastoEdicion.estado_pago}
                    onChange={(e) => setGastoEdicion({ ...gastoEdicion, estado_pago: e.target.value as EstadoPago })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monto Mensual ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={gastoEdicion.monto_mensual ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setGastoEdicion({ ...gastoEdicion, monto_mensual: isNaN(val) || val < 0 ? 0 : val });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción / Detalle</label>
                <input
                  type="text"
                  value={gastoEdicion.descripcion_detalle || ''}
                  onChange={(e) => setGastoEdicion({ ...gastoEdicion, descripcion_detalle: e.target.value })}
                  placeholder="Ej: Factura Enel Codensa correspondiente a septiembre"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Periodo (YYYY-MM)</label>
                  <input
                    type="text"
                    value={gastoEdicion.periodo || '2026-09'}
                    onChange={(e) => setGastoEdicion({ ...gastoEdicion, periodo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={gastoEdicion.fecha_vencimiento || '2026-09-30'}
                    onChange={(e) => setGastoEdicion({ ...gastoEdicion, fecha_vencimiento: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {errorGasto && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                  {errorGasto}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGastoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Guardar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EMPLEADO */}
      {empleadoModalOpen && empleadoEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {empleadoEdicion.id ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setEmpleadoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEmpleado} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={empleadoEdicion.nombre || ''}
                  onChange={(e) => setEmpleadoEdicion({ ...empleadoEdicion, nombre: e.target.value })}
                  placeholder="Ej: Laura Gómez"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Documento / Cédula</label>
                  <input
                    type="text"
                    value={empleadoEdicion.documento || ''}
                    onChange={(e) => setEmpleadoEdicion({ ...empleadoEdicion, documento: e.target.value })}
                    placeholder="CC 1.020..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo / Rol</label>
                  <input
                    type="text"
                    value={empleadoEdicion.cargo || ''}
                    onChange={(e) => setEmpleadoEdicion({ ...empleadoEdicion, cargo: e.target.value })}
                    placeholder="Ej: Pastelero Jefe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sueldo Mensual ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={empleadoEdicion.salario_mensual ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEmpleadoEdicion({ ...empleadoEdicion, salario_mensual: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Seguridad Social / Prestaciones ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={empleadoEdicion.seguridad_social_prestaciones ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEmpleadoEdicion({ ...empleadoEdicion, seguridad_social_prestaciones: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {errorEmpleado && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                  {errorEmpleado}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEmpleadoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
