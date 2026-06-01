import { useState, useCallback } from 'react';

export type Manager = {
  id: string;
  name: string;
};

export type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
};

export type Deal = {
  id: string;
  title: string;
  client: string;
  managerId: string;
  revenue: number;
  expenses: ExpenseItem[];
  date: string;
  status: 'active' | 'closed' | 'pending';
};

export type TransactionType =
  | 'income'
  | 'expense'
  | 'salary'
  | 'dividend';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  recipientId?: string;
  dealId?: string;
  date: string;
};

export type Settings = {
  dividendPercent: number;
  managerCommissionPercent: number;
  companyName: string;
  currency: string;
};

export type DealCalc = Deal & {
  totalExpenses: number;
  margin: number;
  marginPercent: number;
  managerSalary: number;
};

const MANAGERS_DEFAULT: Manager[] = [
  { id: 'm1', name: 'Александр Петров' },
  { id: 'm2', name: 'Мария Иванова' },
  { id: 'm3', name: 'Дмитрий Сидоров' },
];

const DEALS_DEFAULT: Deal[] = [
  {
    id: 'd1', title: 'Разработка сайта для ООО Ромашка', client: 'ООО Ромашка',
    managerId: 'm1', revenue: 450000,
    expenses: [
      { id: 'e1', name: 'Дизайн', amount: 80000 },
      { id: 'e2', name: 'Разработка', amount: 150000 },
    ],
    date: '2026-05-10', status: 'closed',
  },
  {
    id: 'd2', title: 'CRM-система для Стройтех', client: 'Стройтех',
    managerId: 'm2', revenue: 720000,
    expenses: [
      { id: 'e3', name: 'Аналитика', amount: 50000 },
      { id: 'e4', name: 'Разработка', amount: 280000 },
      { id: 'e5', name: 'Тестирование', amount: 40000 },
    ],
    date: '2026-05-20', status: 'closed',
  },
  {
    id: 'd3', title: 'Мобильное приложение', client: 'ИП Климов',
    managerId: 'm1', revenue: 380000,
    expenses: [
      { id: 'e6', name: 'Дизайн', amount: 60000 },
      { id: 'e7', name: 'iOS разработка', amount: 120000 },
    ],
    date: '2026-06-01', status: 'active',
  },
  {
    id: 'd4', title: 'Интеграция 1С', client: 'ГК Меркурий',
    managerId: 'm3', revenue: 210000,
    expenses: [
      { id: 'e8', name: 'Разработка', amount: 90000 },
    ],
    date: '2026-05-28', status: 'pending',
  },
];

const TRANSACTIONS_DEFAULT: Transaction[] = [
  { id: 't1', type: 'income', amount: 450000, description: 'Оплата ООО Ромашка', dealId: 'd1', date: '2026-05-15' },
  { id: 't2', type: 'income', amount: 720000, description: 'Оплата Стройтех', dealId: 'd2', date: '2026-05-22' },
  { id: 't3', type: 'expense', amount: 370000, description: 'Затраты на сделку Ромашка', dealId: 'd1', date: '2026-05-16' },
  { id: 't4', type: 'expense', amount: 370000, description: 'Затраты на сделку Стройтех', dealId: 'd2', date: '2026-05-23' },
  { id: 't5', type: 'salary', amount: 35000, description: 'ЗП за сделку Ромашка', recipientId: 'm1', dealId: 'd1', date: '2026-05-18' },
  { id: 't6', type: 'salary', amount: 40000, description: 'ЗП за сделку Стройтех', recipientId: 'm2', dealId: 'd2', date: '2026-05-25' },
  { id: 't7', type: 'dividend', amount: 80000, description: 'Дивиденды май', date: '2026-05-31' },
];

const SETTINGS_DEFAULT: Settings = {
  dividendPercent: 10,
  managerCommissionPercent: 10,
  companyName: 'МояКомпания',
  currency: '₽',
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function calcDeal(deal: Deal, settings: Settings): DealCalc {
  const totalExpenses = deal.expenses.reduce((s, e) => s + e.amount, 0);
  const margin = deal.revenue - totalExpenses;
  const marginPercent = deal.revenue > 0 ? (margin / deal.revenue) * 100 : 0;
  const managerSalary = margin > 0 ? (margin * settings.managerCommissionPercent) / 100 : 0;
  return { ...deal, totalExpenses, margin, marginPercent, managerSalary };
}

export function calcSummary(deals: Deal[], transactions: Transaction[], settings: Settings) {
  const calcs = deals.map(d => calcDeal(d, settings));

  const totalRevenue = calcs.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = calcs.reduce((s, d) => s + d.totalExpenses, 0);
  const totalMargin = calcs.reduce((s, d) => s + d.margin, 0);
  const netProfit = totalMargin;
  const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const accruedDividends = netProfit > 0 ? (netProfit * settings.dividendPercent) / 100 : 0;
  const paidDividends = transactions
    .filter(t => t.type === 'dividend')
    .reduce((s, t) => s + t.amount, 0);
  const remainingDividends = Math.max(0, accruedDividends - paidDividends);

  const salariesByManager: Record<string, { accrued: number; paid: number; remaining: number }> = {};
  for (const d of calcs) {
    if (!salariesByManager[d.managerId]) {
      salariesByManager[d.managerId] = { accrued: 0, paid: 0, remaining: 0 };
    }
    salariesByManager[d.managerId].accrued += d.managerSalary;
  }
  for (const t of transactions) {
    if (t.type === 'salary' && t.recipientId) {
      if (!salariesByManager[t.recipientId]) {
        salariesByManager[t.recipientId] = { accrued: 0, paid: 0, remaining: 0 };
      }
      salariesByManager[t.recipientId].paid += t.amount;
    }
  }
  for (const id of Object.keys(salariesByManager)) {
    const s = salariesByManager[id];
    s.remaining = Math.max(0, s.accrued - s.paid);
  }

  const totalSalariesAccrued = Object.values(salariesByManager).reduce((s, v) => s + v.accrued, 0);
  const totalSalariesPaid = Object.values(salariesByManager).reduce((s, v) => s + v.paid, 0);
  const totalSalariesRemaining = Object.values(salariesByManager).reduce((s, v) => s + v.remaining, 0);

  const balance = transactions.reduce((s, t) => {
    if (t.type === 'income') return s + t.amount;
    if (t.type === 'expense' || t.type === 'salary' || t.type === 'dividend') return s - t.amount;
    return s;
  }, 0);

  return {
    totalRevenue,
    totalExpenses,
    totalMargin,
    netProfit,
    marginPercent,
    accruedDividends,
    paidDividends,
    remainingDividends,
    salariesByManager,
    totalSalariesAccrued,
    totalSalariesPaid,
    totalSalariesRemaining,
    balance,
    dealCalcs: calcs,
  };
}

export function useFinance() {
  const [managers, setManagers] = useState<Manager[]>(MANAGERS_DEFAULT);
  const [deals, setDeals] = useState<Deal[]>(DEALS_DEFAULT);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS_DEFAULT);
  const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULT);

  const summary = calcSummary(deals, transactions, settings);

  const addDeal = useCallback((deal: Omit<Deal, 'id'>) => {
    setDeals(prev => [...prev, { ...deal, id: generateId() }]);
  }, []);

  const updateDeal = useCallback((id: string, data: Partial<Omit<Deal, 'id'>>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...tx, id: generateId() }]);
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addManager = useCallback((name: string) => {
    setManagers(prev => [...prev, { id: generateId(), name }]);
  }, []);

  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  }, []);

  return {
    managers, deals, transactions, settings, summary,
    addDeal, updateDeal, deleteDeal,
    addTransaction, updateTransaction, deleteTransaction,
    addManager, updateSettings,
  };
}

export type FinanceStore = ReturnType<typeof useFinance>;
