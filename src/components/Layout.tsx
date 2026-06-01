import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'dashboard' | 'deals' | 'transactions' | 'analytics' | 'settings';

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'Главная', icon: 'House' },
  { id: 'dashboard' as Page, label: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'deals' as Page, label: 'Сделки', icon: 'Handshake' },
  { id: 'transactions' as Page, label: 'Транзакции', icon: 'ArrowLeftRight' },
  { id: 'analytics' as Page, label: 'Аналитика', icon: 'BarChart3' },
  { id: 'settings' as Page, label: 'Настройки', icon: 'Settings' },
];

interface LayoutProps {
  children: (page: Page, setPage: (p: Page) => void) => React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex gradient-mesh">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="TrendingUp" size={16} className="text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">ФинКонтроль</div>
            <div className="text-[10px] text-muted-foreground">Управление финансами</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                page === item.id
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon
                name={item.icon}
                size={16}
                className={`flex-shrink-0 transition-colors ${page === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
              />
              {item.label}
              {page === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon name="User" size={12} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">Администратор</div>
              <div className="text-[10px] text-muted-foreground">admin@company.ru</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-14 border-b border-border bg-background/80 backdrop-blur-md">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="Menu" size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto">
          {children(page, setPage)}
        </main>
      </div>
    </div>
  );
}
