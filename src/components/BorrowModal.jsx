import { useState, useEffect, useRef } from 'react';

export function BorrowModal({ bookTypes, stockInfo, onConfirm, onClose }) {
  const [nom, setNom] = useState('');
  const [typeId, setTypeId] = useState(bookTypes[0]?.id || 'p1');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectedType = bookTypes.find((bt) => bt.id === typeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedNom = nom.trim();

    if (!trimmedNom) {
      setError('Veuillez saisir le nom de l’emprunteur');
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
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-xl p-4 md:p-5 border border-slate-700
                     shadow-2xl w-full max-w-md"
        >
          {/* En-tête */}
          <div className="flex items-start justify-between mb-4 md:mb-5">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white">Nouvel emprunt</h2>
              <p className="text-slate-400 text-[10px] md:text-xs mt-0.5">
                Informations de l’emprunteur
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300
                         flex items-center justify-center transition-colors text-xs md:text-sm"
            >
              ✕
            </button>
          </div>

          {/* Nom */}
          <div className="mb-3 md:mb-4">
            <label className="text-slate-300 text-xs md:text-sm font-medium mb-1 md:mb-1.5 block">
              Nom de l’emprunteur
            </label>
            <input
              ref={inputRef}
              type="text"
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                setError('');
              }}
              placeholder="Ex. : Jean Dupont"
              className="w-full px-3 md:px-3.5 py-2 md:py-2.5 rounded-lg bg-slate-900 border border-slate-600
                         text-white text-xs md:text-sm placeholder-slate-500
                         focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40
                         outline-none transition-colors"
              maxLength={40}
            />
          </div>

          {/* Type de livre */}
          <div className="mb-3 md:mb-4">
            <label className="text-slate-300 text-xs md:text-sm font-medium mb-1 md:mb-1.5 block">
              Type de livre
            </label>
            <div className="space-y-1 md:space-y-1.5">
              {bookTypes.map((bt) => {
                const stock = stockInfo.find((s) => s.id === bt.id);
                const dispo = (stock?.tokens || 0) > 0;
                const isSelected = typeId === bt.id;

                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => {
                      if (dispo) {
                        setTypeId(bt.id);
                        setError('');
                      }
                    }}
                    disabled={!dispo}
                    className={`w-full flex items-center justify-between px-2.5 md:px-3.5 py-2 md:py-2.5 rounded-lg border
                                text-left transition-colors duration-150
                      ${
                        !dispo
                          ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-900/40'
                          : isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                      }`}
                  >
                    <div className="flex items-center gap-2 md:gap-2.5">
                      <span
                        className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                        style={{ background: bt.color }}
                      />
                      <span className="text-white text-xs md:text-sm font-medium">{bt.label}</span>
                    </div>
                    <span
                      className={`text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md ${
                        dispo
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
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
            <div className="mb-3 md:mb-4 p-2 md:p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <p className="text-rose-400 text-[10px] md:text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Récap */}
          {nom.trim() && selectedType && (
            <div className="mb-3 md:mb-4 p-2 md:p-2.5 rounded-lg bg-slate-900/70 border border-slate-700">
              <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-wider mb-1">
                Récapitulatif
              </p>
              <p className="text-slate-300 text-xs md:text-sm">
                <span className="text-white font-medium">{nom.trim()}</span>
                {' '}souhaite emprunter{' '}
                <span style={{ color: selectedType.color }} className="font-medium">
                  {selectedType.label}
                </span>
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-2 mt-4 md:mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium bg-slate-700 text-slate-200
                         hover:bg-slate-600 border border-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!nom.trim()}
              className={`flex-1 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors
                ${
                  !nom.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-cyan-700 text-white hover:bg-cyan-600 border border-cyan-600'
                }`}
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BorrowModal;
