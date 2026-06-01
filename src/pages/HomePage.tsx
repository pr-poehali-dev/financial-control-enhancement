import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const FEATURES = [
  { icon: 'LayoutDashboard', title: 'Дашборд', desc: 'Ключевые метрики, дивиденды и зарплаты в реальном времени', page: 'dashboard', color: '#22c55e' },
  { icon: 'Handshake', title: 'Сделки', desc: 'Учёт сделок с расходами, маржой и привязкой к менеджеру', page: 'deals', color: '#3b82f6' },
  { icon: 'ArrowLeftRight', title: 'Транзакции', desc: 'История всех платежей, выплат ЗП и дивидендов', page: 'transactions', color: '#a855f7' },
  { icon: 'BarChart3', title: 'Аналитика', desc: 'Графики по периодам, структура доходов и расходов', page: 'analytics', color: '#f97316' },
  { icon: 'Settings', title: 'Настройки', desc: 'Проценты дивидендов и комиссий менеджеров', page: 'settings', color: '#eab308' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative mb-12 text-center pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Версия 1.0 · Готово к работе
        </div>
        <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-4 leading-none tracking-tight">
          Контроль
          <span className="neon-text"> финансов</span>
          <br />под рукой
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Единая система для управления сделками, расчёта маржи, автоматических выплат зарплат и дивидендов
        </p>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            Открыть дашборд
          </button>
          <button
            onClick={() => onNavigate('deals')}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-all border border-border"
          >
            Перейти к сделкам
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Разделов', value: '6' },
          { label: 'Авторасчёт', value: '✓' },
          { label: 'Менеджеры', value: '∞' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center border border-border">
            <div className="text-2xl font-black font-mono text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <button
            key={f.page}
            onClick={() => onNavigate(f.page)}
            className="glass-card border border-border rounded-2xl p-5 text-left hover:border-primary/30 transition-all hover:scale-[1.02] group animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}
            >
              <Icon name={f.icon} size={18} style={{ color: f.color }} />
            </div>
            <div className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{f.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
