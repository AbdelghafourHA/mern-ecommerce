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
  Facebook,
  Instagram,
  ChevronDown,
} from "lucide-react";
import Logo from "../assets/Logo01.png";
import { useCart } from "../../contexts/CartContext";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const socialMedia = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1CactdLs66/",
      icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/mounir_fragrance/",
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@mounir.fragrance",
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  const { cart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [perfumesDropdownOpen, setPerfumesDropdownOpen] = useState(false);
  const { setIsCartOpen } = useCart();

  const mainNavItems = [
    {
      name: "Parfums",
      type: "dropdown",
      items: [
        { name: "Parfums", link: "category/perfumes" },
        { name: "Decants", link: "category/perfumes/decants" },
      ],
    },
    {
      name: "Cosmétiques",
      type: "link",
      link: "category/cosmetics",
    },
    {
      name: "Cadeaux",
      type: "link",
      link: "category/gifts",
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

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-primary backdrop-blur-xl shadow-lg `}
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
                {mainNavItems.map((item) => (
                  <motion.li
                    key={item.name}
                    variants={itemVariants}
                    className="relative"
                  >
                    {item.type === "dropdown" ? (
                      // Dropdown for Parfums
                      <div
                        className="relative"
                        onMouseEnter={() => setPerfumesDropdownOpen(true)}
                        onMouseLeave={() => setPerfumesDropdownOpen(false)}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center space-x-1 font-medium transition-colors duration-300 cursor-pointer text-lg text-background hover:text-secondary`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${
                              perfumesDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {perfumesDropdownOpen && (
                            <motion.div
                              variants={dropdownVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary/10 overflow-hidden"
                            >
                              <div className="py-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={`/${subItem.link}`}
                                    className="block px-4 py-3 text-primary hover:bg-secondary/10 hover:text-secondary transition-colors"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // Regular link
                      <Link to={`/${item.link}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className={`font-medium transition-colors duration-300 cursor-pointer text-lg text-background hover:text-secondary`}
                        >
                          {item.name}
                        </motion.button>
                      </Link>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Home icon */}
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`cursor-pointer p-2 rounded-full transition-colors text-background hover:text-secondary hover:bg-secondary/10`}
                >
                  <Home size={22} />
                </motion.button>
              </Link>

              {/* Dashboard */}
              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`cursor-pointer p-2 rounded-full transition-colors text-background hover:text-secondary hover:bg-secondary/10`}
                >
                  <LayoutDashboard size={22} />
                </motion.button>
              </Link>

              {/* Cart */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`cursor-pointer relative p-2 rounded-full transition-colors text-background hover:text-secondary hover:bg-secondary/10`}
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
                className={`cursor-pointer md:hidden p-2 rounded-full transition-colors text-background hover:text-secondary hover:bg-secondary/10`}
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
                <div className="flex justify-between items-center mb-16">
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
                  className="space-y-2 flex-1 flex flex-col pb-8"
                >
                  <motion.li variants={itemVariants} className="text-start">
                    <Link
                      onClick={() => setIsOpen(false)}
                      to="/products"
                      className="w-full text-start text-2xl font-semibold text-primary hover:text-secondary transition-colors py-4 px-4 rounded-lg hover:bg-secondary/5"
                    >
                      Collections
                    </Link>
                  </motion.li>

                  {/* Mobile version for Parfums with sub-items */}
                  <motion.li variants={itemVariants} className="text-start">
                    <div className="space-y-2">
                      <Link
                        onClick={() => setIsOpen(false)}
                        to="/category/perfumes"
                        className="w-full text-start text-2xl font-semibold text-primary hover:text-secondary transition-colors py-4 px-4 rounded-lg hover:bg-secondary/5"
                      >
                        Parfums
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        to="/category/perfumes/decants"
                        className="w-full text-start text-xl font-medium text-primary/80 hover:text-secondary transition-colors py-3 px-8 rounded-lg hover:bg-secondary/5 flex items-center"
                      >
                        <span className="ml-2">•</span>
                        <span className="ml-2">Decants</span>
                      </Link>
                    </div>
                  </motion.li>

                  {/* Other categories */}
                  {mainNavItems.slice(1).map((item) => (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      className="text-start"
                    >
                      <Link
                        onClick={() => setIsOpen(false)}
                        to={`/${item.link}`}
                        className="w-full text-start text-2xl font-semibold text-primary hover:text-secondary transition-colors py-4 px-4 rounded-lg hover:bg-secondary/5"
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="flex justify-center space-x-3">
                  {socialMedia.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`bg-secondary/10 text-primary p-2 md:p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all duration-300`}
                      aria-label={social.name}
                      target="_blank"
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
