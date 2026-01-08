import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

const generateToken = (adminId) => {
  const accessToken = jwt.sign({ adminId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ adminId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (adminId, refreshToken) => {
  await redis.set(
    `refresh_token:${adminId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

// const setCookies = (res, accessToken, refreshToken) => {
//   res.cookie("accessToken", accessToken, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     path: "/",
//     maxAge: 15 * 60 * 1000,
//   });

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     path: "/",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });
// };

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Identifiants incorrects" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants incorrects" });
    }

    const accessToken = jwt.sign(
      { adminId: admin._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { adminId: admin._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await redis.set(
      `refresh_token:${admin._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      admin: adminData,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.adminId}`);
    }
    res.json({ message: "Déconnexion réussie" });
  } catch {
    res.status(500).json({ message: "Erreur logout" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token manquant" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const stored = await redis.get(`refresh_token:${decoded.adminId}`);
    if (stored !== refreshToken) {
      return res.status(401).json({ message: "Refresh token invalide" });
    }

    const newAccessToken = jwt.sign(
      { adminId: decoded.adminId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Refresh échoué" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    if (currentPassword) {
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Le mot de passe actuel est incorrect" });
      }
    }

    if (newUsername && newUsername.trim() !== admin.username) {
      const usernameExists = await Admin.findOne({ username: newUsername });
      if (usernameExists) {
        return res
          .status(400)
          .json({ message: "Ce nom d'utilisateur existe déjà" });
      }
      admin.username = newUsername;
    }

    if (newPassword && newPassword.trim()) {
      admin.password = newPassword;
    }

    await admin.save();

    const updatedAdmin = await Admin.findById(admin._id).select("-password");

    res.json({
      message: "Administrateur mis à jour avec succès",
      admin: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, password, role = "admin" } = req.body;
    const currentAdmin = req.admin;

    // Check if current admin has permission to create admins
    if (currentAdmin.role !== "super-admin" && role === "super-admin") {
      return res.status(403).json({
        message:
          "Seul le super administrateur peut créer des comptes d administrateur super-admin",
      });
    }

    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      return res
        .status(400)
        .json({ message: "Ce nom d'utilisateur existe déjà" });
    }

    const createdAdmin = await Admin.create({
      username,
      password,
      role: currentAdmin.role === "super-admin" ? role : "admin",
    });

    // Remove password from response
    const adminData = createdAdmin.toObject();
    delete adminData.password;

    res.status(201).json(adminData);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.admin;

    // Only super-admin can delete admins
    if (currentAdmin.role !== "super-admin") {
      return res.status(403).json({
        message:
          "Seul le super administrateur peut supprimer des administrateurs",
      });
    }

    // Prevent self-deletion
    if (id === currentAdmin._id.toString()) {
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer votre propre compte",
      });
    }

    // Check if admin exists
    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // Prevent deletion of other super-admins
    if (adminToDelete.role === "super-admin") {
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer un autre super administrateur",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.json({
      message: "Administrateur supprimé avec succès",
      deletedAdminId: id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const currentAdmin = req.admin;

    // Only super admin can see all admins
    if (currentAdmin.role !== "super-admin") {
      return res.status(403).json({
        message: "Accès non autorisé",
      });
    }

    // Get all admins except password field
    const admins = await Admin.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ admins });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération",
      error: error.message,
    });
  }
};
