import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { Transaction, NEUTRAL_TYPES } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

const TX_TYPES: { value: Transaction['type']; label: string; color: string; icon: string; catDefault?: string; neutral?: boolean }[] = [
  { value: 'income',   label: 'Поступление', color: '#22c55e', icon: 'ArrowDownLeft' },
  { value: 'expense',  label: 'Расход',       color: '#f97316', icon: 'ArrowUpRight' },
  { value: 'salary',   label: 'Зарплата',     color: '#3b82f6', icon: 'User',            catDefault: 'cat4' },
  { value: 'dividend', label: 'Дивиденды',    color: '#a855f7', icon: 'Gem',             catDefault: 'cat5' },
  { value: 'tax',      label: 'Налог',        color: '#ef4444', icon: 'Landmark',        catDefault: 'cat6' },
  { value: 'transfer', label: 'Перевод',      color: '#06b6d4', icon: 'ArrowRightLeft',  neutral: true },
  { value: 'neutral',  label: 'Нейтральная',  color: '#8b5cf6', icon: 'ShieldCheck',     neutral: true },
];

function TxModal({
  tx, onClose, onSave, managers, counterparties, accounts, categories,
}: {
  tx?: Transaction | null;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  managers: { id: string; name: string }[];
  counterparties: { id: string; name: string }[];
  accounts: { id: string; name: string; color: string }[];
  categories: { id: string; name: string; type: string; color: string; icon: string }[];
}) {
  const isEdit = !!tx;
  const [type, setType] = useState<Transaction['type']>(tx?.type ?? 'income');
  const [amount, setAmount] = useState(tx?.amount?.toString() ?? '');
  const [description, setDescription] = useState(tx?.description ?? '');
  const [recipientId, setRecipientId] = useState(tx?.recipientId ?? managers[0]?.id ?? '');
  const [counterpartyId, setCounterpartyId] = useState(tx?.counterpartyId ?? '');
  const [accountId, setAccountId] = useState(tx?.accountId ?? accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(tx?.toAccountId ?? '');
  const [categoryId, setCategoryId] = useState(tx?.categoryId ?? '');
  const [date, setDate] = useState(tx?.date ?? new Date().toISOString().slice(0, 10));

  const isTransfer = type === 'transfer';
  const isNeutral = type === 'neutral';
  const needsRecipient = type === 'salary';
  const needsCounterparty = type === 'income' || type === 'expense' || isNeutral;
  const isExpenseType = type !== 'income' && !isTransfer && !isNeutral;

  const filteredCategories = categories.filter(c => {
    if (isNeutral) return c.type === 'neutral';
    if (type === 'income') return c.type === 'income';
    return c.type === 'expense';
  });

  function handleTypeChange(t: Transaction['type']) {
    setType(t);
    const def = TX_TYPES.find(x => x.value === t)?.catDefault;
    if (def) setCategoryId(def);
    else setCategoryId('');
  }

  function handleSave() {
    if (!amount || !description.trim()) return;
    if (isTransfer && !toAccountId) return;
    onSave({
      type,
      amount: Number(amount),
      description,
      date,
      categoryId: categoryId || undefined,
      recipientId: (needsRecipient || type === 'dividend') && recipientId ? recipientId : undefined,
      counterpartyId: counterpartyId || undefined,
      accountId: accountId || undefined,
      toAccountId: isTransfer && toAccountId ? toAccountId : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать транзакцию' : 'Новая транзакция'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Тип операции</label>
            <div className="grid grid-cols-4 gap-2">
              {TX_TYPES.slice(0, 5).map(t => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${type === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <Icon name={t.icon} size={14} style={{ color: type === t.value ? undefined : t.color }} />
                  <span className="text-center leading-tight">{t.label}</span>
                </button>
              ))}
              {/* Neutral types span 2 cols each row */}
              {TX_TYPES.slice(5).map(t => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={`col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${type === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <Icon name={t.icon} size={13} style={{ color: type === t.value ? undefined : t.color }} />
                  {t.label}
                  <span className="text-[9px] opacity-60 ml-1">не P&L</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Сумма (₽) *</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="0" type="number" value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Дата</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                type="date" value={date} onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Описание *</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Описание операции..." value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Transfer: from → to */}
          {isTransfer ? (
            <>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Списать со счёта *</label>
                <select
                  className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={accountId} onChange={e => setAccountId(e.target.value)}
                >
                  <option value="">— Выбрать счёт</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Зачислить на счёт *</label>
                <select
                  className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={toAccountId} onChange={e => setToAccountId(e.target.value)}
                >
                  <option value="">— Выбрать счёт</option>
                  {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Категория</label>
                <select
                  className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={categoryId} onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">— Без категории</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Account */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {isExpenseType || isNeutral ? 'Списать со счёта' : 'Зачислить на счёт'}
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={accountId} onChange={e => setAccountId(e.target.value)}
                >
                  <option value="">— Без счёта</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {needsCounterparty && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {type === 'income' ? 'Оплачено контрагентом' : isNeutral ? 'Контрагент' : 'Оплачивается контрагенту'}
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    value={counterpartyId} onChange={e => setCounterpartyId(e.target.value)}
                  >
                    <option value="">— Без контрагента</option>
                    {counterparties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {needsRecipient && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Получатель (менеджер)</label>
                  <select
                    className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    value={recipientId} onChange={e => setRecipientId(e.target.value)}
                  >
                    <option value="">— Выбрать менеджера</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}

              {type === 'dividend' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Получатель дивидендов</label>
                  <select
                    className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    value={recipientId} onChange={e => setRecipientId(e.target.value)}
                  >
                    <option value="">— Без получателя</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
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
  const { transactions, managers, counterparties, accounts, categories, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
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

  const totals = transactions
    .filter(t => !NEUTRAL_TYPES.includes(t.type))
    .reduce(
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

      {/* Summary — только P&L */}
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
          <div className="text-xs text-muted-foreground mb-0.5">Баланс P&L</div>
          <div className={`font-mono font-bold text-sm ${totals.income - totals.out >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmt(totals.income - totals.out)} ₽
          </div>
          <div className="text-[9px] text-muted-foreground">без переводов и нейтр.</div>
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

      {/* Table */}
      <div className="glass-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Описание</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Категория</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Счёт</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Контрагент / Кому</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Дата</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Сумма</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const tt = TX_TYPES.find(x => x.value === t.type)!;
                const recipient = t.recipientId ? managers.find(m => m.id === t.recipientId) : null;
                const cp = t.counterpartyId ? counterparties.find(c => c.id === t.counterpartyId) : null;
                const acc = t.accountId ? accounts.find(a => a.id === t.accountId) : null;
                const toAcc = t.toAccountId ? accounts.find(a => a.id === t.toAccountId) : null;
                const cat = t.categoryId ? categories.find(c => c.id === t.categoryId) : null;
                const isPositive = t.type === 'income';
                const isNeutralTx = NEUTRAL_TYPES.includes(t.type);

                return (
                  <tr
                    key={t.id}
                    className={`border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in group ${isNeutralTx ? 'opacity-80' : ''}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${tt.color}18` }}>
                          <Icon name={tt.icon} size={12} style={{ color: tt.color }} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground truncate max-w-[140px]">{t.description}</div>
                          <div className="flex items-center gap-1">
                            <div className="text-[10px]" style={{ color: tt.color }}>{tt.label}</div>
                            {isNeutralTx && <span className="text-[9px] text-muted-foreground/60 italic">не P&L</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cat ? (
                        <span className="flex items-center gap-1 text-xs">
                          <Icon name={cat.icon} size={11} style={{ color: cat.color }} />
                          <span className="text-muted-foreground">{cat.name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.type === 'transfer' ? (
                        <div className="flex items-center gap-1 text-xs">
                          {acc && <span className="font-medium" style={{ color: acc.color }}>{acc.name}</span>}
                          <Icon name="ArrowRight" size={10} className="text-muted-foreground/60 flex-shrink-0" />
                          {toAcc && <span className="font-medium" style={{ color: toAcc.color }}>{toAcc.name}</span>}
                        </div>
                      ) : acc ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-2 h-2 rounded-full" style={{ background: acc.color }} />
                          {acc.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {cp?.name || recipient?.name || <span className="opacity-40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{t.date}</td>
                    <td className="px-4 py-3 text-right">
                      {isNeutralTx ? (
                        <span className="font-mono font-bold text-sm" style={{ color: tt.color }}>
                          {fmt(t.amount)} ₽
                        </span>
                      ) : (
                        <span className={`font-mono font-bold text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : '-'}{fmt(t.amount)} ₽
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditTx(t); setModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                          <Icon name="Pencil" size={12} />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Icon name="Trash2" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <Icon name="ArrowLeftRight" size={32} className="mx-auto mb-3 opacity-30" />
                    <div>Нет транзакций</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <TxModal
          tx={editTx}
          managers={managers}
          counterparties={counterparties}
          accounts={accounts}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
