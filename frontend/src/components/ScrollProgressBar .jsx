import React, { useState, useEffect } from "react";

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const calculateScrollProgress = () => {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - winHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / docHeight) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  useEffect(() => {
    window.addEventListener("scroll", calculateScrollProgress);
    calculateScrollProgress(); // Initial calculation

    return () => window.removeEventListener("scroll", calculateScrollProgress);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
      {/* Main progress bar with gradient */}
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background:
            "linear-gradient(90deg, #ff9292 0%, #ff7a7a 50%, #ff5e5e 100%)",
          boxShadow: "0 0 20px rgba(255, 146, 146, 0.5)",
        }}
      >
        {/* Glowing effect at the end */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white"
          style={{
            boxShadow: "0 0 15px #ff9292, 0 0 30px #ff9292, 0 0 45px #ff9292",
          }}
        />
      </div>

      {/* Subtle background line */}
      <div className="absolute inset-0 bg-gray-800/20" />
    </div>
  );
};

export default ScrollProgressBar;
