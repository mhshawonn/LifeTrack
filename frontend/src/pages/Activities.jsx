import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, RefreshCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient, { handleApiError } from '../api/apiClient.js';

const defaultActivity = {
  name: '',
  frequency: 'daily',
  notes: '',
  icon: '',
};

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(defaultActivity);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchActivities = async () => {
    try {
      const { data } = await apiClient.get('/activities');
      setActivities(data.activities);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveActivity = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        const { data } = await apiClient.put(`/activities/${editingId}`, form);
        setActivities((prev) => prev.map((item) => (item._id === editingId ? data.activity : item)));
        toast.success('Activity updated');
      } else {
        const { data } = await apiClient.post('/activities', form);
        setActivities((prev) => [data.activity, ...prev]);
        toast.success('Activity created');
      }
      setForm(defaultActivity);
      setEditingId(null);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const markCompleted = async (activityId) => {
    try {
      const { data } = await apiClient.post(`/activities/${activityId}/complete`, {});
      setActivities((prev) => prev.map((item) => (item._id === activityId ? data.activity : item)));
      toast.success('Great job! Activity completed.');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const removeActivity = async (activityId) => {
    try {
      await apiClient.delete(`/activities/${activityId}`);
      setActivities((prev) => prev.filter((item) => item._id !== activityId));
      toast.success('Activity removed');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const editActivity = (activity) => {
    setEditingId(activity._id);
    setForm({
      name: activity.name,
      frequency: activity.frequency,
      notes: activity.notes || '',
      icon: activity.icon || '',
    });
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {editingId ? 'Edit activity' : 'Add activity'}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Celebrate your rituals</h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">
            <Activity className="h-4 w-4" />
            {activities.length} activities
          </div>
        </div>

        <form onSubmit={saveActivity} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Morning run"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Frequency</label>
            <select
              value={form.frequency}
              onChange={handleChange('frequency')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={handleChange('icon')}
              placeholder="Optional emoji/icon"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              rows="2"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark"
            >
              <CheckCircle2 className="h-4 w-4" />
              {editingId ? 'Update activity' : 'Create activity'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(defaultActivity);
                  setEditingId(null);
                }}
                className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm text-slate-500 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Active streaks</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
              Keep your habits glowing
            </h2>
          </div>
          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/70 px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
          >
            <RefreshCcw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-slate-400">Loading activities...</p>}
          {!loading && activities.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add habits you want to nurture to start building streaks.
            </p>
          )}

          {activities.map((activity) => (
            <div
              key={activity._id}
              className="flex flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-5 transition hover:border-brand/40 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activity.icon || '🌟'}</span>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{activity.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {activity.notes || 'No notes yet'}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                    Frequency: {activity.frequency}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    Last done{' '}
                    {activity.lastCompletedAt ? new Date(activity.lastCompletedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold text-amber-500 dark:text-amber-300">{activity.streak}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Day streak</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => markCompleted(activity._id)}
                  className="flex items-center gap-2 rounded-2xl bg-brand/20 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/30"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Mark done
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editActivity(activity)}
                    className="rounded-2xl border border-slate-200/70 px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeActivity(activity._id)}
                    className="flex items-center gap-1 rounded-2xl border border-rose-200/70 px-4 py-2 text-xs font-medium text-rose-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-rose-900 dark:text-rose-300"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default ActivitiesPage;
