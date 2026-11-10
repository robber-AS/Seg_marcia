import { Router } from "express";
import { 
  processProject, 
  getProjectStatus, 
  getProjectClips 
} from "../controllers/projectController.js";

const router = Router();

router.post("/process/:id", processProject);
router.get("/status/:id", getProjectStatus);

export default router;