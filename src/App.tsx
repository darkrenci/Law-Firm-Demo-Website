import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Page } from './types';
import { ToastProvider } from './components/ui/Toast';
import { SearchModal } from './components/ui/SearchModal';
import { DemoSwitcher } from './components/ui/DemoSwitcher';
import { Button } from './components/ui/Buttons';

// Public Components
import { Header } from './components/public/Header';
import { AnnouncementBanner } from './components/public/AnnouncementBanner';
import { Footer } from './components/public/Footer';
import { SectionRenderer } from './components/public/SectionRenderer';
import { PracticeAreasView } from './components/public/PracticeAreasView';
import { AttorneysView } from './components/public/AttorneysView';
import { InsightsView } from './components/public/InsightsView';
import { NewsView } from './components/public/NewsView';
import { FAQsView } from './components/public/FAQsView';
import { ContactView } from './components/public/ContactView';
import { ConsultationView } from './components/public/ConsultationView';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PageManager } from './components/admin/PageManager';
import { AttorneyManager } from './components/admin/AttorneyManager';
import { PracticeAreaManager } from './components/admin/PracticeAreaManager';
import { ArticleManager } from './components/admin/ArticleManager';
import { NewsManager } from './components/admin/NewsManager';
import { FAQManager } from './components/admin/FAQManager';
import { ConsultationManager } from './components/admin/ConsultationManager';
import { MessageManager } from './components/admin/MessageManager';
import { MediaLibrary } from './components/admin/MediaLibrary';
import { SettingsManager } from './components/admin/SettingsManager';
import { AuditLogs } from './components/admin/AuditLogs';
import { AdminLogin } from './components/admin/AdminLogin';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>(db.getPages());

  // Listen to popstate for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check and listen to Supabase Auth session
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAdminAuthenticated(true);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdminAuthenticated(Boolean(session));
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Subscribe to db changes to keep pages up to date
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPages(db.getPages());
    });
    return unsub;
  }, []);

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (path !== currentPath) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
    }
  };

  const handleExitAdmin = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setIsAdminAuthenticated(false);
    handleNavigate('/');
  };

  // Keyboard shortcut Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine if currently in Admin Portal
  const isAdminRoute = currentPath.startsWith('/admin');

  // Render Admin View
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <ToastProvider>
          <AdminLogin
            onSuccess={() => setIsAdminAuthenticated(true)}
            onCancel={() => handleNavigate('/')}
          />
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <AdminLayout
          currentTab={adminTab}
          onTabChange={(tab) => setAdminTab(tab)}
          onExitAdmin={handleExitAdmin}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />
          )}
          {adminTab === 'pages' && (
            <PageManager onPreviewPage={(slug) => handleNavigate(slug)} />
          )}
          {adminTab === 'attorneys' && <AttorneyManager />}
          {adminTab === 'practice-areas' && <PracticeAreaManager />}
          {adminTab === 'articles' && <ArticleManager />}
          {adminTab === 'news' && <NewsManager />}
          {adminTab === 'faqs' && <FAQManager />}
          {adminTab === 'consultations' && <ConsultationManager />}
          {adminTab === 'messages' && <MessageManager />}
          {adminTab === 'media' && <MediaLibrary />}
          {adminTab === 'settings' && <SettingsManager />}
          {adminTab === 'logs' && <AuditLogs />}
        </AdminLayout>

        {/* Global Demo Switcher */}
        <DemoSwitcher
          currentPath={currentPath}
          onNavigate={handleNavigate}
          adminTab={adminTab}
          onSelectAdminTab={setAdminTab}
        />
      </ToastProvider>
    );
  }

  // PUBLIC SITE ROUTING
  const renderPublicView = () => {
    // 1. Deep Detail: Practice area individual page
    if (currentPath.startsWith('/practice-areas/') && currentPath !== '/practice-areas') {
      const rawSlug = currentPath.replace('/practice-areas/', '').split('/')[0].split('?')[0];
      const slug = decodeURIComponent(rawSlug).trim();
      return (
        <PracticeAreasView
          slug={slug || undefined}
          currentSlug={slug || undefined}
          onNavigate={handleNavigate}
        />
      );
    }

    // 2. Deep Detail: Partner individual profile
    if (
      (currentPath.startsWith('/attorneys/') && currentPath !== '/attorneys') ||
      (currentPath.startsWith('/partners/') && currentPath !== '/partners')
    ) {
      const rawSlug = currentPath.replace(/^\/(attorneys|partners)\//, '').split('/')[0].split('?')[0];
      const slug = decodeURIComponent(rawSlug).trim();
      return (
        <AttorneysView
          slug={slug || undefined}
          currentSlug={slug || undefined}
          onNavigate={handleNavigate}
        />
      );
    }

    // Retired sections: insights, news, faqs
    if (
      currentPath === '/insights' ||
      currentPath.startsWith('/insights/') ||
      currentPath === '/news' ||
      currentPath.startsWith('/news/') ||
      currentPath === '/faqs' ||
      currentPath.startsWith('/faqs/')
    ) {
      return (
        <div className="bg-[#0d0d11] min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
          <span className="font-cinzel text-xs text-[#c59b63] uppercase tracking-[0.25em]">
            Archival Notice
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">Section No Longer Active</h1>
          <p className="text-xs text-[#8e877e] max-w-sm">
            This section has been retired from the chamber website. Please return to the homepage or explore our partner directory.
          </p>
          <Button variant="gold-outline" size="sm" onClick={() => handleNavigate('/')}>
            Return to Homepage
          </Button>
        </div>
      );
    }

    // 5. CMS-driven Page rendering for all pages
    const cleanSlug = currentPath.replace(/^\//, '') || 'home';
    const matchedPage =
      (cleanSlug === 'partners' ? pages.find((p) => p.slug === 'attorneys' || p.slug === 'partners') : null) ||
      pages.find((p) => p.slug === cleanSlug) ||
      pages.find((p) => (cleanSlug === 'home' || cleanSlug === '') && (p.slug === '' || p.slug === 'home'));

    if (matchedPage && matchedPage.sections && matchedPage.sections.length > 0) {
      return (
        <SectionRenderer
          sections={matchedPage.sections}
          onNavigate={handleNavigate}
          isAdmin={false}
        />
      );
    }

    // Fallback dedicated view components if a page has no sections configured
    if (currentPath === '/practice-areas') {
      return <PracticeAreasView onNavigate={handleNavigate} />;
    }
    if (currentPath === '/attorneys' || currentPath === '/partners') {
      return <AttorneysView onNavigate={handleNavigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactView onNavigate={handleNavigate} />;
    }
    if (currentPath === '/consultation') {
      return <ConsultationView onNavigate={handleNavigate} />;
    }

    /* Commented out / hidden routes per user request (uncomment to activate dedicated views):
    if (currentPath === '/insights' || currentPath.startsWith('/insights/')) {
      const insightSlug = currentPath.startsWith('/insights/') ? currentPath.replace('/insights/', '') : undefined;
      return <InsightsView slug={insightSlug} onNavigate={handleNavigate} />;
    }
    if (currentPath === '/news' || currentPath.startsWith('/news/')) {
      const newsSlug = currentPath.startsWith('/news/') ? currentPath.replace('/news/', '') : undefined;
      return <NewsView slug={newsSlug} onNavigate={handleNavigate} />;
    }
    if (currentPath === '/faqs') {
      return <FAQsView onNavigate={handleNavigate} />;
    }
    */

    // Fallback 404
    return (
      <div className="bg-[#0d0d11] min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
        <span className="font-cinzel text-xs text-[#c59b63] uppercase tracking-[0.25em]">
          Notice of Non-Appearance
        </span>
        <h1 className="font-cormorant text-4xl text-[#f7f4ee]">404 — Record Not Found</h1>
        <p className="text-xs text-[#8e877e] max-w-sm">
          The requested docket or webpage could not be retrieved from the firm registry.
        </p>
        <button
          onClick={() => handleNavigate('/')}
          className="mt-4 px-6 py-2 bg-[#c59b63] text-[#0d0d11] font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-[#d4af7a] cursor-pointer"
        >
          Return to Chambers
        </button>
      </div>
    );
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0d0d11] text-[#f7f4ee] flex flex-col antialiased selection:bg-[#c59b63]/30 selection:text-[#f4e6d0]">
        {/* Top Chamber Announcement Banner */}
        <AnnouncementBanner onNavigate={handleNavigate} />

        {/* Public Header */}
        <Header
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAdmin={() => handleNavigate('/admin')}
        />

        {/* Main Content */}
        <main className="flex-1">{renderPublicView()}</main>

        {/* Public Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Global Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Global Demo Switcher */}
        <DemoSwitcher
          currentPath={currentPath}
          onNavigate={handleNavigate}
          adminTab={adminTab}
          onSelectAdminTab={setAdminTab}
        />
      </div>
    </ToastProvider>
  );
}
