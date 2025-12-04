import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  LayoutDashboard,
  Home,
} from "lucide-react";
import Logo from "../assets/Logo01.png";
import { useCart } from "../../contexts/CartContext";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const { cart } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Parfums", link: "perfumes" },
    {
      name: "Cosmétiques",
      link: "cosmetics",
    },
    {
      name: "Cadeaux",
      link: "gifts",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link to="/">
                <img src={Logo} alt="Logo" className="h-10 lg:h-14 w-auto" />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex space-x-8"
              >
                {navItems.map((item) => (
                  <motion.li
                    key={item.name}
                    variants={itemVariants}
                    className="relative"
                  >
                    <Link to={`/category/${item.link}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className={` font-medium transition-colors duration-300 cursor-pointer text-lg
                        text-primary hover:text-secondary`}
                      >
                        {item.name}
                      </motion.button>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Home icon  */}
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`cursor-pointer p-2 rounded-full transition-colors text-primary hover:text-secondary hover:bg-secondary/10`}
                >
                  <Home size={22} />
                </motion.button>
              </Link>

              {/* Dashboard  */}

              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`cursor-pointer p-2 rounded-full transition-colors text-primary hover:text-secondary hover:bg-secondary/10`}
                >
                  <LayoutDashboard size={22} />
                </motion.button>
              </Link>

              {/* Cart */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`cursor-pointer relative p-2 rounded-full transition-colors text-primary hover:text-secondary hover:bg-secondary/10`}
              >
                <ShoppingBag size={22} />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-secondary text-xs text-background rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                >
                  {cart.length}
                </motion.span>
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer md:hidden p-2 rounded-full transition-colors text-primary hover:text-secondary hover:bg-secondary/10`}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Menu Panel - Full Width */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 right-0 bottom-0 bg-background shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Mobile Header with Close Button */}
                <div className="flex justify-between items-center mb-8 ">
                  <img src={Logo} alt="Logo" className="h-10" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full text-primary hover:text-secondary hover:bg-secondary/10"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Mobile Navigation - Centered and spaced */}
                <motion.ul
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6 flex-1 flex flex-col pb-8"
                >
                  {navItems.map((item) => (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      className="text-start"
                    >
                      <Link
                        onClick={() => setIsOpen(false)}
                        to={`/category/${item.link}`}
                        className="w-full text-start text-2xl font-semibold text-primary hover:text-secondary transition-colors py-4 px-4 rounded-lg hover:bg-secondary/5"
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
