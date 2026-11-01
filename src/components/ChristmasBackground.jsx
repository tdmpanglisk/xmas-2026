import { useEffect, useRef } from 'react';

/**
 * Snowfall background effect with CSS animations
 */
export const Snowfall = ({ intensity = 'medium' }) => {
  const containerRef = useRef(null);
  const snowflakes = ['❄', '❅', '❆', '✦', '✧', '★', '☆'];
  
  const counts = {
    low: 15,
    medium: 30,
    high: 50,
  };

  const count = counts[intensity] || 30;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create snowflakes
    const flakes = Array.from({ length: count }, (_, i) => {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.setProperty('--delay', Math.random() * 5);
      flake.style.setProperty('--duration', 8 + Math.random() * 10);
      flake.style.setProperty('--size', `${8 + Math.random() * 16}px`);
      flake.style.setProperty('--opacity', 0.3 + Math.random() * 0.5);
      container.appendChild(flake);
      return flake;
    });

    // Create twinkling stars
    const stars = Array.from({ length: 20 }, (_, i) => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${2 + Math.random() * 4}px`;
      star.style.height = star.style.width;
      star.style.setProperty('--delay', Math.random() * 3);
      container.appendChild(star);
      return star;
    });

    return () => {
      [...flakes, ...stars].forEach(el => el.remove());
    };
  }, [count]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

/**
 * Floating ornaments decoration
 */
export const FloatingOrnaments = () => {
  const ornaments = [
    { top: '10%', left: '5%', size: '60px', delay: '0s', color: '#C41E3A' },
    { top: '20%', right: '8%', size: '40px', delay: '1s', color: '#D4A843' },
    { bottom: '15%', left: '10%', size: '50px', delay: '2s', color: '#2D5A27' },
    { bottom: '30%', right: '5%', size: '45px', delay: '0.5s', color: '#C41E3A' },
    { top: '50%', left: '2%', size: '35px', delay: '1.5s', color: '#D4A843' },
    { top: '60%', right: '3%', size: '30px', delay: '2.5s', color: '#2D5A27' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {ornaments.map((ornament, i) => (
        <div
          key={i}
          className="ornament"
          style={{
            ...ornament,
            '--delay': ornament.delay,
            width: ornament.size,
            height: ornament.size,
          }}
        >
          <div 
            className="w-full h-full rounded-full border-4 border-current opacity-60"
            style={{ 
              borderColor: ornament.color,
              background: `radial-gradient(circle at 30% 30%, ${ornament.color}40, transparent 70%)`
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Combined background effect
 */
export const ChristmasBackground = ({ showSnow = true, showOrnaments = true }) => {
  return (
    <div className="fixed inset-0 z-0 bg-xmas-night bg-snow-pattern">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-xmas-night via-xmas-darkgreen to-xmas-night" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23D4A843' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {showSnow && <Snowfall intensity="medium" />}
      {showOrnaments && <FloatingOrnaments />}
    </div>
  );
};