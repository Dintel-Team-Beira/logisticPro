import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function FlashMessages() {
  const { flash } = usePage().props;
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newMessages = [];

    if (flash?.success) {
      newMessages.push({ id: Date.now(), type: 'success', message: flash.success });
    }
    if (flash?.error) {
      newMessages.push({ id: Date.now() + 1, type: 'error', message: flash.error });
    }
    if (flash?.warning) {
      newMessages.push({ id: Date.now() + 2, type: 'warning', message: flash.warning });
    }
    if (flash?.info) {
      newMessages.push({ id: Date.now() + 3, type: 'info', message: flash.info });
    }

    if (newMessages.length > 0) {
      setMessages(newMessages);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setMessages([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flash]);

  const dismissMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="fixed z-50 max-w-md space-y-3 top-20 right-4" role="region" aria-live="polite">
      <AnimatePresence>
        {messages.map((msg) => (
          <FlashMessage
            key={msg.id}
            type={msg.type}
            message={msg.message}
            onDismiss={() => dismissMessage(msg.id)}
            isDark={isDark}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FlashMessage({ type, message, onDismiss, isDark }) {
  const configs = {
    success: {
      icon: CheckCircle,
      lightBg: 'bg-green-50 border-green-200',
      darkBg: 'bg-green-900/30 border-green-700',
      lightText: 'text-green-800',
      darkText: 'text-green-200',
      iconColor: 'text-green-500',
    },
    error: {
      icon: XCircle,
      lightBg: 'bg-red-50 border-red-200',
      darkBg: 'bg-red-900/30 border-red-700',
      lightText: 'text-red-800',
      darkText: 'text-red-200',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertCircle,
      lightBg: 'bg-yellow-50 border-yellow-200',
      darkBg: 'bg-yellow-900/30 border-yellow-700',
      lightText: 'text-yellow-800',
      darkText: 'text-yellow-200',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: Info,
      lightBg: 'bg-blue-50 border-blue-200',
      darkBg: 'bg-blue-900/30 border-blue-700',
      lightText: 'text-blue-800',
      darkText: 'text-blue-200',
      iconColor: 'text-blue-500',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${isDark ? config.darkBg : config.lightBg}
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />
      <p className={`flex-1 font-medium text-sm ${isDark ? config.darkText : config.lightText}`}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        className={`
          p-1 rounded-lg transition-colors
          ${isDark
            ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
            : 'hover:bg-black/5 text-gray-600 hover:text-gray-900'
          }
        `}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
