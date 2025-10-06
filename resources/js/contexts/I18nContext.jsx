import { createContext, useContext, useState } from 'react';

const I18nContext = createContext();

const translations = {
  pt: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.shipments': 'Shipments',
    'nav.operations': 'Operações',
    'nav.documents': 'Documentos',
    'nav.finances': 'Finanças',
    'nav.reports': 'Relatórios',
    'nav.users': 'Usuários',
    'nav.settings': 'Configurações',
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',

    // Operations
    'operations.coleta': 'Coleta de Dispersa',
    'operations.legalizacao': 'Legalização',
    'operations.alfandegas': 'Alfândegas',
    'operations.cornelder': 'Cornelder',

    // Common
    'common.search': 'Buscar...',
    'common.notifications': 'Notificações',
    'common.theme.toggle': 'Alternar tema',
    'common.language': 'Idioma',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.shipments': 'Shipments',
    'nav.operations': 'Operations',
    'nav.documents': 'Documents',
    'nav.finances': 'Finances',
    'nav.reports': 'Reports',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',

    // Operations
    'operations.coleta': 'Collection',
    'operations.legalizacao': 'Legalization',
    'operations.alfandegas': 'Customs',
    'operations.cornelder': 'Cornelder',

    // Common
    'common.search': 'Search...',
    'common.notifications': 'Notifications',
    'common.theme.toggle': 'Toggle theme',
    'common.language': 'Language',
  },
};

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'pt';
  });

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key) => {
    return translations[locale]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
