import { Router } from "express";
import { param } from "express-validator";
import adminController from "../controllers/admin";
import excludeFile from "../middlewares/excludeFile";
import isAdmin from "../middlewares/isAdmin";
import isAuth from "../middlewares/isAuth";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.get(
  "/suggestion",
  excludeFile,
  isAuth,
  isAdmin,
  adminController.getSuggestions
);

router.get(
  "/suggestion/:id",
  excludeFile,
  isAuth,
  isAdmin,
  adminController.getSuggestionById
);

router.post(
  "/accept/:id",
  excludeFile,
  isAuth,
  isAdmin,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  adminController.acceptSuggestion
);

export default router;
