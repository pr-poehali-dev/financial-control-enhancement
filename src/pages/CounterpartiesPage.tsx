import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { Counterparty } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

const CP_TYPES: { value: Counterparty['type']; label: string; color: string }[] = [
  { value: 'client', label: 'Клиент', color: '#22c55e' },
  { value: 'supplier', label: 'Поставщик', color: '#f97316' },
  { value: 'partner', label: 'Партнёр', color: '#3b82f6' },
  { value: 'other', label: 'Прочее', color: '#6b7280' },
];

function CpModal({
  cp, onClose, onSave,
}: {
  cp?: Counterparty | null;
  onClose: () => void;
  onSave: (data: Omit<Counterparty, 'id'>) => void;
}) {
  const isEdit = !!cp;
  const [name, setName] = useState(cp?.name ?? '');
  const [type, setType] = useState<Counterparty['type']>(cp?.type ?? 'client');
  const [phone, setPhone] = useState(cp?.phone ?? '');
  const [email, setEmail] = useState(cp?.email ?? '');
  const [comment, setComment] = useState(cp?.comment ?? '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, phone: phone.trim() || undefined, email: email.trim() || undefined, comment: comment.trim() || undefined });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать контрагента' : 'Новый контрагент'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название / Имя *</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="ООО Ромашка"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              {CP_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${type === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Телефон</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="+7 999 000-00-00"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="info@company.ru"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Комментарий</label>
            <textarea
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              rows={2}
              placeholder="Дополнительная информация..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
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

export default function CounterpartiesPage() {
  const { counterparties, addCounterparty, updateCounterparty, deleteCounterparty } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCp, setEditCp] = useState<Counterparty | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Counterparty['type']>('all');

  const filtered = counterparties.filter(cp => {
    const matchType = typeFilter === 'all' || cp.type === typeFilter;
    const matchSearch = cp.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  function handleSave(data: Omit<Counterparty, 'id'>) {
    if (editCp) updateCounterparty(editCp.id, data);
    else addCounterparty(data);
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Контрагенты</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{counterparties.length} контрагентов</p>
        </div>
        <button
          onClick={() => { setEditCp(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Icon name="Plus" size={16} />
          Новый контрагент
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="Поиск контрагента..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {([['all', 'Все'], ...CP_TYPES.map(t => [t.value, t.label])] as [string, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTypeFilter(val as typeof typeFilter)}
            className={`px-3 py-2 text-xs rounded-lg border transition-all ${typeFilter === val ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cp, i) => {
          const cpType = CP_TYPES.find(t => t.value === cp.type)!;
          return (
            <div
              key={cp.id}
              className="glass-card border border-border rounded-2xl p-4 animate-slide-up group hover:border-primary/20 transition-all"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cpType.color}18`, border: `1px solid ${cpType.color}30` }}>
                  <Icon name="Building2" size={16} style={{ color: cpType.color }} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditCp(cp); setModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button onClick={() => deleteCounterparty(cp.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
              <div className="font-semibold text-sm text-foreground mb-1">{cp.name}</div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mb-2" style={{ color: cpType.color, background: `${cpType.color}15` }}>
                {cpType.label}
              </span>
              <div className="space-y-1">
                {cp.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Phone" size={11} />
                    {cp.phone}
                  </div>
                )}
                {cp.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Mail" size={11} />
                    {cp.email}
                  </div>
                )}
                {cp.comment && (
                  <div className="text-xs text-muted-foreground italic truncate">{cp.comment}</div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <Icon name="Building2" size={36} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Контрагенты не найдены</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <CpModal cp={editCp} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
