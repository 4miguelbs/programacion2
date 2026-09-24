import React, { useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  Eye, 
  CheckCheck,
  Building,
  DollarSign,
  PackageCheck,
  Sparkles,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { EstadoPago, MetodoPago, VentaFactura, ClienteFacturacion } from '../types';
import { formatMoney, formatDate } from '../utils/formatters';
import { InvoiceModal } from './InvoiceModal';

export const SalesInvoicingModule: React.FC = () => {
  const {
    productos,
    ventas,
    clientes,
    config,
    registrarVenta,
    actualizarEstadoVenta,
    calcularCostoTotalPorKilo,
  } = useApp();

  // Form State
  const [productoId, setProductoId] = useState<string>(productos[0]?.id || '');
  const [kilos, setKilos] = useState<number>(5);
  const [precioUnitario, setPrecioUnitario] = useState<number>(
    productos[0]?.precio_venta_actual || 14000
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia');
  const [comisionPct, setComisionPct] = useState<number>(0);
  const [estadoPago, setEstadoPago] = useState<EstadoPago>('Pagado');
  const [notas, setNotas] = useState<string>('');

  // Customer State & Autocomplete
  const [cliente, setCliente] = useState<ClienteFacturacion>({
    id: '',
    nombre: '',
    nit_cedula: '',
    celular: '',
    direccion: '',
    email: '',
    ciudad: 'Bogotá D.C.',
  });

  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>('');
  const [busquedaCliente, setBusquedaCliente] = useState<string>('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState<boolean>(false);

  // UI state
  const [alertaMensaje, setAlertaMensaje] = useState<{ tipo: 'error' | 'success'; texto: string } | null>(null);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<VentaFactura | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Pagado' | 'Pendiente'>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const productoSeleccionado = productos.find((p) => p.id === productoId);
  const stockDisponible = productoSeleccionado?.stock_disponible_kg || 0;
  const stockInsuficiente = kilos > stockDisponible;
  const costoUnitarioTotal = productoSeleccionado ? calcularCostoTotalPorKilo(productoSeleccionado.id) : 0;
  const ventaBajoCosto = precioUnitario < costoUnitarioTotal;

  // Handle product select change to update price
  const handleProductChange = (prodId: string) => {
    setProductoId(prodId);
    const p = productos.find((item) => item.id === prodId);
    if (p) {
      setPrecioUnitario(p.precio_venta_actual);
    }
    setAlertaMensaje(null);
  };

  // Payment method defaults commission
  const handleMetodoPagoChange = (metodo: MetodoPago) => {
    setMetodoPago(metodo);
    if (metodo === 'Tarjeta') {
      setComisionPct(2.8); // Usual dataphone fee
    } else if (metodo === 'Transferencia') {
      setComisionPct(0);
    } else {
      setComisionPct(0);
    }
  };

  // AUTOCOMPLETE: Select existing client from directory
  const handleSeleccionarClienteExistente = (c: ClienteFacturacion) => {
    setCliente({ ...c });
    setClienteSeleccionadoId(c.id);
    setBusquedaCliente(c.nombre);
    setMostrarSugerencias(false);
  };

  const handleLimpiarCliente = () => {
    setCliente({
      id: '',
      nombre: '',
      nit_cedula: '',
      celular: '',
      direccion: '',
      email: '',
      ciudad: 'Bogotá D.C.',
    });
    setClienteSeleccionadoId('');
    setBusquedaCliente('');
  };

  // Client suggestions based on name or NIT
  const clientesFiltrados = clientes.filter((c) => {
    if (!busquedaCliente.trim()) return false;
    const term = busquedaCliente.toLowerCase();
    return c.nombre.toLowerCase().includes(term) || c.nit_cedula.toLowerCase().includes(term);
  });

  // Live calculations
  const subtotalBruto = Math.max(0, kilos * precioUnitario);
  const montoComision = Math.round(subtotalBruto * (comisionPct / 100));
  const totalNeto = subtotalBruto - montoComision;

  const handleEmitirFactura = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertaMensaje(null);

    // Strict non-negative checks
    if (kilos <= 0) {
      setAlertaMensaje({ tipo: 'error', texto: 'La cantidad en kilos debe ser mayor a 0.' });
      return;
    }
    if (precioUnitario <= 0) {
      setAlertaMensaje({ tipo: 'error', texto: 'El precio unitario debe ser un valor positivo mayor a 0.' });
      return;
    }
    if (comisionPct < 0 || comisionPct > 100) {
      setAlertaMensaje({ tipo: 'error', texto: 'El porcentaje de comisión debe estar entre 0% y 100%.' });
      return;
    }

    // Required electronic billing customer fields
    if (!cliente.nombre.trim()) {
      setAlertaMensaje({ tipo: 'error', texto: 'El nombre o razón social del comprador es obligatorio.' });
      return;
    }
    if (!cliente.nit_cedula.trim()) {
      setAlertaMensaje({ tipo: 'error', texto: 'El NIT o Cédula es obligatorio para emitir la factura.' });
      return;
    }
    if (!cliente.celular.trim()) {
      setAlertaMensaje({ tipo: 'error', texto: 'El número de celular del comprador es obligatorio.' });
      return;
    }
    if (!cliente.direccion.trim()) {
      setAlertaMensaje({ tipo: 'error', texto: 'La dirección de entrega/facturación es obligatoria.' });
      return;
    }
    if (!cliente.email.trim() || !cliente.email.includes('@')) {
      setAlertaMensaje({ tipo: 'error', texto: 'Ingresa un correo electrónico válido para enviar la factura.' });
      return;
    }

    // Attempt sale with stock validation
    const resultado = registrarVenta({
      cliente,
      productoId,
      kilos,
      precioUnitario,
      metodoPago,
      comisionPct,
      estadoPago,
      notas,
    });

    if (resultado.success && resultado.venta) {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
      });
      setAlertaMensaje({ tipo: 'success', texto: resultado.mensaje });
      setFacturaSeleccionada(resultado.venta);
      handleLimpiarCliente();
      setNotas('');
    } else {
      setAlertaMensaje({ tipo: 'error', texto: resultado.mensaje });
    }
  };

  // Filtered sales list
  const ventasFiltradas = ventas.filter((v) => {
    const cumpleEstado = filtroEstado === 'Todos' || v.estado_pago === filtroEstado;
    const cumpleBusqueda =
      v.numero_factura.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cliente.nit_cedula.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.producto_nombre.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar in Light Pastel */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">
              Ventas, Facturación Electrónica & Autocompletado de Clientes
            </h1>
            <p className="text-xs text-stone-500">
              Autocompleta clientes frecuentes con 1 clic, valida existencias en bodega y descuenta comisiones automáticamente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Estados válidos:</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            Pagado
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-200">
            Pendiente
          </span>
        </div>
      </div>

      {/* Grid: Form (Left) vs History / Issued Invoices (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invoice Generator Form */}
        <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Nueva Factura de Venta & Despacho
          </h2>

          <form onSubmit={handleEmitirFactura} className="space-y-4">
            {/* 1. Product & Quantity with Stock Validation + Thumbnail */}
            <div className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Producto a Vender
                </label>
                <span className="text-xs font-medium text-stone-500">
                  Disponible en Bodega:{' '}
                  <strong className={stockDisponible > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {stockDisponible} kg
                  </strong>
                </span>
              </div>

              {/* Product selector with preview thumbnail */}
              <div className="flex items-center gap-2.5">
                {productoSeleccionado?.imagen_url ? (
                  <img
                    src={productoSeleccionado.imagen_url}
                    alt={productoSeleccionado.nombre}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                    {productoSeleccionado?.nombre.charAt(0) || 'P'}
                  </div>
                )}

                <select
                  value={productoId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre} (Bodega: {prod.stock_disponible_kg} kg) - {formatMoney(prod.precio_venta_actual)}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cantidad Solicitada (kg)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={kilos || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setKilos(isNaN(val) || val < 0 ? 0 : val);
                      setAlertaMensaje(null);
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Precio por Kilo ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={precioUnitario || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPrecioUnitario(isNaN(val) || val < 0 ? 0 : val);
                      setAlertaMensaje(null);
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Stock Warning Banner if client asks more than in stock */}
              {stockInsuficiente && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start gap-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <strong>¡ALERTA DE STOCK!</strong> El cliente solicita {kilos} kg pero solo tienes {stockDisponible} kg en bodega. 
                    El sistema bloquea la venta para no vender lo que no existe.
                  </div>
                </div>
              )}

              {ventaBajoCosto && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-2 text-amber-800 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Aviso: El precio unitario ({formatMoney(precioUnitario)}) es menor a tu costo total ({formatMoney(costoUnitarioTotal)}).</span>
                </div>
              )}
            </div>

            {/* 2. Customer Information WITH INSTANT AUTOCOMPLETE */}
            <div className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Datos del Comprador (Facturación Electrónica)
                </span>

                {/* Clear / New customer button */}
                {cliente.nombre && (
                  <button
                    type="button"
                    onClick={handleLimpiarCliente}
                    className="text-3xs text-stone-500 hover:text-stone-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-stone-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar / Nuevo</span>
                  </button>
                )}
              </div>

              {/* Autocomplete Quick Client Selector */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <select
                    value={clienteSeleccionadoId}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) {
                        handleLimpiarCliente();
                      } else {
                        const encontrado = clientes.find((c) => c.id === id);
                        if (encontrado) handleSeleccionarClienteExistente(encontrado);
                      }
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">⚡ Autocompletar con cliente frecuente ({clientes.length} registrados)...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} · NIT: {c.nit_cedula}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-stone-500 mb-0.5">Nombre / Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={cliente.nombre}
                    onChange={(e) => {
                      setCliente({ ...cliente, nombre: e.target.value });
                      setBusquedaCliente(e.target.value);
                      setMostrarSugerencias(true);
                    }}
                    placeholder="Ej: Panadería La Espiga o Juan Pérez"
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />

                  {/* Dropdown suggestions when typing */}
                  {mostrarSugerencias && clientesFiltrados.length > 0 && (
                    <div className="absolute z-20 mt-1 w-64 bg-white border border-stone-200 rounded-xl shadow-lg p-1 space-y-1">
                      <span className="text-3xs text-stone-400 px-2 py-0.5 block font-bold">Clientes coincidentes:</span>
                      {clientesFiltrados.slice(0, 3).map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleSeleccionarClienteExistente(sug)}
                          className="w-full text-left p-1.5 rounded-lg hover:bg-stone-100 text-3xs text-stone-800 flex items-center justify-between"
                        >
                          <span className="font-semibold truncate">{sug.nombre}</span>
                          <span className="text-stone-400 font-mono">{sug.nit_cedula}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-stone-500 mb-0.5">NIT o Cédula *</label>
                  <input
                    type="text"
                    required
                    value={cliente.nit_cedula}
                    onChange={(e) => setCliente({ ...cliente, nit_cedula: e.target.value })}
                    placeholder="Ej: 900.123.456-7"
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-0.5">Teléfono / Celular *</label>
                  <input
                    type="tel"
                    required
                    value={cliente.celular}
                    onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                    placeholder="310 123 4567"
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-0.5">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    placeholder="facturacion@cliente.com"
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-500 mb-0.5">Dirección de Entrega *</label>
                  <input
                    type="text"
                    required
                    value={cliente.direccion}
                    onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    placeholder="Calle 10 # 45-30"
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method, Fee Deduction & Strict Status */}
            <div className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Forma de Cobro & Comisiones
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Payment Method */}
                <div>
                  <label className="block text-stone-500 mb-0.5">Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => handleMetodoPagoChange(e.target.value as MetodoPago)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 font-medium"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta (Datáfono)</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                {/* Gateway Fee % */}
                <div>
                  <label className="block text-stone-500 mb-0.5">Comisión Banco (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={comisionPct}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setComisionPct(isNaN(val) || val < 0 ? 0 : val);
                      }}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-900 pr-7 font-mono"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-3xs text-stone-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Strict Status Enum */}
                <div>
                  <label className="block text-stone-500 mb-0.5">Estado Contable *</label>
                  <select
                    value={estadoPago}
                    onChange={(e) => setEstadoPago(e.target.value as EstadoPago)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-900"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-2 border-t border-stone-200 text-xs space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal Bruto ({kilos} kg × {formatMoney(precioUnitario)}):</span>
                  <span className="font-mono">{formatMoney(subtotalBruto)}</span>
                </div>
                {comisionPct > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>Comisión descontada ({comisionPct}%):</span>
                    <span className="font-mono">-{formatMoney(montoComision)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Neto en Caja:</span>
                  <span className="font-mono text-emerald-800">
                    {formatMoney(totalNeto)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Observaciones / Condiciones de Factura (Opcional)
              </label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Pedido entregado a domicilio, plazo de pago 15 días..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>

            {/* Submit Button */}
            <div>
              {stockInsuficiente ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 px-4 bg-stone-200 text-stone-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span>Venta Bloqueada: No hay suficiente stock en bodega</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Emitir Factura y Descontar {kilos} kg de Bodega</span>
                </button>
              )}
            </div>

            {alertaMensaje && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  alertaMensaje.tipo === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {alertaMensaje.texto}
              </div>
            )}
          </form>
        </div>

        {/* Right: Issued Invoices & Real-time Receivables */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Historial de Facturación ({ventas.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Consulta de comprobantes, recibos y cuentas por cobrar
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                {(['Todos', 'Pagado', 'Pendiente'] as const).map((est) => (
                  <button
                    key={est}
                    onClick={() => setFiltroEstado(est)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      filtroEstado === est
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por factura, cliente, NIT o producto..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Invoices List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {ventasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  No hay facturas que coincidan con los filtros seleccionados.
                </div>
              ) : (
                ventasFiltradas.map((fac) => (
                  <div
                    key={fac.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-emerald-300 transition-colors text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">
                            {fac.numero_factura}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-3xs ${
                              fac.estado_pago === 'Pagado'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {fac.estado_pago}
                          </span>
                        </div>
                        <div className="font-semibold text-stone-800 mt-1">
                          {fac.cliente.nombre}
                        </div>
                        <div className="text-3xs text-stone-500">
                          NIT: {fac.cliente.nit_cedula} · {fac.cliente.celular}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sm text-stone-900 font-mono">
                          {formatMoney(fac.total_neto_recibido, config.moneda, config.simbolo_moneda)}
                        </div>
                        <div className="text-3xs text-stone-500">
                          {fac.kilos_vendidos} kg de {fac.producto_nombre}
                        </div>
                        <div className="text-3xs text-stone-400 mt-0.5">
                          {fac.metodo_pago}
                          {fac.comision_pct > 0 && ` (${fac.comision_pct}% com)`}
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-3xs text-stone-400">
                      <span>{formatDate(fac.fecha)}</span>

                      <div className="flex items-center gap-2">
                        {fac.estado_pago === 'Pendiente' && (
                          <button
                            onClick={() => actualizarEstadoVenta(fac.id, 'Pagado')}
                            className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Marcar Pagado</span>
                          </button>
                        )}
                        <button
                          onClick={() => setFacturaSeleccionada(fac)}
                          className="flex items-center gap-1 text-stone-700 font-semibold hover:text-emerald-700 transition-colors bg-white px-2 py-1 rounded-lg border border-stone-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Factura & Enviar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal with PDF & Sharing */}
      {facturaSeleccionada && (
        <InvoiceModal
          venta={facturaSeleccionada}
          config={config}
          onClose={() => setFacturaSeleccionada(null)}
        />
      )}
    </div>
  );
};
