import { useMemo } from 'react';
import { PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from '../components/StatsCard.jsx';
import TrendChart from '../components/TrendChart.jsx';
import CategoryPie from '../components/CategoryPie.jsx';
import GoalProgress from '../components/GoalProgress.jsx';
import ActivityStreaks from '../components/ActivityStreaks.jsx';
import useDashboard from '../hooks/useDashboard.js';
import Loader from '../components/Loader.jsx';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const buildTrendData = (aggregate = []) => {
  const byMonth = {};
  aggregate.forEach((entry) => {
    const label = `${entry._id.month}/${entry._id.year}`;
    if (!byMonth[label]) {
      byMonth[label] = { month: label, income: 0, expense: 0 };
    }
    byMonth[label][entry._id.type === 'income' ? 'income' : 'expense'] = entry.total;
  });
  return Object.values(byMonth);
};

const DashboardPage = () => {
  const { metrics, loading, error } = useDashboard();

  const trendData = useMemo(() => buildTrendData(metrics?.monthlyTrends), [metrics]);

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Total income"
          value={formatCurrency(metrics?.income)}
          subtitle="All sources this month"
          icon={TrendingUp}
          accent="bg-emerald-500"
        />
        <StatsCard
          title="Total expenses"
          value={formatCurrency(metrics?.expenses)}
          subtitle="Tracked spending"
          icon={TrendingDown}
          accent="bg-rose-500"
        />
        <StatsCard
          title="Savings balance"
          value={formatCurrency(metrics?.savings)}
          subtitle="Good job staying balanced"
          icon={PiggyBank}
          accent="bg-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <TrendChart data={trendData} />
        <CategoryPie data={metrics?.topCategories ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GoalProgress goals={metrics?.goalStats ?? []} />
        <ActivityStreaks activities={metrics?.activityStreaks ?? []} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel grid grid-cols-1 gap-4 rounded-3xl border-none p-6 sm:grid-cols-3"
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Expense streak</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {metrics?.streaks?.expenses ?? 0} days
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Goal streak</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {metrics?.streaks?.goals ?? 0} days
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Activity streak
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {metrics?.streaks?.activities ?? 0} days
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
