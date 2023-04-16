import { Router } from "express";
import { param } from "express-validator";
import adminController from "../controllers/admin";
import excludeFile from "../middlewares/excludeFile";
import isAuth from "../middlewares/isAuth";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.get("/suggestion", excludeFile, isAuth, adminController.getSuggestions);

router.get(
  "/suggestion/:id",
  excludeFile,
  isAuth,
  adminController.getSuggestionById
);

router.post(
  "/accept/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  adminController.acceptSuggestion
);

router.post(
  "/reject/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  adminController.rejectSuggestion
);

router.post(
  "/ban/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  adminController.banUser
);

router.post(
  "/unban/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  adminController.unbanUser
);

export default router;
