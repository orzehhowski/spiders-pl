import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import isAuth from "../middlewares/isAuth";
import familyController from "../controllers/family";
import { body, param } from "express-validator";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.get("/", excludeFile, familyController.getAll);
router.get(
  "/:id",
  excludeFile,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  familyController.get
);
router.post(
  "/",
  isAuth,
  body("latinName", "Latin name is required!").notEmpty(),
  checkValidation,
  familyController.post
);
router.put(
  "/:id",
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  familyController.put
);
router.delete(
  "/:id",
  excludeFile,
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  familyController.delete
);

export default router;
