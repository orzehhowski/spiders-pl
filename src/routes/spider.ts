import { Router } from "express";
import { param, body } from "express-validator";
import checkValidation from "../middlewares/checkValidation";

import excludeFile from "../middlewares/excludeFile";
import spiderController from "../controllers/spider";

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
  body("latinName", "Latin name is required!").notEmpty(),
  checkValidation,
  spiderController.post
);
router.put(
  "/:id",
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  spiderController.put
);
router.delete(
  "/:id",
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  spiderController.delete
);

export default router;
