import { MarkerType } from '@xyflow/react';

export const initialNodes = [
  // ===== GAUCHE : Stocks par type de livre =====
  {
    id: 'p1',
    type: 'place',
    position: { x: 60, y: 40 },
    data: { label: '📗 Babou', tokens: 0, color: '#10b981' },
  },
  {
    id: 'p1b',
    type: 'place',
    position: { x: 60, y: 220 },
    data: { label: '📕 Jésus', tokens: 0, color: '#ef4444' },
  },
  {
    id: 'p1c',
    type: 'place',
    position: { x: 60, y: 400 },
    data: { label: '📘 Le Roi Lion', tokens: 0, color: '#3b82f6' },
  },
  {
    id: 'p2',
    type: 'place',
    position: { x: 60, y: 580 },
    data: { label: 'Demandes en attente', tokens: 0, color: '#a855f7' },
  },

  // ===== TRANSITIONS =====
  {
    id: 't1',
    type: 'transition',
    position: { x: 380, y: 240 },
    data: { label: 'Vérifier & Enregistrer'},
  },
  {
    id: 't2',
    type: 'transition',
    position: { x: 700, y: 240 },
    data: { label: 'Délai 20s puis Rendu'},
  },
  {
    id: 't3',
    type: 'transition',
    position: { x: 1020, y: 240 },
    data: { label: 'Pénalité Retard'},
  },

  // ===== ÉTATS INTERMÉDIAIRES =====
  {
    id: 'p3',
    type: 'place',
    position: { x: 380, y: 480 },
    data: { label: 'Emprunts en cours', tokens: 0, color: '#f59e0b' },
  },
  {
    id: 'p4',
    type: 'place',
    position: { x: 700, y: 480 },
    data: { label: 'Rendus en attente', tokens: 0, color: '#8b5cf6' },
  },
  {
    id: 'p5',
    type: 'place',
    position: { x: 1020, y: 480 },
    data: { label: 'Amendes', tokens: 0, color: '#dc2626' },
  },
  {
    id: 'p6',
    type: 'place',
    position: { x: 700, y: 40 },
    data: { label: 'Livres Rendus ✓', tokens: 0, color: '#06b6d4' },
  },
];

export const initialEdges = [
  // Stocks → Transition Vérifier & Enregistrer
  { id: 'e1', source: 'p1', target: 't1', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e2', source: 'p1b', target: 't1', animated: true, style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e3', source: 'p1c', target: 't1', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'e4', source: 'p2', target: 't1', animated: true, style: { stroke: '#a855f7' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },

  // Emprunts en cours ← t1
  { id: 'e5', source: 't1', target: 'p3', animated: true, style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },

  // Emprunts en cours → t2 (délai 5s)
  { id: 'e6', source: 'p3', target: 't2', animated: true, style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },

  // t2 → Livres Rendus + Rendus en attente
  { id: 'e7', source: 't2', target: 'p6', animated: true, style: { stroke: '#06b6d4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
  { id: 'e8', source: 't2', target: 'p4', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },

  // Rendus en attente → Pénalité
  { id: 'e9', source: 'p4', target: 't3', animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e10', source: 't3', target: 'p5', animated: true, style: { stroke: '#dc2626' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' } },

  // Livres Rendus → Retour vers stocks (cycle)
  { id: 'e11', source: 'p6', target: 'p1', animated: true, type: 'smoothstep', style: { stroke: '#10b981', strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e12', source: 'p6', target: 'p1b', animated: true, type: 'smoothstep', style: { stroke: '#ef4444', strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e13', source: 'p6', target: 'p1c', animated: true, type: 'smoothstep', style: { stroke: '#3b82f6', strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
];