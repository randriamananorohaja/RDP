import { Handle, Position } from '@xyflow/react';

export function PlaceNode({ data, selected }) {
  const tokens = data.tokens || 0;
  const color = data.color || '#38bdf8';

  const getTokenPosition = (index, total) => {
    if (total === 0) return { x: 0, y: 0 };
    if (total === 1) return { x: 0, y: 0 };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = total <= 4 ? 14 : 20;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative flex flex-col items-center group">
      <div
        className="absolute -top-9 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                   bg-slate-800/90 backdrop-blur border border-slate-700 transition-all duration-300"
        style={{ color, borderColor: selected ? color : undefined }}
      >
        {data.label}
      </div>

      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center
                    bg-slate-900/80 backdrop-blur transition-all duration-300 cursor-grab active:cursor-grabbing
                    ${selected ? 'animate-glow' : ''}`}
        style={{
          border: `3px solid ${color}`,
          boxShadow: selected
            ? `0 0 30px ${color}88, inset 0 0 20px ${color}22`
            : `0 0 15px ${color}44, inset 0 0 10px ${color}11`,
        }}
      >
        {tokens > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: Math.min(tokens, 9) }).map((_, i) => {
              const pos = getTokenPosition(i, Math.min(tokens, 9));
              return (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-pulse-token"
                  style={{
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              );
            })}
          </div>
        )}

        <span
          className="text-lg font-bold z-10 drop-shadow-lg"
          style={{ color: tokens > 0 ? '#fff' : color }}
        >
          {tokens}
        </span>

        <Handle
          type="target"
          position={Position.Left}
          style={{ background: color, left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: color, right: -6 }}
        />
      </div>
    </div>
  );
}

export default PlaceNode;