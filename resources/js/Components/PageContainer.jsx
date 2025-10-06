import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function PageContainer({
  children,
  title,
  description,
  actions,
  className = ''
}) {
  const { isDark } = useTheme();

  return (
    <div className={className}>
      {(title || description || actions) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              {title && (
                <h1 className={`
                  text-3xl md:text-4xl font-bold mb-2
                  ${isDark ? 'text-gray-100' : 'text-gray-900'}
                `}>
                  {title}
                </h1>
              )}
              {description && (
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </motion.div>
      )}
      {children}
    </div>
  );
}
