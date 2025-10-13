export const Progress = ({ value = 0 }) => (
  <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700">
    <div
      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
