import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import { handleApiError } from '../api/apiClient.js';

const modes = {
  login: {
    title: 'Welcome back',
    action: 'Login',
    toggleLabel: "Don't have an account?",
    toggleAction: 'Create one',
  },
  register: {
    title: 'Create your space',
    action: 'Sign up',
    toggleLabel: 'Already with us?',
    toggleAction: 'Log in',
  },
};

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  const meta = useMemo(() => modes[activeMode], [activeMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (activeMode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }

      const redirectTo = location.state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
      toast.success(`Welcome ${activeMode === 'login' ? 'back' : 'aboard'}!`);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));

  const toggleMode = () => {
    setActiveMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-white"
        >
          <p className="text-sm uppercase tracking-[0.6em] text-white/40">LifeTrack</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Calm finances, <span className="text-brand-light">balanced living.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/70">
            Track your income, expenses, goals, and daily activities in one thoughtful dashboard.
            Smart AI categorization keeps everything organized effortlessly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel flex-1 rounded-4xl border border-white/20 p-8"
        >
          <p className="text-base font-medium text-slate-500">{meta?.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{meta?.action}</h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {activeMode === 'register' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={updateField('email')}
                placeholder="name@email.com"
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={updateField('password')}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/50"
            >
              {loading ? 'Please wait...' : meta?.action}
            </button>
          </form>

          <button
            type="button"
            onClick={toggleMode}
            className="mt-6 text-sm font-medium text-brand transition hover:text-brand-dark"
          >
            {meta?.toggleLabel} {meta?.toggleAction}
          </button>

          <p className="mt-6 text-xs text-slate-400">
            Use the demo account: <span className="font-semibold text-slate-500">demo@lifetrack.app</span> /
            <span className="font-semibold text-slate-500"> password123</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
