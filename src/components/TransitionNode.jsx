import { Handle, Position } from '@xyflow/react';
import { useState, useEffect } from 'react';

export function TransitionNode({ data, selected }) {
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsFiring(true);
        setTimeout(() => setIsFiring(false), 1000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center group">
      <div
        className={`relative w-36 h-16 rounded-xl flex flex-col items-center justify-center
                    backdrop-blur transition-all duration-300 cursor-grab active:cursor-grabbing
                    ${isFiring ? 'transition-fire' : ''}
                    ${selected && !isFiring ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
        style={{
          background: isFiring
            ? undefined
            : 'linear-gradient(135deg, #1e293b, #334155)',
          border: `2px solid ${isFiring ? '#fb923c' : '#475569'}`,
          boxShadow: isFiring
            ? undefined
            : '0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">{data.icon}</span>
          <span className="text-xs font-semibold text-center leading-tight px-1">
            {data.label}
          </span>
        </div>

        {isFiring && (
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-300 animate-ping" />
        )}

        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#38bdf8', left: -6, top: '50%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#38bdf8', right: -6, top: '50%' }}
        />
      </div>
    </div>
  );
}

export default TransitionNode;