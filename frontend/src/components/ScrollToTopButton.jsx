import React, { useState, useEffect } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`
        fixed z-50
        flex items-center justify-center
        bg-secondary
        shadow-2xl 
        transition-all duration-500
        hover:scale-110 
        focus:outline-none
        rounded-full
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}
        
        /* Default positioning (mobile/sm) */
        bottom-4 right-4
        w-10 h-10
        
        /* Small screens */
        sm:bottom-6 sm:right-6
        sm:w-12 sm:h-12
        

      `}
      aria-label="Scroll to top"
    >
      {/* Responsive arrow icon */}
      <svg
        className="
          text-background transition-transform duration-300 hover:-translate-y-0.5
          w-4 h-4
          sm:w-5 sm:h-5          
        "
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>

      {/* Responsive accent dot */}
      <div
        className="
        absolute rounded-full bg-background
        bottom-0.5 w-0.5 h-0.5
        sm:bottom-1 sm:w-1 sm:h-1        
      "
      />
    </button>
  );
};

export default ScrollToTopButton;
