import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient, { handleApiError } from '../api/apiClient.js';
import useDashboard from '../hooks/useDashboard.js';
import Loader from '../components/Loader.jsx';

const prepareSummaryData = (summary) => {
  const categories = {};
  summary.forEach((entry) => {
    const key = entry._id.category;
    if (!categories[key]) {
      categories[key] = { category: key, income: 0, expense: 0 };
    }
    categories[key][entry._id.type] = entry.total;
  });
  return Object.values(categories);
};

const buildTrendData = (aggregate = []) => {
  const byMonth = {};
  aggregate.forEach((entry) => {
    const label = `${entry._id.month}/${entry._id.year}`;
    if (!byMonth[label]) {
      byMonth[label] = { month: label, income: 0, expense: 0 };
    }
    byMonth[label][entry._id.type] = entry.total;
  });
  return Object.values(byMonth);
};

const AnalyticsPage = () => {
  const { metrics, loading } = useDashboard();
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const now = new Date();
        const { data } = await apiClient.get('/transactions/summary', {
          params: { month: now.getMonth(), year: now.getFullYear() },
        });
        setSummary(data.summary);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const categoryData = useMemo(() => prepareSummaryData(summary), [summary]);
  const trendData = useMemo(() => buildTrendData(metrics?.monthlyTrends ?? []), [metrics]);

  if (loading && !metrics) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass-panel border border-red-200 bg-red-50/60 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/40 dark:text-red-200">
          {error}
        </div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Financial & lifestyle analytics
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Monitor the balance between income, spending, and personal growth. Spot trends quickly.
          </p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel h-[420px] rounded-3xl border-none p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">6-Month Flow</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Combined income and expense trend
          </p>
          <div className="mt-6 h-full">
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#22C55E" fill="url(#incomeColor)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel h-[420px] rounded-3xl border-none p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Goal completion snapshot</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Compare different goals side-by-side
          </p>
          <div className="mt-6 h-full">
            <ResponsiveContainer>
              <BarChart
                data={(metrics?.goalStats ?? []).map((goal) => ({
                  name: goal.title,
                  progress: goal.progress,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="progress" fill="#4C6EF5" radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Current month breakdown</h2>
          {summaryLoading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Compare how each category contributes to income and expenses.
        </p>

        <div className="mt-6 h-96">
          <ResponsiveContainer>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" stackId="a" fill="#22C55E" radius={[12, 12, 0, 0]} />
              <Bar dataKey="expense" stackId="a" fill="#EF4444" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </div>
  );
};

export default AnalyticsPage;
