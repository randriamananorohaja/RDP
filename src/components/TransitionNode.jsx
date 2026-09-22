import { Handle, Position } from '@xyflow/react';
import { useState, useEffect } from 'react';

export function TransitionNode({ data, selected }) {
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.82) {
        setIsFiring(true);
        setTimeout(() => setIsFiring(false), 700);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative w-32 h-14 rounded-lg flex flex-col items-center justify-center
                    transition-all duration-200 cursor-grab active:cursor-grabbing
                    ${selected && !isFiring ? 'ring-2 ring-cyan-500/60 ring-offset-1 ring-offset-slate-900' : ''}`}
        style={{
          background: isFiring
            ? 'linear-gradient(135deg, #c2410c, #9a3412)'
            : '#1e293b',
          border: `1.5px solid ${isFiring ? '#ea580c' : '#475569'}`,
          boxShadow: isFiring
            ? '0 0 16px rgba(234, 88, 12, 0.35)'
            : '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center gap-1.5 text-slate-100">
          <span className="text-sm opacity-90">{data.icon}</span>
          <span className="text-[11px] font-medium text-center leading-tight px-0.5">
            {data.label}
          </span>
        </div>

        {isFiring && (
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 opacity-80" />
        )}

        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#64748b', left: -5, top: '50%', width: 8, height: 8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#64748b', right: -5, top: '50%', width: 8, height: 8 }}
        />
      </div>
    </div>
  );
}

export default TransitionNode;
