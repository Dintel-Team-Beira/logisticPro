import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import FloatingSidebar from '@/Components/Layout/FloatingSidebar';
import Topbar from '@/Components/Layout/Topbar';
import Breadcrumbs from '@/Components/Layout/Breadcrumbs';
import FlashMessages from '@/Components/Layout/FlashMessages';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout({ children, title, breadcrumbs }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [window.location.pathname]);

  return (
    <ThemeProvider>
      <I18nProvider>
        <LayoutContent
          title={title}
          breadcrumbs={breadcrumbs}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          isMobile={isMobile}
        >
          {children}
        </LayoutContent>
      </I18nProvider>
    </ThemeProvider>
  );
}

function LayoutContent({
  title,
  breadcrumbs,
  children,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isMobile
}) {
  return (
    <div  className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {title && <Head title={title} />}

      {/* Flash Messages */}
      <FlashMessages />

      {/* Topbar */}
      <Topbar
        onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobile={isMobile}
      />

      {/* Sidebar */}
      <FloatingSidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          pt-16
          ${isMobile ? '' : 'lg:ml-20'}
          min-h-screen
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

          {/* Page Content */}
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      {/* <Footer isMobile={isMobile} /> */}
    </div>
  );
}


