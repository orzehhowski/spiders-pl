import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import authController from "../controllers/auth";
import { body, param } from "express-validator";
import checkValidation from "../middlewares/checkValidation";
import isAuth from "../middlewares/isAuth";
import isAdmin from "../middlewares/isAdmin";

const router = Router();

router.post(
  "/signup",
  excludeFile,
  body("email", "Incorrect email.").isEmail(),
  body("password", "Password is too weak!").isStrongPassword(),
  checkValidation,
  authController.singup
);

router.post(
  "/login",
  excludeFile,
  body("email", "Incorrect email.").isEmail(),
  body("password", "No password provided.").notEmpty(),
  checkValidation,
  authController.login
);

router.put(
  "/set-admin/:email",
  excludeFile,
  isAuth,
  isAdmin,
  param("email", "Incorrect Email.").isEmail(),
  checkValidation,
  authController.setAdmin
);

// authorization testing route
router.get("/test", excludeFile, isAuth, isAdmin, (req, res) => {
  res.status(200).json({ message: "alles gut" });
});

export default router;
