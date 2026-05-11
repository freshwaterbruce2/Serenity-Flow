import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check } from 'lucide-react';

const PALETTE = [
  '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c',
  '#e8eaf6', '#c5cae9', '#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f', '#283593', '#1a237e'
];

interface PathObj {
  id: string;
  d: string;
}

const BUTTERFLY_PATHS: PathObj[] = [
  // Upper Left Wing outer
  { id: 'ul-out', d: 'M100 100 C70 40, 5 15, 10 55 C12 70, 30 110, 100 100' },
  // Upper Left Wing inner sections
  { id: 'ul-in1', d: 'M85 85 C60 50, 25 35, 20 55 C22 65, 40 95, 85 85' },
  { id: 'ul-in2', d: 'M70 70 C50 45, 30 40, 25 55 C27 60, 45 80, 70 70' },
  { id: 'ul-spot1', d: 'M30 55 A 5 5 0 1 0 30 54' },
  
  // Upper Right Wing outer
  { id: 'ur-out', d: 'M100 100 C130 40, 195 15, 190 55 C188 70, 170 110, 100 100' },
  // Upper Right Wing inner sections
  { id: 'ur-in1', d: 'M115 85 C140 50, 175 35, 180 55 C178 65, 160 95, 115 85' },
  { id: 'ur-in2', d: 'M130 70 C150 45, 170 40, 175 55 C173 60, 155 80, 130 70' },
  { id: 'ur-spot1', d: 'M170 55 A 5 5 0 1 0 170 54' },

  // Lower Left Wing outer
  { id: 'll-out', d: 'M100 100 C70 130, 30 180, 20 160 C10 140, 50 110, 100 100' },
  // Lower Left inner sections
  { id: 'll-in1', d: 'M85 110 C60 130, 35 160, 30 150 C25 140, 55 120, 85 110' },
  { id: 'll-in2', d: 'M75 115 C55 130, 40 150, 35 145 C30 140, 60 125, 75 115' },
  { id: 'll-spot1', d: 'M40 145 A 4 4 0 1 0 40 144' },

  // Lower Right Wing outer
  { id: 'lr-out', d: 'M100 100 C130 130, 170 180, 180 160 C190 140, 150 110, 100 100' },
  // Lower Right inner sections
  { id: 'lr-in1', d: 'M115 110 C140 130, 165 160, 170 150 C175 140, 145 120, 115 110' },
  { id: 'lr-in2', d: 'M125 115 C145 130, 160 150, 165 145 C170 140, 140 125, 125 115' },
  { id: 'lr-spot1', d: 'M160 145 A 4 4 0 1 0 160 144' },

  // Body
  { id: 'body', d: 'M96 60 C92 80, 92 120, 96 145 C100 155, 100 155, 104 145 C108 120, 108 80, 104 60 C100 50, 100 50, 96 60' },
  
  // Antennae
  { id: 'ant-l', d: 'M98 60 Q90 30 80 20' },
  { id: 'ant-r', d: 'M102 60 Q110 30 120 20' }
];

export default function ZenColoring() {
  const [selectedColor, setSelectedColor] = useState(PALETTE[5]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [showPallete, setShowPalette] = useState(true);

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
        <h2 className="text-3xl font-serif text-purple-900">Zen Color</h2>
        <button 
          onClick={handleReset}
          className="text-xs uppercase tracking-widest text-purple-900/60 hover:text-purple-900 transition-opacity"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-purple-900/60 italic font-light text-center mb-8">
        Bring the butterfly to life. Select a color and tap a section to paint.
      </p>

      {/* Canvas */}
      <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl p-6 w-full max-w-[340px] aspect-square flex items-center justify-center relative shadow-xl border border-white/80 overflow-hidden">
        <div className="absolute inset-0 bg-purple-500/5 mix-blend-overlay"></div>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl relative z-10">
          <defs>
            <linearGradient id="shine-left" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="shine-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="body-shine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="black" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="black" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="spot-shine" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {BUTTERFLY_PATHS.map((path) => {
            const isLeft = path.id.startsWith('ul') || path.id.startsWith('ll');
            const isRight = path.id.startsWith('ur') || path.id.startsWith('lr');
            const isSpot = path.id.includes('spot');
            const isBody = path.id === 'body';
            const isAnt = path.id.startsWith('ant');
            
            let overlayUrl = '';
            if (isSpot) overlayUrl = 'url(#spot-shine)';
            else if (isBody) overlayUrl = 'url(#body-shine)';
            else if (isLeft) overlayUrl = 'url(#shine-left)';
            else if (isRight) overlayUrl = 'url(#shine-right)';

            return (
              <g key={path.id}>
                <path
                  d={path.d}
                  fill={isAnt ? 'none' : (fills[path.id] || 'rgba(157, 126, 207, 0.15)')}
                  stroke="rgba(157, 126, 207, 0.4)"
                  strokeWidth={isAnt ? 2 : 1.5}
                  strokeLinecap="round"
                  onClick={() => handleFill(path.id)}
                  className={isAnt ? '' : 'cursor-pointer hover:opacity-80 transition-opacity'}
                  style={isAnt ? {} : { transition: 'fill 0.4s ease' }}
                />
                {!isAnt && (
                  <path
                    d={path.d}
                    fill={overlayUrl}
                    className="pointer-events-none mix-blend-overlay"
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
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="text-xs uppercase tracking-widest text-purple-900/60">Palette</span>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-lg">
          <div className="grid grid-cols-10 gap-2 sm:gap-3">
            {PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className="relative w-full aspect-square rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <motion.div
                    layoutId="color-check"
                    className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full"
                  >
                    <Check className="w-3 h-3 text-white" />
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
