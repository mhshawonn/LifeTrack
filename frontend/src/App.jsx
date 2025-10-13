import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import TransactionsPage from './pages/Transactions.jsx';
import GoalsPage from './pages/Goals.jsx';
import ActivitiesPage from './pages/Activities.jsx';
import AnalyticsPage from './pages/Analytics.jsx';
import SettingsPage from './pages/Settings.jsx';
import AuthPage from './pages/Auth.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
