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
        p1: Math.max(0, parseInt(stock.p1) || 0),
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
        className="fixed top-0 right-0 h-full w-full max-w-sm z-50
                   bg-slate-800 border-l border-slate-700
                   shadow-2xl overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Configuration</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Stocks initiaux par type
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300
                         flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Stocks */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-300 text-sm font-medium mb-3">Stock par type</p>
              <div className="space-y-2.5">
                {bookTypes.map((bt) => (
                  <div key={bt.id} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: bt.color }}
                    />
                    <span className="text-slate-300 text-sm flex-1">{bt.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={stock[bt.id] ?? 0}
                      onChange={(e) => handleStockChange(bt.id, e.target.value)}
                      className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600
                                 text-white text-sm font-medium text-center tabular-nums
                                 focus:border-cyan-500 outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700 flex justify-between text-xs">
                <span className="text-slate-500">Total stock</span>
                <span className="text-cyan-400 font-semibold tabular-nums">{totalStock}</span>
              </div>
            </div>

            {/* Emprunts initiaux */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
              <label className="text-slate-300 text-sm font-medium block mb-2">
                Emprunts en attente (initiaux)
              </label>
              <input
                type="number"
                min="0"
                value={nbEmpruntsInitial}
                onChange={(e) => setNbEmpruntsInitial(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border
                           text-white text-base font-medium tabular-nums
                           focus:ring-1 outline-none transition-colors
                           ${
                             empruntsInvalides
                               ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/30'
                               : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/30'
                           }`}
              />
              {empruntsInvalides && (
                <p className="text-rose-400 text-xs mt-2">
                  Ne peut pas dépasser le stock total ({totalStock})
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-200
                         hover:bg-slate-600 border border-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={empruntsInvalides}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  empruntsInvalides
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-cyan-700 text-white hover:bg-cyan-600 border border-cyan-600'
                }`}
            >
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ConfigPanel;
