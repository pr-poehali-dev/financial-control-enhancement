import { useState, useCallback } from 'react';

export type Manager = {
  id: string;
  name: string;
};

export type Counterparty = {
  id: string;
  name: string;
  type: 'client' | 'supplier' | 'partner' | 'other';
  phone?: string;
  email?: string;
  comment?: string;
};

export type Account = {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'card' | 'other';
  initialBalance: number;
  currency: string;
  color: string;
};

export type CategoryType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
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
  counterpartyId?: string;
  managerId: string;
  accountId?: string;
  revenue: number;
  expenses: ExpenseItem[];
  date: string;
  status: 'active' | 'closed' | 'pending';
};

export type TransactionType = 'income' | 'expense' | 'salary' | 'dividend' | 'tax';

export type Transaction = {
  id: string;
  type: TransactionType;
  categoryId?: string;
  amount: number;
  description: string;
  recipientId?: string;
  counterpartyId?: string;
  accountId?: string;
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

// ─── Defaults ────────────────────────────────────────────────────────────────

const MANAGERS_DEFAULT: Manager[] = [
  { id: 'm1', name: 'Александр Петров' },
  { id: 'm2', name: 'Мария Иванова' },
  { id: 'm3', name: 'Дмитрий Сидоров' },
];

const COUNTERPARTIES_DEFAULT: Counterparty[] = [
  { id: 'cp1', name: 'ООО Ромашка', type: 'client', email: 'info@romashka.ru' },
  { id: 'cp2', name: 'Стройтех', type: 'client', phone: '+7 495 123-45-67' },
  { id: 'cp3', name: 'ИП Климов', type: 'client' },
  { id: 'cp4', name: 'ГК Меркурий', type: 'partner', email: 'mercury@gk.ru' },
];

const ACCOUNTS_DEFAULT: Account[] = [
  { id: 'acc1', name: 'Расчётный счёт', type: 'bank', initialBalance: 500000, currency: '₽', color: '#22c55e' },
  { id: 'acc2', name: 'Касса', type: 'cash', initialBalance: 50000, currency: '₽', color: '#3b82f6' },
  { id: 'acc3', name: 'Корпоративная карта', type: 'card', initialBalance: 120000, currency: '₽', color: '#a855f7' },
];

const CATEGORIES_DEFAULT: Category[] = [
  { id: 'cat1', name: 'Выручка', type: 'income', color: '#22c55e', icon: 'TrendingUp' },
  { id: 'cat2', name: 'Прочие доходы', type: 'income', color: '#3b82f6', icon: 'Plus' },
  { id: 'cat3', name: 'Операционные расходы', type: 'expense', color: '#f97316', icon: 'Receipt' },
  { id: 'cat4', name: 'Зарплата', type: 'expense', color: '#3b82f6', icon: 'User' },
  { id: 'cat5', name: 'Дивиденды', type: 'expense', color: '#a855f7', icon: 'Gem' },
  { id: 'cat6', name: 'Налог', type: 'expense', color: '#ef4444', icon: 'Landmark' },
  { id: 'cat7', name: 'Маркетинг', type: 'expense', color: '#eab308', icon: 'Megaphone' },
];

const DEALS_DEFAULT: Deal[] = [
  {
    id: 'd1', title: 'Разработка сайта для ООО Ромашка', client: 'ООО Ромашка',
    counterpartyId: 'cp1', managerId: 'm1', accountId: 'acc1', revenue: 450000,
    expenses: [
      { id: 'e1', name: 'Дизайн', amount: 80000 },
      { id: 'e2', name: 'Разработка', amount: 150000 },
    ],
    date: '2026-05-10', status: 'closed',
  },
  {
    id: 'd2', title: 'CRM-система для Стройтех', client: 'Стройтех',
    counterpartyId: 'cp2', managerId: 'm2', accountId: 'acc1', revenue: 720000,
    expenses: [
      { id: 'e3', name: 'Аналитика', amount: 50000 },
      { id: 'e4', name: 'Разработка', amount: 280000 },
      { id: 'e5', name: 'Тестирование', amount: 40000 },
    ],
    date: '2026-05-20', status: 'closed',
  },
  {
    id: 'd3', title: 'Мобильное приложение', client: 'ИП Климов',
    counterpartyId: 'cp3', managerId: 'm1', accountId: 'acc2', revenue: 380000,
    expenses: [
      { id: 'e6', name: 'Дизайн', amount: 60000 },
      { id: 'e7', name: 'iOS разработка', amount: 120000 },
    ],
    date: '2026-06-01', status: 'active',
  },
  {
    id: 'd4', title: 'Интеграция 1С', client: 'ГК Меркурий',
    counterpartyId: 'cp4', managerId: 'm3', accountId: 'acc1', revenue: 210000,
    expenses: [
      { id: 'e8', name: 'Разработка', amount: 90000 },
    ],
    date: '2026-05-28', status: 'pending',
  },
];

const TRANSACTIONS_DEFAULT: Transaction[] = [
  { id: 't1', type: 'income', categoryId: 'cat1', amount: 450000, description: 'Оплата ООО Ромашка', counterpartyId: 'cp1', accountId: 'acc1', dealId: 'd1', date: '2026-05-15' },
  { id: 't2', type: 'income', categoryId: 'cat1', amount: 720000, description: 'Оплата Стройтех', counterpartyId: 'cp2', accountId: 'acc1', dealId: 'd2', date: '2026-05-22' },
  { id: 't3', type: 'expense', categoryId: 'cat3', amount: 370000, description: 'Затраты на сделку Ромашка', accountId: 'acc1', dealId: 'd1', date: '2026-05-16' },
  { id: 't4', type: 'expense', categoryId: 'cat3', amount: 370000, description: 'Затраты на сделку Стройтех', accountId: 'acc1', dealId: 'd2', date: '2026-05-23' },
  { id: 't5', type: 'salary', categoryId: 'cat4', amount: 35000, description: 'ЗП за сделку Ромашка', recipientId: 'm1', accountId: 'acc1', dealId: 'd1', date: '2026-05-18' },
  { id: 't6', type: 'salary', categoryId: 'cat4', amount: 40000, description: 'ЗП за сделку Стройтех', recipientId: 'm2', accountId: 'acc1', dealId: 'd2', date: '2026-05-25' },
  { id: 't7', type: 'dividend', categoryId: 'cat5', amount: 80000, description: 'Дивиденды май', accountId: 'acc1', date: '2026-05-31' },
];

const SETTINGS_DEFAULT: Settings = {
  dividendPercent: 10,
  managerCommissionPercent: 10,
  companyName: 'МояКомпания',
  currency: '₽',
};

// ─── Utils ───────────────────────────────────────────────────────────────────

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Calculations ────────────────────────────────────────────────────────────

export function calcDeal(deal: Deal, settings: Settings): DealCalc {
  const totalExpenses = deal.expenses.reduce((s, e) => s + e.amount, 0);
  const margin = deal.revenue - totalExpenses;
  const marginPercent = deal.revenue > 0 ? (margin / deal.revenue) * 100 : 0;
  const managerSalary = margin > 0 ? (margin * settings.managerCommissionPercent) / 100 : 0;
  return { ...deal, totalExpenses, margin, marginPercent, managerSalary };
}

export function calcAccountBalances(accounts: Account[], transactions: Transaction[]): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const acc of accounts) {
    balances[acc.id] = acc.initialBalance;
  }
  for (const t of transactions) {
    if (!t.accountId) continue;
    const isIncome = t.type === 'income';
    const isExpense = t.type === 'expense' || t.type === 'salary' || t.type === 'dividend' || t.type === 'tax';
    if (balances[t.accountId] === undefined) balances[t.accountId] = 0;
    if (isIncome) balances[t.accountId] += t.amount;
    else if (isExpense) balances[t.accountId] -= t.amount;
  }
  return balances;
}

export function calcSummary(
  deals: Deal[],
  transactions: Transaction[],
  settings: Settings,
  accounts: Account[],
) {
  const calcs = deals.map(d => calcDeal(d, settings));

  const totalRevenue = calcs.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = calcs.reduce((s, d) => s + d.totalExpenses, 0);
  const totalMargin = calcs.reduce((s, d) => s + d.margin, 0);
  const netProfit = totalMargin;
  const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const accruedDividends = netProfit > 0 ? (netProfit * settings.dividendPercent) / 100 : 0;
  const paidDividends = transactions.filter(t => t.type === 'dividend').reduce((s, t) => s + t.amount, 0);
  const remainingDividends = Math.max(0, accruedDividends - paidDividends);

  const salariesByManager: Record<string, { accrued: number; paid: number; remaining: number }> = {};
  for (const d of calcs) {
    if (!salariesByManager[d.managerId]) salariesByManager[d.managerId] = { accrued: 0, paid: 0, remaining: 0 };
    salariesByManager[d.managerId].accrued += d.managerSalary;
  }
  for (const t of transactions) {
    if (t.type === 'salary' && t.recipientId) {
      if (!salariesByManager[t.recipientId]) salariesByManager[t.recipientId] = { accrued: 0, paid: 0, remaining: 0 };
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
    if (['expense', 'salary', 'dividend', 'tax'].includes(t.type)) return s - t.amount;
    return s;
  }, 0);

  const accountBalances = calcAccountBalances(accounts, transactions);

  return {
    totalRevenue, totalExpenses, totalMargin, netProfit, marginPercent,
    accruedDividends, paidDividends, remainingDividends,
    salariesByManager, totalSalariesAccrued, totalSalariesPaid, totalSalariesRemaining,
    balance, dealCalcs: calcs, accountBalances,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFinance() {
  const [managers, setManagers] = useState<Manager[]>(MANAGERS_DEFAULT);
  const [counterparties, setCounterparties] = useState<Counterparty[]>(COUNTERPARTIES_DEFAULT);
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS_DEFAULT);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DEFAULT);
  const [deals, setDeals] = useState<Deal[]>(DEALS_DEFAULT);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS_DEFAULT);
  const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULT);

  const summary = calcSummary(deals, transactions, settings, accounts);

  // Deals
  const addDeal = useCallback((deal: Omit<Deal, 'id'>) => {
    setDeals(prev => [...prev, { ...deal, id: generateId() }]);
  }, []);
  const updateDeal = useCallback((id: string, data: Partial<Omit<Deal, 'id'>>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, []);
  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  // Transactions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...tx, id: generateId() }]);
  }, []);
  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Managers
  const addManager = useCallback((name: string) => {
    setManagers(prev => [...prev, { id: generateId(), name }]);
  }, []);

  // Counterparties
  const addCounterparty = useCallback((cp: Omit<Counterparty, 'id'>) => {
    setCounterparties(prev => [...prev, { ...cp, id: generateId() }]);
  }, []);
  const updateCounterparty = useCallback((id: string, data: Partial<Omit<Counterparty, 'id'>>) => {
    setCounterparties(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);
  const deleteCounterparty = useCallback((id: string) => {
    setCounterparties(prev => prev.filter(c => c.id !== id));
  }, []);

  // Accounts
  const addAccount = useCallback((acc: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...acc, id: generateId() }]);
  }, []);
  const updateAccount = useCallback((id: string, data: Partial<Omit<Account, 'id'>>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);
  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Categories
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: generateId() }]);
  }, []);
  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);
  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // Settings
  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  }, []);

  return {
    managers, counterparties, accounts, categories, deals, transactions, settings, summary,
    addDeal, updateDeal, deleteDeal,
    addTransaction, updateTransaction, deleteTransaction,
    addManager,
    addCounterparty, updateCounterparty, deleteCounterparty,
    addAccount, updateAccount, deleteAccount,
    addCategory, updateCategory, deleteCategory,
    updateSettings,
  };
}

export type FinanceStore = ReturnType<typeof useFinance>;
