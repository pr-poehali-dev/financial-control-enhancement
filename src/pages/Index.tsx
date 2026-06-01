import { FinanceProvider } from '@/store/FinanceContext';
import Layout from '@/components/Layout';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import DealsPage from './DealsPage';
import TransactionsPage from './TransactionsPage';
import AnalyticsPage from './AnalyticsPage';
import CounterpartiesPage from './CounterpartiesPage';
import AccountsPage from './AccountsPage';
import CategoriesPage from './CategoriesPage';
import SettingsPage from './SettingsPage';

export default function Index() {
  return (
    <FinanceProvider>
      <Layout>
        {(page, setPage) => {
          switch (page) {
            case 'home': return <HomePage onNavigate={setPage} />;
            case 'dashboard': return <DashboardPage />;
            case 'deals': return <DealsPage />;
            case 'transactions': return <TransactionsPage />;
            case 'analytics': return <AnalyticsPage />;
            case 'counterparties': return <CounterpartiesPage />;
            case 'accounts': return <AccountsPage />;
            case 'categories': return <CategoriesPage />;
            case 'settings': return <SettingsPage />;
            default: return <DashboardPage />;
          }
        }}
      </Layout>
    </FinanceProvider>
  );
}