export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-base shadow-lg shadow-teal-500/20">
            🚭
          </div>
          <span className="font-black text-white tracking-tight">Nichtraucher<span className="text-teal-400">.</span></span>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
