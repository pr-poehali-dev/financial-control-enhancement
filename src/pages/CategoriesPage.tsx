import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import { Category, CategoryType } from '@/store/useFinance';
import Icon from '@/components/ui/icon';

const PRESET_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ef4444', '#06b6d4', '#ec4899', '#6b7280', '#14b8a6'];

const PRESET_ICONS = [
  'TrendingUp', 'TrendingDown', 'Receipt', 'User', 'Users', 'Gem',
  'Landmark', 'Megaphone', 'ShoppingCart', 'Car', 'Home', 'Laptop',
  'Zap', 'Coffee', 'Package', 'Wrench', 'Globe', 'Star',
];

const SYSTEM_IDS = ['cat4', 'cat5', 'cat6']; // зарплата, дивиденды, налог — системные

function CategoryModal({
  cat, onClose, onSave,
}: {
  cat?: Category | null;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id'>) => void;
}) {
  const isEdit = !!cat;
  const [name, setName] = useState(cat?.name ?? '');
  const [type, setType] = useState<CategoryType>(cat?.type ?? 'expense');
  const [color, setColor] = useState(cat?.color ?? '#22c55e');
  const [icon, setIcon] = useState(cat?.icon ?? 'Receipt');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, color, icon });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-foreground">{isEdit ? 'Редактировать категорию' : 'Новая категория'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название *</label>
            <input
              className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Операционные расходы"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              {([['income', 'Доход', '#22c55e'], ['expense', 'Расход', '#ef4444']] as const).map(([val, label, col]) => (
                <button
                  key={val}
                  onClick={() => setType(val)}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${type === val ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/60'}`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5" style={{ background: col }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Цвет</label>
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
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Иконка</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg border transition-all flex items-center justify-center ${icon === ic ? 'border-primary bg-primary/10' : 'border-border hover:border-border/60'}`}
                  title={ic}
                >
                  <Icon name={ic} size={16} style={{ color: icon === ic ? color : undefined }} className={icon !== ic ? 'text-muted-foreground' : ''} />
                </button>
              ))}
            </div>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              <Icon name={icon} size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{name || 'Название категории'}</div>
              <div className="text-xs" style={{ color: type === 'income' ? '#22c55e' : '#ef4444' }}>
                {type === 'income' ? 'Доход' : 'Расход'}
              </div>
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

export default function CategoriesPage() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | CategoryType>('all');

  const filtered = categories.filter(c => typeFilter === 'all' || c.type === typeFilter);
  const income = categories.filter(c => c.type === 'income');
  const expense = categories.filter(c => c.type === 'expense');

  function getCatUsage(id: string) {
    return transactions.filter(t => t.categoryId === id).length;
  }

  function handleSave(data: Omit<Category, 'id'>) {
    if (editCat) updateCategory(editCat.id, data);
    else addCategory(data);
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Категории</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{income.length} доходов · {expense.length} расходов</p>
        </div>
        <button
          onClick={() => { setEditCat(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Icon name="Plus" size={16} />
          Новая категория
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {([['all', 'Все'], ['income', 'Доходы'], ['expense', 'Расходы']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTypeFilter(val)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${typeFilter === val ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-card border border-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border/50">
          {filtered.map((cat, i) => {
            const usage = getCatUsage(cat.id);
            const isSystem = SYSTEM_IDS.includes(cat.id);
            return (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/20 transition-colors animate-fade-in group"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}18` }}>
                  <Icon name={cat.icon} size={15} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    {isSystem && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">системная</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Использована в {usage} транзакциях
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{
                    color: cat.type === 'income' ? '#22c55e' : '#ef4444',
                    background: cat.type === 'income' ? '#22c55e18' : '#ef444418',
                  }}
                >
                  {cat.type === 'income' ? 'Доход' : 'Расход'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditCat(cat); setModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                  {!isSystem && (
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Icon name="Trash2" size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Icon name="Tag" size={32} className="mx-auto mb-3 opacity-30" />
              <div>Нет категорий</div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <CategoryModal cat={editCat} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
