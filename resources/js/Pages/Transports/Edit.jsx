import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Truck, User, MapPin, Save, X } from 'lucide-react';

export default function TransportEdit({ transport, tiposVeiculo, destinosComuns }) {
  const { data, setData, put, processing, errors } = useForm({
    tipo_veiculo: transport.tipo_veiculo || '',
    matricula: transport.matricula || '',
    marca: transport.marca || '',
    modelo: transport.modelo || '',
    ano: transport.ano || '',
    capacidade_peso: transport.capacidade_peso || '',
    capacidade_volume: transport.capacidade_volume || '',
    motorista_nome: transport.motorista_nome || '',
    motorista_telefone: transport.motorista_telefone || '',
    motorista_documento: transport.motorista_documento || '',
    destinos: transport.destinos || [],
    observacoes: transport.observacoes || '',
    ativo: transport.ativo ?? true,
  });

  const [destinoInput, setDestinoInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/transports/${transport.id}`);
  };

  const addDestino = (destino) => {
    if (destino && !data.destinos.includes(destino)) {
      setData('destinos', [...data.destinos, destino]);
    }
    setDestinoInput('');
  };

  const removeDestino = (destino) => {
    setData('destinos', data.destinos.filter(d => d !== destino));
  };

  return (
    <DashboardLayout>
      <Head title={`Editar Transporte ${transport.matricula}`} />

      <div className="p-6 ml-5 -mt-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/transports"
              className="p-2 transition-colors rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Editar Transporte
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Atualize as informações do veículo {transport.matricula}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Veículo */}
          <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Informações do Veículo
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Tipo de Veículo */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Tipo de Veículo <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.tipo_veiculo}
                  onChange={(e) => setData('tipo_veiculo', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tipo_veiculo ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {Object.entries(tiposVeiculo || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.tipo_veiculo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo_veiculo}</p>
                )}
              </div>

              {/* Matrícula */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Matrícula/Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.matricula}
                  onChange={(e) => setData('matricula', e.target.value.toUpperCase())}
                  placeholder="Ex: ABC-1234"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.matricula ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {errors.matricula && (
                  <p className="mt-1 text-sm text-red-600">{errors.matricula}</p>
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Marca
                </label>
                <input
                  type="text"
                  value={data.marca}
                  onChange={(e) => setData('marca', e.target.value)}
                  placeholder="Ex: Mercedes, Scania, Volvo"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Modelo
                </label>
                <input
                  type="text"
                  value={data.modelo}
                  onChange={(e) => setData('modelo', e.target.value)}
                  placeholder="Ex: Actros, R620"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Ano */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Ano de Fabricação
                </label>
                <input
                  type="number"
                  value={data.ano}
                  onChange={(e) => setData('ano', e.target.value)}
                  placeholder="Ex: 2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Capacidade Peso */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Capacidade de Peso (toneladas)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.capacidade_peso}
                  onChange={(e) => setData('capacidade_peso', e.target.value)}
                  placeholder="Ex: 25.5"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Capacidade Volume */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Capacidade Volumétrica (m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.capacidade_volume}
                  onChange={(e) => setData('capacidade_volume', e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informações do Motorista */}
          <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Informações do Motorista
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Nome do Motorista */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Nome do Motorista
                </label>
                <input
                  type="text"
                  value={data.motorista_nome}
                  onChange={(e) => setData('motorista_nome', e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  type="text"
                  value={data.motorista_telefone}
                  onChange={(e) => setData('motorista_telefone', e.target.value)}
                  placeholder="+258 84 123 4567"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Documento */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Nº Documento/Carta
                </label>
                <input
                  type="text"
                  value={data.motorista_documento}
                  onChange={(e) => setData('motorista_documento', e.target.value)}
                  placeholder="Nº da carta de condução"
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Destinos */}
          <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Destinos Atendidos
              </h2>
            </div>

            <div className="space-y-4">
              {/* Add Destino */}
              <div className="flex gap-2">
                <select
                  value={destinoInput}
                  onChange={(e) => setDestinoInput(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um destino</option>
                  {(destinosComuns || []).map((destino) => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addDestino(destinoInput)}
                  disabled={!destinoInput}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>

              {/* Selected Destinos */}
              {data.destinos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.destinos.map((destino, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700"
                    >
                      <MapPin className="w-3 h-3" />
                      {destino}
                      <button
                        type="button"
                        onClick={() => removeDestino(destino)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum destino adicionado. Selecione os destinos que este veículo atende.
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Observações
              </label>
              <textarea
                value={data.observacoes}
                onChange={(e) => setData('observacoes', e.target.value)}
                rows={4}
                placeholder="Informações adicionais sobre o veículo..."
                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Ativo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ativo"
                checked={data.ativo}
                onChange={(e) => setData('ativo', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-slate-700">
                Veículo ativo e disponível
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/transports"
              className="px-6 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Salvando...' : 'Atualizar Transporte'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
