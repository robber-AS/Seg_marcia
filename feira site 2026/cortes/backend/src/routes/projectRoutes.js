import { Router } from "express";
import { createProject, getProject, getProjectClips, getProjects, processProject, validateYouTubeURL } from "../controllers/projectController.js";
import path from "path";
import os from "os";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.get("/:id/clips", getProjectClips);
router.post("/:id/process", async (req, res) => {
  await processProject(req, res);
});
router.post("/validate", validateYouTubeURL);
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(os.tmpdir(), req.params.filename);
  res.download(filePath);
});
router.delete("/:id", (req, res) => {
  res.json({ success: true });
});

export default router;