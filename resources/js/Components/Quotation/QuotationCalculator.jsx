import { useState, useEffect } from 'react';
import { DollarSign, Package, Ship, MapPin, CheckCircle, FileText } from 'lucide-react';
import axios from 'axios';

export default function QuotationCalculator({
  containerType,
  cargoType,
  regime,
  finalDestination,
  additionalServices = [],
  onQuotationCalculated
}) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateQuotation();
  }, [containerType, cargoType, regime, finalDestination, additionalServices]);

  const calculateQuotation = async () => {
    // Só calcular se tiver pelo menos um campo preenchido
    if (!containerType && !cargoType && !regime && !finalDestination && additionalServices.length === 0) {
      setQuotation(null);
      if (onQuotationCalculated) {
        onQuotationCalculated(null);
      }
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/v1/calculate-quotation', {
        container_type: containerType || null,
        cargo_type: cargoType || null,
        regime: regime || null,
        destination: finalDestination || null,
        additional_services: additionalServices,
      });

      setQuotation(response.data);

      if (onQuotationCalculated) {
        onQuotationCalculated(response.data);
      }
    } catch (error) {
      console.error('Erro ao calcular cotação:', error);
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) {
    return null;
  }

  return (
    <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          Cotação Automática
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Breakdown */}
          <div className="space-y-2">
            {quotation.breakdown && quotation.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  {item.category === 'Tipo de Container' && <Package className="w-4 h-4 text-slate-500" />}
                  {item.category === 'Tipo de Mercadoria' && <Ship className="w-4 h-4 text-slate-500" />}
                  {item.category === 'Destino' && <MapPin className="w-4 h-4 text-slate-500" />}
                  {item.category === 'Serviço Adicional' && <CheckCircle className="w-4 h-4 text-slate-500" />}
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN',
                  }).format(item.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="pt-4 space-y-2 border-t-2 border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                }).format(quotation.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">IVA (16%):</span>
              <span className="font-semibold text-slate-900">
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                }).format(quotation.tax)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 text-lg border-t border-blue-200">
              <span className="font-bold text-blue-900">Total:</span>
              <span className="font-bold text-blue-900">
                {new Intl.NumberFormat('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                }).format(quotation.total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 text-sm bg-white rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-slate-700">
              Esta cotação será salva automaticamente ao criar o processo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
