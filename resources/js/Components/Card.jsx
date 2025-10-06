import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : {}}
            className={`
                bg-white rounded-xl shadow-md
                border border-gray-100
                transition-all duration-300
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    );
}
