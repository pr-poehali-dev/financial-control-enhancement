import { useFinanceStore } from '@/store/FinanceContext';
import { calcDeal } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

function BarChart({ data, color = '#22c55e' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="text-[9px] font-mono text-muted-foreground">{fmt(d.value)}</div>
          <div className="w-full rounded-t-md transition-all duration-700 min-h-[2px]" style={{
            height: `${Math.max((d.value / max) * 100, 2)}%`,
            background: `linear-gradient(to top, ${color}, ${color}99)`,
            boxShadow: `0 0 8px ${color}40`,
          }} />
          <div className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="text-center text-xs text-muted-foreground py-6">Нет данных</div>;

  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="16" />
        {segments.map((s, i) => {
          const pct = s.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-2 flex-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
            <span className="font-mono font-medium text-foreground">{total > 0 ? ((s.value / total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { deals, transactions, managers, settings, summary } = useFinanceStore();
  const calcs = deals.map(d => calcDeal(d, settings));

  // Revenue by manager
  const byManager = managers.map(m => {
    const mDeals = calcs.filter(d => d.managerId === m.id);
    return {
      label: m.name.split(' ')[0],
      value: mDeals.reduce((s, d) => s + d.revenue, 0),
      margin: mDeals.reduce((s, d) => s + d.margin, 0),
    };
  }).filter(x => x.value > 0);

  // Revenue by month (last 6 months)
  const monthMap: Record<string, number> = {};
  for (const d of calcs) {
    const month = d.date.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + d.revenue;
  }
  const months = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([k, v]) => ({
      label: new Date(k + '-01').toLocaleDateString('ru-RU', { month: 'short' }),
      value: v,
    }));

  // Expense structure for donut
  const expTotal = summary.totalExpenses;
  const salaryTotal = summary.totalSalariesAccrued;
  const divTotal = summary.accruedDividends;
  const netLeft = Math.max(0, summary.netProfit - salaryTotal - divTotal);

  const donutData = [
    { label: 'Операционные расходы', value: expTotal, color: '#f97316' },
    { label: 'Зарплаты', value: salaryTotal, color: '#3b82f6' },
    { label: 'Дивиденды', value: divTotal, color: '#a855f7' },
    { label: 'Чистый остаток', value: netLeft, color: '#22c55e' },
  ].filter(x => x.value > 0);

  // Deal status summary
  const statusCounts = { active: 0, closed: 0, pending: 0 };
  for (const d of deals) statusCounts[d.status]++;

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Аналитика</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Сводная статистика по всем данным</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Всего сделок', value: deals.length, icon: 'Handshake', color: '#22c55e' },
          { label: 'Конверсия закрытых', value: `${deals.length > 0 ? Math.round((statusCounts.closed / deals.length) * 100) : 0}%`, icon: 'Target', color: '#3b82f6' },
          { label: 'Средняя маржа', value: `${summary.marginPercent.toFixed(1)}%`, icon: 'Percent', color: '#a855f7' },
          { label: 'Транзакций', value: transactions.length, icon: 'ArrowLeftRight', color: '#f97316' },
        ].map((k, i) => (
          <div key={i} className="glass-card border border-border rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <Icon name={k.icon} size={14} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by month */}
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="BarChart3" size={15} className="text-green-400" />
            <span className="font-semibold text-sm text-foreground">Выручка по месяцам</span>
          </div>
          {months.length > 0 ? (
            <BarChart data={months} color="#22c55e" />
          ) : (
            <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">Нет данных</div>
          )}
        </div>

        {/* By manager */}
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="Users" size={15} className="text-blue-400" />
            <span className="font-semibold text-sm text-foreground">Выручка по менеджерам</span>
          </div>
          {byManager.length > 0 ? (
            <BarChart data={byManager} color="#3b82f6" />
          ) : (
            <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">Нет данных</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense structure */}
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="PieChart" size={15} className="text-purple-400" />
            <span className="font-semibold text-sm text-foreground">Структура выручки</span>
          </div>
          <DonutChart segments={donutData} />
        </div>

        {/* Top deals by margin */}
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Trophy" size={15} className="text-yellow-400" />
            <span className="font-semibold text-sm text-foreground">Топ сделок по марже</span>
          </div>
          <div className="space-y-2.5">
            {calcs
              .sort((a, b) => b.margin - a.margin)
              .slice(0, 5)
              .map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{d.title}</div>
                    <div className="h-1 mt-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max((d.margin / (calcs[0]?.margin || 1)) * 100, 2)}%`,
                          background: i === 0 ? '#eab308' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-green-400 flex-shrink-0">{fmt(d.margin)} ₽</span>
                </div>
              ))}
            {calcs.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Нет сделок</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
