import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityStreaks = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="glass-panel rounded-3xl border-none p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Lifestyle streaks
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Keep the momentum</h3>
      </div>
    </div>

    <div className="mt-6 space-y-4">
      {activities.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Log activities like gym, diet, or study to build inspiring streaks.
        </p>
      )}
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between rounded-2xl bg-white/70 p-4 dark:bg-slate-800/60"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{activity.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last completed{' '}
                {activity.lastCompletedAt
                  ? new Date(activity.lastCompletedAt).toLocaleDateString()
                  : 'Not yet'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-amber-500 dark:text-amber-300">{activity.streak}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Day streak</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default ActivityStreaks;
