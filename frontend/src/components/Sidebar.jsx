import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart,
  Goal,
  Home,
  Layers,
  LogOut,
  Settings,
  Wallet,
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'Income & Expenses', to: '/transactions', icon: Wallet },
  { label: 'Goals', to: '/goals', icon: Goal },
  { label: 'Activities', to: '/activities', icon: Activity },
  { label: 'Analytics', to: '/analytics', icon: BarChart },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="glass-panel flex h-full w-72 flex-col border-none bg-white/70 dark:bg-slate-900/70">
      <div className="px-6 pt-8">
        <div className="card-gradient rounded-3xl p-5 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">LifeTrack</p>
          <h2 className="mt-2 text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-white/70">{user?.name}</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1 px-4">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-brand text-white shadow-lg shadow-brand/30'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
              ].join(' ')
            }
            end={to === '/'}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 pb-8">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
