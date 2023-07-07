import { Router } from "express";
import { param } from "express-validator";
import ownerController from "../controllers/owner";
import excludeFile from "../middlewares/excludeFile";
import isAuth from "../middlewares/isAuth";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.post(
  "/set-admin/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  ownerController.setAdmin
);

export default router;
