import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
    const Component = hover ? motion.div : 'div';

    const hoverProps = hover ? {
        whileHover: { y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
        transition: { duration: 0.2 }
    } : {};

    return (
        <Component
            className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}
            {...hoverProps}
            {...props}
        >
            {children}
        </Component>
    );
}
