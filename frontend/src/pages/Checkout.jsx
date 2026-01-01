import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import algeriaWillayas from "../utils/Willaya.json";
import { useCheckoutStore } from "../stores/useCheckoutStore";
import { useShippingStore } from "../stores/useShippingStore"; // إضافة الـ store الجديد

const Checkout = () => {
  const [items, setItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // إضافة state جديد لحساب سعر الشحن
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedWilaya, setSelectedWilaya] = useState(null);

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { createCheckout } = useCheckoutStore();
  const {
    shipping,
    fetchShipping,
    loading: shippingLoading,
  } = useShippingStore(); // جلب بيانات الشحن

  useEffect(() => {
    fetchShipping(); // جلب بيانات الشحن عند تحميل المكون
  }, []);

  useEffect(() => {
    const directCheckoutData = JSON.parse(
      localStorage.getItem("directCheckout") || "null"
    );

    if (directCheckoutData && directCheckoutData.directCheckout) {
      setIsDirectCheckout(true);
      setItems([directCheckoutData.product]);
      setCheckoutTotal(directCheckoutData.total);
      setItemCount(directCheckoutData.count);

      setTimeout(() => {
        localStorage.removeItem("directCheckout");
      }, 100);
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setIsDirectCheckout(false);
      setItems(cart);

      const newTotal = cart.reduce((sum, item) => {
        if (item.category === "Decants") {
          if (
            item.discount > 0 &&
            item.discountedVolumePricing &&
            item.selectedSize
          ) {
            let discountedVolumePricing = {};
            if (
              item.discountedVolumePricing instanceof Map ||
              item.discountedVolumePricing[Symbol.iterator]
            ) {
              try {
                discountedVolumePricing = Object.fromEntries(
                  item.discountedVolumePricing
                );
              } catch {
                discountedVolumePricing = {};
              }
            } else {
              discountedVolumePricing = item.discountedVolumePricing || {};
            }

            const discountedPrice = discountedVolumePricing[item.selectedSize];
            if (discountedPrice) {
              return sum + discountedPrice * item.quantity;
            }
          }

          let volumePricing = {};
          if (
            item.volumePricing instanceof Map ||
            item.volumePricing[Symbol.iterator]
          ) {
            try {
              volumePricing = Object.fromEntries(item.volumePricing);
            } catch {
              volumePricing = {};
            }
          } else {
            volumePricing = item.volumePricing || {};
          }

          const volumePrice = volumePricing[item.selectedSize] || item.price;
          const finalPrice =
            item.discount > 0
              ? Math.round(volumePrice * (1 - item.discount / 100))
              : volumePrice;
          return sum + finalPrice * item.quantity;
        }

        const price =
          item.discount > 0
            ? item.newPrice > 0
              ? item.newPrice
              : Math.round(item.price * (1 - item.discount / 100))
            : item.price;
        return sum + price * item.quantity;
      }, 0);

      const newCount = cart.reduce((sum, item) => sum + item.quantity, 0);

      setCheckoutTotal(newTotal);
      setItemCount(newCount);
    }

    setHasLoaded(true);
  }, []);

  const algeriaWilayas = {};
  algeriaWillayas.forEach((wilaya) => {
    const wilayaKey = `${wilaya.wilayaCode.toString().padStart(2, "0")}-${
      wilaya.nameFr
    }`;
    algeriaWilayas[wilayaKey] = {
      name: wilaya.nameFr,
      code: wilaya.wilayaCode,
      communes: wilaya.communes.map((commune) => commune.nameFr),
    };
  });

  const subtotal = checkoutTotal;
  const total = subtotal + shippingPrice;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    willaya: "",
    commune: "",
    country: "Algérie",
    deliveryType: "home",
    paymentMethod: "COD",
  });

  const formatPrice = (price) => {
    return `${price?.toLocaleString("fr-FR") || 0} DA`;
  };

  const getItemPrice = (item) => {
    if (item.category === "Decants") {
      if (
        item.discount > 0 &&
        item.discountedVolumePricing &&
        item.selectedSize
      ) {
        let discountedVolumePricing = {};
        if (
          item.discountedVolumePricing instanceof Map ||
          item.discountedVolumePricing[Symbol.iterator]
        ) {
          try {
            discountedVolumePricing = Object.fromEntries(
              item.discountedVolumePricing
            );
          } catch {
            discountedVolumePricing = {};
          }
        } else {
          discountedVolumePricing = item.discountedVolumePricing || {};
        }

        const discountedPrice = discountedVolumePricing[item.selectedSize];
        if (discountedPrice) {
          return discountedPrice;
        }
      }

      let volumePricing = {};
      if (
        item.volumePricing instanceof Map ||
        item.volumePricing[Symbol.iterator]
      ) {
        try {
          volumePricing = Object.fromEntries(item.volumePricing);
        } catch {
          volumePricing = {};
        }
      } else {
        volumePricing = item.volumePricing || {};
      }

      const volumePrice = volumePricing[item.selectedSize] || item.price;
      return item.discount > 0
        ? Math.round(volumePrice * (1 - item.discount / 100))
        : volumePrice;
    }

    return item.discount > 0
      ? item.newPrice > 0
        ? item.newPrice
        : Math.round(item.price * (1 - item.discount / 100))
      : item.price;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
        ...(name === "willaya" && { commune: "" }),
      };

      // إذا تغيرت الولاية، احسب سعر الشحن الجديد
      if (name === "willaya") {
        calculateShippingPrice(newFormData.willaya, newFormData.deliveryType);
      }

      // إذا تغير نوع التوصيل، احسب سعر الشحن الجديد
      if (name === "deliveryType" && formData.willaya) {
        calculateShippingPrice(formData.willaya, value);
      }

      return newFormData;
    });
  };

  // دالة لحساب سعر الشحن بناءً على الولاية ونوع التوصيل
  const calculateShippingPrice = (wilayaValue, deliveryType) => {
    if (!wilayaValue) {
      setShippingPrice(0);
      setSelectedWilaya(null);
      return;
    }

    // استخراج كود الولاية من القيمة (مثلاً: "01-Adrar")
    const wilayaCode = parseInt(wilayaValue.split("-")[0]);

    // البحث عن الولاية في بيانات الشحن
    const wilayaData = shipping.find((s) => s.wilayaCode === wilayaCode);

    if (wilayaData && wilayaData.isActive) {
      setSelectedWilaya(wilayaData);

      // تحديد السعر بناءً على نوع التوصيل
      const price =
        deliveryType === "home" ? wilayaData.homePrice : wilayaData.officePrice;

      setShippingPrice(price);
    } else {
      setSelectedWilaya(null);
      setShippingPrice(0);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^213/, "");
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من أن الولاية مفعلة للشحن
    if (selectedWilaya && !selectedWilaya.isActive) {
      alert(
        "La livraison n'est pas disponible pour cette wilaya pour le moment."
      );
      return;
    }

    // التحقق من وجود سعر للشحن
    if (shippingPrice === 0 && formData.willaya) {
      alert("Veuillez sélectionner une wilaya valide pour la livraison.");
      return;
    }

    const orderItems = items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      image: item.image,
      price: getItemPrice(item),
      product: item._id,
      volume:
        item.selectedSize ||
        item.volume ||
        (item.category === "Decants" ? "10ml" : null),
    }));

    const orderData = {
      ...formData,
      orderItems: orderItems,
      subtotalPrice: subtotal,
      shippingPrice: shippingPrice,
      totalPrice: total,
      checkoutType: isDirectCheckout ? "direct" : "cart",
      // إضافة معلومات إضافية عن الشحن
      wilayaCode: selectedWilaya?.wilayaCode || 0,
      wilayaName: selectedWilaya?.wilayaName || "",
    };

    console.log("Sending order data:", orderData);

    await createCheckout(orderData);
    setCurrentStep(4);
  };

  const steps = [
    { number: 1, title: "Informations", icon: <Shield size={20} /> },
    { number: 2, title: "Livraison", icon: <Truck size={20} /> },
    { number: 3, title: "Paiement", icon: <CreditCard size={20} /> },
    { number: 4, title: "Confirmation", icon: <CheckCircle size={20} /> },
  ];

  if (!hasLoaded || shippingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="costum-section">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer flex items-center space-x-2 text-primary hover:text-secondary transition-colors font-p01 text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Retour</span>
            </button>

            {isDirectCheckout && (
              <span className="bg-secondary text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                Achat direct
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-p01 mb-4 text-center lg:text-left">
            {isDirectCheckout ? "Achat Direct" : "Finaliser la Commande"}
          </h1>

          <div className="flex justify-center mb-6 sm:mb-8 lg:mb-12">
            <div className="w-full max-w-4xl">
              <div className="lg:hidden space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                        currentStep >= step.number
                          ? "bg-secondary border-secondary text-primary"
                          : "border-primary/20 text-primary/40"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                      ) : (
                        React.cloneElement(step.icon, {
                          size: 16,
                          className: "sm:w-5 sm:h-5",
                        })
                      )}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`font-bold01 text-xs sm:text-sm ${
                          currentStep >= step.number
                            ? "text-primary"
                            : "text-primary/40"
                        }`}
                      >
                        Étape {step.number}
                      </span>
                      <p
                        className={`font-p01 font-bold text-sm sm:text-base ${
                          currentStep >= step.number
                            ? "text-primary"
                            : "text-primary/40"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-6 sm:h-8 ml-6 ${
                          currentStep > step.number
                            ? "bg-secondary"
                            : "bg-primary/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden lg:flex items-center justify-between relative">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-secondary border-secondary text-primary"
                            : "border-primary/20 text-primary/40"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle size={20} className="lg:w-6 lg:h-6" />
                        ) : (
                          React.cloneElement(step.icon, {
                            size: 20,
                            className: "lg:w-6 lg:h-6",
                          })
                        )}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 lg:w-24 h-0.5 ${
                            currentStep > step.number
                              ? "bg-secondary"
                              : "bg-primary/20"
                          }`}
                        />
                      )}
                    </div>

                    <span
                      className={`mt-3 font-bold01 text-sm lg:text-base text-center ${
                        currentStep >= step.number
                          ? "text-primary"
                          : "text-primary/40"
                      }`}
                    >
                      {step.title}
                    </span>

                    <div
                      className={`absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full text-xs flex items-center justify-center font-bold01 ${
                        currentStep >= step.number
                          ? "bg-accent text-primary"
                          : "bg-primary/20 text-primary/40"
                      }`}
                    >
                      {step.number}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:hidden text-center mt-4 sm:mt-6">
                <span className="bg-secondary text-primary px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold01 text-xs sm:text-sm">
                  Étape {currentStep} sur {steps.length} :{" "}
                  {steps[currentStep - 1]?.title}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-primary/10 p-4 sm:p-6 sticky top-24"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-primary font-p01">
                  Résumé de la Commande
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {items.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-primary/60">Aucun produit</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const itemPrice = getItemPrice(item);

                    return (
                      <div key={item._id} className="flex space-x-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-primary font-bold01 text-sm sm:text-base line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <div>
                              <span className="text-secondary font-p01 text-sm sm:text-base">
                                {formatPrice(itemPrice)}
                              </span>
                              {(item.selectedSize || item.volume) && (
                                <span className="ml-2 bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                                  {item.selectedSize || item.volume}
                                </span>
                              )}
                            </div>
                            <span className="text-primary/60 text-xs sm:text-sm font-p01">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-2 sm:space-y-3 border-t border-primary/10 pt-3 sm:pt-4">
                <div className="flex justify-between text-primary font-bold01 text-sm sm:text-base">
                  <span>
                    Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
                  </span>
                  <span className="font-p01">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-primary font-bold01 text-sm sm:text-base">
                  <span>
                    Livraison{" "}
                    {selectedWilaya && `(${selectedWilaya.wilayaName})`}
                  </span>
                  <span className="font-p01">
                    {shippingPrice > 0
                      ? formatPrice(shippingPrice)
                      : "À calculer"}
                  </span>
                </div>

                {/* عرض تحذير إذا كانت الولاية معطلة */}
                {selectedWilaya && !selectedWilaya.isActive && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs text-center">
                      ⚠️ La livraison n'est pas disponible pour{" "}
                      {selectedWilaya.wilayaName}
                    </p>
                  </div>
                )}

                <div className="border-t border-primary/10 pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-primary font-p01">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {currentStep !== 4 && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-xl text-center">
                  <Shield
                    className="mx-auto text-secondary mb-2 sm:w-6 sm:h-6"
                    size={20}
                  />
                  <p className="text-primary/60 text-xs sm:text-sm font-bold01">
                    Paiement 100% sécurisé
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-primary/10 p-4 sm:p-6"
            >
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary font-p01 mb-4 sm:mb-6">
                    Informations Personnelles
                  </h2>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                          Nom *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 font-bold01 text-sm sm:text-base">
                          +213
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          required
                          placeholder="X XXX XXXX"
                          className="w-full pl-14 sm:pl-16 pr-4 p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                          maxLength={9}
                        />
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextStep}
                      disabled={
                        !formData.firstName ||
                        !formData.lastName ||
                        !formData.email ||
                        !formData.phone
                      }
                      className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full bg-secondary text-primary py-3 sm:py-4 rounded-xl font-p01 text-sm sm:text-base hover:shadow-lg transition-all duration-300"
                    >
                      Continuer vers la Livraison
                    </motion.button>
                  </form>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary font-p01 mb-4 sm:mb-6">
                    Adresse de Livraison
                  </h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                          Wilaya *
                        </label>
                        <select
                          name="willaya"
                          value={formData.willaya}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                        >
                          <option value="">Sélectionnez votre wilaya</option>
                          {Object.keys(algeriaWilayas).map((wilayaKey) => {
                            const wilayaData = algeriaWilayas[wilayaKey];
                            const shippingData = shipping.find(
                              (s) => s.wilayaCode === wilayaData.code
                            );
                            const isActive = shippingData?.isActive || false;

                            return (
                              <option
                                key={wilayaKey}
                                value={wilayaKey}
                                className={!isActive ? "text-red-500" : ""}
                              >
                                {wilayaData.name}{" "}
                                {!isActive && "(Non disponible)"}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                          Commune *
                        </label>
                        <select
                          name="commune"
                          value={formData.commune}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.willaya}
                          className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base disabled:opacity-50"
                        >
                          <option value="">Sélectionnez votre commune</option>
                          {formData.willaya &&
                            algeriaWilayas[formData.willaya]?.communes?.map(
                              (commune) => (
                                <option key={commune} value={commune}>
                                  {commune}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                        Type de Livraison *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3 p-3 sm:p-4 border border-primary/20 rounded-xl cursor-pointer hover:border-secondary transition-colors">
                          <input
                            type="radio"
                            name="deliveryType"
                            value="home"
                            checked={formData.deliveryType === "home"}
                            onChange={handleInputChange}
                            className="text-secondary focus:ring-secondary"
                          />
                          <div>
                            <span className="font-bold01 text-primary text-sm sm:text-base">
                              Domicile
                            </span>
                            <p className="text-primary/60 text-xs sm:text-sm">
                              Livraison à l'adresse personnelle
                              {selectedWilaya && (
                                <span className="block text-secondary font-bold mt-1">
                                  {formatPrice(selectedWilaya.homePrice)}
                                </span>
                              )}
                            </p>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 sm:p-4 border border-primary/20 rounded-xl cursor-pointer hover:border-secondary transition-colors">
                          <input
                            type="radio"
                            name="deliveryType"
                            value="office"
                            checked={formData.deliveryType === "office"}
                            onChange={handleInputChange}
                            className="text-secondary focus:ring-secondary"
                          />
                          <div>
                            <span className="font-bold01 text-primary text-sm sm:text-base">
                              Bureau
                            </span>
                            <p className="text-primary/60 text-xs sm:text-sm">
                              Livraison à l'adresse professionnelle
                              {selectedWilaya && (
                                <span className="block text-secondary font-bold mt-1">
                                  {formatPrice(selectedWilaya.officePrice)}
                                </span>
                              )}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm sm:text-base">
                        Pays
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm sm:text-base"
                      >
                        <option value="Algérie">Algérie</option>
                      </select>
                    </div>

                    {/* عرض معلومات الشحن */}
                    {selectedWilaya && (
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <h4 className="font-bold01 text-primary text-sm mb-2">
                          Informations de Livraison
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="text-primary/60 text-xs">
                              Wilaya:
                            </span>
                            <p className="font-semibold text-primary text-sm">
                              {selectedWilaya.wilayaName}
                            </p>
                          </div>
                          <div>
                            <span className="text-primary/60 text-xs">
                              Livraison:
                            </span>
                            <p className="font-semibold text-primary text-sm">
                              {formData.deliveryType === "home"
                                ? "Domicile"
                                : "Bureau"}
                            </p>
                          </div>
                          <div>
                            <span className="text-primary/60 text-xs">
                              Prix:
                            </span>
                            <p className="font-bold text-secondary text-sm">
                              {formatPrice(shippingPrice)}
                            </p>
                          </div>
                          <div>
                            <span className="text-primary/60 text-xs">
                              Statut:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                selectedWilaya.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {selectedWilaya.isActive
                                ? "Disponible"
                                : "Non disponible"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePreviousStep}
                        className="flex-1 border border-primary/20 text-primary py-2 sm:py-3 rounded-xl font-p01 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm sm:text-base"
                      >
                        Retour
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextStep}
                        disabled={
                          !formData.willaya ||
                          !formData.commune ||
                          !formData.address ||
                          (selectedWilaya && !selectedWilaya.isActive)
                        }
                        className="flex-1 bg-secondary text-primary py-2 sm:py-3 rounded-xl font-p01 hover:shadow-lg transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedWilaya && !selectedWilaya.isActive
                          ? "Livraison non disponible"
                          : "Continuer vers le Paiement"}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary font-p01 mb-4 sm:mb-6">
                    Méthode de Paiement
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 p-3 sm:p-4 border border-primary/20 rounded-xl cursor-pointer hover:border-secondary transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === "cash"}
                          onChange={handleInputChange}
                          className="text-secondary focus:ring-secondary"
                        />
                        <div>
                          <span className="font-bold01 text-primary text-sm sm:text-base">
                            Paiement à la Livraison
                          </span>
                          <p className="text-primary/60 text-xs sm:text-sm">
                            Payez lorsque vous recevez votre commande
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePreviousStep}
                        className="flex-1 border border-primary/20 text-primary py-2 sm:py-3 rounded-xl font-p01 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm sm:text-base"
                      >
                        Retour
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={selectedWilaya && !selectedWilaya.isActive}
                        className="flex-1 bg-secondary text-primary py-2 sm:py-3 rounded-xl font-p01 hover:shadow-lg transition-all duration-300 text-sm sm:text-base disabled:opacity-50"
                      >
                        Confirmer la Commande
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle size={24} className="sm:w-10 sm:h-10" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary font-p01 mb-3 sm:mb-4">
                    Commande Confirmée !
                  </h2>
                  <p className="text-primary/60 font-bold01 mb-6 sm:mb-8 text-base sm:text-lg">
                    Merci pour votre achat. Votre commande a été passée avec
                    succès.
                  </p>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/")}
                      className="w-full bg-secondary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:shadow-lg transition-all duration-300"
                    >
                      Retour à l'Accueil
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/products")}
                      className="w-full border border-primary/20 text-primary py-2 sm:py-3 rounded-xl font-bold01 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm sm:text-base"
                    >
                      Continuer mes Achats
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
