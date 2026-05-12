import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check } from 'lucide-react';

const PALETTE = [
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ecfeff',
  '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#f0f9ff',
  '#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#f5f3ff',
  '#be185d', '#db2777', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'
];

interface PathObj {
  id: string;
  d: string;
}

const BUTTERFLY_PATHS: PathObj[] = [
  // Upper Left Wing - Main Outline
  { id: 'ul-outer', d: 'M100 100 C70 40, 5 15, 10 55 C12 70, 30 110, 100 100' },
  // Upper Left Wing - Interior Cells (Ornate)
  { id: 'ul-cell1', d: 'M95 90 C80 60, 40 40, 25 50 C20 60, 40 85, 95 90' },
  { id: 'ul-cell2', d: 'M85 80 C70 55, 50 45, 40 55 C35 60, 50 75, 85 80' },
  { id: 'ul-cell3', d: 'M70 70 C60 55, 55 50, 50 55 C48 60, 60 65, 70 70' },
  { id: 'ul-edge1', d: 'M20 50 C15 45, 15 35, 25 30 C35 25, 45 40, 20 50' },
  { id: 'ul-edge2', d: 'M40 35 C35 30, 45 25, 55 25 C65 25, 60 35, 40 35' },
  { id: 'ul-dot1', d: 'M15 55 A 4 4 0 1 0 15 54 Z' },
  { id: 'ul-dot2', d: 'M25 90 A 3 3 0 1 0 25 89 Z' },

  // Upper Right Wing - Main Outline
  { id: 'ur-outer', d: 'M100 100 C130 40, 195 15, 190 55 C188 70, 170 110, 100 100' },
  // Upper Right Wing - Interior Cells (Ornate)
  { id: 'ur-cell1', d: 'M105 90 C120 60, 160 40, 175 50 C180 60, 160 85, 105 90' },
  { id: 'ur-cell2', d: 'M115 80 C130 55, 150 45, 160 55 C165 60, 150 75, 115 80' },
  { id: 'ur-cell3', d: 'M130 70 C140 55, 145 50, 150 55 C152 60, 140 65, 130 70' },
  { id: 'ur-edge1', d: 'M180 50 C185 45, 185 35, 175 30 C165 25, 155 40, 180 50' },
  { id: 'ur-edge2', d: 'M160 35 C165 30, 155 25, 145 25 C135 25, 140 35, 160 35' },
  { id: 'ur-dot1', d: 'M185 55 A 4 4 0 1 0 185 54 Z' },
  { id: 'ur-dot2', d: 'M175 90 A 3 3 0 1 0 175 89 Z' },

  // Lower Left Wing - Main Outline
  { id: 'll-outer', d: 'M100 100 C70 130, 30 180, 20 160 C10 140, 50 110, 100 100' },
  // Lower Left Wing - Interior Cells
  { id: 'll-cell1', d: 'M95 110 C75 140, 45 165, 35 150 C30 140, 60 120, 95 110' },
  { id: 'll-cell2', d: 'M85 115 C70 135, 55 155, 50 145 C45 135, 65 125, 85 115' },
  { id: 'll-dot1', d: 'M35 170 A 5 5 0 1 0 35 169 Z' },
  { id: 'll-dot2', d: 'M55 175 A 4 4 0 1 0 55 174 Z' },

  // Lower Right Wing - Main Outline
  { id: 'lr-outer', d: 'M100 100 C130 130, 170 180, 180 160 C190 140, 150 110, 100 100' },
  // Lower Right Wing - Interior Cells
  { id: 'lr-cell1', d: 'M105 110 C125 140, 155 165, 165 150 C170 140, 140 120, 105 110' },
  { id: 'lr-cell2', d: 'M115 115 C130 135, 145 155, 150 145 C155 135, 135 125, 115 115' },
  { id: 'lr-dot1', d: 'M165 170 A 5 5 0 1 0 165 169 Z' },
  { id: 'lr-dot2', d: 'M145 175 A 4 4 0 1 0 145 174 Z' },

  // Body
  { id: 'body-tail', d: 'M100 155 C90 140, 90 110, 100 105 C110 110, 110 140, 100 155' },
  { id: 'body-torso', d: 'M100 105 C90 95, 90 75, 100 65 C110 75, 110 95, 100 105' },
  { id: 'body-head', d: 'M100 65 C95 60, 95 50, 100 45 C105 50, 105 60, 100 65' },
  
  // Antennae
  { id: 'ant-l', d: 'M98 50 Q85 30 75 15' },
  { id: 'ant-r', d: 'M102 50 Q115 30 125 15' }
];

export default function ZenColoring() {
  const [selectedColor, setSelectedColor] = useState(PALETTE[4]);
  const [fills, setFills] = useState<Record<string, string>>({});

  const handleFill = (id: string) => {
    if (id.startsWith('ant')) return;
    setFills(prev => ({ ...prev, [id]: selectedColor }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear your beautiful butterfly?')) {
      setFills({});
    }
  };

  return (
    <div className="flex flex-col items-center pb-32">
      <div className="flex items-center justify-between w-full mb-8">
        <h2 className="text-3xl font-serif text-sky-900">Zen Color</h2>
        <button 
          onClick={handleReset}
          className="text-xs uppercase tracking-widest text-sky-900/40 hover:text-sky-900 transition-opacity"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-sky-900/60 italic font-light text-center mb-8">
        Bring the butterfly to life. Select a color and tap a section to paint.
      </p>

      {/* Canvas */}
      <div className="mb-12 bg-white/40 backdrop-blur-xl rounded-3xl p-6 w-full max-w-[360px] aspect-square flex items-center justify-center relative shadow-2xl border border-white/80 overflow-hidden">
        <div className="absolute inset-0 bg-sky-400/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)]"></div>
        
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl relative z-10 filter-glow">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <linearGradient id="wing-shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.1" />
            </linearGradient>

            <radialGradient id="soft-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {BUTTERFLY_PATHS.map((path) => {
            const isAnt = path.id.startsWith('ant');
            const isBody = path.id.startsWith('body');
            const isDot = path.id.includes('dot');
            const isOuter = path.id.includes('outer');
            
            let defaultFill = 'rgba(56, 189, 248, 0.1)';
            if (isBody) defaultFill = 'rgba(12, 105, 233, 0.4)';
            if (isDot) defaultFill = 'rgba(255, 255, 255, 0.8)';

            return (
              <g key={path.id} filter="url(#glow)">
                <path
                  d={path.d}
                  fill={isAnt ? 'none' : (fills[path.id] || defaultFill)}
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth={isAnt ? 1.5 : (isOuter ? 1 : 0.8)}
                  strokeLinecap="round"
                  onClick={() => handleFill(path.id)}
                  className={`${isAnt ? '' : 'cursor-pointer hover:opacity-80 transition-all duration-500'} ${isOuter ? 'hover:scale-[1.01]' : ''}`}
                  style={isAnt ? {} : { transition: 'fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                {!isAnt && !isDot && (
                  <path
                    d={path.d}
                    fill="url(#wing-shine)"
                    className="pointer-events-none mix-blend-overlay"
                  />
                )}
                {isOuter && (
                  <path
                    d={path.d}
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Palette Tools */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-sky-500" />
            <span className="text-xs uppercase tracking-widest text-sky-900/60 font-medium">Celestial Palette</span>
          </div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xl">
          <div className="grid grid-cols-6 gap-3">
            {PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className="relative w-full aspect-square rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-inner border border-white/20"
                style={{ 
                  backgroundColor: color,
                  boxShadow: selectedColor === color ? `0 0 15px ${color}88` : 'none'
                }}
              >
                {selectedColor === color && (
                  <motion.div
                    layoutId="color-check-sky"
                    className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-[1px]"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
