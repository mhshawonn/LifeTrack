import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarCheck, Target, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient, { handleApiError } from '../api/apiClient.js';
import { Progress } from '../components/Progress.jsx';

const initialGoal = {
  title: '',
  description: '',
  targetValue: '',
  currentValue: '',
  frequency: 'monthly',
  deadline: '',
  category: '',
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(initialGoal);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState({});

  const fetchGoals = async () => {
    try {
      const { data } = await apiClient.get('/goals');
      setGoals(data.goals);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitGoal = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      targetValue: Number(form.targetValue),
      currentValue: Number(form.currentValue || 0),
    };
    try {
      if (editingId) {
        const { data } = await apiClient.put(`/goals/${editingId}`, payload);
        setGoals((prev) => prev.map((goal) => (goal._id === editingId ? data.goal : goal)));
        toast.success('Goal updated');
      } else {
        const { data } = await apiClient.post('/goals', payload);
        setGoals((prev) => [data.goal, ...prev]);
        toast.success('Goal created');
      }
      setForm(initialGoal);
      setEditingId(null);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await apiClient.delete(`/goals/${goalId}`);
      setGoals((prev) => prev.filter((goal) => goal._id !== goalId));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const editGoal = (goal) => {
    setEditingId(goal._id);
    setForm({
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      frequency: goal.frequency,
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
      category: goal.category || '',
    });
  };

  const handleProgressChange = (goalId, value) => {
    setProgressUpdates((prev) => ({
      ...prev,
      [goalId]: value,
    }));
  };

  const submitProgress = async (goal) => {
    const value = Number(progressUpdates[goal._id]);
    if (Number.isNaN(value)) {
      toast.error('Enter a valid progress value');
      return;
    }
    try {
      const { data } = await apiClient.post(`/goals/${goal._id}/progress`, { value });
      setGoals((prev) => prev.map((item) => (item._id === goal._id ? data.goal : item)));
      toast.success('Progress updated');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const aggregatedProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + goal.currentValue / goal.targetValue, 0);
    return Math.round((total / goals.length) * 100);
  }, [goals]);

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
              {editingId ? 'Edit goal' : 'Create new goal'}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Focus on progress</h1>
          </div>
          <div className="rounded-2xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
            Avg completion {aggregatedProgress}%
          </div>
        </div>

        <form onSubmit={submitGoal} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={handleChange('title')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target</label>
            <input
              type="number"
              min="0"
              required
              value={form.targetValue}
              onChange={handleChange('targetValue')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current progress
            </label>
            <input
              type="number"
              min="0"
              value={form.currentValue}
              onChange={handleChange('currentValue')}
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
              <option value="monthly">Monthly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={handleChange('category')}
              placeholder="e.g. Savings"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={handleChange('deadline')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows="2"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark"
            >
              <Target className="h-4 w-4" />
              {editingId ? 'Update goal' : 'Create goal'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(initialGoal);
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
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Goal board</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Track each milestone</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarCheck className="h-4 w-4" />
            <span>{goals.length} goal(s)</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-slate-400">Loading goals...</p>}
          {!loading && goals.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No goals yet. Start by defining what you want to achieve.
            </p>
          )}

          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <div
                key={goal._id}
                className="rounded-3xl border border-white/40 bg-white/70 p-5 transition hover:border-brand/40 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{goal.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {goal.description || 'No description yet'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      Frequency: {goal.frequency} · Target {goal.targetValue}
                    </p>
                    {goal.deadline && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                        Deadline {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editGoal(goal)}
                      className="rounded-2xl border border-slate-200/70 px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(goal._id)}
                      className="flex items-center gap-2 rounded-2xl border border-rose-200/70 px-4 py-2 text-xs font-medium text-rose-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-rose-900 dark:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <BarChart3 className="h-4 w-4" />
                      {goal.currentValue} / {goal.targetValue}
                    </span>
                    <span className="text-sm font-semibold text-brand-dark dark:text-brand-light">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={progressUpdates[goal._id] ?? goal.currentValue}
                    onChange={(event) => handleProgressChange(goal._id, event.target.value)}
                    className="w-32 rounded-2xl border border-white/40 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                  />
                  <button
                    onClick={() => submitProgress(goal)}
                    className="rounded-2xl bg-brand/20 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/30"
                  >
                    Update progress
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
};

export default GoalsPage;
