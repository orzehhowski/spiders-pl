import { Router } from "express";
import { param } from "express-validator";

import imageController from "../controllers/image";
import excludeFile from "../middlewares/excludeFile";
import checkValidation from "../middlewares/checkValidation";

const router = Router();

router.get(
  "/:id",
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  imageController.get
);
router.post("/", imageController.post);
router.put(
  "/:id",
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  imageController.put
);
router.delete(
  "/:id",
  param("id", "ID must be a number!").isNumeric(),
  checkValidation,
  excludeFile,
  imageController.delete
);

export default router;
