import { useState, useCallback } from 'react';

// Petri Net Model for Library Book Borrowing Process
const initialPlaces = [
  { id: 'p1', label: 'Livres disponibles', tokens: 10 },
  { id: 'p2', label: 'Demande en attente', tokens: 0 },
  { id: 'p3', label: 'Emprunt en cours', tokens: 0 },
  { id: 'p4', label: 'Retour prévu', tokens: 0 },
  { id: 'p5', label: 'Livres rendus', tokens: 0 },
];

const initialTransitions = [
  { id: 't1', label: 'Demander' },
  { id: 't2', label: 'Valider' },
  { id: 't3', label: 'Emprunter' },
  { id: 't4', label: 'Retourner' },
];

const initialEdges = [
  { id: 'e1', source: 'p1', target: 't1' },
  { id: 'e2', source: 't1', target: 'p2' },
  { id: 'e3', source: 'p2', target: 't2' },
  { id: 'e4', source: 't2', target: 'p3' },
  { id: 'e5', source: 'p3', target: 't3' },
  { id: 'e6', source: 't3', target: 'p4' },
  { id: 'e7', source: 'p4', target: 't4' },
  { id: 'e8', source: 't4', target: 'p5' },
  { id: 'e9', source: 'p5', target: 'p1' },
];

export const usePetriNet = () => {
  const [places, setPlaces] = useState(initialPlaces);
  const [transitions, setTransitions] = useState(initialTransitions);
  const [edges, setEdges] = useState(initialEdges);
  const [history, setHistory] = useState([]);

  const fireTransition = useCallback((transitionId) => {
    const transition = transitions.find(t => t.id === transitionId);
    if (!transition) return false;

    // Find input places
    const inputPlaces = edges
      .filter(e => e.target === transitionId)
      .map(e => places.find(p => p.id === e.source));

    // Check if all input places have at least 1 token
    const canFire = inputPlaces.every(p => p.tokens > 0);

    if (!canFire) return false;

    // Fire transition: remove tokens from input places, add to output places
    const newPlaces = places.map(place => {
      const isInput = edges.some(e => e.target === transitionId && e.source === place.id);
      const isOutput = edges.some(e => e.source === transitionId && e.target === place.id);
      
      let newTokens = place.tokens;
      if (isInput) newTokens -= 1;
      if (isOutput) newTokens += 1;

      return { ...place, tokens: newTokens };
    });

    setPlaces(newPlaces);
    setHistory([...history, { action: `Transition ${transition.label} fired`, timestamp: new Date() }]);
    
    return true;
  }, [places, transitions, edges, history]);

  const resetNet = useCallback(() => {
    setPlaces(initialPlaces);
    setHistory([]);
  }, []);

  return {
    places,
    transitions,
    edges,
    history,
    fireTransition,
    resetNet,
  };
};
