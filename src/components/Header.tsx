import React from 'react';
import { 
  Factory, 
  Package, 
  Receipt, 
  DollarSign, 
  BarChart3, 
  Code2, 
  RotateCcw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';

export type ActiveTab = 
  | 'dashboard' 
  | 'graficos'
  | 'produccion' 
  | 'ventas' 
  | 'inventario' 
  | 'costos' 
  | 'reportes' 
  | 'arquitectura';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { productos, insumos, ventas, config, resetearDatosDemo } = useApp();

  const totalKilosTerminados = productos.reduce((acc, p) => acc + p.stock_disponible_kg, 0);
  const totalKilosInsumos = insumos.reduce((acc, i) => acc + (i.cantidad_stock_gramos / 1000), 0);
  const totalVentasNetas = ventas.reduce((acc, v) => acc + v.total_neto_recibido, 0);

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar los datos de demostración de la fábrica?')) {
      resetearDatosDemo();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3 },
    { id: 'graficos', label: 'Gráficos Visuales', icon: TrendingUp, highlightPastel: true },
    { id: 'produccion', label: 'Producción & Recetas', icon: Factory },
    { id: 'ventas', label: 'Ventas & Facturación', icon: Receipt },
    { id: 'inventario', label: 'Bodega & Catálogo', icon: Package },
    { id: 'costos', label: 'Recibos & Nómina', icon: DollarSign },
    { id: 'reportes', label: 'Cierre Financiero (P&L)', icon: Sparkles },
    { id: 'arquitectura', label: 'SQL & Backend Python', icon: Code2 },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md text-stone-800 border-b border-stone-200/90 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-amber-900 font-bold shadow-2xs">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-stone-900">FabriControl ERP</span>
                <span className="text-3xs text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200">
                  Planta Activa
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sistema Integral de Producción, Recetas, Facturación & Costos
              </p>
            </div>
          </div>

          {/* Quick Metrics in Soft Pastels */}
          <div className="hidden lg:flex items-center gap-5 text-xs">
            <div className="flex flex-col text-right bg-emerald-50/70 px-3 py-1 rounded-xl border border-emerald-200/70">
              <span className="text-3xs font-medium text-emerald-800">Bodega Terminados:</span>
              <span className="font-bold font-mono text-emerald-900">{totalKilosTerminados.toFixed(1)} kg listos</span>
            </div>
            <div className="flex flex-col text-right bg-sky-50/70 px-3 py-1 rounded-xl border border-sky-200/70">
              <span className="text-3xs font-medium text-sky-800">Materia Prima:</span>
              <span className="font-bold font-mono text-sky-900">{totalKilosInsumos.toFixed(1)} kg</span>
            </div>
            <div className="flex flex-col text-right bg-amber-50/70 px-3 py-1 rounded-xl border border-amber-200/70">
              <span className="text-3xs font-medium text-amber-800">Ventas Registradas:</span>
              <span className="font-bold font-mono text-amber-900">{formatMoney(totalVentasNetas, config.moneda, config.simbolo_moneda)}</span>
            </div>
            <button
              onClick={handleReset}
              title="Restaurar datos iniciales"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-stone-200 bg-stone-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Demo</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300/80 shadow-2xs'
                    : item.highlightPastel
                    ? 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-900' : 'text-stone-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
