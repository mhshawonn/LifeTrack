import { Progress } from './Progress.jsx';
import { motion } from 'framer-motion';

const GoalProgress = ({ goals }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="glass-panel rounded-3xl border-none p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Goal focus</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Progress overview</h3>
      </div>
    </div>
    <div className="mt-6 space-y-4">
      {goals.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set your first goal to start tracking your progress.
        </p>
      )}
      {goals.map((goal) => (
        <div key={goal.id} className="rounded-2xl bg-white/60 p-4 dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{goal.title}</p>
            <span
              className={`text-xs font-semibold ${
                goal.isCompleted ? 'text-emerald-500' : 'text-brand-dark dark:text-brand-light'
              }`}
            >
              {goal.progress}%
            </span>
          </div>
          <div className="mt-3">
            <Progress value={goal.progress} />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default GoalProgress;
