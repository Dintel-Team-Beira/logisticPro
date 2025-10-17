import React, { useState } from 'react';
import { Home, RefreshCw, ArrowLeft, AlertTriangle, ServerCrash, Lock, Search, FileQuestion } from 'lucide-react';

const ErrorPages = () => {
  const [currentError, setCurrentError] = useState('404');

  const errors = {
    '404': {
      code: '404',
      title: 'Página Não Encontrada',
      message: 'Oops! A página que você está procurando não existe ou foi movida.',
      icon: FileQuestion,
      color: 'blue',
      suggestions: [
        'Verifique se o URL está correto',
        'Volte para a página inicial',
        'Use o menu de navegação'
      ]
    },
    '500': {
      code: '500',
      title: 'Erro Interno do Servidor',
      message: 'Algo deu errado do nosso lado. Já estamos trabalhando para resolver!',
      icon: ServerCrash,
      color: 'red',
      suggestions: [
        'Tente novamente em alguns instantes',
        'Atualize a página',
        'Entre em contato se o erro persistir'
      ]
    },
    '403': {
      code: '403',
      title: 'Acesso Negado',
      message: 'Você não tem permissão para acessar este recurso.',
      icon: Lock,
      color: 'yellow',
      suggestions: [
        'Faça login com uma conta autorizada',
        'Verifique suas permissões',
        'Entre em contato com o administrador'
      ]
    },
    '503': {
      code: '503',
      title: 'Serviço Indisponível',
      message: 'O serviço está temporariamente indisponível. Estamos em manutenção.',
      icon: AlertTriangle,
      color: 'orange',
      suggestions: [
        'Aguarde alguns minutos',
        'Verifique nossa página de status',
        'Tente novamente mais tarde'
      ]
    }
  };

  const error = errors[currentError];
  const Icon = error.icon;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      code: 'text-blue-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      code: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      code: 'text-yellow-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
      code: 'text-orange-600'
    }
  };

  const colors = colorClasses[error.color];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Selector de Erros - Para Demo */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <p className="mb-2 text-sm text-gray-600">Visualizar erro:</p>
          <div className="flex gap-2">
            {Object.keys(errors).map((code) => (
              <button
                key={code}
                onClick={() => setCurrentError(code)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentError === code
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Página de Erro */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-2xl">
          {/* Card Principal */}
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            {/* Header com Ícone */}
            <div className={`${colors.bg} p-8 text-center`}>
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4 bg-white rounded-full shadow-lg">
                <Icon className={`w-12 h-12 ${colors.icon}`} />
              </div>
              <h1 className={`text-6xl font-bold ${colors.code} mb-2`}>
                {error.code}
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800">
                {error.title}
              </h2>
            </div>

            {/* Conteúdo */}
            <div className="p-8">
              <p className="mb-6 text-lg text-center text-gray-600">
                {error.message}
              </p>

              {/* Sugestões */}
              <div className="p-6 mb-6 rounded-lg bg-gray-50">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                  <Search className="w-4 h-4" />
                  O que você pode fazer:
                </h3>
                <ul className="space-y-2">
                  {error.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1 text-gray-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Recarregar
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${colors.button} text-white rounded-lg transition-colors font-medium`}
                >
                  <Home className="w-5 h-5" />
                  Ir para Início
                </button>
              </div>

              {/* Informação Adicional */}
              <div className="pt-6 mt-6 text-center border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Se o problema persistir, entre em contato com o{' '}
                  <a href="/suporte" className={`${colors.code} hover:underline font-medium`}>
                    suporte técnico
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Código de Referência */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Código de referência: <span className="font-mono font-medium">REF-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPages;
