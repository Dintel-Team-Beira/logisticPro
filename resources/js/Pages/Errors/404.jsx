import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Home, RefreshCw, ArrowLeft, ServerCrash, Lock, FileQuestion } from 'lucide-react';

export default function ErrorPage({ status = 404 }) {
  const [isDark, setIsDark] = React.useState(false);

  const errorConfig = {
    503: {
      title: '503: Serviço Indisponível',
      subtitle: 'Manutenção em Progresso',
      description: 'Estamos realizando melhorias no sistema. Por favor, tente novamente em alguns minutos.',
      icon: ServerCrash,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    500: {
      title: '500: Erro no Servidor',
      subtitle: 'Algo Deu Errado',
      description: 'Ocorreu um erro interno no servidor. Nossa equipe foi notificada e está trabalhando para resolver.',
      icon: AlertCircle,
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    404: {
      title: '404: Página Não Encontrada',
      subtitle: 'Rota Perdida',
      description: 'A página que você está procurando não existe ou foi movida para outro endereço.',
      icon: FileQuestion,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    403: {
      title: '403: Acesso Negado',
      subtitle: 'Permissão Necessária',
      description: 'Você não tem permissão para acessar este recurso. Entre em contato com o administrador.',
      icon: Lock,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  };

  const config = errorConfig[status] || errorConfig[404];
  const IconComponent = config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    // <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br ' + config.bgGradient}`}>
    <div className="flex items-center justify-center min-h-screen p-4">
                <img
                    id="background"
                    className="absolute -left-20 top-0 max-w-[877px]"
                    src="https://laravel.com/assets/img/welcome/background.svg"
                />
      {/* Theme Toggle */}
      {/* <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 p-3 rounded-xl transition-all duration-200 ${
          isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-md'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button> */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <motion.div
          className={`rounded-2xl p-8 md:p-12 shadow-sm ${  isDark ? 'bg-gray-800/10 backdrop-blur-xl border border-gray-700' : 'bg-white-100/10 backdrop-blur-sm border border-gray-200'
          }`}
        >
          {/* Icon Section */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="flex justify-center mb-8"
          >
            <div className={`relative`}>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : config.iconBg}`}
              >
                <IconComponent className={`w-16 h-16 ${isDark ? 'text-blue-400' : config.iconColor}`} strokeWidth={1.5} />
              </motion.div>

              {/* Decorative circles */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-20 blur-xl`}
              />
            </div>
          </motion.div>

          {/* Status Code */}
          <motion.div variants={itemVariants} className="mb-4 text-center">
            <h1 className={`text-8xl font-bold bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent`}>
              {status}
            </h1>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="mb-3 text-center">
            <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {config.subtitle}
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <p className={`text-base md:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-md mx-auto`}>
              {config.description}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/'}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              } shadow-lg`}
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all duration-200 ${
                isDark
                  ? 'border-gray-600 hover:bg-gray-700 text-white'
                  : 'border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </motion.button>
          </motion.div>

          {/* Help Text */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Precisa de ajuda?{' '}
              <a
                href="support@dintell.co.mz"
                className={`font-medium underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Contate o suporte
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            © 2025 Logística Pro • DINTELL
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
