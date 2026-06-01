import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { Transaction } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

const TX_TYPES: { value: Transaction['type']; label: string; color: string; icon: string }[] = [
  { value: 'income', label: 'Поступление', color: '#22c55e', icon: 'ArrowDownLeft' },
  { value: 'expense', label: 'Расход', color: '#f97316', icon: 'ArrowUpRight' },
  { value: 'salary', label: 'Зарплата', color: '#3b82f6', icon: 'User' },
  { value: 'dividend', label: 'Дивиденды', color: '#a855f7', icon: 'Gem' },
];

function TxModal({
  tx, onClose, onSave, managers,
}: {
  tx?: Transaction | null;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  managers: { id: string; name: string }[];
}) {
  const isEdit = !!tx;
  const [type, setType] = useState<Transaction['type']>(tx?.type ?? 'income');
  const [amount, setAmount] = useState(tx?.amount?.toString() ?? '');
  const [description, setDescription] = useState(tx?.description ?? '');
  const [recipientId, setRecipientId] = useState(tx?.recipientId ?? managers[0]?.id ?? '');
  const [date, setDate] = useState(tx?.date ?? new Date().toISOString().slice(0, 10));

  const needsRecipient = type === 'salary' || type === 'dividend';

  function handleSave() {
    if (!amount || !description.trim()) return;
    onSave({
      type, amount: Number(amount), description, date,
      recipientId: needsRecipient ? recipientId : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать транзакцию' : 'Новая транзакция'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              {TX_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${type === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <Icon name={t.icon} size={13} style={{ color: type === t.value ? undefined : t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Сумма (₽)</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="0"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Описание</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Описание транзакции..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {needsRecipient && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Получатель {type === 'dividend' ? '(необязательно)' : ''}
              </label>
              <select
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
              >
                {type === 'dividend' && <option value="">— Без получателя</option>}
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

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

        <div className="flex gap-3 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-border text-muted-foreground rounded-xl hover:text-foreground transition-colors">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions, managers, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | Transaction['type']>('all');

  const filtered = transactions
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleSave(data: Omit<Transaction, 'id'>) {
    if (editTx) updateTransaction(editTx.id, data);
    else addTransaction(data);
  }

  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.out += t.amount;
      return acc;
    },
    { income: 0, out: 0 }
  );

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Транзакции</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} операций</p>
        </div>
        <button
          onClick={() => { setEditTx(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card border border-border rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Поступления</div>
          <div className="font-mono font-bold text-sm text-green-400">{fmt(totals.income)} ₽</div>
        </div>
        <div className="glass-card border border-border rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Расходы</div>
          <div className="font-mono font-bold text-sm text-orange-400">{fmt(totals.out)} ₽</div>
        </div>
        <div className="glass-card border border-border rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Баланс</div>
          <div className={`font-mono font-bold text-sm ${totals.income - totals.out >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(totals.income - totals.out)} ₽</div>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${typeFilter === 'all' ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          Все
        </button>
        {TX_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${typeFilter === t.value ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-card border border-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border/50">
          {filtered.map((t, i) => {
            const tt = TX_TYPES.find(x => x.value === t.type)!;
            const recipient = t.recipientId ? managers.find(m => m.id === t.recipientId) : null;
            const isPositive = t.type === 'income';
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/20 transition-colors animate-fade-in group"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tt.color}18` }}
                >
                  <Icon name={tt.icon} size={15} style={{ color: tt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{t.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ color: tt.color, background: `${tt.color}15` }}
                    >
                      {tt.label}
                    </span>
                    {recipient && <span className="text-[10px] text-muted-foreground">→ {recipient.name}</span>}
                    <span className="text-[10px] text-muted-foreground">{t.date}</span>
                  </div>
                </div>
                <div className={`font-mono font-bold text-sm flex-shrink-0 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : '-'}{fmt(t.amount)} ₽
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditTx(t); setModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Icon name="ArrowLeftRight" size={32} className="mx-auto mb-3 opacity-30" />
              <div>Нет транзакций</div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <TxModal
          tx={editTx}
          managers={managers}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
