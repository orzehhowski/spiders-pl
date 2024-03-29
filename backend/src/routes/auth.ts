import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import authController from "../controllers/auth";
import { body } from "express-validator";
import checkValidation from "../middlewares/checkValidation";
import isAuth from "../middlewares/isAuth";

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

// authorization testing route
router.get("/test", excludeFile, isAuth, (req, res) => {
  res.status(200).json({ message: "Alles gut!" });
});

export default router;
