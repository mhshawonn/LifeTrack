import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationBell from './NotificationBell.jsx';
import useAuth from '../hooks/useAuth.js';
import { motion } from 'framer-motion';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-white p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-[1440px] gap-6">
        <Sidebar />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-1 flex-col"
        >
          <header className="glass-panel flex items-center justify-between rounded-3xl border-none px-8 py-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily wellness & finances</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-white">
                Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>

          <main className="mt-6 flex-1">
            <Outlet />
          </main>
        </motion.div>
      </div>
    </div>
  );
};

export default AppLayout;
