const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand/40 border-t-brand"></div>
      <p className="text-lg font-medium text-white/70">Preparing your LifeTrack space...</p>
    </div>
  </div>
);

export default Loader;
