import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, ArrowLeftRight, Save, Download, Sparkles, Wand2, ChevronLeft, Brush, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { generateDetailedMandala, generateMajesticButterfly } from './complexArtworks';

interface SessionInfo {
  therapeutic_intro: string;
  palette: Record<string, { hex: string, theme: string }>;
  mid_coloring_prompt: string;
  completion_affirmation: string;
}

const PALETTES = {
  celestial: [
    '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ecfeff',
    '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#f0f9ff',
    '#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#f5f3ff',
    '#be185d', '#db2777', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'
  ],
  pastel: [
    '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48',
    '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c',
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706',
    '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'
  ],
  earth: [
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706',
    '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d',
    '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c',
    '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563'
  ]
};

type PaletteName = keyof typeof PALETTES | 'ai' | 'classic';

const PALETTE_NAMES: { id: PaletteName; label: string }[] = [
  { id: 'classic', label: 'Color by Number' },
  { id: 'celestial', label: 'Celestial' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'earth', label: 'Earth Tones' },
  { id: 'ai', label: 'AI Guided' }
];

interface PathObj {
  id: string;
  d: string;
  isSymmetric?: boolean;
  mirrorId?: string;
  number?: number;
  center?: { x: number, y: number };
}

interface Artwork {
  id: string;
  name: string;
  paths: PathObj[];
  viewBox: string;
  classicPalette?: string[];
  category?: 'Butterflies' | 'Nature' | 'Geometric' | 'Abstract' | 'Love';
}

const ARTWORKS: Artwork[] = [
  {
    id: 'monarch-journey',
    name: 'Monarch Journey',
    viewBox: '0 0 200 200',
    category: 'Butterflies',
    classicPalette: ['#f97316', '#ea580c', '#c2410c', '#fcd34d', '#0f172a', '#e2e8f0'],
    paths: [
      { id: 'mj-ol', d: 'M100 100 C70 40, 20 20, 20 60 C20 100, 60 120, 100 100', number: 1, center: {x: 50, y: 70} },
      { id: 'mj-or', d: 'M100 100 C130 40, 180 20, 180 60 C180 100, 140 120, 100 100', number: 1, center: {x: 150, y: 70} },
      { id: 'mj-il1', d: 'M90 95 C65 60, 40 40, 40 65 C40 85, 65 100, 90 95', number: 2, center: {x: 65, y: 75} },
      { id: 'mj-ir1', d: 'M110 95 C135 60, 160 40, 160 65 C160 85, 135 100, 110 95', number: 2, center: {x: 135, y: 75} },
      { id: 'mj-il2', d: 'M80 85 C60 60, 50 50, 50 65 C50 75, 65 90, 80 85', number: 3, center: {x: 65, y: 70} },
      { id: 'mj-ir2', d: 'M120 85 C140 60, 150 50, 150 65 C150 75, 135 90, 120 85', number: 3, center: {x: 135, y: 70} },
      { id: 'mj-dot-l1', d: 'M30 65 A 3 3 0 1 0 30 64 Z', number: 6, center: {x: 30, y: 65} },
      { id: 'mj-dot-r1', d: 'M170 65 A 3 3 0 1 0 170 64 Z', number: 6, center: {x: 170, y: 65} },
      { id: 'mj-ll', d: 'M100 100 C70 140, 40 160, 40 140 C40 120, 70 110, 100 100', number: 1, center: {x: 60, y: 130} },
      { id: 'mj-lr', d: 'M100 100 C130 140, 160 160, 160 140 C160 120, 130 110, 100 100', number: 1, center: {x: 140, y: 130} },
      { id: 'mj-lin1', d: 'M95 105 C75 130, 55 140, 55 135 C55 125, 75 115, 95 105', number: 4, center: {x: 70, y: 125} },
      { id: 'mj-rin1', d: 'M105 105 C125 130, 145 140, 145 135 C145 125, 125 115, 105 105', number: 4, center: {x: 130, y: 125} },
      { id: 'mj-body', d: 'M95 40 C105 40, 105 160, 95 160 C85 160, 85 40, 95 40 Z', number: 5, center: {x: 100, y: 100} },
      { id: 'ant-left', d: 'M95 40 Q80 20 70 10' },
      { id: 'ant-right', d: 'M105 40 Q120 20 130 10' }
    ]
  },
  {
    id: 'twin-hearts',
    name: 'Twin Hearts',
    viewBox: '0 0 200 200',
    category: 'Love',
    classicPalette: ['#f43f5e', '#e11d48', '#be185d', '#fda4af', '#fecdd3', '#16a34a', '#86efac'],
    paths: [
      { id: 'lh-out1', d: 'M80 120 C80 120, 30 90, 30 60 C30 40, 60 40, 80 60 Z', number: 1, center: {x: 55, y: 70}, mirrorId: 'rh-out2' },
      { id: 'lh-out2', d: 'M80 120 C80 120, 130 90, 130 60 C130 40, 100 40, 80 60 Z', number: 2, center: {x: 105, y: 70}, mirrorId: 'rh-out1' },
      { id: 'lh-in1', d: 'M80 105 C80 105, 45 85, 45 65 C45 50, 65 50, 80 65 Z', number: 3, center: {x: 65, y: 70}, mirrorId: 'rh-in2' },
      { id: 'lh-in2', d: 'M80 105 C80 105, 115 85, 115 65 C115 50, 95 50, 80 65 Z', number: 4, center: {x: 95, y: 70}, mirrorId: 'rh-in1' },
      { id: 'rh-out1', d: 'M130 140 C130 140, 80 110, 80 80 C80 60, 110 60, 130 80 Z', number: 2, center: {x: 105, y: 90}, mirrorId: 'lh-out2' },
      { id: 'rh-out2', d: 'M130 140 C130 140, 180 110, 180 80 C180 60, 150 60, 130 80 Z', number: 1, center: {x: 155, y: 90}, mirrorId: 'lh-out1' },
      { id: 'rh-in1', d: 'M130 125 C130 125, 95 105, 95 85 C95 70, 115 70, 130 85 Z', number: 4, center: {x: 115, y: 90}, mirrorId: 'lh-in2' },
      { id: 'rh-in2', d: 'M130 125 C130 125, 165 105, 165 85 C165 70, 145 70, 130 85 Z', number: 3, center: {x: 145, y: 90}, mirrorId: 'lh-in1' },
      { id: 'vine-1', d: 'M20 180 Q40 160, 30 140 T50 100 Z', number: 6, center: {x: 35, y: 150} },
      { id: 'vine-2', d: 'M180 20 Q160 40, 170 60 T150 100 Z', number: 6, center: {x: 165, y: 50} },
      { id: 'leaf-1', d: 'M30 140 C20 130, 20 120, 30 120 C40 120, 40 130, 30 140 Z', number: 7, center: {x: 30, y: 125} },
      { id: 'leaf-2', d: 'M50 100 C40 90, 40 80, 50 80 C60 80, 60 90, 50 100 Z', number: 7, center: {x: 50, y: 85} },
      { id: 'leaf-3', d: 'M170 60 C180 70, 180 80, 170 80 C160 80, 160 70, 170 60 Z', number: 7, center: {x: 170, y: 75} },
      { id: 'leaf-4', d: 'M150 100 C160 110, 160 120, 150 120 C140 120, 140 110, 150 100 Z', number: 7, center: {x: 150, y: 105} }
    ]
  },
  {
    id: 'mountain-sunrise',
    name: 'Mountain Sunrise',
    viewBox: '0 0 200 200',
    category: 'Nature',
    classicPalette: ['#fcd34d', '#f59e0b', '#f43f5e', '#3b82f6', '#1e3a8a', '#10b981', '#064e3b'],
    paths: [
      { id: 'sun', d: 'M100 120 A 40 40 0 1 0 100 40 A 40 40 0 1 0 100 120 Z', number: 1, center: {x: 100, y: 80} },
      { id: 'sky-rays1', d: 'M0 0 L100 80 L0 50 Z', number: 2, center: {x: 30, y: 40} },
      { id: 'sky-rays2', d: 'M0 0 L100 0 L100 80 Z', number: 3, center: {x: 60, y: 20} },
      { id: 'sky-rays3', d: 'M100 0 L200 0 L100 80 Z', number: 3, center: {x: 140, y: 20} },
      { id: 'sky-rays4', d: 'M200 0 L200 50 L100 80 Z', number: 2, center: {x: 170, y: 40} },
      { id: 'mntn-bg-l', d: 'M0 160 L60 80 L120 160 Z', number: 5, center: {x: 60, y: 130} },
      { id: 'mntn-bg-r', d: 'M80 160 L140 70 L200 160 Z', number: 5, center: {x: 140, y: 130} },
      { id: 'mntn-fg-m', d: 'M40 200 L100 110 L160 200 Z', number: 4, center: {x: 100, y: 160} },
      { id: 'ground', d: 'M0 160 L200 160 L200 200 L0 200 Z', number: 6, center: {x: 100, y: 180} },
      { id: 'tree-1', d: 'M20 180 L30 150 L40 180 Z', number: 7, center: {x: 30, y: 170} },
      { id: 'tree-2', d: 'M160 180 L170 140 L180 180 Z', number: 7, center: {x: 170, y: 165} }
    ]
  },
  {
    id: 'butterfly',
    name: 'Eternal Butterfly',
    viewBox: '0 0 200 200',
    classicPalette: ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#818cf8'],
    paths: [
      // Left Wing Upper - Highly Detailed
      { id: 'ul-outer', d: 'M100 100 C70 40, 5 15, 10 55 C12 70, 30 110, 100 100', mirrorId: 'ur-outer', number: 1, center: {x: 40, y: 50} },
      { id: 'ul-v1', d: 'M100 100 C80 60, 40 40, 30 55', mirrorId: 'ur-v1', number: 2, center: {x: 60, y: 60} },
      { id: 'ul-v2', d: 'M100 100 C70 80, 50 90, 40 100', mirrorId: 'ur-v2', number: 3, center: {x: 60, y: 85} },
      { id: 'ul-cell-1', d: 'M90 95 C75 70, 45 45, 30 55 C25 60, 45 80, 90 95', mirrorId: 'ur-cell-1', number: 4, center: {x: 50, y: 70} },
      { id: 'ul-cell-2', d: 'M80 85 C65 65, 50 55, 40 60 C35 65, 50 75, 80 85', mirrorId: 'ur-cell-2', number: 5, center: {x: 55, y: 65} },
      { id: 'ul-cell-3', d: 'M70 75 C60 60, 55 55, 50 60 C45 65, 55 70, 70 75', mirrorId: 'ur-cell-3', number: 6, center: {x: 58, y: 62} },
      { id: 'ul-det-1', d: 'M50 30 Q40 20 30 35 Q40 45 50 30', mirrorId: 'ur-det-1', number: 1, center: {x: 40, y: 32} },
      { id: 'ul-det-2', d: 'M25 60 Q15 50 20 70 Q30 80 25 60', mirrorId: 'ur-det-2', number: 2, center: {x: 22, y: 65} },
      { id: 'ul-dot-1', d: 'M15 45 A 4 4 0 1 0 15 44 Z', mirrorId: 'ur-dot-1' },
      { id: 'ul-dot-2', d: 'M40 30 A 3 3 0 1 0 40 29 Z', mirrorId: 'ur-dot-2' },
      { id: 'ul-dot-3', d: 'M60 25 A 2 2 0 1 0 60 24 Z', mirrorId: 'ur-dot-3' },
      
      // Right Wing Upper
      { id: 'ur-outer', d: 'M100 100 C130 40, 195 15, 190 55 C188 70, 170 110, 100 100', mirrorId: 'ul-outer', number: 1, center: {x: 160, y: 50} },
      { id: 'ur-v1', d: 'M100 100 C120 60, 160 40, 170 55', mirrorId: 'ul-v1', number: 2, center: {x: 140, y: 60} },
      { id: 'ur-v2', d: 'M100 100 C130 80, 150 90, 160 100', mirrorId: 'ul-v2', number: 3, center: {x: 140, y: 85} },
      { id: 'ur-cell-1', d: 'M110 95 C125 70, 155 45, 170 55 C175 60, 155 80, 110 95', mirrorId: 'ul-cell-1', number: 4, center: {x: 150, y: 70} },
      { id: 'ur-cell-2', d: 'M120 85 C135 65, 150 55, 160 60 C165 65, 150 75, 120 85', mirrorId: 'ul-cell-2', number: 5, center: {x: 145, y: 65} },
      { id: 'ur-cell-3', d: 'M130 75 C140 60, 145 55, 150 60 C155 65, 145 70, 130 75', mirrorId: 'ul-cell-3', number: 6, center: {x: 142, y: 62} },
      { id: 'ur-det-1', d: 'M150 30 Q160 20 170 35 Q160 45 150 30', mirrorId: 'ul-det-1', number: 1, center: {x: 160, y: 32} },
      { id: 'ur-det-2', d: 'M175 60 Q185 50 180 70 Q170 80 175 60', mirrorId: 'ul-det-2', number: 2, center: {x: 178, y: 65} },
      { id: 'ur-dot-1', d: 'M185 45 A 4 4 0 1 0 185 44 Z', mirrorId: 'ul-dot-1' },
      { id: 'ur-dot-2', d: 'M160 30 A 3 3 0 1 0 160 29 Z', mirrorId: 'ul-dot-2' },
      { id: 'ur-dot-3', d: 'M140 25 A 2 2 0 1 0 140 24 Z', mirrorId: 'ul-dot-3' },

      // Left Wing Lower
      { id: 'll-outer', d: 'M100 100 C70 130, 30 180, 20 160 C10 140, 50 110, 100 100', mirrorId: 'lr-outer', number: 3, center: {x: 45, y: 140} },
      { id: 'll-v1', d: 'M100 100 Q60 140 40 160', mirrorId: 'lr-v1', number: 4, center: {x: 65, y: 145} },
      { id: 'll-cell-1', d: 'M95 110 C80 130, 50 160, 40 155 C35 150, 60 120, 95 110', mirrorId: 'lr-cell-1', number: 5, center: {x: 70, y: 135} },
      { id: 'll-cell-2', d: 'M85 120 C75 135, 60 150, 55 145 C50 140, 70 125, 85 120', mirrorId: 'lr-cell-2', number: 6, center: {x: 75, y: 130} },
      { id: 'll-det-1', d: 'M50 170 Q30 180 35 150 Q55 140 50 170', mirrorId: 'lr-det-1', number: 3, center: {x: 45, y: 160} },
      { id: 'll-dot-1', d: 'M25 150 A 6 6 0 1 0 25 149 Z', mirrorId: 'lr-dot-1' },
      { id: 'll-dot-2', d: 'M45 175 A 3 3 0 1 0 45 174 Z', mirrorId: 'lr-dot-2' },
      
      // Right Wing Lower
      { id: 'lr-outer', d: 'M100 100 C130 130, 170 180, 180 160 C190 140, 150 110, 100 100', mirrorId: 'll-outer', number: 3, center: {x: 155, y: 140} },
      { id: 'lr-v1', d: 'M100 100 Q140 140 160 160', mirrorId: 'll-v1', number: 4, center: {x: 135, y: 145} },
      { id: 'lr-cell-1', d: 'M105 110 C120 130, 150 160, 160 155 C165 150, 140 120, 105 110', mirrorId: 'll-cell-1', number: 5, center: {x: 130, y: 135} },
      { id: 'lr-cell-2', d: 'M115 120 C125 135, 140 150, 145 145 C150 140, 130 125, 115 120', mirrorId: 'll-cell-2', number: 6, center: {x: 125, y: 130} },
      { id: 'lr-det-1', d: 'M150 170 Q170 180 165 150 Q145 140 150 170', mirrorId: 'll-det-1', number: 3, center: {x: 155, y: 160} },
      { id: 'lr-dot-1', d: 'M175 150 A 6 6 0 1 0 175 149 Z', mirrorId: 'll-dot-1' },
      { id: 'lr-dot-2', d: 'M155 175 A 3 3 0 1 0 155 174 Z', mirrorId: 'll-dot-2' },

      // Body 
      { id: 'body-segment-1', d: 'M100 45 C105 50, 105 55, 100 60 C95 55, 95 50, 100 45', number: 6, center: {x: 100, y: 52} },
      { id: 'body-segment-2', d: 'M100 60 C110 75, 110 95, 100 105 C90 95, 90 75, 100 60', number: 6, center: {x: 100, y: 82} },
      { id: 'body-segment-3', d: 'M100 105 C110 125, 105 155, 100 165 C95 155, 90 125, 100 105', number: 6, center: {x: 100, y: 135} },
      
      // Antennae
      { id: 'ant-l', d: 'M98 48 Q85 30 75 15' },
      { id: 'ant-r', d: 'M102 48 Q115 30 125 15' }
    ]
  },
  {
    id: 'lotus',
    name: 'Sacred Lotus',
    viewBox: '0 0 200 200',
    paths: [
      // Central Petal
      { id: 'petal-c-outer', d: 'M100 160 C90 140, 80 100, 100 60 C120 100, 110 140, 100 160' },
      { id: 'petal-c-m1', d: 'M100 150 C95 135, 88 110, 100 80 C112 110, 105 135, 100 150' },
      { id: 'petal-c-m2', d: 'M100 140 C97 130, 92 115, 100 95 C108 115, 103 130, 100 140' },
      
      // Left Upper Petal
      { id: 'petal-lu-outer', d: 'M95 155 C70 145, 50 110, 70 70 C85 90, 95 130, 95 155', mirrorId: 'petal-ru-outer' },
      { id: 'petal-lu-m1', d: 'M90 145 C75 140, 60 115, 75 85 C83 100, 90 125, 90 145', mirrorId: 'petal-ru-m1' },
      { id: 'petal-lu-m2', d: 'M85 135 C75 130, 65 115, 75 95 Q82 110 85 135', mirrorId: 'petal-ru-m2' },
      
      // Right Upper Petal
      { id: 'petal-ru-outer', d: 'M105 155 C130 145, 150 110, 130 70 C115 90, 105 130, 105 155', mirrorId: 'petal-lu-outer' },
      { id: 'petal-ru-m1', d: 'M110 145 C125 140, 140 115, 125 85 C117 100, 110 125, 110 145', mirrorId: 'petal-lu-m1' },
      { id: 'petal-ru-m2', d: 'M115 135 C125 130, 135 115, 125 95 Q118 110 115 135', mirrorId: 'petal-lu-m2' },
      
      // Left Side Petal
      { id: 'petal-ls-outer', d: 'M90 160 C60 160, 30 140, 40 100 C55 115, 80 140, 90 160', mirrorId: 'petal-rs-outer' },
      { id: 'petal-ls-m1', d: 'M85 155 C65 155, 45 140, 52 110 C62 125, 78 145, 85 155', mirrorId: 'petal-rs-m1' },
      { id: 'petal-ls-m2', d: 'M80 150 C65 150, 55 140, 60 120 Q68 130 80 150', mirrorId: 'petal-rs-m2' },
      
      // Right Side Petal
      { id: 'petal-rs-outer', d: 'M110 160 C140 160, 170 140, 160 100 C145 115, 120 140, 110 160', mirrorId: 'petal-ls-outer' },
      { id: 'petal-rs-m1', d: 'M115 155 C135 155, 155 140, 148 110 C138 125, 122 145, 115 155', mirrorId: 'petal-ls-m1' },
      { id: 'petal-rs-m2', d: 'M120 150 C135 150, 145 140, 140 120 Q132 130 120 150', mirrorId: 'petal-ls-m2' },
      
      // Lower Petals
      { id: 'petal-lb-outer', d: 'M95 165 C70 175, 40 170, 50 145 C65 155, 85 160, 95 165', mirrorId: 'petal-rb-outer' },
      { id: 'petal-lb-m1', d: 'M90 168 Q65 180 55 160 Q75 160 90 168', mirrorId: 'petal-rb-m1' },
      
      { id: 'petal-rb-outer', d: 'M105 165 C130 175, 160 170, 150 145 C135 155, 115 160, 105 165', mirrorId: 'petal-lb-outer' },
      { id: 'petal-rb-m1', d: 'M110 168 Q135 180 145 160 Q125 160 110 168', mirrorId: 'petal-lb-m1' },
      
      // Core Detailed
      { id: 'core-shadow', d: 'M100 158 A 15 10 0 1 0 100 157 Z' },
      { id: 'core-rim', d: 'M100 155 A 10 6 0 1 0 100 154 Z' },
      { id: 'core-center', d: 'M100 155 A 5 3 0 1 0 100 154 Z' },
      { id: 'core-dot-1', d: 'M95 153 A 1 1 0 1 0 95 152 Z' },
      { id: 'core-dot-2', d: 'M105 153 A 1 1 0 1 0 105 152 Z' },
      { id: 'core-dot-3', d: 'M100 157 A 1 1 0 1 0 100 156 Z' }
    ]
  },
  {
    id: 'mandala',
    name: 'Mandala of Peace',
    viewBox: '0 0 200 200',
    paths: [
      // Detailed Layered Mandala
      { id: 'm-core', d: 'M100 100 A 8 8 0 1 0 100 92 A 8 8 0 1 0 100 108 Z' },
      { id: 'm-core-dot', d: 'M100 100 A 3 3 0 1 0 100 97 Z' },
      
      // Ring 1 (Petals)
      { id: 'm-r1-p1', d: 'M100 92 Q105 85 110 92 Q105 100 100 92', mirrorId: 'm-r1-p5' },
      { id: 'm-r1-p2', d: 'M108 96 Q115 95 115 102 Q108 105 108 96', mirrorId: 'm-r1-p6' },
      { id: 'm-r1-p3', d: 'M100 108 Q95 115 90 108 Q95 100 100 108', mirrorId: 'm-r1-p7' },
      { id: 'm-r1-p4', d: 'M92 96 Q85 95 85 102 Q92 105 92 96', mirrorId: 'm-r1-p8' },
      { id: 'm-r1-p5', d: 'M100 108 Q105 115 110 108 Q105 100 100 108', mirrorId: 'm-r1-p1' },
      { id: 'm-r1-p6', d: 'M92 104 Q85 105 85 98 Q92 95 92 104', mirrorId: 'm-r1-p2' },
      { id: 'm-r1-p7', d: 'M100 92 Q95 85 90 92 Q95 100 100 92', mirrorId: 'm-r1-p3' },
      { id: 'm-r1-p8', d: 'M108 104 Q115 105 115 98 Q108 95 108 104', mirrorId: 'm-r1-p4' },
      
      // Ring 2 (Geometric)
      { id: 'm-r2-s1', d: 'M100 85 L115 92 L100 100 L85 92 Z', mirrorId: 'm-r2-s3' },
      { id: 'm-r2-s2', d: 'M115 100 L108 115 L100 100 L108 85 Z', mirrorId: 'm-r2-s4' },
      { id: 'm-r2-s3', d: 'M100 115 L85 108 L100 100 L115 108 Z', mirrorId: 'm-r2-s1' },
      { id: 'm-r2-s4', d: 'M85 100 L92 85 L100 100 L92 115 Z', mirrorId: 'm-r2-s2' },
      
      // Ring 3 (Large Petals)
      { id: 'm-r3-p1', d: 'M100 75 C120 65, 135 80, 125 100 C115 85, 105 80, 100 75', mirrorId: 'm-r3-p3' },
      { id: 'm-r3-p2', d: 'M125 100 C135 120, 120 135, 100 125 C115 115, 120 105, 125 100', mirrorId: 'm-r3-p4' },
      { id: 'm-r3-p3', d: 'M100 125 C80 135, 65 120, 75 100 C85 115, 95 120, 100 125', mirrorId: 'm-r3-p1' },
      { id: 'm-r3-p4', d: 'M75 100 C65 80, 80 65, 100 75 C85 85, 80 95, 75 100', mirrorId: 'm-r3-p2' },
      
      // Ring 4 (Arches)
      { id: 'm-r4-a1', d: 'M100 60 A 40 40 0 0 1 140 100 L 130 100 A 30 30 0 0 0 100 70 Z', mirrorId: 'm-r4-a3' },
      { id: 'm-r4-a2', d: 'M140 100 A 40 40 0 0 1 100 140 L 100 130 A 30 30 0 0 0 130 100 Z', mirrorId: 'm-r4-a4' },
      { id: 'm-r4-a3', d: 'M100 140 A 40 40 0 0 1 60 100 L 70 100 A 30 30 0 0 0 100 130 Z', mirrorId: 'm-r4-a1' },
      { id: 'm-r4-a4', d: 'M60 100 A 40 40 0 0 1 100 60 L 100 70 A 30 30 0 0 0 70 100 Z', mirrorId: 'm-r4-a2' },
      
      // Outer Detail Ring
      { id: 'm-out-1', d: 'M100 30 Q130 30 150 50 Q170 70 170 100 Q170 130 150 150 Q130 170 100 170 Q70 170 50 150 Q30 130 30 100 Q30 70 50 50 Q70 30 100 30' },
      { id: 'm-out-f1', d: 'M100 40 Q125 40 140 55 L 140 45 Q125 30 100 30 Z', mirrorId: 'm-out-f3' },
      { id: 'm-out-f2', d: 'M160 100 Q160 125 145 140 L 155 140 Q170 125 170 100 Z', mirrorId: 'm-out-f4' },
      { id: 'm-out-f3', d: 'M100 160 Q75 160 60 145 L 60 155 Q75 170 100 170 Z', mirrorId: 'm-out-f1' },
      { id: 'm-out-f4', d: 'M40 100 Q40 75 55 60 L 45 60 Q30 75 30 100 Z', mirrorId: 'm-out-f2' },
      
      // Decorative Dots
      { id: 'm-d-1', d: 'M100 35 A 2 2 0 1 0 100 34 Z', mirrorId: 'm-d-5' },
      { id: 'm-d-2', d: 'M145 55 A 2 2 0 1 0 145 54 Z', mirrorId: 'm-d-6' },
      { id: 'm-d-3', d: 'M165 100 A 2 2 0 1 0 165 99 Z', mirrorId: 'm-d-7' },
      { id: 'm-d-4', d: 'M145 145 A 2 2 0 1 0 145 144 Z', mirrorId: 'm-d-8' },
      { id: 'm-d-5', d: 'M100 165 A 2 2 0 1 0 100 164 Z', mirrorId: 'm-d-1' },
      { id: 'm-d-6', d: 'M55 145 A 2 2 0 1 0 55 144 Z', mirrorId: 'm-d-2' },
      { id: 'm-d-7', d: 'M35 100 A 2 2 0 1 0 35 99 Z', mirrorId: 'm-d-3' },
      { id: 'm-d-8', d: 'M55 55 A 2 2 0 1 0 55 54 Z', mirrorId: 'm-d-4' }
    ]
  },
  {
    id: 'flower',
    name: 'Desert Rose',
    viewBox: '0 0 200 200',
    paths: [
      // Core
      { id: 'rose-c-1', d: 'M100 100 A 6 6 0 1 0 100 92 A 6 6 0 1 0 100 108 Z' },
      { id: 'rose-c-2', d: 'M100 100 A 3 3 0 1 0 100 97 Z' },
      
      // Inner Petal Layer
      { id: 'rose-i1', d: 'M100 94 Q110 85 120 94 Q110 103 100 94', mirrorId: 'rose-i3' },
      { id: 'rose-i2', d: 'M106 100 Q115 110 106 120 Q97 110 106 100', mirrorId: 'rose-i4' },
      { id: 'rose-i3', d: 'M100 106 Q90 115 80 106 Q90 97 100 106', mirrorId: 'rose-i1' },
      { id: 'rose-i4', d: 'M94 100 Q85 90 94 80 Q103 90 94 100', mirrorId: 'rose-i2' },
      
      // Middle Petal Layer
      { id: 'rose-m1', d: 'M100 85 C120 70, 140 85, 130 105 Q115 95 100 85', mirrorId: 'rose-m3' },
      { id: 'rose-m2', d: 'M115 100 C130 120, 115 140, 95 130 Q105 115 115 100', mirrorId: 'rose-m4' },
      { id: 'rose-m3', d: 'M100 115 C80 130, 60 115, 70 95 Q85 105 100 115', mirrorId: 'rose-m1' },
      { id: 'rose-m4', d: 'M85 100 C70 80, 85 60, 105 70 Q95 85 85 100', mirrorId: 'rose-m2' },
      
      // Outer Petal Layer (Large)
      { id: 'rose-o1', d: 'M100 70 C140 40, 180 70, 160 110 Q130 90 100 70', mirrorId: 'rose-o3' },
      { id: 'rose-o2', d: 'M130 100 C160 140, 130 180, 90 160 Q110 130 130 100', mirrorId: 'rose-o4' },
      { id: 'rose-o3', d: 'M100 130 C60 160, 20 130, 40 90 Q70 110 100 130', mirrorId: 'rose-o1' },
      {
    id: 'rose-o4', d: 'M70 100 C40 60, 70 20, 110 40 Q90 70 70 100', mirrorId: 'rose-o2' },
      
      // Decorative Veins
      { id: 'rose-v1', d: 'M110 60 Q130 50 150 60', mirrorId: 'rose-v3' },
      { id: 'rose-v2', d: 'M140 120 Q150 140 140 160', mirrorId: 'rose-v4' },
      { id: 'rose-v3', d: 'M90 140 Q70 150 50 140', mirrorId: 'rose-v1' },
      { id: 'rose-v4', d: 'M60 80 Q50 60 60 40', mirrorId: 'rose-v2' }
    ]
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    viewBox: '0 0 200 200',
    classicPalette: ['#166534', '#15803d', '#22c55e', '#4ade80', '#86efac', '#fde047'],
    paths: [
      // Central Tree Trunk
      { id: 'tree-trunk', d: 'M90 190 Q90 150 100 120 Q110 150 110 190 Z', number: 1, center: {x: 100, y: 160} },
      { id: 'tree-base', d: 'M100 180 Q80 185 70 195 Q100 190 130 195 Q120 185 100 180', number: 2, center: {x: 100, y: 190} },
      
      // Branches
      { id: 'branch-l', d: 'M100 140 Q80 130 60 140 Q75 135 100 145 Z', mirrorId: 'branch-r', number: 1, center: {x: 80, y: 140} },
      { id: 'branch-r', d: 'M100 140 Q120 130 140 140 Q125 135 100 145 Z', mirrorId: 'branch-l', number: 1, center: {x: 120, y: 140} },
      
      // Layers of Leaves/Canopy
      { id: 'leaf-center', d: 'M100 80 Q120 60 100 40 Q80 60 100 80', number: 3, center: {x: 100, y: 60} },
      { id: 'leaf-lu-1', d: 'M85 90 C60 70, 40 80, 60 100 C70 95, 80 95, 85 90', mirrorId: 'leaf-ru-1', number: 4, center: {x: 65, y: 90} },
      { id: 'leaf-ru-1', d: 'M115 90 C140 70, 160 80, 140 100 C130 95, 120 95, 115 90', mirrorId: 'leaf-lu-1', number: 4, center: {x: 135, y: 90} },
      { id: 'leaf-ll-1', d: 'M80 110 C50 100, 30 120, 55 140 C65 130, 75 120, 80 110', mirrorId: 'leaf-rl-1', number: 5, center: {x: 55, y: 125} },
      { id: 'leaf-rl-1', d: 'M120 110 C150 100, 170 120, 145 140 C135 130, 125 120, 120 110', mirrorId: 'leaf-ll-1', number: 5, center: {x: 145, y: 125} },
      
      // Detailed leaves
      { id: 'leaf-det-1', d: 'M100 60 Q110 50 120 65 Q110 75 100 60', mirrorId: 'leaf-det-2', number: 2, center: {x: 110, y: 65} },
      { id: 'leaf-det-2', d: 'M100 60 Q90 50 80 65 Q90 75 100 60', mirrorId: 'leaf-det-1', number: 2, center: {x: 90, y: 65} },
      
      // Flowers at base
      { id: 'flower-1-c', d: 'M70 185 A 3 3 0 1 0 70 184 Z', mirrorId: 'flower-2-c', number: 6, center: {x: 70, y: 185} },
      { id: 'flower-1-p1', d: 'M70 182 Q73 178 76 182 Q73 186 70 182', mirrorId: 'flower-2-p1', number: 6, center: {x: 73, y: 180} },
      { id: 'flower-2-c', d: 'M130 185 A 3 3 0 1 0 130 184 Z', mirrorId: 'flower-1-c', number: 6, center: {x: 130, y: 185} },
      { id: 'flower-2-p1', d: 'M130 182 Q127 178 124 182 Q127 186 130 182', mirrorId: 'flower-1-p1', number: 6, center: {x: 127, y: 180} }
    ]
  },
  {
    id: 'nebula',
    name: 'Cosmic Nebula',
    viewBox: '0 0 200 200',
    paths: [
      // Swirling center
      { id: 'spiral-1', d: 'M100 100 C120 80, 150 100, 130 130 C110 150, 80 130, 70 100 C60 60, 100 40, 140 60' },
      { id: 'spiral-2', d: 'M100 100 C80 120, 50 100, 70 70 C90 50, 120 70, 130 100 C140 140, 100 160, 60 140' },
      
      // Stars
      { id: 'star-1', d: 'M160 40 L163 47 L170 50 L163 53 L160 60 L157 53 L150 50 L157 47 Z' },
      { id: 'star-2', d: 'M40 150 L42 154 L46 156 L42 158 L40 162 L38 158 L34 156 L38 154 Z' },
      { id: 'star-3', d: 'M180 160 L182 163 L185 165 L182 167 L180 170 L178 167 L175 165 L178 163 Z' },
      
      // Planets
      { id: 'planet-1', d: 'M50 50 A 10 10 0 1 0 50 49 Z' },
      { id: 'ring-1-f', d: 'M35 55 Q50 65 65 55 L 63 52 Q50 60 37 52 Z' },
      { id: 'ring-1-b', d: 'M35 45 Q50 35 65 45 L 63 48 Q50 40 37 48 Z' },
      
      // More stars
      { id: 'star-dot-1', d: 'M120 30 A 1.5 1.5 0 1 0 120 29 Z' },
      { id: 'star-dot-2', d: 'M80 170 A 1.5 1.5 0 1 0 80 169 Z' },
      { id: 'star-dot-3', d: 'M180 100 A 2 2 0 1 0 180 99 Z' },
      { id: 'star-dot-4', d: 'M20 80 A 1.5 1.5 0 1 0 20 79 Z' }
    ]
  },
  {
    id: 'harmony',
    name: 'Geometric Harmony',
    viewBox: '0 0 200 200',
    classicPalette: ['#4f46e5', '#7c3aed', '#c026d3', '#db2777', '#f43f5e', '#fb923c'],
    paths: [
      // Central Hexagon
      { id: 'hex-core', d: 'M100 70 L126 85 L126 115 L100 130 L74 115 L74 85 Z', number: 1, center: {x: 100, y: 100} },
      
      // Triangular radiation
      { id: 'tri-u', d: 'M100 70 L115 45 L85 45 Z', mirrorId: 'tri-d', number: 2, center: {x: 100, y: 55} },
      { id: 'tri-d', d: 'M100 130 L115 155 L85 155 Z', mirrorId: 'tri-u', number: 2, center: {x: 100, y: 145} },
      { id: 'tri-ur', d: 'M126 85 L150 70 L150 100 Z', mirrorId: 'tri-ul', number: 3, center: {x: 140, y: 85} },
      { id: 'tri-ul', d: 'M74 85 L50 70 L50 100 Z', mirrorId: 'tri-ur', number: 3, center: {x: 60, y: 85} },
      { id: 'tri-lr', d: 'M126 115 L150 130 L150 100 Z', mirrorId: 'tri-ll', number: 4, center: {x: 140, y: 115} },
      { id: 'tri-ll', d: 'M74 115 L50 130 L50 100 Z', mirrorId: 'tri-lr', number: 4, center: {x: 60, y: 115} },
      
      // Circles
      { id: 'circ-ur', d: 'M150 70 A 20 20 0 1 0 150 69 Z', number: 5, center: {x: 150, y: 70} },
      { id: 'circ-ul', d: 'M50 70 A 20 20 0 1 0 50 69 Z', number: 5, center: {x: 50, y: 70} },
      { id: 'circ-lr', d: 'M150 130 A 20 20 0 1 0 150 129 Z', number: 5, center: {x: 150, y: 130} },
      { id: 'circ-ll', d: 'M50 130 A 20 20 0 1 0 50 129 Z', number: 5, center: {x: 50, y: 130} },
      { id: 'circ-u', d: 'M100 40 A 15 15 0 1 0 100 39 Z', number: 6, center: {x: 100, y: 40} },
      { id: 'circ-d', d: 'M100 160 A 15 15 0 1 0 100 159 Z', number: 6, center: {x: 100, y: 160} },
      
      // Outer border frame
      { id: 'frame-tl', d: 'M10 10 L40 10 L10 40 Z', number: 1, center: {x: 20, y: 20} },
      { id: 'frame-tr', d: 'M190 10 L160 10 L190 40 Z', number: 1, center: {x: 180, y: 20} },
      { id: 'frame-bl', d: 'M10 190 L40 190 L10 160 Z', number: 1, center: {x: 20, y: 180} },
      { id: 'frame-br', d: 'M190 190 L160 190 L190 160 Z', number: 1, center: {x: 180, y: 180} }
    ]
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass Sun',
    viewBox: '0 0 200 200',
    classicPalette: ['#fbbf24', '#f59e0b', '#ea580c', '#e11d48', '#38bdf8', '#6366f1', '#a855f7'],
    paths: [
      { id: 'center-sun', d: 'M100 100 A 20 20 0 1 0 100 99 Z' },
      { id: 'ray-1', d: 'M100 80 L110 40 L90 40 Z', mirrorId: 'ray-5' },
      { id: 'ray-2', d: 'M115 85 L150 50 L135 40 Z', mirrorId: 'ray-6' },
      { id: 'ray-3', d: 'M120 100 L160 110 L160 90 Z', mirrorId: 'ray-7' },
      { id: 'ray-4', d: 'M115 115 L150 150 L135 160 Z', mirrorId: 'ray-8' },
      { id: 'ray-5', d: 'M100 120 L110 160 L90 160 Z', mirrorId: 'ray-1' },
      { id: 'ray-6', d: 'M85 115 L50 150 L65 160 Z', mirrorId: 'ray-2' },
      { id: 'ray-7', d: 'M80 100 L40 110 L40 90 Z', mirrorId: 'ray-3' },
      { id: 'ray-8', d: 'M85 85 L50 50 L65 40 Z', mirrorId: 'ray-4' },
      // Glass shards
      { id: 'shard-1', d: 'M110 40 L135 40 L150 50 L115 85 Z', mirrorId: 'shard-5' },
      { id: 'shard-2', d: 'M150 50 L160 90 L120 100 L115 85 Z', mirrorId: 'shard-6' },
      { id: 'shard-3', d: 'M160 110 L150 150 L115 115 L120 100 Z', mirrorId: 'shard-7' },
      { id: 'shard-4', d: 'M150 150 L135 160 L110 160 L115 115 Z', mirrorId: 'shard-8' },
      { id: 'shard-5', d: 'M90 160 L65 160 L50 150 L85 115 Z', mirrorId: 'shard-1' },
      { id: 'shard-6', d: 'M50 150 L40 110 L80 100 L85 115 Z', mirrorId: 'shard-2' },
      { id: 'shard-7', d: 'M40 90 L50 50 L85 85 L80 100 Z', mirrorId: 'shard-3' },
      { id: 'shard-8', d: 'M50 50 L65 40 L90 40 L85 85 Z', mirrorId: 'shard-4' },
      // Outer rim
      { id: 'rim-1', d: 'M10 10 L65 40 L50 50 L10 90 Z' },
      { id: 'rim-2', d: 'M190 10 L135 40 L150 50 L190 90 Z' },
      { id: 'rim-3', d: 'M190 190 L135 160 L150 150 L190 110 Z' },
      { id: 'rim-4', d: 'M10 190 L65 160 L50 150 L10 110 Z' },
    ]
  },
  {
    id: 'masterpiece-mandala',
    name: 'Masterpiece Mandala',
    viewBox: '0 0 200 200',
    category: 'Geometric',
    classicPalette: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'],
    paths: generateDetailedMandala()
  },
  {
    id: 'majestic-butterfly',
    name: 'Majestic Monarch',
    viewBox: '0 0 200 200',
    category: 'Butterflies',
    classicPalette: ['#1e1e1e', '#eab308', '#f97316', '#f43f5e', '#ec4899', '#3b82f6', '#14b8a6'],
    paths: generateMajesticButterfly()
  }
];

// Helper to auto-enrich artworks with numbers and centers if missing
const RAW_ARTWORKS = ARTWORKS;
const ENRICHED_ARTWORKS = RAW_ARTWORKS.map(art => {
  let cat = art.category;
  if (!cat) {
    if (art.id === 'butterfly') cat = 'Butterflies';
    else if (art.id === 'lotus' || art.id === 'flower' || art.id === 'forest') cat = 'Nature';
    else if (art.id === 'mandala' || art.id === 'harmony') cat = 'Geometric';
    else if (art.id === 'nebula' || art.id === 'stained-glass') cat = 'Abstract';
    else cat = 'Abstract';
  }

  const classicColors = art.classicPalette || PALETTES.celestial.slice(0, 8);
  const numColors = classicColors.length;
  
  let currentNum = 1;
  const assignments: Record<string, number> = {};
  
  const newPaths = art.paths.map((p, i) => {
    let num = p.number;
    if (num === undefined && !p.id.startsWith('ant')) {
      if (assignments[p.id]) {
        num = assignments[p.id];
      } else if (p.mirrorId && assignments[p.mirrorId]) {
        num = assignments[p.mirrorId];
      } else {
        num = currentNum;
        assignments[p.id] = num;
        currentNum = (currentNum % numColors) + 1;
      }
    }
    
    let center = p.center;
    if (!center && num !== undefined) {
      // Find a rough bounding or M coordinate
      const match = p.d.match(/[M|m]\s*([0-9.-]+)[,\s]+([0-9.-]+)/);
      if (match) {
        center = { x: parseFloat(match[1]) + 5, y: parseFloat(match[2]) + 5 }; // offset so it sits loosely inside
      } else {
        center = { x: 100, y: 100 };
      }
    }
    
    return { ...p, number: num, center };
  });
  
  return { ...art, paths: newPaths, classicPalette: classicColors, category: cat };
});

export default function ZenColoring() {
  const [screen, setScreen] = useState<'gallery' | 'workspace'>('gallery');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePalette, setActivePalette] = useState<PaletteName>('classic');
  const [selectedColor, setSelectedColor] = useState('#f43f5e'); // will set properly in useEffect
  const [activeArtworkId, setActiveArtworkId] = useState('butterfly');
  const [fills, setFills] = useState<Record<string, Record<string, string>>>({});
  const [symmetryMode, setSymmetryMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isClassicMode, setIsClassicMode] = useState(true);
  const [hintPathId, setHintPathId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [exporting, setExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const currentArtwork = ENRICHED_ARTWORKS.find(a => a.id === activeArtworkId) || ENRICHED_ARTWORKS[0];
  const currentFills = fills[activeArtworkId] || {};

  // Auto-select correct next color in classic mode
  useEffect(() => {
    if (!isClassicMode || !currentArtwork.classicPalette) return;
    
    const selectedIndex = currentArtwork.classicPalette.indexOf(selectedColor);
    // if currently selected color is fully filled, automatically pick the next available one
    if (selectedIndex !== -1) {
      const targetNumber = selectedIndex + 1;
      const unfilledWithCurrent = currentArtwork.paths.filter(p => !p.id.startsWith('ant') && p.number === targetNumber && !currentFills[p.id]);
      
      if (unfilledWithCurrent.length === 0) {
        // find next
        for (let i = 0; i < currentArtwork.classicPalette.length; i++) {
          const num = i + 1;
          const remaining = currentArtwork.paths.filter(p => p.number === num && !currentFills[p.id]).length;
          if (remaining > 0) {
            setSelectedColor(currentArtwork.classicPalette[i]);
            break;
          }
        }
      }
    } else {
       // if selecting an artwork sets an invalid color, set to the first unfilled
       for (let i = 0; i < currentArtwork.classicPalette.length; i++) {
          const num = i + 1;
          const remaining = currentArtwork.paths.filter(p => p.number === num && !currentFills[p.id]).length;
          if (remaining > 0) {
            setSelectedColor(currentArtwork.classicPalette[i]);
            break;
          }
       }
    }
  }, [currentFills, selectedColor, currentArtwork, isClassicMode]);

  const requestAISession = async () => {
    setLoadingSession(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "You are the companion behind Serenity Flow. Set up a new coloring session for the user. Provide a soothing intro, a theme-based palette (4 colors with hex and theme name), a mindfulness prompt for middle of coloring, and a completion affirmation. Output JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              therapeutic_intro: { type: Type.STRING },
              palette: { 
                type: Type.OBJECT,
                properties: {
                  "1": { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, theme: { type: Type.STRING } } },
                  "2": { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, theme: { type: Type.STRING } } },
                  "3": { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, theme: { type: Type.STRING } } },
                  "4": { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, theme: { type: Type.STRING } } }
                }
              },
              mid_coloring_prompt: { type: Type.STRING },
              completion_affirmation: { type: Type.STRING }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setSessionInfo(data);
      setActivePalette('ai');
      setSelectedColor(data.palette["1"].hex);
      setAiError(null);
    } catch (e: any) {
      console.error("Failed to fetch AI session", e);
      let errorMsg = "The AI guiding companion is currently taking a mindful breath. Please try again in a moment.";
      const errorStr = (e instanceof Error ? e.message : String(e));
      if (errorStr.includes('"code":503') || errorStr.includes('high demand') || errorStr.includes('UNAVAILABLE')) {
        errorMsg = "The AI guiding companion is currently experiencing high demand. Please try again in a few moments.";
      }
      setAiError(errorMsg);
      setTimeout(() => setAiError(null), 6000);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('serenity-flow-fills');
    if (saved) {
      try {
        setFills(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved state', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('serenity-flow-fills', JSON.stringify(fills));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleExport = async () => {
    if (svgRef.current === null) return;
    try {
      setExporting(true);
      
      // Temporarily add a white background for the export because SVG might be transparent
      const originalBackground = svgRef.current.style.backgroundColor;
      svgRef.current.style.backgroundColor = '#ffffff';

      const dataUrl = await toPng(svgRef.current, { cacheBust: true, pixelRatio: 2 });
      
      svgRef.current.style.backgroundColor = originalBackground;

      const link = document.createElement('a');
      link.download = `${currentArtwork.name}-serenity-flow.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Could not export the image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFill = (id: string) => {
    if (id.startsWith('ant')) return;
    
    if (isClassicMode) {
      const path = currentArtwork.paths.find(p => p.id === id);
      if (path && path.number) {
        const selectedIndex = currentArtwork.classicPalette?.indexOf(selectedColor);
        if (selectedIndex !== (path.number - 1)) {
          // Wrong color feedback? Maybe a shake?
          return;
        }
      }
    }

    setFills(prev => {
      const artFills = { ...(prev[activeArtworkId] || {}) };
      artFills[id] = selectedColor;
      
      if (symmetryMode) {
        const path = currentArtwork.paths.find(p => p.id === id);
        if (path?.mirrorId) {
          const mirrorPath = currentArtwork.paths.find(p => p.id === path.mirrorId);
          // Only mirror if it is also a valid target in classic mode
          if (!isClassicMode || (mirrorPath && mirrorPath.number === path?.number)) {
            artFills[path.mirrorId] = selectedColor;
          }
        }
      }
      
      return { ...prev, [activeArtworkId]: artFills };
    });
    
    if (id === hintPathId) setHintPathId(null);
  };

  const toggleClassicMode = () => {
    setIsClassicMode(!isClassicMode);
    if (!isClassicMode && currentArtwork.classicPalette) {
      setActivePalette('classic');
      setSelectedColor(currentArtwork.classicPalette[0]);
    } else {
      setActivePalette('celestial');
    }
    setFills(prev => ({ ...prev, [activeArtworkId]: {} })); // Reset on mode switch for clarity
  };

  const handleHint = () => {
    if (!isClassicMode || !currentArtwork.classicPalette) return;
    const selectedNumber = currentArtwork.classicPalette.indexOf(selectedColor) + 1;
    const remainingPaths = currentArtwork.paths.filter(p => p.number === selectedNumber && !currentFills[p.id]);
    if (remainingPaths.length > 0) {
      const randomPath = remainingPaths[Math.floor(Math.random() * remainingPaths.length)];
      setHintPathId(randomPath.id);
      setTimeout(() => setHintPathId(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Clear your ${currentArtwork.name}?`)) {
      setFills(prev => ({ ...prev, [activeArtworkId]: {} }));
    }
  };

  return (
    <div className="flex flex-col items-center pb-40 min-h-screen relative">
      {screen === 'gallery' ? (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 w-full border-b border-sky-900/10 pb-6">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                      <Brush className="w-7 h-7 text-white" />
                  </div>
                  <div>
                      <h1 className="text-3xl font-serif text-sky-900 leading-tight">Serenity Flow</h1>
                      <p className="text-xs uppercase tracking-widest font-bold text-sky-900/40">Mindful Coloring Studio</p>
                  </div>
              </div>
           </div>
           
           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
             {['All', 'Butterflies', 'Nature', 'Geometric', 'Abstract', 'Love'].map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat ? 'bg-sky-500 text-white shadow-md' : 'bg-white/60 text-sky-900/40 hover:bg-white/80 hover:text-sky-900 shadow-sm border border-white/60'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
             {ENRICHED_ARTWORKS.filter(art => activeCategory === 'All' || art.category === activeCategory).map(art => {
               const total = art.paths.filter(p => !p.id.startsWith('ant')).length;
               const savedFills = fills[art.id] || {};
               const filledCount = Object.keys(savedFills).filter(k => !k.startsWith('ant') && savedFills[k]).length;
               const progress = total > 0 ? (filledCount / total) * 100 : 0;
               return (
                 <div key={art.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 text-left">
                    {/* SVG preview */}
                    <div className="w-full sm:w-36 h-48 sm:h-36 shrink-0 bg-slate-50 rounded-xl relative flex items-center justify-center p-3 border border-slate-100 overflow-hidden group-hover:bg-slate-100/50 transition-colors">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                      <svg viewBox={art.viewBox} className="w-full h-full drop-shadow-sm relative z-10 transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none">
                         {art.paths.map(p => {
                            const isAnt = p.id.startsWith('ant');
                            const savedColor = savedFills[p.id];
                            
                            const targetColor = art.classicPalette?.[((p.number || 1) - 1) % (art.classicPalette?.length || 1)] || '#cbd5e1';
                            const fillColor = isAnt ? 'none' : (savedColor || targetColor);
                            const fillOpacity = isAnt ? 1 : (savedColor ? 1 : 0.15);
                            const strokeColor = savedColor ? "rgba(255,255,255,0.4)" : "rgba(15, 23, 42, 0.4)";
                            
                            return (
                               <g key={p.id} className={
                                 (art.id === 'butterfly' || art.id === 'monarch-journey' || art.id === 'majestic-butterfly') && (p.id.startsWith('ul-') || p.id.startsWith('ll-') || p.id.startsWith('mj-l')) ? 'wing-left' :
                                 (art.id === 'butterfly' || art.id === 'monarch-journey' || art.id === 'majestic-butterfly') && (p.id.startsWith('ur-') || p.id.startsWith('lr-') || p.id.startsWith('mj-r')) ? 'wing-right' : ''
                               }>
                                 <path d={p.d} fill={fillColor} fillOpacity={fillOpacity} stroke={strokeColor} strokeWidth={isAnt ? 1.5 : (savedColor ? 1 : 0.8)} strokeLinecap="round" />
                               </g>
                            );
                         })}
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 z-10 relative">
                      <h3 className="text-xl sm:text-lg font-bold text-slate-800 font-serif leading-tight truncate" title={art.name}>{art.name}</h3>
                      <div className="flex items-center justify-between mt-1 mb-4">
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                           {art.category} • {total} parts
                         </span>
                         {progress > 0 && (
                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full ring-1 ring-sky-200">
                               {Math.round(progress)}%
                            </span>
                         )}
                      </div>
                      
                      {progress > 0 && (
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4 overflow-hidden border border-black/5 shadow-inner">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 sm:pt-4">
                         <button onClick={(e) => { e.stopPropagation(); setActiveArtworkId(art.id); setIsClassicMode(true); setActivePalette('classic'); setScreen('workspace'); }} className="w-full py-3 sm:py-2.5 bg-slate-900 text-white rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors whitespace-nowrap overflow-hidden text-ellipsis shadow-sm">Classic</button>
                         <button onClick={(e) => { e.stopPropagation(); setActiveArtworkId(art.id); setIsClassicMode(false); setActivePalette('celestial'); setScreen('workspace'); }} className="w-full py-3 sm:py-2.5 bg-sky-50 text-sky-700 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-sky-100 transition-colors whitespace-nowrap overflow-hidden text-ellipsis border border-sky-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] group-hover:border-sky-200">Zen</button>
                      </div>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-[#f8fafc] flex z-50 overflow-hidden font-sans selection:bg-sky-100">
           {/* Background Texture */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

           <AnimatePresence>
             {aiError && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="absolute top-24 inset-x-0 mx-auto w-full max-w-lg z-50 pointer-events-none flex justify-center"
               >
                 <div className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl shadow-xl flex flex-col items-center text-center border border-red-100 pointer-events-auto">
                    <p className="text-sm font-medium">{aiError}</p>
                 </div>
               </motion.div>
             )}
             
             {sessionInfo && activePalette === 'ai' && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-md w-full px-4"
               >
                 <div className="bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl flex flex-col items-center text-center border border-white/10 pointer-events-auto">
                    <p className="text-sm font-serif italic mb-1">
                      "{sessionInfo.therapeutic_intro}"
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-slate-400">
                       <Sparkles className="w-3 h-3 text-sky-400" />
                       Guided Intention
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Header Area */}
           <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
             <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
               <button 
                 onClick={() => setScreen('gallery')} 
                 className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all hover:shadow-md"
               >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
               <div className="bg-white/90 backdrop-blur-md px-3 sm:px-5 h-10 sm:h-12 border border-slate-200/60 rounded-2xl shadow-sm flex flex-col justify-center">
                   <h2 className="text-xs sm:text-sm font-serif text-slate-800 leading-tight">{currentArtwork.name}</h2>
                   <p className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-slate-400">{isClassicMode ? 'Classic Mode' : 'Zen Freeplay'}</p>
               </div>
             </div>
             
             <div className="bg-white/90 backdrop-blur-md h-10 sm:h-12 p-1 border border-slate-200/60 rounded-2xl shadow-sm flex items-center gap-1 sm:gap-2 pointer-events-auto">
               <button 
                 onClick={requestAISession} 
                 disabled={loadingSession} 
                 className={`h-full px-2 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 sm:gap-2 ${loadingSession ? 'bg-sky-50 text-sky-400' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}
               >
                 {loadingSession ? <div className="w-3 h-3 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" /> : <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                 <span className="hidden sm:inline">AI Guide</span>
               </button>
               <div className="w-px h-5 sm:h-6 bg-slate-200 mx-0.5 sm:mx-1" />
               <button onClick={handleSave} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Save">
                  {saveStatus === 'saved' ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
               </button>
               <button onClick={handleExport} disabled={exporting} className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Export">
                  <Download className="w-4 h-4" />
               </button>
               <button onClick={() => setSymmetryMode(!symmetryMode)} className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-colors ${symmetryMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} title="Symmetry">
                  <ArrowLeftRight className="w-4 h-4" />
               </button>
               <button onClick={handleReset} className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Reset">
                  <RotateCcw className="w-4 h-4" />
               </button>
             </div>
           </div>

           {/* Floating Bottom Dock */}
           <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 flex flex-col items-center pointer-events-none">
             {isClassicMode && (
               <div className="w-full max-w-4xl h-1 bg-slate-200/50 rounded-t-full mb-1 flex overflow-hidden backdrop-blur-sm pointer-events-auto">
                 <motion.div 
                   className="h-full bg-sky-500 rounded-full"
                   initial={{ width: 0 }}
                   animate={{ width: `${(Object.keys(currentFills).filter(k => !k.startsWith('ant')).length / currentArtwork.paths.filter(p => !p.id.startsWith('ant')).length) * 100}%` }}
                   transition={{ duration: 0.5 }}
                 />
               </div>
             )}

             <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl pointer-events-auto flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide py-1">
                    <button
                      onClick={() => { setActivePalette('classic'); setIsClassicMode(true); }}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                        isClassicMode ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Classic By Number
                    </button>
                    <div className="w-px h-4 bg-slate-200 shrink-0" />
                    {PALETTE_NAMES.filter(p => p.id !== 'classic').map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setActivePalette(p.id); setIsClassicMode(false); }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                          !isClassicMode && activePalette === p.id ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm' : 'text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {isClassicMode && (
                    <button onClick={handleHint} className="hidden sm:flex shrink-0 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Hint
                    </button>
                  )}
                </div>

                <div className="px-4 py-4 sm:py-6 overflow-x-auto scrollbar-hide">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={activePalette}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 min-w-max px-2 items-center"
                    >
                      {activePalette === 'ai' && sessionInfo ? (
                        Object.entries(sessionInfo.palette).map(([key, item]: [string, { hex: string, theme: string }]) => (
                          <div key={`ai-${key}`} className="flex flex-col items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedColor(item.hex)}
                              className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-sm border border-black/5 shrink-0 ${selectedColor === item.hex ? 'ring-4 ring-sky-500/30 ring-offset-2' : ''}`}
                              style={{ backgroundColor: item.hex }}
                            >
                              {selectedColor === item.hex && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                                </div>
                              )}
                            </motion.button>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.theme}</span>
                          </div>
                        ))
                      ) : activePalette === 'classic' && currentArtwork.classicPalette ? (
                        currentArtwork.classicPalette.map((color, index) => {
                          const total = currentArtwork.paths.filter(p => p.number === (index + 1) && !p.id.startsWith('ant')).length;
                          const remaining = currentArtwork.paths.filter(p => p.number === (index + 1) && !currentFills[p.id] && !p.id.startsWith('ant')).length;
                          const isDone = total > 0 && remaining === 0;
                          const progress = total === 0 ? 100 : ((total - remaining) / total) * 100;
                          const isSelected = selectedColor === color;
                          
                          return (
                            <motion.button
                              key={`classic-${color}`}
                              whileHover={!isDone ? { scale: 1.1 } : {}} whileTap={!isDone ? { scale: 0.95 } : {}}
                              onClick={() => setSelectedColor(color)}
                              className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shrink-0 flex items-center justify-center ${isSelected && !isDone ? 'ring-4 ring-sky-500/30 ring-offset-2' : ''}`}
                            >
                              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                 <circle cx="50%" cy="50%" r="45%" fill={isDone ? '#f1f5f9' : "white"} className="drop-shadow-sm" />
                                 {!isDone && (
                                   <circle 
                                     cx="50%" cy="50%" r="45%" fill="none" stroke={color} strokeWidth="4" 
                                     strokeDasharray="283" strokeDashoffset={`${283 * (1 - progress / 100)}`}
                                     strokeLinecap="round" className="transition-all duration-500"
                                   />
                                 )}
                              </svg>
                              <div className="w-[70%] h-[70%] rounded-full shadow-inner flex items-center justify-center z-10" style={{ backgroundColor: color, opacity: isDone ? 0.3 : 1 }}>
                                 {!isDone && <span className="text-white text-sm sm:text-lg font-bold drop-shadow-sm">{index + 1}</span>}
                                 {isDone && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute" />}
                              </div>
                              {isSelected && !isDone && (
                                 <div className="absolute -top-1 -right-1 min-w-[20px] sm:min-w-[24px] h-[20px] sm:h-[24px] px-1 rounded-full bg-slate-800 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm z-20">
                                   {remaining}
                                 </div>
                              )}
                            </motion.button>
                          );
                        })
                      ) : (
                        (activePalette !== 'ai') && PALETTES[activePalette as keyof typeof PALETTES]?.map((color) => (
                          <motion.button
                            key={`${activePalette}-${color}`}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColor(color)}
                            className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-sm border border-black/5 shrink-0 transition-all ${selectedColor === color ? 'ring-4 ring-sky-500/30 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                              </div>
                            )}
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
             </div>
           </div>

           {/* Zoom Controls */}
           <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30 pointer-events-auto">
               <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-2xl p-1.5 flex flex-col gap-1">
                 <button onClick={() => setZoomLevel(z => Math.min(z + 0.3, 4))} className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                   <ZoomIn className="w-5 h-5" />
                 </button>
                 <div className="w-6 h-px bg-slate-200 mx-auto" />
                 <button onClick={() => setZoomLevel(z => Math.max(z - 0.3, 0.5))} className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                   <ZoomOut className="w-5 h-5" />
                 </button>
               </div>
           </div>

           {/* Main Workspace Area (Canvas Layer) */}
           <div className="absolute inset-0 z-10 flex items-center justify-center pt-16 pb-48 overflow-hidden cursor-grab active:cursor-grabbing">
              <motion.div
                key={activeArtworkId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoomLevel }}
                className="transform-origin-center transition-transform duration-300 w-[85vmin] max-w-[800px] aspect-square"
              >
                <svg ref={svgRef} viewBox={currentArtwork.viewBox} className="w-full h-full drop-shadow-2xl relative z-10 filter-glow">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    <linearGradient id="brush-shine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="white" stopOpacity="0" />
                      <stop offset="100%" stopColor="black" stopOpacity="0.1" />
                    </linearGradient>

                    <pattern id="target-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                       <rect width="10" height="10" fill="rgba(0,0,0,0)" />
                       <circle cx="5" cy="5" r="2" fill="rgba(56, 189, 248, 0.5)" />
                    </pattern>

                    <filter id="paper-noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0.05 0.05 0.05 0 0" in="noise" />
                    </filter>
                  </defs>

                  {currentArtwork.paths.map((path) => {
                    const isAnt = path.id.startsWith('ant');
                    const isFilled = !!currentFills[path.id];
                    const isHinted = hintPathId === path.id;
                    
                    // In classic mode, highlight paths matching selected color
                    const isTargetNumber = isClassicMode && currentArtwork.classicPalette && 
                      path.number === (currentArtwork.classicPalette.indexOf(selectedColor) + 1) && !isFilled;

                    const fillColor = isAnt ? 'none' : (isFilled ? currentFills[path.id] : (isTargetNumber ? 'url(#target-pattern)' : (isClassicMode ? '#ffffff' : 'rgba(255, 255, 255, 0.6)')));

                    let wingCls = '';
                    if (currentArtwork.id === 'butterfly' || currentArtwork.id === 'monarch-journey' || currentArtwork.id === 'majestic-butterfly') {
                       if (path.id.startsWith('ul-') || path.id.startsWith('ll-') || path.id.startsWith('mj-l')) wingCls = 'wing-left';
                       else if (path.id.startsWith('ur-') || path.id.startsWith('lr-') || path.id.startsWith('mj-r')) wingCls = 'wing-right';
                    }

                    return (
                      <g key={path.id} className={wingCls} filter={(!isClassicMode && !isFilled) ? "url(#glow)" : undefined}>
                        <path
                          d={path.d}
                          fill={fillColor}
                          stroke={isClassicMode ? '#334155' : "rgba(71, 85, 105, 0.2)"}
                          strokeWidth={isTargetNumber ? 1.5 : (isClassicMode ? 0.75 : 0.5)}
                          strokeLinecap="round"
                          onClick={() => handleFill(path.id)}
                          className={`${isAnt ? '' : 'cursor-pointer hover:opacity-80 transition-opacity duration-300'} ${isHinted ? 'animate-pulse' : ''}`}
                          style={{ transition: 'fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                        {isHinted && !isFilled && (
                           <path d={path.d} fill="rgba(250, 204, 21, 0.6)" stroke="#facc15" strokeWidth="2" className="pointer-events-none animate-pulse" />
                        )}
                        {!isAnt && (
                          <>
                            <path
                              d={path.d}
                              fill="url(#brush-shine)"
                              className="pointer-events-none mix-blend-overlay opacity-30"
                            />
                            {isClassicMode && path.number && path.center && (!isFilled) && (
                              <text
                                x={path.center.x}
                                y={path.center.y}
                                fontSize={isTargetNumber ? "8" : "6"}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`pointer-events-none font-bold select-none transition-colors ${isTargetNumber ? 'fill-sky-700' : 'fill-slate-500'}`}
                              >
                                {path.number}
                              </text>
                            )}
                          </>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Subtle paper texture overlay */}
                  <rect 
                    x="-20%" y="-20%" width="140%" height="140%" 
                    fill="url(#paper-noise)" 
                    className="pointer-events-none mix-blend-multiply opacity-70" 
                  />
                </svg>
              </motion.div>
           </div>

           {/* Completion Overlays */}
           <AnimatePresence>
             {sessionInfo && Object.values(fills[activeArtworkId] || {}).length > currentArtwork.paths.length * 0.4 && Object.values(fills[activeArtworkId] || {}).length < currentArtwork.paths.length * 0.45 && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                 className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-slate-200/50 max-w-sm w-full text-center"
               >
                 <p className="text-sm font-serif italic text-slate-800">
                   A gentle check-in: "{sessionInfo.mid_coloring_prompt}"
                 </p>
               </motion.div>
             )}

             {sessionInfo && Object.values(fills[activeArtworkId] || {}).length >= currentArtwork.paths.filter(p => !p.id.startsWith('ant')).length && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                 className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
               >
                 <div className="bg-gradient-to-br from-white to-slate-50 text-slate-800 p-10 rounded-[3rem] shadow-2xl text-center max-w-lg w-full relative overflow-hidden border border-white">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Sparkles className="w-48 h-48" />
                   </div>
                   <h4 className="text-4xl font-serif mb-4 relative z-10 text-sky-900">Masterpiece Complete</h4>
                   <p className="text-lg opacity-80 italic relative z-10 font-serif">"{sessionInfo.completion_affirmation}"</p>
                   <button 
                     onClick={() => setSessionInfo(null)}
                     className="mt-8 px-6 py-3 bg-sky-500 hover:bg-sky-600 shadow-md text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors relative z-10"
                   >
                     Continue
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

        </div>
      )}
    </div>
  );
}