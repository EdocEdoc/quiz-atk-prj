import React from "react";

export default function SciFiBattlefield({ children }) {
  return (
    <div className="relative min-h-screen bg-[#050816]">
      {/* --- Background Gradient --- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,200,255,0.1) 0%, rgba(0,0,0,1) 70%)",
        }}
      />

      {/* --- Stars --- */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {[...Array(120)].map((_, i) => {
          const isFallingStar = Math.random() < 0.08; // slightly higher chance
          const top = Math.random() * 100;
          const left = Math.random() * 100;

          // direction vector toward center
          const dx = 50 - left;
          const dy = 50 - top;

          // randomize speed slightly
          const duration = Math.random() * 2 + 2;
          const delay = Math.random() * 8;

          return (
            <div
              key={i}
              className={`absolute rounded-full bg-white ${
                isFallingStar ? "opacity-80" : "opacity-20"
              }`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: isFallingStar ? "3px" : `${Math.random() * 2 + 1}px`,
                height: isFallingStar ? "3px" : `${Math.random() * 2 + 1}px`,
                boxShadow: isFallingStar
                  ? "0 0 15px 3px rgba(255,255,255,0.8)"
                  : "none",
                "--dx": `${dx * 6}px`, // movement strength
                "--dy": `${dy * 6}px`,
                animation: isFallingStar
                  ? `falling-star ${duration}s linear ${delay}s infinite`
                  : `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
              }}
            />
          );
        })}
      </div>
      {/* --- Horizon Glow --- */}
      <div
        className="absolute bottom-1/2 left-0 w-full h-[200px] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(88, 28, 135, 0.6) 0%, transparent 70%)",
        }}
      />

      {/* --- Grid Floor --- */}
      {/* <div
        className="absolute bottom-0 w-full h-1/2"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to top, rgba(0,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          perspective: "500px",
          transform: "rotateX(60deg)",
          transformOrigin: "bottom",
          boxShadow: "0 -20px 60px rgba(0,255,255,0.2) inset",
        }}
      /> */}

      {/* --- Children (player, opponent, etc.) --- */}
      {/* --- Your scrollable content --- */}
      <div className="relative z-10">
        <section className="h-full flex items-center justify-center text-white">
          {children}
        </section>
      </div>

      {/* --- Twinkle Animation --- */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
