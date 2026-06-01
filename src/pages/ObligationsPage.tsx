import { useFinanceStore } from '@/store/FinanceContext';
import Icon from '@/components/ui/icon';

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

const OBLIGATION_COLORS: Record<string, string> = {
  cat8: '#06b6d4',   // займ выданный
  cat9: '#06b6d4',   // возврат займа
  cat10: '#8b5cf6',  // обеспечение контракта
  cat11: '#8b5cf6',  // возврат обеспечения
};

const RETURN_PAIRS: Record<string, string> = {
  cat8: 'cat9',   // займ → возврат займа
  cat10: 'cat11', // обеспечение → возврат обеспечения
};

export default function ObligationsPage() {
  const { summary, counterparties, categories, transactions } = useFinanceStore();

  // Группируем нейтральные транзакции по контрагенту
  const neutralTxs = transactions.filter(t => t.type === 'neutral' && t.counterpartyId);

  // По каждому контрагенту считаем: что выдано и что возвращено
  type ObligationGroup = {
    counterpartyId: string;
    items: {
      categoryId: string;
      outgoing: number; // отправлено (займы выданные, обеспечения)
      incoming: number; // возвращено
      net: number;       // остаток (долг перед нами или наш долг)
      txs: typeof neutralTxs;
    }[];
    totalNet: number;
  };

  const grouped: Record<string, ObligationGroup> = {};

  for (const t of neutralTxs) {
    const cpId = t.counterpartyId!;
    const catId = t.categoryId ?? 'other';

    if (!grouped[cpId]) {
      grouped[cpId] = { counterpartyId: cpId, items: [], totalNet: 0 };
    }

    // Определяем: это выдача или возврат
    const isReturn = catId === 'cat9' || catId === 'cat11';
    const parentCatId = isReturn
      ? (catId === 'cat9' ? 'cat8' : 'cat10')
      : catId;

    let item = grouped[cpId].items.find(i => i.categoryId === parentCatId);
    if (!item) {
      item = { categoryId: parentCatId, outgoing: 0, incoming: 0, net: 0, txs: [] };
      grouped[cpId].items.push(item);
    }

    item.txs.push(t);
    if (isReturn) item.incoming += t.amount;
    else item.outgoing += t.amount;
    item.net = item.outgoing - item.incoming;
  }

  for (const g of Object.values(grouped)) {
    g.totalNet = g.items.reduce((s, i) => s + i.net, 0);
  }

  const groups = Object.values(grouped).sort((a, b) => Math.abs(b.totalNet) - Math.abs(a.totalNet));
  const totalObligations = groups.reduce((s, g) => s + Math.max(g.totalNet, 0), 0);

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Обязательства</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Займы, обеспечения контрактов по контрагентам
          </p>
        </div>
        <div className="px-4 py-2 glass-card border border-border rounded-xl text-center">
          <div className="text-xs text-muted-foreground">Итого к возврату</div>
          <div className="font-mono font-black text-lg text-cyan-400">{fmt(totalObligations)} ₽</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Займов выдано', catId: 'cat8', color: '#06b6d4' },
          { label: 'Займов возвращено', catId: 'cat9', color: '#06b6d4' },
          { label: 'Обеспечений перечислено', catId: 'cat10', color: '#8b5cf6' },
          { label: 'Обеспечений возвращено', catId: 'cat11', color: '#8b5cf6' },
        ].map(card => {
          const total = neutralTxs
            .filter(t => t.categoryId === card.catId)
            .reduce((s, t) => s + t.amount, 0);
          const cat = categories.find(c => c.id === card.catId);
          return (
            <div key={card.catId} className="glass-card border border-border rounded-2xl p-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={cat?.icon ?? 'Circle'} size={13} style={{ color: card.color }} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <div className="font-mono font-bold text-lg" style={{ color: card.color }}>
                {fmt(total)} ₽
              </div>
            </div>
          );
        })}
      </div>

      {/* Per counterparty */}
      {groups.length === 0 ? (
        <div className="glass-card border border-border rounded-2xl py-16 text-center">
          <Icon name="ShieldCheck" size={40} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm text-muted-foreground">Нет обязательств</div>
          <div className="text-xs text-muted-foreground mt-1">
            Добавьте транзакцию с типом «Нейтральная» и категорией «Займ» или «Обеспечение»
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g, gi) => {
            const cp = counterparties.find(c => c.id === g.counterpartyId);
            return (
              <div
                key={g.counterpartyId}
                className="glass-card border border-border rounded-2xl overflow-hidden animate-slide-up"
                style={{ animationDelay: `${gi * 60}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon name="Building2" size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {cp?.name ?? 'Неизвестный контрагент'}
                      </div>
                      {cp?.phone && <div className="text-[10px] text-muted-foreground">{cp.phone}</div>}
                      {cp?.email && <div className="text-[10px] text-muted-foreground">{cp.email}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Остаток</div>
                    <div className={`font-mono font-black text-lg ${g.totalNet > 0 ? 'text-cyan-400' : g.totalNet < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {g.totalNet > 0 ? '+' : ''}{fmt(g.totalNet)} ₽
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {g.totalNet > 0 ? 'должны нам' : g.totalNet < 0 ? 'мы должны' : 'расчёт закрыт'}
                    </div>
                  </div>
                </div>

                {/* Items by category */}
                <div className="divide-y divide-border/40">
                  {g.items.map(item => {
                    const cat = categories.find(c => c.id === item.categoryId);
                    const retCatId = RETURN_PAIRS[item.categoryId];
                    const retCat = retCatId ? categories.find(c => c.id === retCatId) : null;
                    const color = OBLIGATION_COLORS[item.categoryId] ?? '#6b7280';
                    const pct = item.outgoing > 0 ? Math.min((item.incoming / item.outgoing) * 100, 100) : 0;

                    return (
                      <div key={item.categoryId} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                              <Icon name={cat?.icon ?? 'Circle'} size={14} style={{ color }} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{cat?.name ?? 'Категория'}</span>
                          </div>
                          <div className={`font-mono font-bold text-sm ${item.net > 0 ? 'text-cyan-400' : item.net < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {item.net === 0 ? '✓ Закрыто' : `${fmt(item.net)} ₽`}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                          <div className="bg-secondary/40 rounded-lg py-2">
                            <div className="text-[10px] text-muted-foreground">Выдано / Перечислено</div>
                            <div className="font-mono font-semibold text-xs mt-0.5" style={{ color }}>{fmt(item.outgoing)} ₽</div>
                          </div>
                          <div className="bg-secondary/40 rounded-lg py-2">
                            <div className="text-[10px] text-muted-foreground">{retCat?.name ?? 'Возвращено'}</div>
                            <div className="font-mono font-semibold text-xs mt-0.5 text-green-400">{fmt(item.incoming)} ₽</div>
                          </div>
                          <div className="bg-secondary/40 rounded-lg py-2">
                            <div className="text-[10px] text-muted-foreground">Погашено</div>
                            <div className="font-mono font-semibold text-xs mt-0.5 text-foreground">{pct.toFixed(0)}%</div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>

                        {/* Transactions list */}
                        {item.txs.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {item.txs.map(t => {
                              const tCat = categories.find(c => c.id === t.categoryId);
                              const isRet = t.categoryId === 'cat9' || t.categoryId === 'cat11';
                              return (
                                <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Icon name={isRet ? 'RotateCcw' : 'ArrowUpRight'} size={11} style={{ color: isRet ? '#22c55e' : color }} />
                                    <span>{t.description}</span>
                                    <span className="text-muted-foreground/60">{t.date}</span>
                                  </div>
                                  <span className={`font-mono font-semibold ${isRet ? 'text-green-400' : ''}`} style={{ color: isRet ? undefined : color }}>
                                    {isRet ? '+' : '-'}{fmt(t.amount)} ₽
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
