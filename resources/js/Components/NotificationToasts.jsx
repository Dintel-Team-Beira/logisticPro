import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, XCircle, Bell } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function NotificationToasts({ notifications, onDismiss }) {
    const [visible, setVisible] = useState([]);

    // Obter IDs de notificações já mostradas do localStorage
    const getShownNotifications = () => {
        try {
            const shown = localStorage.getItem('shown_notifications');
            return shown ? JSON.parse(shown) : [];
        } catch {
            return [];
        }
    };

    // Adicionar notificação como "já mostrada"
    const markAsShown = (id) => {
        try {
            const shown = getShownNotifications();
            if (!shown.includes(id)) {
                shown.push(id);
                // Manter apenas últimas 100 notificações no histórico
                const recentShown = shown.slice(-100);
                localStorage.setItem('shown_notifications', JSON.stringify(recentShown));
            }
        } catch (error) {
            console.error('Erro ao salvar notificação mostrada:', error);
        }
    };

    useEffect(() => {
        // Obter lista de notificações já mostradas
        const shownIds = getShownNotifications();

        // Filtrar apenas notificações não lidas E que NUNCA foram mostradas
        const newNotifications = notifications
            .filter(n => !n.read && !shownIds.includes(n.id))
            .slice(0, 3); // Máximo 3 toasts por vez

        if (newNotifications.length > 0) {
            // Tocar som para cada nova notificação
            newNotifications.forEach((notif) => {
                playNotificationSound();
                // Marcar como "já mostrada" imediatamente
                markAsShown(notif.id);
            });

            // Adicionar às visíveis (sem duplicar)
            setVisible(prev => {
                const existingIds = prev.map(v => v.id);
                const toAdd = newNotifications.filter(n => !existingIds.includes(n.id));
                return [...toAdd, ...prev].slice(0, 3);
            });
        }
    }, [notifications]);

    const playNotificationSound = () => {
        try {
            // Som de notificação irritante/longo
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Criar oscilador para som mais irritante
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Frequências para som mais irritante (tipo alarme)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);

            // Volume
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (error) {
            console.error('Erro ao tocar som:', error);
        }
    };

    const handleDismiss = (id) => {
        // Remover do estado de visíveis
        setVisible(prev => prev.filter(n => n.id !== id));

        // Garantir que está marcada como mostrada
        markAsShown(id);

        // Callback opcional (pode marcar como lida se necessário)
        if (onDismiss) {
            onDismiss(id);
        }
    };

    const handleClick = (notification) => {
        if (notification.action_url) {
            router.visit(notification.action_url);
            handleDismiss(notification.id);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getBackgroundColor = (type) => {
        switch (type) {
            case 'success':
                return 'from-green-50 to-green-100 border-green-200';
            case 'warning':
                return 'from-yellow-50 to-yellow-100 border-yellow-200';
            case 'error':
                return 'from-red-50 to-red-100 border-red-200';
            default:
                return 'from-blue-50 to-blue-100 border-blue-200';
        }
    };

    return (
        <div className="fixed top-20 right-6 z-[9999] space-y-3 pointer-events-none">
            <AnimatePresence>
                {visible.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -50, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            delay: index * 0.1
                        }}
                        className="pointer-events-auto"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.02, 1],
                                boxShadow: [
                                    "0 10px 30px rgba(0, 0, 0, 0.1)",
                                    "0 15px 40px rgba(0, 0, 0, 0.2)",
                                    "0 10px 30px rgba(0, 0, 0, 0.1)",
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className={`
                                relative w-96 p-4 rounded-xl border-2
                                bg-gradient-to-br ${getBackgroundColor(notification.type)}
                                shadow-2xl backdrop-blur-xl
                            `}
                        >
                            {/* Pulse Animation Background */}
                            <motion.div
                                className="absolute inset-0 rounded-xl bg-white opacity-20"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            <div className="relative flex items-start gap-3">
                                {/* Icon Tipo de Notificação */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                    className="flex-shrink-0"
                                >
                                    {getIcon(notification.type)}
                                </motion.div>

                                {/* Content */}
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => handleClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-900">
                                                {notification.title}
                                            </h4>
                                            {/* Bell Icon ao lado do título */}
                                            <motion.div
                                                animate={{
                                                    rotate: [-15, 15, -15],
                                                }}
                                                transition={{
                                                    duration: 0.4,
                                                    repeat: Infinity,
                                                    repeatDelay: 1.5
                                                }}
                                            >
                                                <Bell className="w-4 h-4 text-blue-600 fill-blue-500" />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-700 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {notification.time}
                                    </p>
                                </div>

                                {/* Close Button */}
                                <motion.button
                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismiss(notification.id);
                                    }}
                                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
