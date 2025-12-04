import Checkout from "../models/checkout.model.js";

export const createCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.create(req.body);
    res.status(201).json(checkout);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in createCheckout controller");
  }
};

export const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.find({});
    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in getAllCheckouts controller");
  }
};

export const updateCheckoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const checkout = await Checkout.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(checkout);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in updateCheckoutStatus controller");
  }
};

export const deleteCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    await Checkout.findByIdAndDelete(id);
    res.json({ message: "Checkout deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in deleteCheckout controller");
  }
};
