import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initDatabase, DEFAULT_SETTINGS } from './db/database';
import { Book, BookStatus } from './types/book';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './pages/HomeScreen';
import { LibraryScreen } from './pages/LibraryScreen';
import { BudgetScreen } from './pages/BudgetScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { AddEditBookModal } from './components/AddEditBookModal';
import { OnboardingBudgetModal } from './components/OnboardingBudgetModal';
import { BookOpen, Home, BarChart3, Settings, Plus, WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<BookStatus | 'all'>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Initialize DB with sample data on first run
  useEffect(() => {
    initDatabase();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reactive live query from IndexedDB
  const books = useLiveQuery(() => db.books.toArray(), []) || [];
  const settings = useLiveQuery(() => db.settings.get('default'), []) || DEFAULT_SETTINGS;

  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsAddModalOpen(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب من مكتبتك؟')) {
      const book = await db.books.get(bookId);
      if (book?.coverImageId) {
        await db.coverImages.delete(book.coverImageId);
      }
      await db.books.delete(bookId);
    }
  };

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    await db.books.update(bookId, {
      status: newStatus,
      updatedAt: Date.now(),
    });
  };

  const handleNavigateToLibrary = (initialFilter?: BookStatus) => {
    if (initialFilter) {
      setLibraryFilter(initialFilter);
    } else {
      setLibraryFilter('all');
    }
    setActiveTab('library');
  };

  const navItems = [
    { id: 'home' as NavTab, label: 'الرئيسية', icon: Home },
    { id: 'library' as NavTab, label: 'مكتبتي', icon: BookOpen },
    { id: 'budget' as NavTab, label: 'الميزانية', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F4EB] via-[#F3ECE2] to-[#EAE0D3] text-sila-text flex flex-col font-arabic relative overflow-x-clip selection:bg-sila-amber selection:text-white">
      {/* Ambient background light gradients for physical Apple / visionOS depth */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#E8D7C2]/40 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#DFCBB2]/30 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Offline banner if disconnected */}
      {isOffline && (
        <div className="bg-[#4D3F35] text-amber-100 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 z-50 sticky top-0 shadow-sm">
          <WifiOff className="w-3.5 h-3.5" />
          <span>وضع عدم الاتصال: التطبيق يعمل بكامل وظائفه ومحلياً على جهازك.</span>
        </div>
      )}

      {/* Real Website Top Header Bar - Persistent Sticky when scrolling */}
      <header className="sticky top-0 z-50 bg-[#FAF6F0]/90 backdrop-blur-2xl border-b border-white/90 shadow-glass-sm transition-all">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <img
              src="/sila-logo.png"
              alt="شعار معرض الجزائر الدولي للكتاب SILA"
              className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-white/80 shrink-0"
            />
            <div>
              <div className="font-bold text-base md:text-lg text-sila-text leading-tight font-arabic flex items-center gap-2">
                <span>مكتبتي في المعرض</span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-sila-amberSoft text-sila-amber px-2 py-0.5 rounded-full border border-sila-amber/20">
                  SILA
                </span>
              </div>
              <div className="text-[11px] text-sila-muted hidden sm:block">
                صالون الجزائر الدولي للكتاب · قصر المعارض
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.04] p-1 rounded-2xl border border-white/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-sila-amber shadow-sm'
                      : 'text-sila-muted hover:text-sila-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Add Book Button) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBookToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="bg-gradient-to-r from-sila-amber to-sila-amberLight text-white px-3.5 md:px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة كتاب</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Website Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-6 pb-28 md:pb-12">
        {activeTab === 'home' && (
          <HomeScreen
            books={books}
            onOpenAddModal={() => {
              setBookToEdit(null);
              setIsAddModalOpen(true);
            }}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onStatusChange={handleStatusChange}
            onNavigateToLibrary={handleNavigateToLibrary}
            onNavigateToBudget={() => setActiveTab('budget')}
            onSearchChange={(q) => setLibrarySearch(q)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            books={books}
            initialFilter={libraryFilter}
            initialSearch={librarySearch}
            onOpenAddModal={() => {
              setBookToEdit(null);
              setIsAddModalOpen(true);
            }}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetScreen
            books={books}
            settings={settings}
            onEditBook={handleEditBook}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            books={books}
            settings={settings}
            onNavigateToBudget={() => setActiveTab('budget')}
            onDataReset={() => {}}
          />
        )}
      </main>

      {/* Mobile Floating Bottom Dock (hidden on desktop) */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Add / Edit Book Modal Dialog */}
      <AddEditBookModal
        isOpen={isAddModalOpen}
        bookToEdit={bookToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setBookToEdit(null);
        }}
      />

      {/* First Enter Onboarding Budget Question */}
      <OnboardingBudgetModal
        isOpen={Boolean(settings && !settings.hasSeenOnboarding)}
        settings={settings}
        onComplete={() => {}}
      />
    </div>
  );
};
