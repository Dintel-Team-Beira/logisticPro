import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Breadcrumbs({ items }) {
  const { isDark } = useTheme();

  if (!items || items.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {/* Home */}
        <li>
          <Link
            href="/dashboard"
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg
              transition-colors text-sm font-medium
              ${isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            aria-label="Home"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight
                className={`h-4 w-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-semibold
                    ${isDark
                      ? 'text-blue-400 bg-blue-900/30'
                      : 'text-blue-600 bg-blue-50'
                    }
                  `}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-colors
                    ${isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}
