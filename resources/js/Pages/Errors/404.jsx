import { Head, Link } from '@inertiajs/react';
import { Home, ArrowLeft, RefreshCw, FileQuestion } from 'lucide-react';

export default function Error404() {
  return (
    <>
      <Head title="404 - Página Não Encontrada" />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            {/* Header */}
            <div className="p-8 text-center bg-blue-50">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4 bg-white rounded-full shadow-lg">
                <FileQuestion className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="mb-2 text-6xl font-bold text-blue-600">404</h1>
              <h2 className="text-2xl font-semibold text-slate-800">
                Página Não Encontrada
              </h2>
            </div>

            {/* Conteúdo */}
            <div className="p-8">
              <p className="mb-6 text-lg text-center text-slate-600">
                Oops! A página que você está procurando não existe ou foi movida.
              </p>

              {/* Sugestões */}
              <div className="p-6 mb-6 rounded-lg bg-slate-50">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  O que você pode fazer:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>Verifique se o URL está correto</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>Volte para a página inicial</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>Use o menu de navegação</span>
                  </li>
                </ul>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium transition-colors rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Home className="w-5 h-5" />
                  Ir para Início
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
