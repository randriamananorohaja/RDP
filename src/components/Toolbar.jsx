export function Toolbar({
  onSimulate,
  onReset,
  onReconfigure,
  onAddEmprunt,
  running,
  stopped,
  tokens,
  contraintes,
  stockInfo,
  enAttente,
  empruntsEnCours,
  stepDuration,
  renderDelay,
}) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-[300px]">
      {/* Panneau principal */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-xl">
        <div className="mb-3">
          <h1 className="text-white font-semibold text-base tracking-tight">
            Réseau de Petri
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Bibliothèque multi-types
          </p>
        </div>

        {/* Stocks */}
        <div className="space-y-1.5 mb-3">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-1">
            Stocks disponibles
          </div>
          {stockInfo.map((bt) => (
            <div
              key={bt.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/80"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: bt.color }}
                />
                <span className="text-slate-300 text-xs">{bt.label}</span>
              </div>
              <span className="font-semibold text-sm tabular-nums" style={{ color: bt.color }}>
                {bt.tokens}
              </span>
            </div>
          ))}
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/60">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">En attente</div>
            <div className="text-violet-400 font-semibold text-lg tabular-nums">{enAttente}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/60">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">En cours</div>
            <div className="text-amber-400 font-semibold text-lg tabular-nums">{empruntsEnCours}</div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onAddEmprunt}
          className="w-full py-2 rounded-lg text-sm font-medium
                     bg-slate-700 text-slate-100 hover:bg-slate-600
                     border border-slate-600 transition-colors duration-150
                     flex items-center justify-center gap-1.5"
        >
          + Ajouter un emprunt
        </button>

        <div className="flex gap-2 mt-2">
          <button
            onClick={onSimulate}
            disabled={stopped}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-150
              ${
                stopped
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : running
                    ? 'bg-rose-700/80 text-white hover:bg-rose-600 border border-rose-600/50'
                    : 'bg-cyan-700/80 text-white hover:bg-cyan-600 border border-cyan-600/50'
              }`}
          >
            {running ? 'Arrêter' : 'Simuler'}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-200
                       hover:bg-slate-600 border border-slate-600 transition-colors duration-150"
            title="Réinitialiser"
          >
            ↺
          </button>
        </div>

        <button
          onClick={onReconfigure}
          className="w-full mt-2 py-1.5 rounded-lg text-xs font-medium
                     bg-transparent text-slate-400 border border-slate-700
                     hover:bg-slate-800 hover:text-slate-200 transition-colors duration-150"
        >
          Configuration
        </button>

        {stopped && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-700/60">
            <p className="text-rose-400 text-xs font-semibold">
              Simulation arrêtée
            </p>
            <p className="text-rose-400/80 text-[10px] mt-0.5 leading-snug">
              Contrainte violée (stock insuffisant ou fin de simulation)
            </p>
          </div>
        )}

        {/* Timing */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex justify-between text-[10px] text-slate-500">
          <span>Étape : {stepDuration}s</span>
          <span>Rendu : {renderDelay}s</span>
        </div>

        {/* Stats */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/80">
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="bg-slate-900/40 rounded-lg p-2">
              <div className="text-slate-500 text-[10px]">Jetons</div>
              <div className="text-cyan-400 font-semibold tabular-nums">{tokens}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-2">
              <div className="text-slate-500 text-[10px]">Statut</div>
              <div
                className={`font-semibold ${
                  running ? 'text-emerald-400' : stopped ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {running ? 'Actif' : stopped ? 'Bloqué' : 'Prêt'}
              </div>
            </div>
          </div>

          {contraintes && (
            <div className="bg-slate-900/40 rounded-lg p-2.5 text-xs space-y-1">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">
                Statistiques
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Emprunts</span>
                <span className="text-emerald-400 font-medium tabular-nums">
                  {contraintes.empruntsReussis}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Refus</span>
                <span className="text-rose-400 font-medium tabular-nums">
                  {contraintes.refusStock}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Retours</span>
                <span className="text-cyan-400 font-medium tabular-nums">
                  {contraintes.retoursTraites}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Retards</span>
                <span className="text-amber-400 font-medium tabular-nums">
                  {contraintes.retards}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-3 border border-slate-700 shadow-xl">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-2">
          Légende
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-300 mb-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-cyan-500/80" />
          <span>Place (état)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="w-4 h-2.5 rounded border border-slate-500 bg-slate-700" />
          <span>Transition (événement)</span>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
