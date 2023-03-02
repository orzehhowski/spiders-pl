import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import authController from "../controllers/auth";
import { body } from "express-validator";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.post(
  "/signup",
  excludeFile,
  body("email", "Incorrect email.").isEmail(),
  body("password", "Password is too weak!").isStrongPassword(),
  checkValidation,
  authController.singup
);

export default router;
