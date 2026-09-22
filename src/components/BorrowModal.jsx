import { useState, useEffect, useRef } from 'react';

export function BorrowModal({ bookTypes, stockInfo, onConfirm, onClose }) {
  const [nom, setNom] = useState('');
  const [typeId, setTypeId] = useState(bookTypes[0]?.id || 'p1');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus automatique sur le champ nom
    setTimeout(() => inputRef.current?.focus(), 100);

    // Fermeture avec Échap
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectedType = bookTypes.find((bt) => bt.id === typeId);
  const selectedStock = stockInfo.find((bt) => bt.id === typeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedNom = nom.trim();

    if (!trimmedNom) {
      setError('Veuillez saisir votre nom');
      return;
    }
    if (!typeId) {
      setError('Veuillez choisir un type de livre');
      return;
    }

    onConfirm({
      nom: trimmedNom,
      typeId,
      typeLabel: selectedType.label,
      color: selectedType.color,
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.25s ease-out' }}
      >
        {/* Modale */}
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-700
                     shadow-2xl w-full max-w-md"
          style={{ animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📝 Nouvel Emprunt
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Remplissez les informations de l'emprunteur
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

          {/* Champ Nom */}
          <div className="mb-4">
            <label className="text-slate-300 text-sm font-semibold flex items-center gap-2 mb-2">
              👤 Nom de l'emprunteur
            </label>
            <input
              ref={inputRef}
              type="text"
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                setError('');
              }}
              placeholder="Ex : Jean Dupont"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-600
                         text-white text-base placeholder-slate-500
                         focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30
                         outline-none transition-all"
              maxLength={40}
            />
          </div>

          {/* Choix du type de livre */}
          <div className="mb-4">
            <label className="text-slate-300 text-sm font-semibold flex items-center gap-2 mb-2">
              📚 Type de livre
            </label>
            <div className="space-y-2">
              {bookTypes.map((bt) => {
                const stock = stockInfo.find((s) => s.id === bt.id);
                const dispo = (stock?.tokens || 0) > 0;
                const isSelected = typeId === bt.id;

                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => {
                      setTypeId(bt.id);
                      setError('');
                    }}
                    disabled={!dispo}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border
                                transition-all duration-200 text-left
                      ${!dispo
                        ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-900/40'
                        : isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20 scale-[1.01]'
                          : 'border-slate-600 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900/80'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          background: bt.color,
                          boxShadow: `0 0 8px ${bt.color}`,
                        }}
                      />
                      <span className="text-white font-semibold text-sm">{bt.label}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        dispo
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {dispo ? `${stock?.tokens} dispo` : 'Épuisé'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40">
              <p className="text-red-400 text-xs font-semibold flex items-center gap-2">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Récap */}
          {nom.trim() && selectedType && (
            <div className="mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-700">
              <p className="text-slate-400 text-[10px] uppercase font-semibold mb-1">Récapitulatif</p>
              <p className="text-slate-300 text-sm">
                <span className="text-white font-semibold">{nom.trim()}</span> souhaite emprunter{' '}
                <span style={{ color: selectedType.color }} className="font-semibold">
                  « {selectedType.label} »
                </span>
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-2 mt-5">
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
              disabled={!nom.trim()}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all duration-300
                ${!nom.trim()
                  ? 'bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/40 hover:scale-[1.02]'
                }`}
            >
              ✅ Confirmer
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

export default BorrowModal;