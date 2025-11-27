
import React from 'react';

interface MascotProps {
  className?: string;
  mood?: 'happy' | 'cool' | 'shocked';
  isStatic?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ className = "w-24 h-24", mood = 'happy', isStatic = false }) => {
  return (
    <svg viewBox="0 0 100 100" className={`${className} overflow-visible text-ink`} xmlns="http://www.w3.org/2000/svg">
      <defs>
         <linearGradient id="shadesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: '#333333', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 1}} />
         </linearGradient>
      </defs>
      
      <g className={`origin-center ${!isStatic && mood === 'shocked' ? 'animate-shake' : ''} ${!isStatic && (mood === 'happy' || mood === 'cool') ? 'animate-float' : ''}`}>
        
        {/* Ears Group - Wiggle when happy/cool */}
        <g className={`origin-bottom ${!isStatic ? 'animate-wiggle' : ''}`}>
           <path d="M20 25 L35 40 L20 45 Z" fill="#FF88DC" stroke="currentColor" strokeWidth="3" />
           <path d="M80 25 L65 40 L80 45 Z" fill="#FF88DC" stroke="currentColor" strokeWidth="3" />
        </g>

        {/* Body */}
        <circle cx="50" cy="55" r="40" fill="#FF88DC" stroke="currentColor" strokeWidth="3" />
        
        {/* Snout */}
        <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFAAE9" stroke="currentColor" strokeWidth="3" />
        <circle cx="45" cy="62" r="2.5" fill="currentColor" />
        <circle cx="55" cy="62" r="2.5" fill="currentColor" />

        {/* Eyes / Sunglasses */}
        <g className="origin-center">
            {mood === 'cool' ? (
                <g className={!isStatic ? "hover:scale-110 transition-transform duration-300 origin-center cursor-pointer" : ""}>
                    {/* Uniform Connected Shades */}
                    <path 
                      d="M 15,42 L 85,42 L 82,52 L 55,52 L 50,47 L 45,52 L 18,52 L 15,42 Z" 
                      fill="url(#shadesGrad)" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinejoin="round"
                    />
                    
                    {/* Temple Arms */}
                    <line x1="15" y1="44" x2="5" y2="40" stroke="currentColor" strokeWidth="3" />
                    <line x1="85" y1="44" x2="95" y2="40" stroke="currentColor" strokeWidth="3" />

                    {/* Animated Shine on Glasses */}
                    {!isStatic && (
                      <g>
                        <rect x="20" y="44" width="20" height="2" fill="white" opacity="0.6" className="animate-shimmer" />
                        <rect x="60" y="44" width="20" height="2" fill="white" opacity="0.6" className="animate-shimmer" style={{animationDelay: '0.2s'}} />
                      </g>
                    )}
                </g>
            ) : mood === 'shocked' ? (
                <g>
                    <circle cx="35" cy="45" r="6" fill="white" stroke="currentColor" strokeWidth="2" />
                    <circle cx="35" cy="45" r="2" fill="currentColor" className={!isStatic ? "animate-ping" : ""} style={{animationDuration: '1s'}} />
                    <circle cx="65" cy="45" r="6" fill="white" stroke="currentColor" strokeWidth="2" />
                    <circle cx="65" cy="45" r="2" fill="currentColor" className={!isStatic ? "animate-ping" : ""} style={{animationDuration: '1s'}} />
                    {/* Mouth for Shock */}
                    <ellipse cx="50" cy="75" rx="6" ry="8" fill="currentColor" />
                </g>
            ) : (
                <g className={!isStatic ? "animate-blink origin-center" : ""} style={{ transformBox: 'fill-box' }}>
                    <circle cx="35" cy="45" r="5" fill="currentColor" />
                    <circle cx="65" cy="45" r="5" fill="currentColor" />
                    {/* Happy Cheeks */}
                    <circle cx="25" cy="55" r="4" fill="#FFAAE9" opacity="0.6" />
                    <circle cx="75" cy="55" r="4" fill="#FFAAE9" opacity="0.6" />
                </g>
            )}
        </g>

        {/* Legs - Little feet */}
        <path d="M35 92 L35 97 L45 97 L45 92" fill="#FF88DC" stroke="currentColor" strokeWidth="3" />
        <path d="M55 92 L55 97 L65 97 L65 92" fill="#FF88DC" stroke="currentColor" strokeWidth="3" />

        {/* Coin Slot */}
        <line x1="40" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default Mascot;
