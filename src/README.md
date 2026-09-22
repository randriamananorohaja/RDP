# Réseau de Petri – Bibliothèque multi-types

Version corrigée et redesignée (conforme aux notions du support UF-ENI Réseaux de Pétri).

## Corrections apportées

### Logique RdP
- Suppression de tous les arcs **Place → Place** (interdit en RdP ordinaire).
- Tir atomique des transitions (consommation + production).
- Conditions d’activation basées sur le marquage.
- Conservation des ressources (retour en stock lors du tir de t2).
- Extension temporisée pour t2 (délai 5 s) – acceptable pédagogiquement.

### Design
- Style sobre, académique et professionnel.
- Palette limitée, typographie claire, animations discrètes.
- Moins d’effets « flashy » pour un rendu plus humain.

## Structure

```
rdp-bibliotheque-corrected/
├── App.jsx
├── index.css
├── README.md
├── components/
│   ├── PlaceNode.jsx
│   ├── TransitionNode.jsx
│   ├── Toolbar.jsx
│   ├── BorrowModal.jsx
│   └── ConfigPanel.jsx
└── data/
    └── initialGraph.jsx
```

## Installation

Remplacez les fichiers correspondants de votre projet par ceux de ce dossier, puis :

```bash
npm install
npm run dev
```

## Notions respectées (support de cours)

| Notion              | Respectée |
|---------------------|-----------|
| Places (états)      | Oui       |
| Transitions (événements) | Oui  |
| Arcs Place ↔ Transition uniquement | Oui |
| Marquage            | Oui       |
| Condition de franchissement (jetons en amont) | Oui |
| Tir atomique        | Oui       |
| Extension temporisée | Oui (t2) |
