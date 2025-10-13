import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { motion } from 'framer-motion';

const TrendChart = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="glass-panel rounded-3xl border-none p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Monthly Trends
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
          Income vs Expenses
        </h3>
      </div>
    </div>

    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default TrendChart;
