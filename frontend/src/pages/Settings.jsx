import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Clock, MoonStar, Palette } from 'lucide-react';
import apiClient, { handleApiError } from '../api/apiClient.js';
import useTheme from '../hooks/useTheme.js';
import useAuth from '../hooks/useAuth.js';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const [preferences, setPreferences] = useState({
    dailyReminder: true,
    reminderTime: '20:00',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get('/settings');
        setPreferences(data.preferences);
        if (data.preferences?.theme) {
          setTheme(data.preferences.theme);
        }
      } catch (error) {
        toast.error(handleApiError(error));
      }
    };
    fetchSettings();
  }, [setTheme]);

  const handlePreferenceChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const payload = { preferences: { ...preferences, theme } };
      await apiClient.put('/settings', payload);
      toast.success('Preferences saved');
      updateUserLocally((prev) => ({
        ...prev,
        preferences: { ...(prev?.preferences ?? {}), ...payload.preferences },
      }));
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Personalize</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tailor LifeTrack to match your daily rhythm.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-brand" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Theme</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose the palette that feels right.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {['light', 'dark', 'system'].map((option) => (
            <button
              key={option}
              onClick={() => setTheme(option)}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                theme === option
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-white/40 bg-white/60 text-slate-500 hover:border-brand/40 dark:border-slate-800 dark:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MoonStar className="h-4 w-4" />
                <div>
                  <p className="text-sm font-semibold capitalize">{option}</p>
                  <p className="text-xs text-slate-400">Persisted for your next visit</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-brand" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily reminders</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay consistent with gentle nudges to log expenses or update goals.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between rounded-3xl border border-white/40 bg-white/60 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            Enable daily reminders
            <input
              type="checkbox"
              checked={preferences.dailyReminder}
              onChange={handlePreferenceChange('dailyReminder')}
              className="h-5 w-5 rounded border border-slate-300 accent-brand"
            />
          </label>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reminder time
            </label>
            <input
              type="time"
              value={preferences.reminderTime}
              onChange={handlePreferenceChange('reminderTime')}
              className="w-40 rounded-2xl border border-white/40 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={savePreferences}
          disabled={saving}
          className="mt-6 rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6 text-sm text-slate-500 dark:text-slate-400"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
            <p className="mt-1 text-base font-semibold text-slate-800 dark:text-white">{user?.name}</p>
          </div>
          <div className="rounded-3xl border border-white/40 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-1 text-base font-semibold text-slate-800 dark:text-white">{user?.email}</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default SettingsPage;
