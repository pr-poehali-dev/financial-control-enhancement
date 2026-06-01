import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { Account } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

const ACC_TYPES: { value: Account['type']; label: string; icon: string }[] = [
  { value: 'bank', label: 'Банк', icon: 'Landmark' },
  { value: 'cash', label: 'Касса', icon: 'Banknote' },
  { value: 'card', label: 'Карта', icon: 'CreditCard' },
  { value: 'other', label: 'Прочее', icon: 'Wallet' },
];

const PRESET_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ef4444', '#06b6d4', '#ec4899'];

function AccountModal({
  acc, onClose, onSave,
}: {
  acc?: Account | null;
  onClose: () => void;
  onSave: (data: Omit<Account, 'id'>) => void;
}) {
  const isEdit = !!acc;
  const [name, setName] = useState(acc?.name ?? '');
  const [type, setType] = useState<Account['type']>(acc?.type ?? 'bank');
  const [initialBalance, setInitialBalance] = useState(acc?.initialBalance?.toString() ?? '0');
  const [currency, setCurrency] = useState(acc?.currency ?? '₽');
  const [color, setColor] = useState(acc?.color ?? '#22c55e');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, initialBalance: Number(initialBalance) || 0, currency, color });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать счёт' : 'Новый счёт'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название счёта *</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Расчётный счёт"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Тип счёта</label>
            <div className="grid grid-cols-4 gap-2">
              {ACC_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs transition-all ${type === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Начальный баланс</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Валюта</label>
              <select
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="₽">₽ Рубль</option>
                <option value="$">$ Доллар</option>
                <option value="€">€ Евро</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Цвет счёта</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110' : 'hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-border text-muted-foreground rounded-xl hover:text-foreground transition-colors">Отмена</button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { accounts, summary, addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);

  const totalBalance = Object.values(summary.accountBalances).reduce((s, v) => s + v, 0);

  function handleSave(data: Omit<Account, 'id'>) {
    if (editAcc) updateAccount(editAcc.id, data);
    else addAccount(data);
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Счета</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{accounts.length} счетов · Итого: {fmt(totalBalance)} ₽</p>
        </div>
        <button
          onClick={() => { setEditAcc(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Icon name="Plus" size={16} />
          Новый счёт
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc, i) => {
          const balance = summary.accountBalances[acc.id] ?? acc.initialBalance;
          const accType = ACC_TYPES.find(t => t.value === acc.type)!;
          const pct = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;

          return (
            <div
              key={acc.id}
              className="glass-card border border-border rounded-2xl p-5 animate-slide-up group hover:border-primary/20 transition-all"
              style={{ animationDelay: `${i * 60}ms`, borderLeft: `3px solid ${acc.color}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${acc.color}20` }}>
                  <Icon name={accType.icon} size={18} style={{ color: acc.color }} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditAcc(acc); setModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button onClick={() => deleteAccount(acc.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{acc.name}</div>
              <div className="text-2xl font-black font-mono mb-3" style={{ color: acc.color }}>
                {fmt(balance)} {acc.currency}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Нач. баланс: {fmt(acc.initialBalance)} {acc.currency}</span>
                <span>{pct.toFixed(0)}% от общего</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: acc.color }} />
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-secondary border border-border">
                  {accType.label}
                </span>
              </div>
            </div>
          );
        })}
        {accounts.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <Icon name="Wallet" size={36} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Нет счетов</div>
          </div>
        )}
      </div>

      {/* Summary row */}
      {accounts.length > 0 && (
        <div className="glass-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="PieChart" size={15} className="text-primary" />
            <span className="font-semibold text-sm text-foreground">Распределение по счетам</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {accounts.map(acc => {
              const balance = summary.accountBalances[acc.id] ?? acc.initialBalance;
              const pct = totalBalance > 0 ? Math.max((balance / totalBalance) * 100, 2) : 0;
              return (
                <div key={acc.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="text-[9px] font-mono text-muted-foreground">{fmt(balance)}</div>
                  <div
                    className="w-full rounded-t-md"
                    style={{ height: `${pct}%`, background: acc.color, boxShadow: `0 0 8px ${acc.color}40`, minHeight: '4px' }}
                  />
                  <div className="text-[9px] text-muted-foreground truncate w-full text-center">{acc.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalOpen && (
        <AccountModal acc={editAcc} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
