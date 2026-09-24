import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { VisualCharts } from './components/VisualCharts';
import { ProductionModule } from './components/ProductionModule';
import { SalesInvoicingModule } from './components/SalesInvoicingModule';
import { InventoryModule } from './components/InventoryModule';
import { CostsAndPayrollModule } from './components/CostsAndPayrollModule';
import { FinancialReportsModule } from './components/FinancialReportsModule';
import { TechnicalDocsView } from './components/TechnicalDocsView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'graficos' && <VisualCharts />}
        {activeTab === 'produccion' && <ProductionModule />}
        {activeTab === 'ventas' && <SalesInvoicingModule />}
        {activeTab === 'inventario' && <InventoryModule />}
        {activeTab === 'costos' && <CostsAndPayrollModule />}
        {activeTab === 'reportes' && <FinancialReportsModule />}
        {activeTab === 'arquitectura' && <TechnicalDocsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/90 bg-white py-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">FabriControl ERP</span>
            <span>·</span>
            <span>Sistema Integral de Gestión de Producción, Recetas & Costeo</span>
          </div>
          <div className="text-3xs text-stone-400">
            Reglas de Integridad: Validación de Insumos · Facturación Anti-Sobrevendida · Autocompletado de Clientes
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
