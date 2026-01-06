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

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await Admin.findOne({ username });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const isMatch = await userExists.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const { accessToken, refreshToken } = generateToken(userExists._id);
    await storeRefreshToken(userExists._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    // Return admin without password
    const adminData = userExists.toObject();
    delete adminData.password;

    res.status(200).json(adminData);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.adminId}`);
    }
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });
    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Aucun jeton de rafraîchissement fourni" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.adminId}`);
    if (storedToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "Jeton de rafraîchissement invalide" });
    }

    const accessToken = jwt.sign(
      { adminId: decoded.adminId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Jeton d'accès rafraîchi" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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
