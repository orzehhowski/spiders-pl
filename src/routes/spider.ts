import { Router } from "express";
import { param, body } from "express-validator";
import checkValidation from "../middlewares/checkValidation";

import excludeFile from "../middlewares/excludeFile";
import spiderController from "../controllers/spider";
import isAuth from "../middlewares/isAuth";

const router = Router();

router.get(
  "/:id",
  excludeFile,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  spiderController.getById
);
router.post(
  "/",
  isAuth,
  body("latinName", "Latin name is required!").notEmpty(),
  body("familyId", "Family ID must be a number!").isNumeric(),
  checkValidation,
  spiderController.post
);
router.put(
  "/:id",
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  spiderController.put
);
router.delete(
  "/:id",
  isAuth,
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  spiderController.delete
);

export default router;
