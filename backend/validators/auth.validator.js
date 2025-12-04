import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().min(4).max(64).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const createAdminSchema = Joi.object({
  username: Joi.string().min(4).max(64).required(),
  password: Joi.string()
    .min(10)
    .max(128)
    .required()
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")), // basic complexity
  role: Joi.string().valid("admin", "super-admin").optional(),
});

export const updateAdminSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(128).optional(),
  newUsername: Joi.string().min(4).max(64).optional(),
  newPassword: Joi.string()
    .min(10)
    .max(128)
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .optional(),
});
