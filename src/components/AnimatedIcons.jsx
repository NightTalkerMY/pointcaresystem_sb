// src/components/AnimatedIcons.jsx
import React from "react";

// REFINED ANIMATION STYLES
const IconStyles = () => (
  <style>
    {`
      @keyframes heartbeat { 0%, 100% { transform: scale(1); } 15%, 45% { transform: scale(1.2); } 30% { transform: scale(1); } }
      @keyframes dash-move { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
      @keyframes walk-left { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-4px); opacity: 0.5; } }
      @keyframes walk-right { 0%, 100% { transform: translateY(-4px); opacity: 0.5; } 50% { transform: translateY(0); opacity: 1; } }
      @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      @keyframes rotate-needle { 0%, 100% { transform: rotate(-45deg); } 50% { transform: rotate(45deg); } }
    `}
  </style>
);

// PRIMARY VITALS
export const HeartIcon = () => (
  <>
    <IconStyles />
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" style={{ animation: 'heartbeat 1.2s infinite', transformOrigin: 'center' }}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  </>
);

// CLEANER O2: A lung-inspired bubble icon
export const OxygenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'float 3s ease-in-out infinite' }}>
    <path d="M12 22c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
    <path d="M12 10v4m-2-2h4" strokeOpacity="0.6" />
  </svg>
);

export const TempIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" style={{ animation: 'float 4s ease-in-out infinite' }}>
    <path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4.5 4.5 0 1 0 4 0z"/>
  </svg>
);

// CLEANER STRESS: A semi-circle gauge with a moving needle
export const StressIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
    <path d="M3 17.5a9 9 0 0 1 18 0" opacity="0.3" />
    <path d="M12 17.5L9 11" style={{ animation: 'rotate-needle 2s ease-in-out infinite', transformOrigin: '12px 17.5px' }} />
  </svg>
);

// SECONDARY VITALS
// CLEANER BP: A simple "Monitor" rectangle with pulse line
export const BPIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Device Body */}
    <rect x="3" y="5" width="18" height="14" rx="2" />
    {/* Screen Lines */}
    <path d="M7 9h10" opacity="0.4" />
    <path d="M7 12h6" opacity="0.4" />
    {/* Heart/Pulse dot that actually moves */}
    <circle cx="17" cy="13" r="1.5" fill="#ef4444" stroke="none">
      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
    </circle>
  </svg>
);
export const HRVIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h3l2-8 4 16 3-11 2 3h6" strokeDasharray="40" style={{ animation: 'dash-move 1.5s linear infinite' }} />
  </svg>
);

// NEW STEPS: Clear shoe shapes that "walk" (up/down alternating)
export const StepsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316">
    {/* Left Shoe */}
    <path d="M6 19a3 3 0 0 1-3-3v-2c0-3 2-5 5-5h1a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3H6z" 
          style={{ animation: 'walk-left 1s infinite' }} />
    {/* Right Shoe */}
    <path d="M17 14a3 3 0 0 1-3-3V9c0-3 2-5 5-5h1a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3h-2z" 
          style={{ animation: 'walk-right 1s infinite' }} />
  </svg>
);

// EXPLICIT EXPORT to fix the "not provide an export named SleepIcon" error
export const SleepIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1" style={{ animation: 'float 3s ease-in-out infinite' }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);