import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { calcDeal, Deal, ExpenseItem } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

function genId() { return Math.random().toString(36).slice(2, 9); }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Активна', color: '#22c55e' },
  closed: { label: 'Закрыта', color: '#6b7280' },
  pending: { label: 'В ожидании', color: '#eab308' },
};

function DealModal({
  deal, onClose, onSave, managers, counterparties, accounts,
}: {
  deal?: Deal | null;
  onClose: () => void;
  onSave: (d: Omit<Deal, 'id'>) => void;
  managers: { id: string; name: string }[];
  counterparties: { id: string; name: string }[];
  accounts: { id: string; name: string; color: string }[];
}) {
  const isEdit = !!deal;
  const [title, setTitle] = useState(deal?.title ?? '');
  const [client, setClient] = useState(deal?.client ?? '');
  const [managerId, setManagerId] = useState(deal?.managerId ?? managers[0]?.id ?? '');
  const [counterpartyId, setCounterpartyId] = useState(deal?.counterpartyId ?? '');
  const [accountId, setAccountId] = useState(deal?.accountId ?? '');
  const [revenue, setRevenue] = useState(deal?.revenue?.toString() ?? '');
  const [status, setStatus] = useState<Deal['status']>(deal?.status ?? 'active');
  const [date, setDate] = useState(deal?.date ?? new Date().toISOString().slice(0, 10));
  const [expenses, setExpenses] = useState<ExpenseItem[]>(deal?.expenses ?? [{ id: genId(), name: '', amount: 0 }]);

  const totalExp = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const margin = (Number(revenue) || 0) - totalExp;

  function addExpense() {
    setExpenses(p => [...p, { id: genId(), name: '', amount: 0 }]);
  }
  function removeExpense(id: string) {
    setExpenses(p => p.filter(e => e.id !== id));
  }
  function updateExpense(id: string, field: 'name' | 'amount', val: string) {
    setExpenses(p => p.map(e => e.id === id ? { ...e, [field]: field === 'amount' ? Number(val) || 0 : val } : e));
  }

  function handleSave() {
    if (!title.trim() || !revenue) return;
    onSave({
      title, client, managerId,
      counterpartyId: counterpartyId || undefined,
      accountId: accountId || undefined,
      revenue: Number(revenue),
      expenses: expenses.filter(e => e.name.trim()),
      date, status,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать сделку' : 'Новая сделка'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название сделки</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Разработка сайта для ..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Клиент (текст)</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="ООО Ромашка"
                value={client}
                onChange={e => setClient(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Контрагент</label>
              <select
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                value={counterpartyId}
                onChange={e => setCounterpartyId(e.target.value)}
              >
                <option value="">— Без контрагента</option>
                {counterparties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Менеджер</label>
              <select
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
              >
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Счёт оплаты</label>
              <select
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
              >
                <option value="">— Без счёта</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Выручка (₽)</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="0"
                type="number"
                value={revenue}
                onChange={e => setRevenue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Дата</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Статус</label>
            <div className="flex gap-2">
              {(['active', 'pending', 'closed'] as Deal['status'][]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${status === s ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}
                >
                  {STATUS_LABELS[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Расходы / Товары</label>
              <button
                onClick={addExpense}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Icon name="Plus" size={12} />
                Добавить строку
              </button>
            </div>
            <div className="space-y-2">
              {expenses.map((e, i) => (
                <div key={e.id} className="flex gap-2 items-center">
                  <input
                    className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder={`Статья ${i + 1}`}
                    value={e.name}
                    onChange={v => updateExpense(e.id, 'name', v.target.value)}
                  />
                  <input
                    className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                    placeholder="0"
                    type="number"
                    value={e.amount || ''}
                    onChange={v => updateExpense(e.id, 'amount', v.target.value)}
                  />
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
            </div>
            {expenses.length > 0 && (
              <div className="mt-3 flex justify-between items-center px-3 py-2 bg-secondary/50 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground">Итого расходов</span>
                <span className="font-mono font-bold text-sm text-orange-400">{fmt(totalExp)} ₽</span>
              </div>
            )}
          </div>

          {/* Margin preview */}
          {revenue && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/50 rounded-xl border border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Маржа</div>
                <div className={`font-mono font-bold text-sm ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(margin)} ₽</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">% маржи</div>
                <div className={`font-mono font-bold text-sm ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(revenue) > 0 ? ((margin / Number(revenue)) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-border text-muted-foreground rounded-xl hover:text-foreground hover:border-foreground/20 transition-colors">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { deals, managers, counterparties, accounts, settings, addDeal, updateDeal, deleteDeal } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [filter, setFilter] = useState<'all' | Deal['status']>('all');

  const filtered = deals.filter(d => filter === 'all' || d.status === filter);
  const calcs = filtered.map(d => calcDeal(d, settings));

  function handleSave(data: Omit<Deal, 'id'>) {
    if (editDeal) updateDeal(editDeal.id, data);
    else addDeal(data);
  }

  function openEdit(d: Deal) { setEditDeal(d); setModalOpen(true); }
  function openNew() { setEditDeal(null); setModalOpen(true); }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Сделки</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{deals.length} сделок в базе</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Icon name="Plus" size={16} />
          Новая сделка
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([['all', 'Все'], ['active', 'Активные'], ['pending', 'В ожидании'], ['closed', 'Закрытые']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filter === val ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Сделка</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Выручка</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Расходы</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Маржа</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">%</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">ЗП менеджера</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {calcs.map((d, i) => {
                const mgr = managers.find(m => m.id === d.managerId);
                const st = STATUS_LABELS[d.status];
                return (
                  <tr
                    key={d.id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground text-xs truncate max-w-[180px]">{d.title}</div>
                      <div className="text-[10px] text-muted-foreground">{d.client} · {mgr?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-green-400">{fmt(d.revenue)} ₽</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-orange-400">{fmt(d.totalExpenses)} ₽</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold" style={{ color: d.margin >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(d.margin)} ₽</td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: d.marginPercent >= 30 ? '#22c55e' : d.marginPercent >= 0 ? '#eab308' : '#ef4444' }}>
                      {d.marginPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-blue-400">{fmt(d.managerSalary)} ₽</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}30` }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                          <Icon name="Pencil" size={12} />
                        </button>
                        <button onClick={() => deleteDeal(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Icon name="Trash2" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {calcs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    <Icon name="Handshake" size={32} className="mx-auto mb-3 opacity-30" />
                    <div>Нет сделок</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <DealModal
          deal={editDeal}
          managers={managers}
          counterparties={counterparties}
          accounts={accounts}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}