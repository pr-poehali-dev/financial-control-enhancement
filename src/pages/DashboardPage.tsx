import { useFinanceStore } from '@/store/FinanceContext';
import Icon from '@/components/ui/icon';

function fmt(n: number, currency = '₽') {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

function StatCard({
  label, value, sub, icon, color, trend,
}: {
  label: string; value: string; sub?: string; icon: string; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="glass-card border border-border rounded-2xl p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon name={icon} size={15} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-black font-mono text-foreground mb-1" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-blue-400'}`}>
          <Icon name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} size={12} />
          {trend === 'up' ? 'Растёт' : trend === 'down' ? 'Снижается' : 'Стабильно'}
        </div>
      )}
    </div>
  );
}

function SalaryWidget() {
  const { summary, managers, settings } = useFinanceStore();

  return (
    <div className="glass-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={16} className="text-blue-400" />
          <span className="font-semibold text-sm text-foreground">Зарплаты менеджеров</span>
        </div>
        <span className="text-xs text-muted-foreground">Комиссия: {settings.managerCommissionPercent}% от маржи</span>
      </div>
      <div className="space-y-3">
        {managers.map(m => {
          const s = summary.salariesByManager[m.id];
          if (!s || s.accrued === 0) return null;
          const pct = s.accrued > 0 ? (s.paid / s.accrued) * 100 : 0;
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-foreground font-medium">{m.name}</span>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">Начислено: <span className="text-blue-400 font-mono">{fmt(s.accrued)}</span></span>
                  <span className="text-muted-foreground">Остаток: <span className="text-green-400 font-mono">{fmt(s.remaining)}</span></span>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
        {summary.totalSalariesAccrued === 0 && (
          <div className="text-center text-xs text-muted-foreground py-4">Нет начисленных зарплат</div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
        <span className="text-muted-foreground">Итого начислено</span>
        <span className="font-mono font-bold text-blue-400">{fmt(summary.totalSalariesAccrued)}</span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-muted-foreground">К выплате</span>
        <span className="font-mono font-bold text-green-400">{fmt(summary.totalSalariesRemaining)}</span>
      </div>
    </div>
  );
}

function DividendWidget() {
  const { summary, settings } = useFinanceStore();
  const pct = summary.accruedDividends > 0 ? (summary.paidDividends / summary.accruedDividends) * 100 : 0;

  return (
    <div className="glass-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Gem" size={16} className="text-purple-400" />
          <span className="font-semibold text-sm text-foreground">Дивиденды</span>
        </div>
        <span className="text-xs text-muted-foreground">{settings.dividendPercent}% от чистой прибыли</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Начислено</div>
          <div className="font-mono font-bold text-sm text-purple-400">{fmt(summary.accruedDividends)}</div>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Выплачено</div>
          <div className="font-mono font-bold text-sm text-muted-foreground">{fmt(summary.paidDividends)}</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Остаток</div>
          <div className="font-mono font-bold text-sm text-primary">{fmt(summary.remainingDividends)}</div>
        </div>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-400 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-1.5 text-right">{Math.round(pct)}% выплачено</div>
    </div>
  );
}

function RecentDeals() {
  const { summary } = useFinanceStore();
  const top = summary.dealCalcs.slice(0, 5);

  return (
    <div className="glass-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Handshake" size={16} className="text-orange-400" />
        <span className="font-semibold text-sm text-foreground">Последние сделки</span>
      </div>
      <div className="space-y-2">
        {top.map(d => (
          <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <div className="text-xs font-medium text-foreground truncate max-w-[160px]">{d.title}</div>
              <div className="text-[10px] text-muted-foreground">{d.client}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-mono text-green-400">{fmt(d.margin)}</div>
              <div className="text-[10px] text-muted-foreground">{d.marginPercent.toFixed(1)}% маржа</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { summary, settings } = useFinanceStore();

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Обзор</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Данные обновляются автоматически</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono px-3 py-1.5 bg-secondary rounded-lg border border-border">
          Июнь 2026
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Выручка" value={fmt(summary.totalRevenue, settings.currency)} icon="CircleDollarSign" color="#22c55e" trend="up" sub={`${summary.dealCalcs.length} сделок`} />
        <StatCard label="Маржа" value={fmt(summary.totalMargin, settings.currency)} icon="TrendingUp" color="#3b82f6" trend="up" sub={`${summary.marginPercent.toFixed(1)}% от выручки`} />
        <StatCard label="Расходы" value={fmt(summary.totalExpenses, settings.currency)} icon="Receipt" color="#f97316" trend="neutral" />
        <StatCard label="Баланс" value={fmt(summary.balance, settings.currency)} icon="Wallet" color="#a855f7" trend={summary.balance >= 0 ? 'up' : 'down'} />
      </div>

      {/* Dividends + Salaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DividendWidget />
        <SalaryWidget />
      </div>

      {/* Deals */}
      <RecentDeals />
    </div>
  );
}
