import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Products from "./pages/Products.jsx";
import Admin from "./pages/Admin.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import Perfumes from "./pages/Perfumes.jsx";
import Cosmetics from "./pages/Cosmetics.jsx";
import Gifts from "./pages/Gifts.jsx";
import ScrollToTop from "./components/scrollToTop.jsx";
import Cart from "./components/Cart.jsx";
import { CartProvider } from "../contexts/CartContext.jsx";
import Checkout from "./pages/Checkout.jsx";
import Product from "./pages/Product.jsx";
import { Toaster } from "react-hot-toast";
import { useAdminStore } from "./stores/useAdminStore.js";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import ScrollProgressBar from "./components/ScrollProgressBar .jsx";
import Decants from "./pages/Decants.jsx";

const App = () => {
  const { user, checkAuth, checkingAuth } = useAdminStore();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/health").catch(() => {});
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <CartProvider>
      <Navbar />
      <Cart />
      <ScrollToTopButton />
      <ScrollProgressBar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/category/perfumes" element={<Perfumes />} />
        <Route path="/category/cosmetics" element={<Cosmetics />} />
        <Route path="/category/gifts" element={<Gifts />} />
        <Route path="/category/perfumes/decants" element={<Decants />} />
        <Route path="/admin" element={!user ? <LoginAdmin /> : <Admin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/products/:productId" element={<Product />} />
      </Routes>
      <Toaster />
    </CartProvider>
  );
};

export default App;
