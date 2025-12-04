import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
} from "lucide-react";
import Logo from "../assets/Logo02.png";
import { Link } from "react-router-dom";

const Footer = ({ colorBg, colorText }) => {
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

  return (
    <footer
      className={`bg-${colorBg} text-${colorText} pt-8 md:pt-12 lg:pt-16 mt-8 md:mt-12 lg:mt-16`}
    >
      <div className="costum-section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex justify-center md:justify-start mb-4 md:mb-6">
              <img
                src={Logo}
                alt="Mounir Fragrance"
                className="h-16 md:h-20 w-auto"
              />
            </div>
            <p
              className={`text-${colorText}/80 text-center md:text-left mb-4 md:mb-6 text-sm md:text-base leading-relaxed`}
            >
              Votre destination de luxe pour les parfums, cosmétiques et cadeaux
              d'exception.
            </p>
            <div className="flex justify-center md:justify-start space-x-3 md:space-x-4">
              {socialMedia.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`bg-${colorText}/10 text-${colorText} p-2 md:p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all duration-300`}
                  aria-label={social.name}
                  target="_blank"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
              Contactez-Nous
            </h3>

            <div className="space-y-3 md:space-y-4">
              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/213549710750"
                target="_blank"
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-3 bg-${colorText}/10 rounded-xl hover:bg-${colorText}/20 transition-all duration-300 group`}
              >
                <div className="bg-green-500 p-2 rounded-full mr-3 md:mr-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs md:text-sm">WhatsApp</h4>
                  <p className={`text-${colorText} text-xs`}>+213 549710750</p>
                </div>
              </motion.a>

              {/* Phone */}
              <motion.a
                href="tel:+213549710750"
                target="_blank"
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-3 bg-${colorText}/10 rounded-xl hover:bg-${colorText}/20 transition-all duration-300 group`}
              >
                <div className="bg-secondary p-2 rounded-full mr-3 md:mr-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                </div>
                <div>
                  <h4 className={`font-semibold text-xs md:text-sm`}>
                    Appel Direct
                  </h4>
                  <p className={`text-${colorText} text-xs`}>
                    +213 549710750 <br /> +213 550492426
                  </p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className={`text-lg md:text-xl font-bold mb-4 md:mb-6`}>
              Navigation
            </h3>
            <nav className="space-y-2 md:space-y-3">
              {[
                { name: "Parfums", href: "/category/perfumes" },
                { name: "Cosmétiques", href: "/category/cosmetics" },
                { name: "Cadeaux", href: "/category/gifts" },
                { name: "Collections", href: "/products" },
              ].map((link) => (
                <Link to={link.href} key={link.name} className={`block`}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className={`cursor-pointer block text-${colorText}/80 hover:text-secondary transition-colors duration-300 text-sm md:text-base`}
                  >
                    {link.name}
                  </motion.div>
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className={`text-lg md:text-xl font-bold mb-4 md:mb-6`}>
              Informations
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className={`font-semibold text-xs md:text-sm`}>
                    Adresse
                  </h4>
                  <p className={`text-${colorText} text-xs`}>
                    Usto, Oran, Algérie
                  </p>
                </div>
              </div>

              <div className={`bg-${colorText}/10 rounded-xl p-3 md:p-4`}>
                <h4 className={`font-semibold text-xs md:text-sm mb-2`}>
                  Horaires d'Ouverture
                </h4>
                <p className={`text-${colorText} text-xs`}>
                  Lun - Ven: 9h - 18h
                </p>
                <p className={`text-${colorText} text-xs`}>Sam: 9h - 16h</p>
                <p className={`text-${colorText} text-xs`}>Vendredi: Fermé</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className={`border-t border-${colorText}/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center`}
        >
          <p className={`text-${colorText} text-xs md:text-sm`}>
            © {new Date().getFullYear()} Mounir Fragrance. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
