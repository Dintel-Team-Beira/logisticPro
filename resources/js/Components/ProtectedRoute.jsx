import { Navigate } from '@inertiajs/react';
import { hasPermission } from '@/config/permissions';
import { usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function ProtectedRoute({ children, permission, fallback = '/dashboard' }) {
  const { auth } = usePage().props;

  // Se não há usuário autenticado, redireciona para login
  if (!auth.user) {
    return <Navigate href="/login" />;
  }

  // Se há permissão especificada e usuário não tem acesso
  if (permission && !hasPermission(auth.user.role, permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 bg-white shadow-2xl rounded-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Acesso Negado
            </h2>
            <p className="mb-6 text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
            <a
              href={fallback}
              className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Se tudo ok, renderiza os children
  return children;
}
