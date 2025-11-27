
import React from 'react';

export const DsynLabsLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 220 36" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="DSYN LABS EXPERIMENT">
    <rect x="1" y="1" width="218" height="34" rx="17" fill="white" stroke="#1A1A1A" strokeWidth="2" />
    <text x="18" y="24" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="900" fontSize="18" fill="#1A1A1A" letterSpacing="0.5">DSYN LABS</text>
    <text x="125" y="24" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="600" fontSize="13" fill="#1A1A1A">EXPERIMENT</text>
  </svg>
);

export default DsynLabsLogo;
