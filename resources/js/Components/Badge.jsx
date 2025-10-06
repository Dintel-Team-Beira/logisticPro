import { motion } from 'framer-motion';

export default function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        purple: 'bg-purple-100 text-purple-800',
        indigo: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </motion.span>
    );
}
