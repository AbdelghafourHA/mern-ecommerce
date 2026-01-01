import Shipping from "../models/Shipping.model.js";

/* ==============================
   GET – All Shipping Prices
================================ */
export const getAllShipping = async (req, res) => {
  try {
    const shipping = await Shipping.find().sort({ wilayaCode: 1 });
    res.status(200).json(shipping);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shipping data" });
  }
};

/* ==============================
   CREATE – Add Wilaya Shipping
================================ */
export const createShipping = async (req, res) => {
  try {
    const { wilayaCode, wilayaName, officePrice, homePrice } = req.body;

    const exists = await Shipping.findOne({ wilayaCode });
    if (exists) {
      return res.status(400).json({ message: "Wilaya already exists" });
    }

    const shipping = await Shipping.create({
      wilayaCode,
      wilayaName,
      officePrice,
      homePrice,
    });

    res.status(201).json(shipping);
  } catch (error) {
    res.status(500).json({ message: "Failed to create shipping" });
  }
};

/* ==============================
   UPDATE – Update Prices
================================ */
export const updateShipping = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await Shipping.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!shipping) {
      return res.status(404).json({ message: "Shipping not found" });
    }

    res.status(200).json(shipping);
  } catch (error) {
    res.status(500).json({ message: "Failed to update shipping" });
  }
};

/* ==============================
   TOGGLE – Enable / Disable
================================ */
export const toggleShipping = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await Shipping.findById(id);
    if (!shipping) {
      return res.status(404).json({ message: "Shipping not found" });
    }

    shipping.isActive = !shipping.isActive;
    await shipping.save();

    res.status(200).json(shipping);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle shipping" });
  }
};
