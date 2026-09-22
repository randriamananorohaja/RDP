import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PlaceNode } from './components/PlaceNode';
import { TransitionNode } from './components/TransitionNode';
import { Toolbar } from './components/Toolbar';
import { ConfigPanel } from './components/ConfigPanel';
import { BorrowModal } from './components/BorrowModal';
import { initialNodes, initialEdges } from './data/initialGraph';

const nodeTypes = {
  place: PlaceNode,
  transition: TransitionNode,
};

const CONSTRAINTS = {
  MAX_JETONS_PAR_PLACE: 30,
};

// 🕐 Timing
const STEP_DURATION_MS = 3000;   // 1 étape = 3 secondes
const RENDER_DELAY_MS = 5000;    // Délai avant rendu = 5 secondes

// 📚 Types de livres gérés par l'application
export const BOOK_TYPES = [
  { id: 'p1',  label: 'Babou',       color: '#10b981' },
  { id: 'p1b', label: 'Jésus',       color: '#ef4444' },
  { id: 'p1c', label: 'Le Roi Lion', color: '#3b82f6' },
];

// 🎯 Configuration par défaut
const DEFAULT_CONFIG = {
  stock: {
    p1:  5, // Babou
    p1b: 3, // Jésus
    p1c: 4, // Le Roi Lion
  },
  nbEmpruntsInitial: 0,
};

export default function App() {
  // ─────────────────────────────────────────────
  // 🔧 State principal
  // ─────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((n) => {
      const data = { ...n.data };
      if (DEFAULT_CONFIG.stock[n.id] !== undefined) data.tokens = DEFAULT_CONFIG.stock[n.id];
      if (n.id === 'p2') data.tokens = DEFAULT_CONFIG.nbEmpruntsInitial;
      return { ...n, data };
    })
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    empruntsReussis: 0,
    refusStock: 0,
    retoursTraites: 0,
    retards: 0,
  });

  // 🕒 Emprunts en cours (pour le délai de rendu et l'affichage bonus)
  const activeLoansRef = useRef([]); // [{ loanId, typeId, label, borrowerName, startedAt }]
  const [activeLoans, setActiveLoans] = useState([]);

  // 📋 Demandes en attente avec infos utilisateur
  const pendingBorrowsRef = useRef([]); // [{ nom, typeId, typeLabel, color }]

  // 🔄 Force re-render toutes les secondes pour les comptes à rebours
  const [, forceUpdate] = useState(0);

  const intervalRef = useRef(null);
  const configRef = useRef(config);

  useEffect(() => { configRef.current = config; }, [config]);

  // ⏱️ Force re-render 1×/s quand il y a des emprunts en cours
  useEffect(() => {
    if (activeLoans.length === 0) return;
    const t = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [activeLoans.length]);

  // ─────────────────────────────────────────────
  // 📝 Log
  // ─────────────────────────────────────────────
  const addLog = useCallback((type, message) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setLogs((prev) =>
      [{ id: Date.now() + Math.random(), type, message, timestamp }, ...prev].slice(0, 40)
    );
  }, []);

  // ─────────────────────────────────────────────
  // 🔴 Arrêt d'urgence
  // ─────────────────────────────────────────────
  const stopSimulation = useCallback((reason) => {
    setRunning(false);
    setStopped(true);
    clearInterval(intervalRef.current);
    addLog('error', `🛑 SIMULATION ARRÊTÉE : ${reason}`);
  }, [addLog]);

  // ─────────────────────────────────────────────
  // ➕ Ouvrir le formulaire d'emprunt
  // ─────────────────────────────────────────────
  const handleOpenBorrowModal = useCallback(() => {
    setShowBorrowModal(true);
  }, []);

  // ─────────────────────────────────────────────
  // ✅ Confirmer un emprunt depuis la modale
  // ─────────────────────────────────────────────
  const handleConfirmBorrow = useCallback((borrowInfo) => {
    // Ajouter 1 jeton à la place "Demandes en attente"
    setNodes((current) =>
      current.map((n) =>
        n.id === 'p2'
          ? { ...n, data: { ...n.data, tokens: n.data.tokens + 1 } }
          : n
      )
    );

    // Stocker les infos de la demande dans la file
    pendingBorrowsRef.current.push(borrowInfo);

    addLog(
      'info',
      `➕ Emprunt demandé par "${borrowInfo.nom}" pour « ${borrowInfo.typeLabel} »`
    );
    setShowBorrowModal(false);
  }, [setNodes, addLog]);

  // ─────────────────────────────────────────────
  // 💾 Appliquer la configuration
  // ─────────────────────────────────────────────
  const handleApplyConfig = useCallback((newCfg) => {
    setConfig(newCfg);
    configRef.current = newCfg;

    setNodes((current) =>
      current.map((n) => {
        const data = { ...n.data };
        if (newCfg.stock[n.id] !== undefined) data.tokens = newCfg.stock[n.id];
        if (n.id === 'p2') data.tokens = 0;
        if (n.id === 'p3') data.tokens = 0;
        if (n.id === 'p4') data.tokens = 0;
        if (n.id === 'p5') data.tokens = 0;
        if (n.id === 'p6') data.tokens = 0;
        return { ...n, data };
      })
    );

    activeLoansRef.current = [];
    pendingBorrowsRef.current = [];
    setActiveLoans([]);
    setStats({ empruntsReussis: 0, refusStock: 0, retoursTraites: 0, retards: 0 });
    setRunning(false);
    setStopped(false);
    setLogs([]);
    setShowConfig(false);
    addLog('success', `✅ Configuration appliquée`);
  }, [setNodes, addLog]);
const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  // ─────────────────────────────────────────────
  // 🔥 Une étape de simulation
  // ─────────────────────────────────────────────
  const simulateStep = useCallback(() => {
  const now = Date.now();
  const cfg = configRef.current;
  const currentNodes = nodesRef.current;

  // Copie profonde du marquage
  const newNodes = currentNodes.map((n) => ({
    ...n,
    data: { ...n.data },
  }));

  const getPlace = (id) => newNodes.find((n) => n.id === id);

  const stocks = {
    p1:  getPlace('p1'),
    p1b: getPlace('p1b'),
    p1c: getPlace('p1c'),
  };
  const p2 = getPlace('p2');
  const p3 = getPlace('p3');
  const p4 = getPlace('p4');
  const p5 = getPlace('p5');
  const p6 = getPlace('p6');

  const logsToAdd = [];
  let stoppedReason = null;

  // ─────────────────────────────────────────────
  // ⏱️ TIR DE t2 : transition temporisée (délai 5s)
  // Condition d’activation : p3 ≥ 1 et âge du jeton ≥ 5s
  // ─────────────────────────────────────────────
  const stillActive = [];
  for (const loan of activeLoansRef.current) {
    const elapsed = now - loan.startedAt;

    if (elapsed >= RENDER_DELAY_MS) {
      // === TIR DE t2 ===
      // 1. Consommer 1 jeton de p3 (fait via la liste)
      // 2. Produire 1 jeton dans p6 (livre rendu)
      if (p6) p6.data.tokens += 1;

      // 3. Remettre le livre dans son stock d’origine (conservation des ressources)
      const stock = stocks[loan.typeId];
      if (stock) stock.data.tokens += 1;

      setStats((s) => ({ ...s, retoursTraites: s.retoursTraites + 1 }));
      logsToAdd.push([
        'success',
        `✅ t2 tirée : "${loan.borrowerName}" a rendu « ${loan.label} » → stock restauré`,
      ]);

      // Branche probabiliste vers p4 (retard) – extension acceptable
      if (Math.random() < 0.3 && p4) {
        p4.data.tokens += 1;
        logsToAdd.push(['warn', `⏰ Retard détecté → jeton produit dans p4`]);
      }
    } else {
      stillActive.push(loan);
    }
  }
  activeLoansRef.current = stillActive;
  if (p3) p3.data.tokens = stillActive.length; // synchronisation du marquage

  // ─────────────────────────────────────────────
  // 🔍 TIR DE t1 : Vérifier & Enregistrer
  // Condition d’activation :
  //   p2 ≥ 1  ET  (p1 ≥ 1 OU p1b ≥ 1 OU p1c ≥ 1)
  // ─────────────────────────────────────────────
  if (p2 && p2.data.tokens > 0) {
    const pendingBorrow = pendingBorrowsRef.current.shift();

    if (!pendingBorrow) {
      // Désynchronisation → on corrige le marquage
      p2.data.tokens = 0;
    } else {
      // Recherche d’un stock disponible (garde colorée)
      let chosen = null;
      if (pendingBorrow.typeId && stocks[pendingBorrow.typeId]?.data.tokens > 0) {
        chosen = BOOK_TYPES.find((bt) => bt.id === pendingBorrow.typeId);
      } else {
        // Si le type demandé est épuisé, on peut choisir un autre (politique)
        const disponibles = BOOK_TYPES.filter((bt) => stocks[bt.id]?.data.tokens > 0);
        if (disponibles.length > 0) {
          chosen = disponibles[Math.floor(Math.random() * disponibles.length)];
        }
      }

      if (!chosen) {
        // Transition non activable → refus
        setStats((s) => ({ ...s, refusStock: s.refusStock + 1 }));
        logsToAdd.push([
          'error',
          `❌ t1 non activable : aucun stock pour "${pendingBorrow.nom}" (« ${pendingBorrow.typeLabel} »)`,
        ]);
        p2.data.tokens -= 1; // on retire la demande (ou on la laisse selon la politique)
      } else {
        // === TIR DE t1 ===
        // Consommation
        p2.data.tokens -= 1;
        stocks[chosen.id].data.tokens -= 1;

        // Production
        const newLoan = {
          loanId: Date.now() + Math.random(),
          typeId: chosen.id,
          label: chosen.label,
          borrowerName: pendingBorrow.nom,
          startedAt: now,
        };
        activeLoansRef.current.push(newLoan);
        if (p3) p3.data.tokens = activeLoansRef.current.length;

        setStats((s) => ({ ...s, empruntsReussis: s.empruntsReussis + 1 }));
        logsToAdd.push([
          'success',
          `📝 t1 tirée : "${pendingBorrow.nom}" → « ${chosen.label} » (stock restant : ${stocks[chosen.id].data.tokens})`,
        ]);
        logsToAdd.push(['info', `⏱️ Jeton placé dans p3 – rendu prévu dans 5s`]);
      }
    }
  }

  // ─────────────────────────────────────────────
  // ⚠️ TIR DE t3 : Pénalité
  // Condition : p4 ≥ 1
  // ─────────────────────────────────────────────
  if (p4 && p5 && p4.data.tokens > 0) {
    p4.data.tokens -= 1;
    p5.data.tokens += 1;
    setStats((s) => ({ ...s, retards: s.retards + 1 }));
    logsToAdd.push(['warn', `⚠️ t3 tirée → amende (total : ${p5.data.tokens})`]);
  }

  // ─────────────────────────────────────────────
  // Condition de terminaison (marquage final)
  // ─────────────────────────────────────────────
  const totalDemandes = p2?.data.tokens || 0;
  const totalActifs   = activeLoansRef.current.length;
  const totalRetards  = p4?.data.tokens || 0;

  if (totalDemandes === 0 && totalActifs === 0 && totalRetards === 0) {
    const stockTotal = BOOK_TYPES.reduce((sum, bt) => sum + (stocks[bt.id]?.data.tokens || 0), 0);
    const stockInitial = Object.values(cfg.stock).reduce((a, b) => a + b, 0);
    if (stockTotal === stockInitial) {
      stoppedReason = 'Simulation terminée : tous les livres sont revenus en rayon ✓';
    }
  }

  // Application atomique du nouveau marquage
  setNodes(newNodes);
  setActiveLoans([...activeLoansRef.current]);
  logsToAdd.forEach(([type, msg]) => addLog(type, msg));

  if (stoppedReason) {
    stopSimulation(stoppedReason);
  }
}, [setNodes, addLog, stopSimulation]);

  // ─────────────────────────────────────────────
  // ⏱️ Intervalle : 1 étape toutes les 3 secondes
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (running && !stopped) {
      intervalRef.current = setInterval(simulateStep, STEP_DURATION_MS);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, stopped, simulateStep]);

  // ─────────────────────────────────────────────
  // 🔄 Reset
  // ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setRunning(false);
    setStopped(false);
    setLogs([]);
    activeLoansRef.current = [];
    pendingBorrowsRef.current = [];
    setActiveLoans([]);
    setStats({ empruntsReussis: 0, refusStock: 0, retoursTraites: 0, retards: 0 });
    setNodes(
      initialNodes.map((n) => {
        const data = { ...n.data };
        if (config.stock[n.id] !== undefined) data.tokens = config.stock[n.id];
        if (n.id === 'p2') data.tokens = 0;
        return { ...n, data };
      })
    );
    setEdges(initialEdges.map((e) => ({ ...e })));
    addLog('info', '🔄 Simulation réinitialisée');
  }, [setNodes, setEdges, config, addLog]);

  // ─────────────────────────────────────────────
  // 📊 Mémoïsations
  // ─────────────────────────────────────────────
  const totalTokens = useMemo(
    () => nodes.filter((n) => n.type === 'place').reduce((sum, n) => sum + (n.data.tokens || 0), 0),
    [nodes]
  );

  const stockInfo = useMemo(() => {
    return BOOK_TYPES.map((bt) => {
      const node = nodes.find((n) => n.id === bt.id);
      return { ...bt, tokens: node?.data.tokens || 0 };
    });
  }, [nodes]);

  const logColors = {
    success: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    error: 'text-red-400 border-red-500/40 bg-red-500/10',
    warn: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
    info: 'text-slate-300 border-slate-600/40 bg-slate-700/20',
  };

  // ─────────────────────────────────────────────
  // 🎨 Rendu
  // ─────────────────────────────────────────────
  return (
    <div className="w-screen h-screen relative bg-slate-950">
      {/* ✅ Graphe en premier */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds))}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#334155" />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={(n) => n.data?.color || '#38bdf8'}
          maskColor="rgba(15, 23, 42, 0.8)"
          position="bottom-left"
        />
      </ReactFlow>

      {/* Toolbar principale */}
      <Toolbar
        onSimulate={() => setRunning((r) => !r)}
        onReset={handleReset}
        onReconfigure={() => setShowConfig(true)}
        onAddEmprunt={handleOpenBorrowModal}
        running={running}
        stopped={stopped}
        tokens={totalTokens}
        contraintes={stats}
        stockInfo={stockInfo}
        enAttente={nodes.find((n) => n.id === 'p2')?.data.tokens || 0}
        empruntsEnCours={activeLoans.length}
        stepDuration={STEP_DURATION_MS / 1000}
        renderDelay={RENDER_DELAY_MS / 1000}
      />

      {/* 📡 Journal temps réel */}
      <div className="absolute top-4 right-4 z-10 w-[360px] max-h-[60vh] flex flex-col
                      bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            📡 Journal Temps Réel
          </h2>
          <span className="text-xs text-slate-400">{logs.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {logs.length === 0 && (
            <p className="text-slate-500 text-xs text-center py-6">
              Aucun événement — lancez la simulation
            </p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className={`text-xs px-3 py-2 rounded-lg border transition-all duration-300
                         ${logColors[log.type] || logColors.info}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold uppercase text-[10px] opacity-70">{log.type}</span>
                <span className="text-[10px] opacity-60">{log.timestamp}</span>
              </div>
              <div className="leading-snug">{log.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 📚 BONUS : Emprunts en cours avec compte à rebours */}
      {activeLoans.length > 0 && (
        <div className="absolute bottom-24 right-4 z-10 w-[360px] max-h-[280px] flex flex-col
                        bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-bold text-xs flex items-center gap-2">
              📚 Emprunts en cours
            </h3>
            <span className="text-xs font-bold text-orange-400">
              {activeLoans.length}
            </span>
          </div>
          <div className="p-2 space-y-1.5 max-h-[220px] overflow-y-auto">
            {activeLoans.map((loan) => {
              const elapsed = Math.floor((Date.now() - loan.startedAt) / 1000);
              const remaining = Math.max(0, RENDER_DELAY_MS / 1000 - elapsed);
              const progress = Math.min(100, (elapsed / (RENDER_DELAY_MS / 1000)) * 100);
              const bookType = BOOK_TYPES.find((bt) => bt.id === loan.typeId);

              return (
                <div
                  key={loan.loanId}
                  className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-xs"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-300 font-semibold truncate">
                      👤 {loan.borrowerName}
                    </span>
                    <span
                      className="font-bold flex-shrink-0 ml-2"
                      style={{ color: bookType?.color }}
                    >
                      {loan.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: bookType?.color,
                          boxShadow: `0 0 6px ${bookType?.color}`,
                        }}
                      />
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] w-8 text-right">
                      {remaining}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ⚙️ Panneau de configuration escamotable */}
      {showConfig && (
        <ConfigPanel
          initialConfig={config}
          bookTypes={BOOK_TYPES}
          onApply={handleApplyConfig}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* 📝 Modale d'emprunt */}
      {showBorrowModal && (
        <BorrowModal
          bookTypes={BOOK_TYPES}
          stockInfo={stockInfo}
          onConfirm={handleConfirmBorrow}
          onClose={() => setShowBorrowModal(false)}
        />
      )}

      {/* Barre inférieure */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-800/80 backdrop-blur-lg px-5 py-2 rounded-full border border-slate-700 shadow-2xl flex items-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Étape : {STEP_DURATION_MS / 1000}s
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Rendu : {RENDER_DELAY_MS / 1000}s
          </span>
          <span className="text-slate-600">|</span>
          <span>Molette = Zoom</span>
        </div>
      </div>
    </div>
  );
}