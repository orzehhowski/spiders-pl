import { Router } from "express";
import familyController from "../controllers/family";

const router = Router();

router.get("/", familyController.getAll);
router.get("/:id", familyController.get);
router.post("/", familyController.post);
router.put("/:id", familyController.put);
router.delete("/:id", familyController.delete);

export default router;
