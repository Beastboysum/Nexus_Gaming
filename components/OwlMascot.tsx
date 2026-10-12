import React, { useState, useEffect, useRef } from 'react';

export const OwlMascot: React.FC = () => {
  const [error, setError] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      
      setTilt({
        x: Math.max(-10, Math.min(10, -dy * 12)),
        y: Math.max(-14, Math.min(14, dx * 14)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-48 h-48 relative mx-auto mb-8 flex items-center justify-center select-none hover:scale-105 transition-transform duration-300"
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {!error ? (
        <div className="relative w-full h-full">
            {/* Base Image */}
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Owl.png" 
              alt="Owl Mascot" 
              onError={() => setError(true)}
              className="w-full h-full object-contain drop-shadow-2xl relative z-10 pointer-events-none"
            />
        </div>
      ) : (
        <div className="text-8xl animate-bounce filter drop-shadow-lg cursor-default">🦉</div>
      )}
    </div>
  );
};