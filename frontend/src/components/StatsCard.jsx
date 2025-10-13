import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, icon: Icon, accent = 'bg-brand' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="glass-panel group relative overflow-hidden rounded-3xl border-none p-6"
  >
    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
    </div>
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {subtitle && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  </motion.div>
);

export default StatsCard;
