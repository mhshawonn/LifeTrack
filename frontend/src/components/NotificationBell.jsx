import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import useDashboard from '../hooks/useDashboard.js';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const { notifications } = useDashboard();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-2xl border border-slate-200/70 bg-white/60 p-2 text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="notification-popover"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-panel absolute right-0 mt-3 w-80 rounded-3xl border border-white/40 p-4 shadow-soft dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Notifications</p>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">You are all caught up! ✨</p>
              )}
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-slate-200/60 bg-white/70 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" />
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{note.message}</p>
                      {note.action && (
                        <p className="mt-1 text-xs uppercase tracking-wide text-brand dark:text-brand-light">
                          {note.action.replace('-', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
