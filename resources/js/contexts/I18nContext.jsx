import { createContext, useContext, useState } from 'react';

const I18nContext = createContext();

// Adicione estas traduções no objeto translations:

const translations = {
  pt: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.shipments': 'Shipments',
    'nav.clients': 'Clientes', // 🆕 NOVO
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

    // 🆕 CLIENTS TRANSLATIONS 🆕
    'clients.title': 'Clientes',
    'clients.new': 'Novo Cliente',
    'clients.edit': 'Editar Cliente',
    'clients.delete': 'Excluir Cliente',
    'clients.view': 'Ver Cliente',
    'clients.total': 'Total de Clientes',
    'clients.active': 'Clientes Ativos',
    'clients.blocked': 'Clientes Bloqueados',
    'clients.vip': 'Clientes VIP',
    'clients.search': 'Buscar clientes...',
    'clients.type': 'Tipo de Cliente',
    'clients.priority': 'Prioridade',
    'clients.company': 'Empresa',
    'clients.individual': 'Pessoa Física',
    'clients.government': 'Governamental',
    'clients.ngo': 'ONG',
    'clients.low': 'Baixa',
    'clients.medium': 'Média',
    'clients.high': 'Alta',
    'clients.vip_label': 'VIP',
    // FIM DAS TRADUÇÕES

    // Common
    'common.search': 'Buscar...',
    'common.notifications': 'Notificações',
    'common.theme.toggle': 'Alternar tema',
    'common.language': 'Idioma',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.export': 'Exportar',
    'common.filter': 'Filtrar',
    'common.clear_filters': 'Limpar Filtros',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.shipments': 'Shipments',
    'nav.clients': 'Clients', // 🆕 NOVO
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

    // 🆕 CLIENTS TRANSLATIONS 🆕
    'clients.title': 'Clients',
    'clients.new': 'New Client',
    'clients.edit': 'Edit Client',
    'clients.delete': 'Delete Client',
    'clients.view': 'View Client',
    'clients.total': 'Total Clients',
    'clients.active': 'Active Clients',
    'clients.blocked': 'Blocked Clients',
    'clients.vip': 'VIP Clients',
    'clients.search': 'Search clients...',
    'clients.type': 'Client Type',
    'clients.priority': 'Priority',
    'clients.company': 'Company',
    'clients.individual': 'Individual',
    'clients.government': 'Government',
    'clients.ngo': 'NGO',
    'clients.low': 'Low',
    'clients.medium': 'Medium',
    'clients.high': 'High',
    'clients.vip_label': 'VIP',
    // FIM DAS TRADUÇÕES

    // Common
    'common.search': 'Search...',
    'common.notifications': 'Notifications',
    'common.theme.toggle': 'Toggle theme',
    'common.language': 'Language',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.export': 'Export',
    'common.filter': 'Filter',
    'common.clear_filters': 'Clear Filters',
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
