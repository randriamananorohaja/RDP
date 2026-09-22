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

// Timing
const STEP_DURATION_MS = 3000;
const RENDER_DELAY_MS = 20000;

export const BOOK_TYPES = [
  { id: 'p1', label: 'Babou', color: '#10b981' },
  { id: 'p1b', label: 'Jésus', color: '#ef4444' },
  { id: 'p1c', label: 'Le Roi Lion', color: '#3b82f6' },
];

const DEFAULT_CONFIG = {
  stock: {
    p1: 5,
    p1b: 3,
    p1c: 4,
  },
  nbEmpruntsInitial: 0,
};

export default function App() {
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

  const activeLoansRef = useRef([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const pendingReturnsRef = useRef([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const pendingBorrowsRef = useRef([]);
  const [, forceUpdate] = useState(0);
  const intervalRef = useRef(null);
  const configRef = useRef(config);
  const nodesRef = useRef(nodes);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    if (activeLoans.length === 0 && pendingReturns.length === 0) return;
    const t = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [activeLoans.length, pendingReturns.length]);

  const addLog = useCallback((type, message) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setLogs((prev) =>
      [{ id: Date.now() + Math.random(), type, message, timestamp }, ...prev].slice(0, 40)
    );
  }, []);

  const stopSimulation = useCallback(
    (reason) => {
      setRunning(false);
      setStopped(true);
      clearInterval(intervalRef.current);
      addLog('error', `SIMULATION ARRÊTÉE : ${reason}`);
    },
    [addLog]
  );

  const handleOpenBorrowModal = useCallback(() => {
    setShowBorrowModal(true);
  }, []);

  const handleConfirmBorrow = useCallback(
    (borrowInfo) => {
      setNodes((current) =>
        current.map((n) =>
          n.id === 'p2'
            ? { ...n, data: { ...n.data, tokens: n.data.tokens + 1 } }
            : n
        )
      );
      pendingBorrowsRef.current.push(borrowInfo);
      addLog('info', `Emprunt demandé par « ${borrowInfo.nom} » pour « ${borrowInfo.typeLabel} »`);
      setShowBorrowModal(false);
    },
    [setNodes, addLog]
  );

  const handleApplyConfig = useCallback(
    (newCfg) => {
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
      pendingReturnsRef.current = [];
      setActiveLoans([]);
      setPendingReturns([]);
      setStats({ empruntsReussis: 0, refusStock: 0, retoursTraites: 0, retards: 0 });
      setRunning(false);
      setStopped(false);
      setLogs([]);
      setShowConfig(false);
      addLog('success', 'Configuration appliquée');
    },
    [setNodes, addLog]
  );

  // ─────────────────────────────────────────────
  // Une étape de simulation (conforme RdP + extension temporisée)
  // ─────────────────────────────────────────────
  const simulateStep = useCallback(() => {
    const now = Date.now();
    const cfg = configRef.current;
    const currentNodes = nodesRef.current;

    const newNodes = currentNodes.map((n) => ({
      ...n,
      data: { ...n.data },
    }));

    const getPlace = (id) => newNodes.find((n) => n.id === id);

    const stocks = {
      p1: getPlace('p1'),
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

    // ── Tir de t2 (transition temporisée) ──
    // Après 20s: déplacer vers p4 (Rendu en attente) sans rendre
    const stillActive = [];
    for (const loan of activeLoansRef.current) {
      const elapsed = now - loan.startedAt;

      if (elapsed >= RENDER_DELAY_MS) {
        // Déplacer vers rendu en attente (p4)
        if (p4) p4.data.tokens += 1;
        pendingReturnsRef.current.push(loan);
        logsToAdd.push([
          'warn',
          `« ${loan.borrowerName} » a dépassé le délai de 20s → placé en attente de rendu (p4)`,
        ]);
      } else {
        stillActive.push(loan);
      }
    }
    activeLoansRef.current = stillActive;
    if (p3) p3.data.tokens = stillActive.length;

    // ── Tir de t1 ──
    // Condition : p2 ≥ 1 et stock du type demandé ≥ 1
    // Si le type demandé est épuisé → refus + ARRÊT de la simulation (contrainte)
    if (p2 && p2.data.tokens > 0) {
      const pendingBorrow = pendingBorrowsRef.current.shift();

      if (!pendingBorrow) {
        p2.data.tokens = 0;
      } else {
        const requestedStock = stocks[pendingBorrow.typeId];
        const hasRequestedStock = requestedStock && requestedStock.data.tokens > 0;

        if (!hasRequestedStock) {
          // Stock insuffisant : la demande reste en attente dans p2
          // On remet la demande à la fin de la file d'attente
          pendingBorrowsRef.current.push(pendingBorrow);
          setStats((s) => ({ ...s, refusStock: s.refusStock + 1 }));
          logsToAdd.push([
            'warn',
            `Stock insuffisant pour « ${pendingBorrow.typeLabel} ». La demande de « ${pendingBorrow.nom} » reste en attente.`,
          ]);
        } else {
          // Tir atomique de t1
          const chosen = BOOK_TYPES.find((bt) => bt.id === pendingBorrow.typeId);
          p2.data.tokens -= 1;
          requestedStock.data.tokens -= 1;

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
            `t1 tirée : « ${pendingBorrow.nom} » → « ${chosen.label} » (stock restant : ${requestedStock.data.tokens})`,
          ]);
          logsToAdd.push(['info', `Jeton placé dans p3 – rendu prévu dans ${RENDER_DELAY_MS / 1000} s`]);
        }
      }
    }

    // ── Tir de t3 ──
    // SUPPRIMÉ : t3 est maintenant tirée uniquement manuellement via handleManualReturn
    // quand l'utilisateur clique sur "Rendre" depuis la liste d'attente (p4)

    // Condition de terminaison
    // SUPPRIMÉ : La simulation ne s'arrête plus automatiquement quand tous les livres sont rendus
    // L'utilisateur peut continuer à ajouter de nouveaux emprunts

    setNodes(newNodes);
    setActiveLoans([...activeLoansRef.current]);
    setPendingReturns([...pendingReturnsRef.current]);
    logsToAdd.forEach(([type, msg]) => addLog(type, msg));

    if (stoppedReason) {
      stopSimulation(stoppedReason);
    }
  }, [setNodes, addLog, stopSimulation]);

  useEffect(() => {
    if (running && !stopped) {
      intervalRef.current = setInterval(simulateStep, STEP_DURATION_MS);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, stopped, simulateStep]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setStopped(false);
    setLogs([]);
    activeLoansRef.current = [];
    pendingBorrowsRef.current = [];
    pendingReturnsRef.current = [];
    setActiveLoans([]);
    setPendingReturns([]);
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
    addLog('info', 'Simulation réinitialisée');
  }, [setNodes, setEdges, config, addLog]);

  // ─────────────────────────────────────────────
  // Rendu manuel d'un emprunt (bouton utilisateur)
  // Détermine automatiquement si c'est un retard (>20s) ou non
  // ─────────────────────────────────────────────
  const handleManualReturn = useCallback(
    (loanId) => {
      // Chercher dans les deux listes
      const loan = activeLoansRef.current.find((l) => l.loanId === loanId) ||
                   pendingReturnsRef.current.find((l) => l.loanId === loanId);
      if (!loan) return;

      const elapsed = Date.now() - loan.startedAt;
      const isLate = elapsed >= RENDER_DELAY_MS;
      const fromPending = pendingReturnsRef.current.some((l) => l.loanId === loanId);

      setNodes((current) => {
        const newNodes = current.map((n) => ({ ...n, data: { ...n.data } }));
        const getPlace = (id) => newNodes.find((n) => n.id === id);

        const stock = getPlace(loan.typeId);
        const p3 = getPlace('p3');
        const p4 = getPlace('p4');
        const p5 = getPlace('p5');
        const p6 = getPlace('p6');

        if (isLate) {
          // Rendu avec retard → pénalité (t3)
          if (p4) p4.data.tokens -= 1;
          if (p5) p5.data.tokens += 1;
          
          // Remise en stock + production p6
          if (stock) stock.data.tokens += 1;
          if (p6) p6.data.tokens += 1;

          // Retirer de la liste appropriée
          if (fromPending) {
            pendingReturnsRef.current = pendingReturnsRef.current.filter((l) => l.loanId !== loanId);
          } else {
            activeLoansRef.current = activeLoansRef.current.filter((l) => l.loanId !== loanId);
            if (p3) p3.data.tokens = activeLoansRef.current.length;
          }

          setStats((s) => ({
            ...s,
            retoursTraites: s.retoursTraites + 1,
            retards: s.retards + 1,
          }));
          addLog(
            'warn',
            `Rendu avec pénalité : « ${loan.borrowerName} » a rendu « ${loan.label} » (amende appliquée)`
          );
        } else {
          // Rendu normal (avant 20s)
          // Remise en stock + production p6
          if (stock) stock.data.tokens += 1;
          if (p6) p6.data.tokens += 1;

          // Retirer de la liste des emprunts actifs
          activeLoansRef.current = activeLoansRef.current.filter((l) => l.loanId !== loanId);
          if (p3) p3.data.tokens = activeLoansRef.current.length;

          setStats((s) => ({ ...s, retoursTraites: s.retoursTraites + 1 }));
          addLog(
            'success',
            `Rendu normal : « ${loan.borrowerName} » a rendu « ${loan.label} » → stock restauré`
          );
        }

        return newNodes;
      });

      setActiveLoans([...activeLoansRef.current]);
      setPendingReturns([...pendingReturnsRef.current]);
    },
    [setNodes, addLog]
  );

  const totalTokens = useMemo(
    () =>
      nodes
        .filter((n) => n.type === 'place')
        .reduce((sum, n) => sum + (n.data.tokens || 0), 0),
    [nodes]
  );

  const stockInfo = useMemo(() => {
    return BOOK_TYPES.map((bt) => {
      const node = nodes.find((n) => n.id === bt.id);
      return { ...bt, tokens: node?.data.tokens || 0 };
    });
  }, [nodes]);

  const logColors = {
    success: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30',
    error: 'text-rose-400 border-rose-800/50 bg-rose-950/30',
    warn: 'text-amber-400 border-amber-800/50 bg-amber-950/30',
    info: 'text-slate-300 border-slate-700/50 bg-slate-800/40',
  };

  return (
    <div className="w-screen h-screen relative bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds))}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 1.5 } }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
        <Controls position="bottom-right" className="!bottom-16 md:!bottom-4" />
        <MiniMap
          nodeColor={(n) => n.data?.color || '#64748b'}
          maskColor="rgba(15, 23, 42, 0.85)"
          position="bottom-left"
          className="!bottom-16 md:!bottom-4"
        />
      </ReactFlow>

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

      {/* Journal */}
      <div
        className="absolute top-4 right-2 md:right-4 z-10 w-[calc(100vw-16px)] md:w-[340px] max-h-[40vh] md:max-h-[55vh] flex flex-col
                      bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden"
      >
        <div className="px-3 md:px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-medium text-[10px] md:text-xs">Journal</h2>
          <span className="text-[9px] md:text-xs text-slate-500 tabular-nums">{logs.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 md:p-2 space-y-1">
          {logs.length === 0 && (
            <p className="text-slate-500 text-[9px] md:text-xs text-center py-6 md:py-8">
              Aucun événement — lancez la simulation
            </p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className={`text-[9px] md:text-xs px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-lg border ${logColors[log.type] || logColors.info}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium uppercase text-[9px] md:text-[10px] opacity-70">{log.type}</span>
                <span className="text-[9px] md:text-[10px] opacity-50 tabular-nums">{log.timestamp}</span>
              </div>
              <div className="leading-snug text-[9px] md:text-xs">{log.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Emprunts en cours et rendus en attente - tableau unique */}
      {(activeLoans.length > 0 || pendingReturns.length > 0) && (
        <div
          className="absolute bottom-16 md:bottom-20 right-2 md:right-4 z-10 w-[calc(100vw-16px)] md:w-[420px] max-h-[40vh] md:max-h-[350px] flex flex-col
                        bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden"
        >
          <div className="px-3 md:px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-medium text-[10px] md:text-xs">Emprunts</h3>
            <span className="text-[10px] md:text-xs font-medium text-amber-400 tabular-nums">
              {activeLoans.length + pendingReturns.length}
            </span>
          </div>
          <div className="p-1.5 md:p-2 max-h-[35vh] md:max-h-[300px] overflow-y-auto">
            <table className="w-full text-[10px] md:text-xs">
              <thead>
                <tr className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-wider border-b border-slate-700/50">
                  <th className="text-left py-1 px-1.5 md:py-1.5 md:px-2">Emprunteur</th>
                  <th className="text-left py-1 px-1.5 md:py-1.5 md:px-2">Livre</th>
                  <th className="text-center py-1 px-1.5 md:py-1.5 md:px-2">Durée</th>
                  <th className="text-center py-1 px-1.5 md:py-1.5 md:px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...activeLoans, ...pendingReturns].map((loan) => {
                  const elapsed = Math.floor((Date.now() - loan.startedAt) / 1000);
                  const isLate = elapsed >= (RENDER_DELAY_MS / 1000);
                  const bookType = BOOK_TYPES.find((bt) => bt.id === loan.typeId);

                  return (
                    <tr
                      key={loan.loanId}
                      className="border-b border-slate-700/30 hover:bg-slate-700/30"
                    >
                      <td className="py-1.5 md:py-2 px-1.5 md:px-2 text-slate-300 font-medium truncate max-w-[60px] md:max-w-[100px]">
                        {loan.borrowerName}
                      </td>
                      <td className="py-1.5 md:py-2 px-1.5 md:px-2">
                        <span
                          className="font-medium text-[9px] md:text-xs"
                          style={{ color: bookType?.color }}
                        >
                          {loan.label}
                        </span>
                      </td>
                      <td className="py-1.5 md:py-2 px-1.5 md:px-2 text-center font-mono">
                        <span className={isLate ? 'text-amber-400' : 'text-slate-400'}>
                          {isLate ? `+${elapsed - (RENDER_DELAY_MS / 1000)}s` : `${elapsed}s`}
                        </span>
                      </td>
                      <td className="py-1.5 md:py-2 px-1.5 md:px-2">
                        <div className="flex gap-0.5 md:gap-1 justify-center">
                          <button
                            onClick={() => handleManualReturn(loan.loanId)}
                            className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-[10px] font-medium
                                       bg-emerald-800/60 text-emerald-300 border border-emerald-700/50
                                       hover:bg-emerald-700/70 transition-colors"
                            title="Rendre le livre"
                          >
                            Rendre
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfig && (
        <ConfigPanel
          initialConfig={config}
          bookTypes={BOOK_TYPES}
          onApply={handleApplyConfig}
          onClose={() => setShowConfig(false)}
        />
      )}

      {showBorrowModal && (
        <BorrowModal
          bookTypes={BOOK_TYPES}
          stockInfo={stockInfo}
          onConfirm={handleConfirmBorrow}
          onClose={() => setShowBorrowModal(false)}
        />
      )}

      {/* Barre inférieure */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-800/90 backdrop-blur-md px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-slate-700 shadow-lg flex items-center gap-2 md:gap-3 text-[9px] md:text-[11px] text-slate-400">
          <span>Étape : {STEP_DURATION_MS / 1000}s</span>
          <span className="text-slate-600">|</span>
          <span>Rendu : {RENDER_DELAY_MS / 1000}s</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">Molette = Zoom</span>
        </div>
      </div>
    </div>
  );
}