import { Handle, Position } from '@xyflow/react';

export function PlaceNode({ data, selected }) {
  const tokens = data.tokens || 0;
  const color = data.color || '#38bdf8';

  const getTokenPosition = (index, total) => {
    if (total <= 1) return { x: 0, y: 0 };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = total <= 4 ? 13 : 18;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Label */}
      <div
        className="absolute -top-8 px-2.5 py-0.5 rounded-md text-[11px] font-medium
                   bg-slate-800/90 border border-slate-700 whitespace-nowrap"
        style={{ color, borderColor: selected ? color : undefined }}
      >
        {data.label}
      </div>

      {/* Place (cercle) */}
      <div
        className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center
                    bg-slate-900/90 transition-shadow duration-200
                    cursor-grab active:cursor-grabbing`}
        style={{
          border: `2.5px solid ${color}`,
          boxShadow: selected
            ? `0 0 0 3px ${color}33, 0 0 18px ${color}44`
            : `0 0 10px ${color}22`,
        }}
      >
        {/* Jetons */}
        {tokens > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: Math.min(tokens, 8) }).map((_, i) => {
              const pos = getTokenPosition(i, Math.min(tokens, 8));
              return (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full animate-pulse-token"
                  style={{
                    background: color,
                    boxShadow: `0 0 5px ${color}`,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Nombre */}
        <span
          className="text-base font-semibold z-10"
          style={{ color: tokens > 0 ? '#f8fafc' : color }}
        >
          {tokens}
        </span>

        <Handle
          type="target"
          position={Position.Left}
          style={{ background: color, left: -5, width: 8, height: 8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: color, right: -5, width: 8, height: 8 }}
        />
      </div>
    </div>
  );
}

export default PlaceNode;
