export const generateDetailedMandala = () => {
  const paths: any[] = [];
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
    
    const midX = (cx + x1 + x2 + x3) / 4;
    const midY = (cy + y1 + y2 + y3) / 4;

    paths.push({
      id: `man-c-${idCounter++}`,
      d: `M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`,
      number: 1,
      center: { x: midX, y: midY }
    });
  }

  // Rings of petals
  const generateRing = (rings: number, startRadius: number, length: number, widthFactor: number, prefix: string, colorNum: number) => {
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
        
        const midX = cx + (startRadius + length*0.5) * Math.cos(angle);
        const midY = cy + (startRadius + length*0.5) * Math.sin(angle);

        paths.push({
            id: `${prefix}-p-${idCounter++}`,
            d: `M ${baseAx} ${baseAy} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${baseBx} ${baseBy} Z`,
            number: colorNum,
            center: { x: midX, y: midY }
        });
        
        // Inner detail
        const tipInnerX = cx + (startRadius + length*0.8) * Math.cos(angle);
        const tipInnerY = cy + (startRadius + length*0.8) * Math.sin(angle);
        
        const detailMidX = cx + (startRadius + length*0.4) * Math.cos(angle);
        const detailMidY = cy + (startRadius + length*0.4) * Math.sin(angle);

        paths.push({
            id: `${prefix}-pin-${idCounter++}`,
            d: `M ${baseAx*0.9 + baseBx*0.1} ${baseAy*0.9 + baseBy*0.1} L ${tipInnerX} ${tipInnerY} L ${baseBx*0.9 + baseAx*0.1} ${baseBy*0.9 + baseAy*0.1} Z`,
            number: colorNum + 1,
            center: { x: detailMidX, y: detailMidY }
        });
    }
  };

  generateRing(16, 17, 20, 0.15, 'r1', 2);
  generateRing(24, 38, 25, 0.1, 'r2', 4);
  generateRing(32, 65, 30, 0.08, 'r3', 6);

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
    
    const midX = cx + 102 * Math.cos((angle + nextAngle)/2);
    const midY = cy + 102 * Math.sin((angle + nextAngle)/2);

    paths.push({
        id: `m-out-${idCounter++}`,
        d: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2} Z`,
        number: 8,
        center: { x: midX, y: midY }
    });

    const cpRadius2 = 102;
    const cpx2 = cx + cpRadius2 * Math.cos((angle + nextAngle)/2);
    const cpy2 = cy + cpRadius2 * Math.sin((angle + nextAngle)/2);
    
    const midX2 = cx + 98 * Math.cos((angle + nextAngle)/2);
    const midY2 = cy + 98 * Math.sin((angle + nextAngle)/2);

    paths.push({
        id: `m-out2-${idCounter++}`,
        d: `M ${x1} ${y1} Q ${cpx2} ${cpy2} ${x2} ${y2} Z`,
        number: 9,
        center: { x: midX2, y: midY2 }
    });
  }

  return paths;
};

export const generateMajesticButterfly = () => {
  const paths: any[] = [];
  const cx = 100;

  // Body
  paths.push({
    id: `body-main`,
    d: `M 98 40 C 98 25, 102 25, 102 40 C 103 60, 103 90, 102 110 C 102 120, 98 120, 98 110 C 97 90, 97 60, 98 40 Z`,
    number: 1,
    center: { x: 100, y: 75 }
  });
  
  paths.push({
    id: `ant-l`,
    d: `M 99 28 C 96 15, 85 10, 75 12`,
    number: 1,
    center: { x: 85, y: 15 }
  });
  paths.push({
    id: `ant-r`,
    d: `M 101 28 C 104 15, 115 10, 125 12`,
    number: 1,
    center: { x: 115, y: 15 }
  });

  const flipX = (val: number, isRight: boolean) => isRight ? cx + (cx - val) : val;

  const addSymm = (p: {id: string, d: string, number: number, center: {x: number, y: number}}) => {
    paths.push({ ...p, id: `ul-${p.id}` });
    
    // Simple heuristic to flip all X coordinates in the path string for symmetry
    const flippedD = p.d.replace(/([0-9.]+)(?=\s|,|$)/g, (m, val, offset, str) => {
        // We only want to flip if it's an X coordinate. 
        // In SVG paths like M x y L x y, X is the 1st, 3rd, 5th etc value after command
        // This regex is slightly risky but usually works for simple paths
        return m; 
    });
    
    // Better: rebuild path if possible, but for butterflies we can just use flipX on the points
    // Let's manually flip the base shapes and then use a more robust generator for facets
    
    paths.push({ 
      id: `ur-${p.id}`, 
      d: p.d, // Fallback, will be overridden for base wings
      number: p.number,
      center: { x: flipX(p.center.x, true), y: p.center.y }
    });
  };

  // Rewrite addSymm to be more robust for different path types
  const pushSymm = (id: string, dLeft: string, dRight: string, num: number, centerLeft: {x: number, y: number}) => {
    paths.push({ id: `ul-${id}`, d: dLeft, number: num, center: centerLeft });
    paths.push({ id: `ur-${id}`, d: dRight, number: num, center: { x: flipX(centerLeft.x, true), y: centerLeft.y } });
  };

  // Base upper wing
  pushSymm('base-up', 
    `M 98 50 C 60 20, 20 10, 5 60 C 20 80, 40 90, 98 70 Z`,
    `M 102 50 C 140 20, 180 10, 195 60 C 180 80, 160 90, 102 70 Z`,
    2, { x: 40, y: 40 }
  );

  // Base lower wing
  pushSymm('base-low',
    `M 97 75 C 60 80, 35 95, 25 160 C 40 170, 90 140, 98 105 Z`,
    `M 103 75 C 140 80, 165 95, 175 160 C 160 170, 110 140, 102 105 Z`,
    2, { x: 50, y: 130 }
  );

  // Generate fractal facets inside wings
  const generateFacets = (centerX: number, centerY: number, radius: number, sections: number, layers: number, wingCls: string) => {
    for (let l = 1; l <= layers; l++) {
      const curR = radius * (1 - (l - 1) / layers);
      const nextR = radius * (1 - l / layers);
      for (let s = 0; s < sections; s++) {
        const a1 = (s * 360 / sections) * Math.PI / 180;
        const a2 = ((s + 1) * 360 / sections) * Math.PI / 180;
        
        const x1 = centerX + curR * Math.cos(a1);
        const y1 = centerY + curR * Math.sin(a1);
        const x2 = centerX + curR * Math.cos(a2);
        const y2 = centerY + curR * Math.sin(a2);
        const x3 = centerX + nextR * Math.cos(a2);
        const y3 = centerY + nextR * Math.sin(a2);
        const x4 = centerX + nextR * Math.cos(a1);
        const y4 = centerY + nextR * Math.sin(a1);

        const midX = (x1 + x2 + x3 + x4) / 4;
        const midY = (y1 + y2 + y3 + y4) / 4;

        pushSymm(`facet-${wingCls}-${l}-${s}`,
          `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`,
          `M ${flipX(x1, true)} ${y1} L ${flipX(x2, true)} ${y2} L ${flipX(x3, true)} ${y3} L ${flipX(x4, true)} ${y4} Z`,
          (s % 5) + 3,
          { x: midX, y: midY }
        );
      }
    }
  };

  generateFacets(45, 50, 25, 8, 4, 'up');
  generateFacets(60, 130, 30, 10, 5, 'low');
  generateFacets(25, 120, 15, 6, 3, 'low-edge');
  generateFacets(70, 75, 10, 5, 2, 'mid');

  return paths;
};

export const generateStellarLotus = () => {
  const paths: any[] = [];
  const cx = 100, cy = 100;
  
  // Bloom petals - multiple layers
  for (let layer = 0; layer < 4; layer++) {
    const petals = 8 + layer * 4;
    const radius = 25 + layer * 20;
    const innerRadius = 10 + layer * 15;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals + (layer * Math.PI / petals);
      const x1 = cx + Math.cos(angle - 0.2) * innerRadius;
      const y1 = cy + Math.sin(angle - 0.2) * innerRadius;
      const x2 = cx + Math.cos(angle + 0.2) * innerRadius;
      const y2 = cy + Math.sin(angle + 0.2) * innerRadius;
      
      const tipX = cx + Math.cos(angle) * (radius + 15);
      const tipY = cy + Math.sin(angle) * (radius + 15);
      
      const cp1x = cx + Math.cos(angle - 0.4) * (radius + 5);
      const cp1y = cy + Math.sin(angle - 0.4) * (radius + 5);
      const cp2x = cx + Math.cos(angle + 0.4) * (radius + 5);
      const cp2y = cy + Math.sin(angle + 0.4) * (radius + 5);

      paths.push({
        id: `lotus-l${layer}-p${i}`,
        d: `M ${x1} ${y1} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${x2} ${y2} Z`,
        number: (layer % 4) + 1,
        center: { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
      });
      
      // Vein details
      paths.push({
        id: `lotus-l${layer}-v${i}`,
        d: `M ${cx + Math.cos(angle) * innerRadius * 1.2} ${cy + Math.sin(angle) * innerRadius * 1.2} L ${tipX * 0.8 + cx * 0.2} ${tipY * 0.8 + cy * 0.2}`,
        number: 5,
        center: { x: cx + Math.cos(angle) * (innerRadius + 5), y: cy + Math.sin(angle) * (innerRadius + 5) }
      });
    }
  }
  
  // Center seeds
  for (let i = 0; i < 12; i++) {
    const angle = (i * 2 * Math.PI) / 12;
    const r = 8;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    paths.push({
      id: `seed-${i}`,
      d: `M ${px-2} ${py} A 2 2 0 1 0 ${px+2} ${py} A 2 2 0 1 0 ${px-2} ${py} Z`,
      number: 6,
      center: { x: px, y: py }
    });
  }

  return paths;
};

export const generateGracefulSwans = () => {
  const paths: any[] = [];
  let idCounter = 1;
  const cx = 200, cy = 200;

  // Background Circle (Sun/Moon)
  paths.push({
    id: `sun-glow`,
    d: `M 200 60 A 100 100 0 1 0 200 260 A 100 100 0 1 0 200 60 Z`,
    number: 1,
    center: { x: 200, y: 160 }
  });
  
  paths.push({
    id: `sun-inner`,
    d: `M 200 80 A 80 80 0 1 0 200 240 A 80 80 0 1 0 200 80 Z`,
    number: 2,
    center: { x: 200, y: 160 }
  });

  // Water base
  paths.push({
    id: `water-base`,
    d: `M 40 280 L 360 280 C 370 330, 320 360, 200 360 C 80 360, 30 330, 40 280 Z`,
    number: 3,
    center: { x: 200, y: 320 }
  });

  // Water ripples
  for (let i = 0; i < 4; i++) {
    const y = 300 + i * 15;
    const w = 180 - i * 30;
    paths.push({
      id: `ripple-${i}`,
      d: `M ${200 - w} ${y} Q 200 ${y + 15} ${200 + w} ${y} Q 200 ${y - 5} ${200 - w} ${y} Z`,
      number: 4 + (i % 2),
      center: { x: 200, y: y + 5 }
    });
  }

  // Intricate Lotus at the bottom
  const lotusY = 290;
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI + (i - 3) * 0.3;
    const len = 40 - Math.abs(i - 3) * 10;
    const px = Math.cos(angle) * len;
    const py = Math.sin(angle) * len;
    paths.push({
      id: `lotus-petal-${i}`,
      d: `M 200 ${lotusY} Q ${200 + px} ${lotusY + py - 20} ${200 + px * 1.5} ${lotusY + py * 1.5} Q ${200 + px - 10} ${lotusY + py} 200 ${lotusY} Z`,
      number: 6,
      center: { x: 200 + px, y: lotusY + py }
    });
  }
  
  // Center lotus gem
  paths.push({
    id: `lotus-gem`,
    d: `M 200 ${lotusY - 5} L 205 ${lotusY + 5} L 200 ${lotusY + 10} L 195 ${lotusY + 5} Z`,
    number: 7,
    center: { x: 200, y: lotusY + 5 }
  });

  // Swans
  const addSwan = (isRight: boolean) => {
    const dir = isRight ? 1 : -1;
    const pfx = isRight ? 'r' : 'l';
    const baseX = 200 + 70 * dir;
    const baseY = 270;

    // Body Mass
    paths.push({
      id: `swan-${pfx}-body`,
      d: `M ${200 + 15*dir} 280 C ${200 + 40*dir} 300, ${baseX + 40*dir} 300, ${baseX + 60*dir} 260 C ${baseX + 80*dir} 200, ${baseX - 40*dir} 190, ${baseX - 20*dir} 240 C ${baseX - 10*dir} 270, ${200 + 25*dir} 260, ${200 + 15*dir} 280 Z`,
      number: 8,
      center: { x: baseX + 10*dir, y: 250 }
    });

    // Neck (Forms a heart)
    paths.push({
      id: `swan-${pfx}-neck`,
      d: `M ${baseX - 25*dir} 230 C ${baseX - 40*dir} 150, ${200 + 10*dir} 80, 200 130 C 200 100, ${baseX - 60*dir} 100, ${baseX - 45*dir} 230 Z`,
      number: 9,
      center: { x: baseX - 35*dir, y: 160 }
    });

    // Head
    const headX = 200 + 5*dir;
    const headY = 125;
    paths.push({
      id: `swan-${pfx}-head`,
      d: `M ${headX} ${headY} A 10 10 0 0 ${isRight ? 0 : 1} ${headX + 15*dir} ${headY - 5} L ${headX + 10*dir} ${headY + 12} Z`,
      number: 8,
      center: { x: headX + 7*dir, y: headY + 3 }
    });

    // Beak
    paths.push({
      id: `swan-${pfx}-beak`,
      d: `M 200 130 L ${200 - 15*dir} 145 L ${200 + 5*dir} 135 Z`,
      number: 2,
      center: { x: 200 - 5*dir, y: 138 }
    });

    // Eye
    paths.push({
      id: `swan-${pfx}-eye`,
      d: `M ${headX + 8*dir} 125 A 2 2 0 1 1 ${headX + 8*dir} 126 Z`,
      number: 1,
      center: { x: headX + 8*dir, y: 125 }
    });

    // Elegant Wings (Multiple overlapping feathers extending back & up)
    for (let layer = 0; layer < 4; layer++) {
      const featherCount = 5 - layer;
      for (let f = 0; f < featherCount; f++) {
        const angle = -0.5 + (f * 0.2) + (layer * 0.1);
        const l = 60 + f * 15 - layer * 5;
        const startX = baseX + (10 + layer * 10) * dir;
        const startY = baseY - 20 - layer * 10;
        
        const tipX = startX + Math.cos(angle) * l * dir;
        const tipY = startY + Math.sin(angle) * l;
        
        paths.push({
          id: `swan-${pfx}-w-l${layer}-f${f}`,
          d: `M ${startX} ${startY} Q ${startX + l * 0.5 * dir} ${startY - 20} ${tipX} ${tipY} Q ${startX + l * 0.3 * dir} ${startY + 20} ${startX} ${startY + 10} Z`,
          number: (layer % 2 === 0) ? 8 : 9,
          center: { x: startX + Math.cos(angle) * l * 0.5 * dir, y: startY + Math.sin(angle) * l * 0.5 }
        });
        
        // Inner feather detail
        paths.push({
          id: `swan-${pfx}-w-d-l${layer}-f${f}`,
          d: `M ${startX} ${startY + 5} L ${tipX * 0.8 + startX * 0.2} ${tipY * 0.8 + startY * 0.2}`,
          number: 5,
          center: { x: (startX + tipX) / 2, y: (startY + tipY) / 2 }
        });
      }
    }
  };

  addSwan(false);
  addSwan(true);

  // Sparkling Stars
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    const r = 130 + Math.random() * 30;
    const sx = 200 + Math.cos(angle) * r;
    const sy = 160 + Math.sin(angle) * r;
    if (sy < 280) { // Don't draw stars in water
      paths.push({
        id: `star-${i}`,
        d: `M ${sx} ${sy-5} L ${sx+1} ${sy-1} L ${sx+5} ${sy} L ${sx+1} ${sy+1} L ${sx} ${sy+5} L ${sx-1} ${sy+1} L ${sx-5} ${sy} L ${sx-1} ${sy-1} Z`,
        number: 4,
        center: { x: sx, y: sy }
      });
    }
  }

  // Small heart center
  paths.push({
    id: `small-heart-center`,
    d: `M 200 155 C 205 145, 215 145, 215 155 C 215 170, 200 180, 200 180 C 200 180, 185 170, 185 155 C 185 145, 195 145, 200 155 Z`,
    number: 7,
    center: { x: 200, y: 160 }
  });

  return paths;
};

export const generateCelestialPhoenix = () => {
  const paths: any[] = [];
  const cx = 200, cy = 200;
  let idCounter = 1;

  // Background Cosmic Aura - more layered and ornate
  for (let layer = 0; layer < 2; layer++) {
    const r1 = 140 + layer * 30;
    const r2 = 180 + layer * 20;
    const opacity = layer === 0 ? 0.3 : 0.1;
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 + (layer * Math.PI / 12);
      const nextA = angle + (Math.PI * 2) / 12;
      
      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(nextA) * r1;
      const y2 = cy + Math.sin(nextA) * r1;
      const cpX = cx + Math.cos(angle + Math.PI/12) * r2;
      const cpY = cy + Math.sin(angle + Math.PI/12) * r2;

      paths.push({
        id: `aura-l${layer}-${i}`,
        d: `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2} L ${cx} ${cy} Z`,
        number: 8,
        center: { x: cx + Math.cos(angle + Math.PI/12) * 110, y: cy + Math.sin(angle + Math.PI/12) * 110 }
      });
    }
  }

  // Tail feathers - Masterpiece level detail
  const addTailFeather = (angle: number, length: number, baseWidth: number, index: number) => {
    const segments = 5;
    for (let s = 0; s < segments; s++) {
      const t1 = s / segments;
      const t2 = (s + 1) / segments;
      const l1 = 35 + t1 * length;
      const l2 = 35 + t2 * length;
      
      const width1 = baseWidth * (1 - t1 * 0.6);
      const width2 = baseWidth * (1 - t2 * 0.6);
      
      // Points for a tapered, segmented feather
      const p1 = { x: cx + Math.cos(angle - width1) * l1, y: cy + 40 + Math.sin(angle - width1) * l1 };
      const p2 = { x: cx + Math.cos(angle + width1) * l1, y: cy + 40 + Math.sin(angle + width1) * l1 };
      const p3 = { x: cx + Math.cos(angle + width2) * l2, y: cy + 40 + Math.sin(angle + width2) * l2 };
      const p4 = { x: cx + Math.cos(angle - width2) * l2, y: cy + 40 + Math.sin(angle - width2) * l2 };

      const curvature = 25 * Math.sin(t1 * Math.PI) * (index % 2 === 0 ? 1 : -1);
      
      paths.push({
        id: `tail-f${index}-s${s}`,
        d: `M ${p1.x} ${p1.y} Q ${p1.x + curvature} ${p1.y + curvature} ${p4.x} ${p4.y} L ${p3.x} ${p3.y} Q ${p2.x + curvature} ${p2.y + curvature} ${p2.x} ${p2.y} Z`,
        number: (index % 4) + 1,
        center: { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 }
      });

      // Central shaft
      if (s < segments - 1) {
          paths.push({
              id: `tail-shaft-${index}-${s}`,
              d: `M ${cx + Math.cos(angle) * l1} ${cy + 40 + Math.sin(angle) * l1} L ${cx + Math.cos(angle) * l2} ${cy + 40 + Math.sin(angle) * l2}`,
              number: 9,
              center: { x: cx + Math.cos(angle) * (l1 + 5), y: cy + 40 + Math.sin(angle) * (l1 + 5) }
          });
      }
      
      // Ornate Eyelet/Gem at the tip
      if (s === segments - 1) {
        const eyeR = 14;
        const ex = cx + Math.cos(angle) * (l2 + 12);
        const ey = cy + 40 + Math.sin(angle) * (l2 + 12);
        
        // Outer eye
        paths.push({
          id: `tail-eye-out-${index}`,
          d: `M ${ex - eyeR} ${ey} A ${eyeR} ${eyeR} 0 1 0 ${ex + eyeR} ${ey} A ${eyeR} ${eyeR} 0 1 0 ${ex - eyeR} ${ey} Z`,
          number: 5,
          center: { x: ex, y: ey }
        });
        
        // Inner eye/glow
        paths.push({
            id: `tail-eye-in-${index}`,
            d: `M ${ex - eyeR * 0.6} ${ey} A ${eyeR * 0.6} ${eyeR * 0.6} 0 1 0 ${ex + eyeR * 0.6} ${ey} A ${eyeR * 0.6} ${eyeR * 0.6} 0 1 0 ${ex - eyeR * 0.6} ${ey} Z`,
            number: 7,
            center: { x: ex, y: ey }
        });
      }
    }
  };

  for (let i = 0; i < 11; i++) {
    const angle = Math.PI * 0.3 + i * 0.14;
    addTailFeather(angle, 150 + i * 12, 0.14, i);
  }

  // Flame Wisps emanating from the center
  for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
      const x1 = cx + Math.cos(angle) * 30;
      const y1 = cy + Math.sin(angle) * 30;
      const tipX = cx + Math.cos(angle) * 80;
      const tipY = cy + Math.sin(angle) * 80;
      const cp1x = cx + Math.cos(angle - 0.5) * 60;
      const cp1y = cy + Math.sin(angle - 0.5) * 60;
      const cp2x = cx + Math.cos(angle + 0.5) * 60;
      const cp2y = cy + Math.sin(angle + 0.5) * 60;

      paths.push({
          id: `flame-wisp-${i}`,
          d: `M ${x1} ${y1} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${x1} ${y1} Z`,
          number: 2,
          center: { x: (x1 + tipX)/2, y: (y1 + tipY)/2 }
      });
  }

  // Wings - Hyper-detailed multi-layered plumage
  const addDetailedWing = (isRight: boolean) => {
    const dir = isRight ? 1 : -1;
    const startA = isRight ? -0.4 : Math.PI + 0.4;
    const endA = isRight ? 1.5 : Math.PI - 1.5;
    
    for (let layer = 0; layer < 4; layer++) {
      const radius = 45 + layer * 30;
      const featherCount = 12 + layer * 2;
      const fLength = 45 + layer * 18;
      
      for (let i = 0; i < featherCount; i++) {
        const t = i / featherCount;
        const angle = startA + t * (endA - startA);
        const nextA = startA + ((i + 0.9) / featherCount) * (endA - startA);
        
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius - 40;
        const x2 = cx + Math.cos(nextA) * radius;
        const y2 = cy + Math.sin(nextA) * radius - 40;
        
        const tipX = cx + Math.cos((angle + nextA) / 2) * (radius + fLength);
        const tipY = cy + Math.sin((angle + nextA) / 2) * (radius + fLength) - 50;
        
        // Outer feather shape
        paths.push({
          id: `wing-${isRight ? 'r' : 'l'}-l${layer}-f${i}`,
          d: `M ${x1} ${y1} Q ${cx + Math.cos(angle) * (radius + fLength * 0.6)} ${cy + Math.sin(angle) * (radius + fLength * 0.6) - 45} ${tipX} ${tipY} Q ${cx + Math.cos(nextA) * (radius + fLength * 0.6)} ${cy + Math.sin(nextA) * (radius + fLength * 0.6) - 45} ${x2} ${y2} Z`,
          number: (layer % 3) + 3,
          center: { x: tipX * 0.7 + x1 * 0.3, y: tipY * 0.7 + y1 * 0.3 }
        });
        
        // Intricate feather pattern/veins
        const midPointX = (x1 + x2) / 2;
        const midPointY = (y1 + y2) / 2;
        paths.push({
           id: `wing-v-${isRight ? 'r' : 'l'}-l${layer}-f${i}`,
           d: `M ${midPointX} ${midPointY} L ${tipX * 0.8 + cx * 0.2} ${tipY * 0.8 + (cy - 40) * 0.2}`,
           number: 1,
           center: { x: (midPointX + tipX)/2, y: (midPointY + tipY)/2 }
        });

        // Small accents at base of feathers
        if (layer > 0) {
            const rx = cx + Math.cos(angle) * (radius - 5);
            const ry = cy + Math.sin(angle) * (radius - 5) - 40;
            paths.push({
                id: `wing-acc-${isRight ? 'r' : 'l'}-l${layer}-f${i}`,
                d: `M ${rx-3} ${ry} A 3 3 0 1 0 ${rx+3} ${ry} A 3 3 0 1 0 ${rx-3} ${ry} Z`,
                number: 7,
                center: { x: rx, y: ry }
            });
        }
      }
    }
  };

  addDetailedWing(false);
  addDetailedWing(true);

  // Body Plumage - structured geometric rows
  for (let row = 0; row < 6; row++) {
      const rowY = cy - 60 + row * 15;
      const feathersInRow = 3 + row;
      for (let i = 0; i < feathersInRow; i++) {
          const offsetX = (i - (feathersInRow - 1) / 2) * 15;
          const px = cx + offsetX;
          const py = rowY;
          const w = 10;
          const h = 18;
          paths.push({
              id: `body-v2-r${row}-f${i}`,
              d: `M ${px} ${py} C ${px-w} ${py+h*0.4}, ${px-w*0.5} ${py+h}, ${px} ${py+h} C ${px+w*0.5} ${py+h}, ${px+w} ${py+h*0.4}, ${px} ${py} Z`,
              number: (row % 3) + 4,
              center: { x: px, y: py + h/2 }
          });
      }
  }

  // Neck and Regal Head Profile
  paths.push({
    id: `regal-neck`,
    d: `M 188 100 Q 185 45 200 35 Q 215 45 212 100 Z`,
    number: 5,
    center: { x: 200, y: 65 }
  });

  // Head with layered crest
  paths.push({
    id: `regal-head`,
    d: `M 200 35 C 182 35, 185 0, 200 -5 C 215 0, 218 35, 200 35 Z`,
    number: 6,
    center: { x: 200, y: 15 }
  });

  // Flowing Crest Wisps
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI/2 + (i - 2.5) * 0.25;
    const length = 45 + i * 6;
    const tipX = 200 + Math.cos(angle) * length;
    const tipY = 15 + Math.sin(angle) * length;
    paths.push({
      id: `crest-v2-${i}`,
      d: `M 200 10 Q 200 + ${Math.cos(angle-0.1)*length*0.5} 10 + ${Math.sin(angle-0.1)*length*0.5} ${tipX} ${tipY} Q 200 + ${Math.cos(angle+0.1)*length*0.5} 10 + ${Math.sin(angle+0.1)*length*0.5} 200 10 Z`,
      number: 7,
      center: { x: 200 + Math.cos(angle) * 25, y: 10 + Math.sin(angle) * 25 }
    });
  }

  // Beak - sharper and more defined
  paths.push({
    id: `regal-beak-up`,
    d: `M 213 22 L 235 26 L 213 30 Z`,
    number: 1,
    center: { x: 224, y: 26 }
  });
  paths.push({
    id: `regal-beak-low`,
    d: `M 213 30 L 228 31 L 213 33 Z`,
    number: 1,
    center: { x: 220, y: 31 }
  });

  // Sharp Celestial Eye
  paths.push({
    id: `celestial-eye-outer`,
    d: `M 203 20 A 4 4 0 1 0 203 19 Z`,
    number: 9,
    center: { x: 203, y: 20 }
  });
  paths.push({
    id: `celestial-eye-inner`,
    d: `M 203 20 A 1.5 1.5 0 1 0 203 19 Z`,
    number: 8,
    center: { x: 203, y: 20 }
  });

  return paths;
};
