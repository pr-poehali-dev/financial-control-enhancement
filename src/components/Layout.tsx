import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

export type Page =
  | 'home'
  | 'dashboard'
  | 'deals'
  | 'transactions'
  | 'analytics'
  | 'obligations'
  | 'counterparties'
  | 'accounts'
  | 'categories'
  | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: string; group?: string }[] = [
  { id: 'home', label: 'Главная', icon: 'House' },
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'deals', label: 'Сделки', icon: 'Handshake' },
  { id: 'transactions', label: 'Транзакции', icon: 'ArrowLeftRight' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
  { id: 'obligations', label: 'Обязательства', icon: 'ShieldCheck' },
  { id: 'counterparties', label: 'Контрагенты', icon: 'Building2', group: 'Справочники' },
  { id: 'accounts', label: 'Счета', icon: 'Wallet', group: 'Справочники' },
  { id: 'categories', label: 'Категории', icon: 'Tag', group: 'Справочники' },
  { id: 'settings', label: 'Настройки', icon: 'Settings', group: 'Система' },
];

interface LayoutProps {
  children: (page: Page, setPage: (p: Page) => void) => React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groups = NAV_ITEMS.reduce<{ group: string | null; items: typeof NAV_ITEMS }[]>((acc, item) => {
    const g = item.group ?? null;
    const last = acc[acc.length - 1];
    if (last && last.group === g) {
      last.items.push(item);
    } else {
      acc.push({ group: g, items: [item] });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background flex gradient-mesh">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="TrendingUp" size={16} className="text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">ФинКонтроль</div>
            <div className="text-[10px] text-muted-foreground">Управление финансами</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {groups.map((g, gi) => (
            <div key={gi}>
              {g.group && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {g.group}
                </div>
              )}
              <div className="space-y-0.5">
                {g.items.map(item => (
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
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border flex-shrink-0">
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