import { useState } from 'react';
import { useFinanceStore } from '@/store/FinanceContext';
import Icon from '@/components/ui/icon';

export default function SettingsPage() {
  const { settings, managers, updateSettings, addManager, deleteManager } = useFinanceStore();
  const [divPct, setDivPct] = useState(settings.dividendPercent.toString());
  const [comPct, setComPct] = useState(settings.managerCommissionPercent.toString());
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [newManager, setNewManager] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSettings({
      dividendPercent: Math.min(100, Math.max(0, Number(divPct) || 0)),
      managerCommissionPercent: Math.min(100, Math.max(0, Number(comPct) || 0)),
      companyName: companyName.trim() || settings.companyName,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddManager() {
    if (!newManager.trim()) return;
    addManager(newManager.trim());
    setNewManager('');
  }

  const totalPct = (Number(divPct) || 0) + (Number(comPct) || 0);

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Настройки</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Параметры расчётов и управление системой</p>
      </div>

      {/* Company */}
      <div className="glass-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Building2" size={15} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">Компания</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название компании</label>
          <input
            className="w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </div>
      </div>

      {/* Percentages */}
      <div className="glass-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Percent" size={15} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">Параметры расчётов</span>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-foreground">Дивиденды от чистой прибыли</label>
              <div className="flex items-center gap-2">
                <input
                  className="w-16 px-2 py-1 bg-input border border-border rounded-lg text-sm text-primary font-mono font-bold text-center focus:outline-none focus:border-primary transition-colors"
                  type="number"
                  min={0} max={100}
                  value={divPct}
                  onChange={e => setDivPct(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input
              type="range" min={0} max={50} step={1}
              value={Number(divPct) || 0}
              onChange={e => setDivPct(e.target.value)}
              className="w-full accent-primary h-1.5 rounded-full bg-secondary cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              При чистой прибыли 1 000 000 ₽ → дивиденды = <span className="text-purple-400 font-mono">{((Number(divPct) || 0) * 10000).toLocaleString('ru-RU')} ₽</span>
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-foreground">Комиссия менеджера от маржи</label>
              <div className="flex items-center gap-2">
                <input
                  className="w-16 px-2 py-1 bg-input border border-border rounded-lg text-sm text-primary font-mono font-bold text-center focus:outline-none focus:border-primary transition-colors"
                  type="number"
                  min={0} max={100}
                  value={comPct}
                  onChange={e => setComPct(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input
              type="range" min={0} max={50} step={1}
              value={Number(comPct) || 0}
              onChange={e => setComPct(e.target.value)}
              className="w-full accent-primary h-1.5 rounded-full bg-secondary cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              При марже 500 000 ₽ → ЗП менеджера = <span className="text-blue-400 font-mono">{((Number(comPct) || 0) * 5000).toLocaleString('ru-RU')} ₽</span>
            </p>
          </div>

          {totalPct > 50 && (
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400">
              <Icon name="AlertTriangle" size={13} />
              Суммарные отчисления ({totalPct}%) превышают половину прибыли
            </div>
          )}
        </div>
      </div>

      {/* Managers */}
      <div className="glass-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Users" size={15} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">Менеджеры</span>
        </div>
        <div className="space-y-2 mb-4">
          {managers.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 bg-secondary/50 rounded-lg border border-border group">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={11} className="text-primary" />
              </div>
              <span className="text-sm text-foreground flex-1">{m.name}</span>
              <button
                onClick={() => deleteManager(m.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                title="Удалить менеджера"
              >
                <Icon name="Trash2" size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="Имя нового менеджера"
            value={newManager}
            onChange={e => setNewManager(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddManager()}
          />
          <button
            onClick={handleAddManager}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 border border-border transition-colors flex items-center gap-1.5"
          >
            <Icon name="UserPlus" size={14} />
            Добавить
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.01]'
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <Icon name="Check" size={16} />
            Сохранено!
          </span>
        ) : (
          'Сохранить настройки'
        )}
      </button>
    </div>
  );
}