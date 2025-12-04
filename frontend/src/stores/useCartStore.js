import { create } from "zustand";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],

  loadCart: () => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    set({ cart });
  },

  addToCart: (product) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    let existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    set({ cart });
    toast.success("Produit ajout  au panier");
  },

  removeFromCart: (productId) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart = cart.filter((item) => item._id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    set({ cart });
    toast.success("Produit retir  du panier");
  },

  increaseQuantity: (productId) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let product = cart.find((item) => item._id === productId);
    product.quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    set({ cart });
  },

  decreaseQuantity: (productId) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let product = cart.find((item) => item._id === productId);

    if (product) {
      if (product.quantity > 1) {
        product.quantity -= 1;
      } else {
        cart = cart.filter((item) => item._id !== productId);
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    set({ cart });
  },

  //   useCartStore
  addToCartWithQuantity: (product, quantityToAdd) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    let existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      existingProduct.quantity += quantityToAdd;
    } else {
      cart.push({ ...product, quantity: quantityToAdd });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    set({ cart });
    toast.success(`${quantityToAdd} item(s) ajout  au panier`);
  },
}));
