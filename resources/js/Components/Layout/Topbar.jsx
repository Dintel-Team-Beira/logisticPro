import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Globe,
  Ship,
} from 'lucide-react';

export default function Topbar({ onMenuToggle, isMobile }) {
  const { auth, notifications } = usePage().props;
  const { theme, toggleTheme, isDark } = useTheme();
  const { locale, changeLocale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const languageMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get('/search', { q: searchQuery });
    }
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-40 h-16
        ${isDark ? 'bg-gray-900/95' : 'bg-white/95'}
        backdrop-blur-xl border-b
        ${isDark ? 'border-gray-800' : 'border-gray-200'}
        shadow-sm
      `}
      role="banner"
    >
      <div className="flex items-center justify-between h-full gap-4 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              lg:hidden
            `}
            aria-label="Toggle menu"
            aria-expanded={false}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Go to dashboard">
            <div className="p-2 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              <Ship className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className={`
              hidden md:block text-xl font-bold
              bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent
            `}>
              Logistic Pro
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <form onSubmit={handleSearch} className="flex-1 hidden max-w-2xl md:flex">
          <div className="relative w-full">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-12 pr-4 py-2.5 rounded-xl border-0
                ${isDark ? 'bg-gray-800 text-gray-200 placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}
                focus:ring-2 focus:ring-blue-500 transition-all
              `}
              aria-label="Search shipments and documents"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`
              p-2 rounded-xl transition-colors
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
            aria-label={t('common.theme.toggle')}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`
                p-2 rounded-xl transition-colors
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}
              aria-label={t('common.language')}
              aria-expanded={showLanguageMenu}
            >
              <Globe className="w-5 h-5" aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {showLanguageMenu && (
                <LanguageMenu
                  locale={locale}
                  onChangeLocale={(newLocale) => {
                    changeLocale(newLocale);
                    setShowLanguageMenu(false);
                  }}
                  isDark={isDark}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                p-2 rounded-xl transition-colors relative
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}
              aria-label={`${unreadCount} ${t('common.notifications')}`}
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg top-1 right-1"
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationsDropdown
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  isDark={isDark}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-xl transition-colors
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}
              aria-label="User menu"
              aria-expanded={showProfileMenu}
            >
              <div className="hidden text-right md:block">
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {auth.user?.name}
                </p>
                <p className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {auth.user?.role}
                </p>
              </div>
              <div className="relative">
                {auth.user?.avatar ? (
                  <img
                    src={auth.user.avatar}
                    alt={auth.user.name}
                    className="object-cover w-10 h-10 rounded-full ring-2 ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-600 to-purple-600 ring-2 ring-blue-500">
                    {auth.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-gray-900"></div>
              </div>
              <ChevronDown className="hidden w-4 h-4 md:block" aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <ProfileDropdown
                  user={auth.user}
                  onLogout={handleLogout}
                  onClose={() => setShowProfileMenu(false)}
                  isDark={isDark}
                  t={t}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function LanguageMenu({ locale, onChangeLocale, isDark }) {
  const languages = [
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`
        absolute right-0 top-12 w-48
        ${isDark ? 'bg-gray-800' : 'bg-white'}
        rounded-2xl shadow-2xl border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        overflow-hidden
      `}
      role="menu"
    >
      <div className="p-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onChangeLocale(lang.code)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors text-left
              ${locale === lang.code
                ? isDark
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-blue-50 text-blue-700'
                : isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
            role="menuitem"
          >
            <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function NotificationsDropdown({ notifications, onClose, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`
        absolute right-0 top-12 w-96
        ${isDark ? 'bg-gray-800' : 'bg-white'}
        rounded-2xl shadow-2xl border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        overflow-hidden
      `}
      role="dialog"
      aria-label="Notifications"
    >
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <h3 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
          Notificações
        </h3>
        <button
          onClick={onClose}
          className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          Marcar todas como lida
        </button>
      </div>
      <div className="overflow-y-auto max-h-96">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              whileHover={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)' }}
              className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} last:border-0 cursor-pointer`}
            >
              <div className="flex gap-3">
                <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" aria-label="Unread"></div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden="true" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhuma notificação</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileDropdown({ user, onLogout, onClose, isDark, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`
        absolute right-0 top-12 w-72
        ${isDark ? 'bg-gray-800' : 'bg-white'}
        rounded-2xl shadow-2xl border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        overflow-hidden
      `}
      role="menu"
    >
      <div className={`p-4 ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="object-cover w-12 h-12 rounded-full ring-2 ring-white"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-blue-600 to-purple-600 ring-2 ring-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {user?.name}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
      <div className="p-2">
        <Link href="/profile">
          <motion.button
            whileHover={{ x: 4 }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors text-left
              ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
            role="menuitem"
          >
            <User className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{t('nav.profile')}</span>
          </motion.button>
        </Link>
        <Link href="/settings">
          <motion.button
            whileHover={{ x: 4 }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors text-left
              ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
            role="menuitem"
          >
            <SettingsIcon className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{t('nav.settings')}</span>
          </motion.button>
        </Link>
        <div className={`my-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
        <motion.button
          whileHover={{ x: 4 }}
          onClick={onLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
            transition-colors text-left
            ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}
          `}
          role="menuitem"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">{t('nav.logout')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
