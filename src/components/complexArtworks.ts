export const generateDetailedMandala = () => {
  const paths = [];
  const cx = 100;
  const cy = 100;
  let idCounter = 1;

  // Center star
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const nextAngle = ((i + 1) * 30) * Math.PI / 180;
    const r1 = 5;
    const r2 = 15;
    
    const x1 = cx + r1 * Math.cos(angle);
    const y1 = cy + r1 * Math.sin(angle);
    const x2 = cx + r2 * Math.cos(angle + 15 * Math.PI / 180);
    const y2 = cy + r2 * Math.sin(angle + 15 * Math.PI / 180);
    const x3 = cx + r1 * Math.cos(nextAngle);
    const y3 = cy + r1 * Math.sin(nextAngle);
    
    paths.push({
      id: `man-c-${idCounter++}`,
      d: `M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`
    });
  }

  // Rings of petals
  const generateRing = (rings: number, startRadius: number, length: number, widthFactor: number, prefix: string) => {
    for (let i = 0; i < rings; i++) {
        const angle = (i * (360 / rings)) * Math.PI / 180;
        
        const baseAx = cx + startRadius * Math.cos(angle - widthFactor);
        const baseAy = cy + startRadius * Math.sin(angle - widthFactor);
        const baseBx = cx + startRadius * Math.cos(angle + widthFactor);
        const baseBy = cy + startRadius * Math.sin(angle + widthFactor);
        
        const tipX = cx + (startRadius + length) * Math.cos(angle);
        const tipY = cy + (startRadius + length) * Math.sin(angle);
        
        const cp1x = cx + (startRadius + length*0.5) * Math.cos(angle - widthFactor*2);
        const cp1y = cy + (startRadius + length*0.5) * Math.sin(angle - widthFactor*2);
        
        const cp2x = cx + (startRadius + length*0.5) * Math.cos(angle + widthFactor*2);
        const cp2y = cy + (startRadius + length*0.5) * Math.sin(angle + widthFactor*2);
        
        paths.push({
            id: `${prefix}-p-${idCounter++}`,
            d: `M ${baseAx} ${baseAy} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${baseBx} ${baseBy} Z`
        });
        
        // Inner detail
        const tipInnerX = cx + (startRadius + length*0.8) * Math.cos(angle);
        const tipInnerY = cy + (startRadius + length*0.8) * Math.sin(angle);
        paths.push({
            id: `${prefix}-pin-${idCounter++}`,
            d: `M ${baseAx*0.9 + baseBx*0.1} ${baseAy*0.9 + baseBy*0.1} L ${tipInnerX} ${tipInnerY} L ${baseBx*0.9 + baseAx*0.1} ${baseBy*0.9 + baseAy*0.1} Z`
        });
    }
  };

  generateRing(16, 17, 20, 0.15, 'r1');
  generateRing(24, 38, 25, 0.1, 'r2');
  generateRing(32, 65, 30, 0.08, 'r3');

  // Outer border scallops
  for (let i = 0; i < 32; i++) {
    const angle = (i * (360 / 32)) * Math.PI / 180;
    const nextAngle = ((i + 1) * (360 / 32)) * Math.PI / 180;
    
    const r = 95;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(nextAngle);
    const y2 = cy + r * Math.sin(nextAngle);
    
    const cpRadius = 110;
    const cpx = cx + cpRadius * Math.cos((angle + nextAngle)/2);
    const cpy = cy + cpRadius * Math.sin((angle + nextAngle)/2);
    
    paths.push({
        id: `m-out-${idCounter++}`,
        d: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2} Z`
    });

    const cpRadius2 = 102;
    const cpx2 = cx + cpRadius2 * Math.cos((angle + nextAngle)/2);
    const cpy2 = cy + cpRadius2 * Math.sin((angle + nextAngle)/2);
    paths.push({
        id: `m-out2-${idCounter++}`,
        d: `M ${x1} ${y1} Q ${cpx2} ${cpy2} ${x2} ${y2} Z`
    });
  }

  return paths;
};

export const generateMajesticButterfly = () => {
  const paths = [];
  let idCounter = 1;
  const cx = 100;

  // Add symmetrical wing shapes
  const addSymm = (dGen: (isRight: boolean) => string, baseId: string) => {
    paths.push({
      id: `ul-${baseId}-${idCounter}`,
      d: dGen(false)
    });
    paths.push({
      id: `ur-${baseId}-${idCounter}`,
      d: dGen(true)
    });
    idCounter++;
  };

  const flipX = (val: number, isRight: boolean) => isRight ? cx + (cx - val) : val;

  // Body
  paths.push({
    id: `body`,
    d: `M 98 40 C 98 25, 102 25, 102 40 C 103 60, 103 90, 102 110 C 102 120, 98 120, 98 110 C 97 90, 97 60, 98 40 Z`
  });
  
  paths.push({
    id: `ant-l`,
    d: `M 99 28 C 96 15, 85 10, 75 12`
  });
  paths.push({
    id: `ant-r`,
    d: `M 101 28 C 104 15, 115 10, 125 12`
  });

  // Base upper wing
  addSymm((isRight) => {
     const p1 = `${flipX(98, isRight)} 50`;
     const p2 = `${flipX(20, isRight)} 10`;
     const p3 = `${flipX(5, isRight)} 60`;
     const p4 = `${flipX(40, isRight)} 90`;
     const p5 = `${flipX(98, isRight)} 70`;
     return `M ${p1} C ${flipX(60, isRight)} 20, ${p2} C ${flipX(10, isRight)} 30, ${p3} C ${flipX(20, isRight)} 80, ${p4} C ${flipX(60, isRight)} 90, ${p5} Z`;
  }, 'base');

  // Base lower wing
  addSymm((isRight) => {
     const p1 = `${flipX(97, isRight)} 75`;
     const p2 = `${flipX(35, isRight)} 95`;
     const p3 = `${flipX(25, isRight)} 160`;
     const p4 = `${flipX(70, isRight)} 175`;
     const p5 = `${flipX(98, isRight)} 105`;
     return `M ${p1} C ${flipX(60, isRight)} 80, ${p2} C ${flipX(30, isRight)} 120, ${p3} C ${flipX(40, isRight)} 170, ${p4} C ${flipX(90, isRight)} 140, ${p5} Z`;
  }, 'base-low');

  // Generate fractal facets inside upper wing
  const generateFacets = (centerX: number, centerY: number, radius: number, sections: number, layers: number, wingCls: string) => {
     for(let l=1; l<=layers; l++) {
        const curR = radius * (1 - (l-1) / layers);
        const nextR = radius * (1 - l / layers);
        for(let s=0; s<sections; s++) {
           const a1 = (s * 360/sections) * Math.PI/180;
           const a2 = ((s+1) * 360/sections) * Math.PI/180;
           addSymm((isRight) => {
              const rx = flipX(centerX, isRight);
              // if right side, angles should be mirrored too. For a simple circle effect, we can just use the coordinates
              const x1 = flipX(centerX + curR * Math.cos(a1), isRight);
              const y1 = centerY + curR * Math.sin(a1);
              const x2 = flipX(centerX + curR * Math.cos(a2), isRight);
              const y2 = centerY + curR * Math.sin(a2);
              const x3 = flipX(centerX + nextR * Math.cos(a2), isRight);
              const y3 = centerY + nextR * Math.sin(a2);
              const x4 = flipX(centerX + nextR * Math.cos(a1), isRight);
              const y4 = centerY + nextR * Math.sin(a1);
              return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
           }, `facet-${wingCls}`);
        }
     }
  };

  generateFacets(45, 50, 25, 8, 4, 'up');
  generateFacets(60, 130, 30, 10, 5, 'low');
  generateFacets(25, 120, 15, 6, 3, 'low-edge');
  generateFacets(70, 75, 10, 5, 2, 'mid');
  generateFacets(20, 45, 10, 5, 2, 'up-edge');

  return paths;
};
