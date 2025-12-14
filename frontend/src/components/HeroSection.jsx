import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { hero01, hero02, hero03, hero04 } from "../utils/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const heroImages = [hero01, hero02, hero03, hero04];
  const containerRef = useRef(null);

  // Slide content in French with corresponding routes
  const slideContents = [
    {
      title: "Mounir Fragrance",
      description: "Une collection qui incarne le luxe et la sophistication.",
      buttonText: "Explorer la Collection",
      buttonLink: "/products", // Main products page
    },
    {
      title: "Parfums Signature",
      description:
        "Découvrez nos fragrances exclusives, créées pour les esprits raffinés.",
      buttonText: "Découvrir les Parfums",
      buttonLink: "/category/perfumes", // Perfumes category page
    },
    {
      title: "Cosmétiques de Luxe",
      description:
        "Des produits d'exception pour sublimer votre beauté naturelle.",
      buttonText: "Voir les Cosmétiques",
      buttonLink: "/category/cosmetics", // Cosmetics category page
    },
    {
      title: "Cadeaux Précieux",
      description:
        "Trouvez le cadeau parfait pour les moments les plus spéciaux.",
      buttonText: "Voir les Cadeaux",
      buttonLink: "/category/gifts", // Gifts category page
    },
  ];

  // Auto-rotate slides every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        nextSlide();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Touch/mouse handlers for swipe
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handleDragEnd = (clientX) => {
    if (!isDragging) return;

    const dragDistance = clientX - dragStartX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        // Swipe right -> previous slide
        prevSlide();
      } else {
        // Swipe left -> next slide
        nextSlide();
      }
    }

    setIsDragging(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    handleDragStart(e.clientX);
  };

  const handleMouseUp = (e) => {
    handleDragEnd(e.clientX);
  };

  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    handleDragEnd(e.changedTouches[0].clientX);
  };

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Main Slider Container */}
      <div
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div className="relative h-full w-full">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className={`absolute inset-0 ${
                index === currentSlide
                  ? "pointer-events-auto"
                  : "pointer-events-none"
              }`}
              initial={{
                opacity: 0,
                x: index > currentSlide ? "100%" : "-100%",
              }}
              animate={{
                opacity: index === currentSlide ? 1 : 0,
                x:
                  index === currentSlide
                    ? "0%"
                    : index > currentSlide
                    ? "100%"
                    : "-100%",
              }}
              transition={{
                opacity: { duration: 0.5 },
                x: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
              }}
            >
              {/* Image with overlay */}
              <div className="relative h-full w-full">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />
                {/* Additional subtle overlay for better contrast */}
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-center"
                  >
                    {/* Title with text shadow */}
                    <h1 className="font-bold01 text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 sm:mb-6 [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)] drop-shadow-2xl">
                      {slideContents[index].title}
                    </h1>

                    {/* Description with text shadow */}
                    <p className="font-p01 text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto [text-shadow:_0_1px_4px_rgba(0,0,0,0.4)] drop-shadow-lg">
                      {slideContents[index].description}
                    </p>

                    {/* CTA Button - Only visible on current slide with dynamic routing */}
                    {index === currentSlide && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Link to={slideContents[index].buttonLink}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center bg-accent rounded-full cursor-pointer text-primary px-8 py-3 sm:px-10 sm:py-4 font-p01 text-base sm:text-lg hover:shadow-xl transition-all duration-300 shadow-lg [text-shadow:_0_1px_2px_rgba(255,255,255,0.3)]"
                          >
                            {slideContents[index].buttonText}
                            <ChevronRight className="ml-3 w-5 h-5" />
                          </motion.button>
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden md:block">
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full flex items-center justify-center shadow-lg [text-shadow:_0_1px_3px_rgba(0,0,0,0.3)]"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full flex items-center justify-center shadow-lg [text-shadow:_0_1px_3px_rgba(0,0,0,0.3)]"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="focus:outline-none group"
            >
              <div className="relative">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-md ${
                    index === currentSlide ? "bg-secondary" : "bg-white/60"
                  } group-hover:bg-white`}
                />
                {index === currentSlide && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-full border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.8 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
