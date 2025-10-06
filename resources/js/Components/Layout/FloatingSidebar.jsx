import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { hasPermission, PERMISSIONS } from '@/config/permissions';
import {
  Home,
  Package,
  Layers,
  FileText,
  DollarSign,
  BarChart3,
  Ship,
  Users,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react';

const SIDEBAR_COLLAPSED_WIDTH = 80;
const SIDEBAR_EXPANDED_WIDTH = 256;

export default function FloatingSidebar({ isOpen, setIsOpen, isMobile }) {
  const { auth } = usePage().props;
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const currentPath = window.location.pathname;

  const menuItems = [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: Home,
      href: '/dashboard',
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      key: 'shipments',
      label: t('nav.shipments'),
      icon: Package,
      href: '/shipments',
      permission: PERMISSIONS.VIEW_SHIPMENTS,
      badge: '12',
    },
    {
      key: 'operations',
      label: t('nav.operations'),
      icon: Layers,
      permission: PERMISSIONS.VIEW_SHIPMENTS,
      submenu: [
        {
          key: 'coleta',
          label: t('operations.coleta'),
          href: '/operations/coleta',
          permission: PERMISSIONS.VIEW_SHIPMENTS,
        },
        {
          key: 'legalizacao',
          label: t('operations.legalizacao'),
          href: '/operations/legalizacao',
          permission: PERMISSIONS.VIEW_SHIPMENTS,
        },
        {
          key: 'alfandegas',
          label: t('operations.alfandegas'),
          href: '/operations/alfandegas',
          permission: PERMISSIONS.VIEW_SHIPMENTS,
        },
        {
          key: 'cornelder',
          label: t('operations.cornelder'),
          href: '/operations/cornelder',
          permission: PERMISSIONS.VIEW_SHIPMENTS,
        },
      ],
    },
    {
      key: 'documents',
      label: t('nav.documents'),
      icon: FileText,
      href: '/documents',
      permission: PERMISSIONS.VIEW_DOCUMENTS,
    },
    {
      key: 'finances',
      label: t('nav.finances'),
      icon: DollarSign,
      href: '/invoices',
      permission: PERMISSIONS.VIEW_FINANCES,
      badge: '3',
    },
    {
      key: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      href: '/reports',
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      key: 'shipping-lines',
      label: 'Linhas Navegação',
      icon: Ship,
      href: '/shipping-lines',
      permission: PERMISSIONS.MANAGE_SETTINGS,
    },
    {
      key: 'users',
      label: t('nav.users'),
      icon: Users,
      href: '/users',
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      key: 'settings',
      label: t('nav.settings'),
      icon: Settings,
      href: '/settings',
      permission: PERMISSIONS.VIEW_SETTINGS,
    },
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    const hasAccess = hasPermission(auth.user?.role, item.permission);

    if (hasAccess && item.submenu) {
      // Filter submenu items
      item.submenu = item.submenu.filter(subItem =>
        !subItem.permission || hasPermission(auth.user?.role, subItem.permission)
      );
      return item.submenu.length > 0;
    }

    return hasAccess;
  });

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
      setExpandedSubmenu(null);
    }
  };

  const toggleSubmenu = (key) => {
    setExpandedSubmenu(prev => prev === key ? null : key);
  };

  const sidebarVariants = {
    collapsed: { width: SIDEBAR_COLLAPSED_WIDTH },
    expanded: { width: SIDEBAR_EXPANDED_WIDTH },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: isOpen ? 0 : -SIDEBAR_EXPANDED_WIDTH }
            : isExpanded
            ? 'expanded'
            : 'collapsed'
        }
        variants={!isMobile ? sidebarVariants : undefined}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed left-0 top-16 bottom-0 z-50
          ${isDark ? 'bg-gray-900/95' : 'bg-white/95'}
          backdrop-blur-xl border-r
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
          shadow-2xl
          ${isMobile ? 'w-64' : ''}
        `}
        style={isMobile ? { width: SIDEBAR_EXPANDED_WIDTH } : undefined}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-x-hidden overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isExpanded={isExpanded || isMobile}
                currentPath={currentPath}
                expandedSubmenu={expandedSubmenu}
                onToggleSubmenu={toggleSubmenu}
                userRole={auth.user?.role}
              />
            ))}
          </nav>

          {/* User Info at Bottom */}
          {(isExpanded || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`
                p-4 border-t
                ${isDark ? 'border-gray-800' : 'border-gray-200'}
              `}
            >
              <div className={`
                p-4 rounded-xl
                ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-50 to-purple-50'}
              `}>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  Plano Pro
                </p>
                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Shipments ilimitados
                </p>
                <button className="w-full px-3 py-2 text-sm font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upgrade
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function MenuItem({ item, isExpanded, currentPath, expandedSubmenu, onToggleSubmenu, userRole }) {
  const { isDark } = useTheme();
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isSubmenuExpanded = expandedSubmenu === item.key;

  if (hasSubmenu) {
    return (
      <div>
        <button
          onClick={() => onToggleSubmenu(item.key)}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            transition-all duration-200 group
            ${isSubmenuExpanded
              ? isDark
                ? 'bg-blue-900/30 text-blue-400'
                : 'bg-blue-50 text-blue-600'
              : isDark
              ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
          aria-expanded={isSubmenuExpanded}
          aria-label={`${item.label} menu`}
        >
          <item.icon className="flex-shrink-0 w-5 h-5" aria-hidden="true" />
          {isExpanded && (
            <>
              <span className="flex-1 font-medium text-left truncate">{item.label}</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isSubmenuExpanded ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <AnimatePresence>
          {isSubmenuExpanded && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 ml-8 space-y-1 overflow-hidden"
            >
              {item.submenu.map((subItem) => (
                <Link
                  key={subItem.key}
                  href={subItem.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-all duration-200 text-sm
                    ${currentPath === subItem.href
                      ? isDark
                        ? 'bg-blue-900/30 text-blue-400 font-medium'
                        : 'bg-blue-100 text-blue-700 font-medium'
                      : isDark
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  aria-current={currentPath === subItem.href ? 'page' : undefined}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></div>
                  <span className="truncate">{subItem.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative flex items-center gap-3 px-3 py-3 rounded-xl
          transition-all duration-200 group
          ${isActive
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
            : isDark
            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className="flex-shrink-0 w-5 h-5" aria-hidden="true" />
        {isExpanded && (
          <>
            <span className="flex-1 font-medium truncate">{item.label}</span>
            {item.badge && (
              <span
                className={`
                  px-2 py-0.5 text-xs font-bold rounded-full
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : isDark
                    ? 'bg-blue-900/50 text-blue-400'
                    : 'bg-blue-100 text-blue-700'
                  }
                `}
                aria-label={`${item.badge} items`}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
        {!isExpanded && item.badge && (
          <span
            className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg -top-1 -right-1"
            aria-label={`${item.badge} items`}
          >
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}
