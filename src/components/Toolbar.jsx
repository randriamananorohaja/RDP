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
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-[320px]">
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-4 border border-slate-700 shadow-2xl">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          📚 Réseau de Pétri
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Bibliothèque multi-types
        </p>

        {/* 📚 Stocks par type */}
        <div className="mt-4 space-y-1.5">
          <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">
            Stocks disponibles
          </div>
          {stockInfo.map((bt) => (
            <div
              key={bt.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: bt.color, boxShadow: `0 0 6px ${bt.color}` }}
                />
                <span className="text-slate-300 text-xs font-medium">{bt.label}</span>
              </div>
              <span
                className="font-bold text-sm"
                style={{ color: bt.color }}
              >
                {bt.tokens}
              </span>
            </div>
          ))}
        </div>

        {/* File d'attente + emprunts en cours */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/30">
            <div className="text-purple-400/80 text-[10px] uppercase font-semibold">⏳ En attente</div>
            <div className="text-purple-400 font-bold text-lg">{enAttente}</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 border border-orange-500/30">
            <div className="text-orange-400/80 text-[10px] uppercase font-semibold">📚 En cours</div>
            <div className="text-orange-400 font-bold text-lg">{empruntsEnCours}</div>
          </div>
        </div>

        {/* ➕ Bouton Ajouter un emprunt */}
        <button
          onClick={onAddEmprunt}
          className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm
                     bg-gradient-to-r from-purple-500 to-pink-500 text-white
                     hover:from-purple-400 hover:to-pink-400
                     shadow-lg shadow-purple-500/30 hover:scale-[1.02]
                     transition-all duration-300 flex items-center justify-center gap-2"
        >
          ➕ Ajouter un emprunt
        </button>

        {/* Boutons simulation */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onSimulate}
            disabled={stopped}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${stopped
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : running
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30 hover:scale-105'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30 hover:scale-105'
              }`}
          >
            {running ? '⏸ Arrêter' : '▶ Simuler'}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-700 text-slate-200
                       hover:bg-slate-600 transition-all duration-300 hover:scale-105"
            title="Réinitialiser"
          >
            🔄
          </button>
        </div>

        <button
          onClick={onReconfigure}
          className="w-full mt-2 px-3 py-2 rounded-xl text-xs font-semibold
                     bg-slate-900/60 text-cyan-400 border border-cyan-500/30
                     hover:bg-slate-900 hover:border-cyan-400 transition-all"
        >
          ⚙️ Configuration
        </button>

        {/* Alerte arrêt */}
        {stopped && (
          <div className="mt-3 p-2 rounded-lg bg-red-500/20 border border-red-500/40">
            <p className="text-red-400 text-xs font-bold flex items-center gap-1">
              🛑 Simulation arrêtée (contrainte violée)
            </p>
          </div>
        )}

        {/* Timing */}
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>⏱️ Étape : {stepDuration}s</span>
            <span>⏳ Rendu : {renderDelay}s</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="bg-slate-900/50 rounded-lg p-2">
              <div className="text-slate-400">Jetons</div>
              <div className="text-cyan-400 font-bold text-base">{tokens}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2">
              <div className="text-slate-400">Statut</div>
              <div className={`font-bold text-base ${running ? 'text-emerald-400' : stopped ? 'text-red-400' : 'text-slate-400'}`}>
                {running ? 'Actif' : stopped ? 'Bloqué' : 'Prêt'}
              </div>
            </div>
          </div>

          {contraintes && (
            <div className="bg-slate-900/50 rounded-lg p-2 text-xs space-y-1">
              <div className="text-slate-400 mb-1 font-semibold">📊 Statistiques</div>
              <div className="flex justify-between text-slate-300">
                <span>Emprunts :</span>
                <span className="text-emerald-400 font-bold">{contraintes.empruntsReussis}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Refus :</span>
                <span className="text-red-400 font-bold">{contraintes.refusStock}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Retours :</span>
                <span className="text-cyan-400 font-bold">{contraintes.retoursTraites}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Retards :</span>
                <span className="text-orange-400 font-bold">{contraintes.retards}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-3 border border-slate-700 shadow-2xl">
        <p className="text-slate-400 text-xs font-semibold mb-2">Légende</p>
        <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
          <div className="w-3 h-3 rounded-full border-2 border-cyan-400" />
          <span>Place (état)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="w-4 h-3 rounded border border-slate-500 bg-slate-700" />
          <span>Transition (action)</span>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;