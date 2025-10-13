import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#4C6EF5', '#38BDF8', '#F97316', '#22C55E', '#E11D48'];

const CategoryPie = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="glass-panel rounded-3xl border-none p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Spending focus
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Top categories</h3>
      </div>
    </div>

    <div className="mt-6 h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="_id"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default CategoryPie;
