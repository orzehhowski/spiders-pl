import { Router } from "express";
import adminController from "../controllers/admin";
import excludeFile from "../middlewares/excludeFile";
import isAdmin from "../middlewares/isAdmin";
import isAuth from "../middlewares/isAuth";

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

export default router;
