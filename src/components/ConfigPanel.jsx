import { useState } from 'react';

export function ConfigPanel({ initialConfig, bookTypes, onApply, onClose }) {
  const [stock, setStock] = useState(
    initialConfig?.stock ?? { p1: 5, p1b: 3, p1c: 4 }
  );
  const [nbEmpruntsInitial, setNbEmpruntsInitial] = useState(
    initialConfig?.nbEmpruntsInitial ?? 0
  );

  const totalStock = Object.values(stock).reduce((a, b) => a + (parseInt(b) || 0), 0);
  const empruntsInvalides = (parseInt(nbEmpruntsInitial) || 0) > totalStock;

  const handleStockChange = (id, value) => {
    setStock((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (empruntsInvalides) return;
    onApply({
      stock: {
        p1:  Math.max(0, parseInt(stock.p1) || 0),
        p1b: Math.max(0, parseInt(stock.p1b) || 0),
        p1c: Math.max(0, parseInt(stock.p1c) || 0),
      },
      nbEmpruntsInitial: Math.max(0, parseInt(nbEmpruntsInitial) || 0),
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-50
                   bg-slate-800/95 backdrop-blur-xl border-l border-slate-700
                   shadow-2xl overflow-y-auto"
        style={{ animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">⚙️ Configuration</h2>
              <p className="text-slate-400 text-xs mt-1">
                Stocks par type de livre
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-300
                         flex items-center justify-center transition-all hover:scale-110"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Stocks par type */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-300 text-sm font-semibold mb-3">📚 Stock par type</p>
              <div className="space-y-3">
                {bookTypes.map((bt) => (
                  <div key={bt.id} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: bt.color, boxShadow: `0 0 8px ${bt.color}` }}
                    />
                    <span className="text-slate-300 text-sm flex-1">{bt.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={stock[bt.id] ?? 0}
                      onChange={(e) => handleStockChange(bt.id, e.target.value)}
                      className="w-20 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600
                                 text-white text-sm font-semibold text-center
                                 focus:border-cyan-400 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs">
                <span className="text-slate-400">Total stock :</span>
                <span className="text-cyan-400 font-bold">{totalStock}</span>
              </div>
            </div>

            {/* Emprunts en attente */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <label className="text-slate-300 text-sm font-semibold flex items-center gap-2 mb-2">
                ⏳ Emprunts en attente (initiaux)
              </label>
              <input
                type="number"
                min="0"
                value={nbEmpruntsInitial}
                onChange={(e) => setNbEmpruntsInitial(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border
                           text-white text-lg font-semibold focus:ring-2 outline-none transition-all
                           ${empruntsInvalides
                             ? 'border-red-500 focus:border-red-400 focus:ring-red-400/30'
                             : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/30'
                           }`}
              />
              {empruntsInvalides && (
                <p className="text-red-400 text-xs mt-2">
                  ⚠️ Ne peut pas dépasser le stock total ({totalStock})
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-slate-700 text-slate-200
                         hover:bg-slate-600 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={empruntsInvalides}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all duration-300
                ${empruntsInvalides
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/40 hover:scale-[1.02]'
                }`}
            >
              ✅ Appliquer
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default ConfigPanel;