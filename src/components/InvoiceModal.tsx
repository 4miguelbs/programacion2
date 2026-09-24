import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Send,
  MessageCircle,
  Copy,
  Check,
  Download,
  Share2
} from 'lucide-react';
import { VentaFactura, ConfiguracionPlanta } from '../types';
import { formatMoney, formatDate } from '../utils/formatters';

interface InvoiceModalProps {
  venta: VentaFactura | null;
  config: ConfiguracionPlanta;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ venta, config, onClose }) => {
  if (!venta) return null;

  const [copiado, setCopiado] = useState(false);
  const [modalEnvioAbierto, setModalEnvioAbierto] = useState(false);
  const [mensajeEnvioExitoso, setMensajeEnvioExitoso] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  // Plain-text invoice summary for WhatsApp or Clipboard
  const textoFactura = `*FACTURA DE VENTA ELECTRÓNICA: ${venta.numero_factura}*
*FabriControl Industrial S.A.S.*
NIT: 901.834.120-1 · Bogotá D.C.
--------------------------------------------
*Cliente:* ${venta.cliente.nombre}
*NIT/CC:* ${venta.cliente.nit_cedula}
*Tel:* ${venta.cliente.celular}
*Dirección:* ${venta.cliente.direccion}, ${venta.cliente.ciudad}
*Fecha:* ${formatDate(venta.fecha)}
*Estado:* ${venta.estado_pago.toUpperCase()}
--------------------------------------------
*DETALLE:*
• ${venta.kilos_vendidos} kg de ${venta.producto_nombre}
  Precio unitario: ${formatMoney(venta.precio_unitario_kg)}/kg
  Subtotal: ${formatMoney(venta.subtotal_bruto)}
${venta.comision_pct > 0 ? `  Comisión pasarela (${venta.comision_pct}%): -${formatMoney(venta.monto_comision)}\n` : ''}
*TOTAL NETO:* ${formatMoney(venta.total_neto_recibido, config.moneda, config.simbolo_moneda)}
*Método de Pago:* ${venta.metodo_pago}
${venta.notas ? `*Notas:* ${venta.notas}\n` : ''}--------------------------------------------
¡Gracias por preferir nuestros productos!`;

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(textoFactura).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // WhatsApp sender
  const handleEnviarWhatsApp = () => {
    const celularLimpio = venta.cliente.celular.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=${celularLimpio ? (celularLimpio.startsWith('57') ? celularLimpio : `57${celularLimpio}`) : ''}&text=${encodeURIComponent(textoFactura)}`;
    window.open(url, '_blank');
    setMensajeEnvioExitoso('Factura preparada y enviada a WhatsApp');
    setTimeout(() => setMensajeEnvioExitoso(null), 3000);
  };

  // Email sender
  const handleEnviarEmail = () => {
    const subject = `Factura Electrónica ${venta.numero_factura} - FabriControl`;
    const body = `Estimado(a) ${venta.cliente.nombre},\n\nAdjuntamos el detalle de su factura electrónica ${venta.numero_factura} emitida por FabriControl Industrial S.A.S.:\n\n${textoFactura}\n\nCordialmente,\nEquipo de Facturación y Despachos`;
    const mailtoUrl = `mailto:${encodeURIComponent(venta.cliente.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    setMensajeEnvioExitoso(`Correo preparado para ${venta.cliente.email}`);
    setTimeout(() => setMensajeEnvioExitoso(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Modal Top Actions Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-stone-200/80 bg-stone-50/70 print:hidden gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
              Factura Electrónica
            </span>
            <span className="text-xs font-mono font-bold text-stone-800">
              {venta.numero_factura}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {/* Download/Print PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-2xs transition-colors"
              title="Guardar o descargar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Ver PDF / Imprimir</span>
            </button>

            {/* Send WhatsApp */}
            <button
              onClick={handleEnviarWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 border border-emerald-200 transition-colors"
              title="Enviar por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Send Email */}
            <button
              onClick={handleEnviarEmail}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-sky-800 bg-sky-100/80 hover:bg-sky-200/80 border border-sky-200 transition-colors"
              title="Enviar por Email al cliente"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </button>

            {/* Copy summary */}
            <button
              onClick={handleCopiarTexto}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 border border-stone-200 bg-white transition-colors"
              title="Copiar texto resumen"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {mensajeEnvioExitoso && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-medium text-emerald-800 flex items-center justify-between print:hidden">
            <span>✓ {mensajeEnvioExitoso}</span>
            <button onClick={() => setMensajeEnvioExitoso(null)} className="text-emerald-700 hover:underline">
              Cerrar
            </button>
          </div>
        )}

        {/* Printable Invoice Sheet (Clean, Light Pastel & Standard DIAN Layout) */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-800 print:p-8">
          {/* Top Company & Invoice ID */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 leading-tight">
                    FabriControl Industrial S.A.S.
                  </h2>
                  <span className="text-3xs text-stone-500">Planta de Producción & Distribución</span>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                NIT: 901.834.120-1 · Régimen Responsable de IVA<br />
                Planta Central: Zona Industrial Calle 18 # 68-45 · PBX: (601) 489-0022<br />
                Email: facturacion@fabricontrol.co · Bogotá D.C.
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-3xs uppercase font-bold text-stone-400 tracking-wider">
                Factura Electrónica de Venta
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-800">
                {venta.numero_factura}
              </div>
              <div className="text-xs text-stone-600">
                Fecha Emisión: {formatDate(venta.fecha)}
              </div>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    venta.estado_pago === 'Pagado'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {venta.estado_pago === 'Pagado' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  {venta.estado_pago.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information (DIAN Electronic mandatory fields) */}
          <div className="bg-stone-50/80 rounded-2xl p-4.5 border border-stone-200/80 space-y-2">
            <h3 className="text-3xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 border-b border-stone-200/60 pb-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Datos del Comprador (Adquirente / Facturación Fiscal)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-3xs text-stone-400 block font-medium">Nombre o Razón Social:</span>
                <span className="font-bold text-stone-900 text-sm">{venta.cliente.nombre}</span>
              </div>
              <div>
                <span className="text-3xs text-stone-400 block font-medium">NIT / Cédula:</span>
                <span className="font-mono font-bold text-stone-900">{venta.cliente.nit_cedula}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{venta.cliente.celular}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{venta.cliente.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{venta.cliente.direccion}, {venta.cliente.ciudad}</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">Ítem / Producto Despachado</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 text-right">Precio Unitario</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-stone-900 text-sm">
                      {venta.producto_nombre}
                    </div>
                    <div className="text-3xs text-stone-400">
                      Lote verificado y descontado de bodega central
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    {venta.kilos_vendidos} kg
                  </td>
                  <td className="p-3 text-right font-mono text-stone-700">
                    {formatMoney(venta.precio_unitario_kg, config.moneda, config.simbolo_moneda)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    {formatMoney(venta.subtotal_bruto, config.moneda, config.simbolo_moneda)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Gateway Commission */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
            <div className="space-y-1.5 text-xs text-stone-500 max-w-sm">
              <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <span>Forma de Pago: {venta.metodo_pago}</span>
              </div>
              {venta.comision_pct > 0 ? (
                <p className="text-3xs text-stone-500">
                  Comisión pasarela bancaria ({venta.comision_pct}%): se deduce {formatMoney(venta.monto_comision)} para cuadre exacto de caja.
                </p>
              ) : (
                <p className="text-3xs text-stone-400">
                  Pago directo sin comisión intermedia (0%).
                </p>
              )}
              {venta.notas && (
                <div className="text-3xs italic text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/80 mt-1">
                  <strong>Condiciones:</strong> {venta.notas}
                </div>
              )}
            </div>

            {/* Totals Table in soft pastel */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-stone-50/60 p-3 rounded-xl border border-stone-200/60">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Bruto:</span>
                <span className="font-mono font-medium">
                  {formatMoney(venta.subtotal_bruto, config.moneda, config.simbolo_moneda)}
                </span>
              </div>

              {venta.comision_pct > 0 && (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Comisión ({venta.comision_pct}%):</span>
                  <span className="font-mono">
                    -{formatMoney(venta.monto_comision, config.moneda, config.simbolo_moneda)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total a Recibir:</span>
                <span className="font-mono text-emerald-800 text-base">
                  {formatMoney(venta.total_neto_recibido, config.moneda, config.simbolo_moneda)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-3xs text-stone-400 pt-4 border-t border-stone-100 space-y-1">
            <p>Comprobante de factura mercantil generado por FabriControl ERP.</p>
            <p>Resolución DIAN No. 187600000001 · Habilitación Técnica Producción</p>
          </div>
        </div>
      </div>
    </div>
  );
};
