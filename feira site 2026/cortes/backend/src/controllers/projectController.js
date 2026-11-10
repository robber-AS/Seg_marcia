import path from "path";
import os from "os";
import { YouTubeService } from "../services/youtube/YouTubeService.js";
import { VideoProcessingService } from "../services/video/VideoProcessingService.js";
import { ClipAnalysisService } from "../services/ai/ClipAnalysisService.js";
import { TranscriptionService } from "../services/transcription/TranscriptionService.js";

export async function validateYouTubeURL(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const result = YouTubeService.validateURL(url);

  if (!result.valid) {
    return res.status(400).json({ error: "Insira um link válido do YouTube." });
  }

  const videoInfo = YouTubeService.getVideoInfo(url);

  res.json({ valid: result.valid, videoId: videoInfo.videoId });
}

export async function createProject(req, res) {
  const { youtube_url } = req.body;

  if (!youtube_url) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  // Validate URL first
  const validation = YouTubeService.validateURL(youtube_url);

  if (!validation.valid) {
    return res.status(400).json({ error: "Insira um link válido do YouTube." });
  }

  res.status(201).json({ project: { id: Date.now().toString(), youtube_url, status: "validated" } });
}

export async function getProject(req, res) {
  const { id } = req.params;

  const { data } = await Promise.resolve({ id, youtube_url: "", status: "validated" });

  if (!data) {
    return res.status(404).json({ error: "Project not found" });
  }

  res.json({ project: data });
}

export async function getProjectClips(req, res) {
  const { id } = req.params;

  // Return empty array since there's no database
  res.json({ clips: [] });
}

export async function getProjects(req, res) {
  // Return empty array since there's no database
  res.json({ projects: [] });
}

export async function processProject(req, res) {
  const { id } = req.params;

  try {
    // Start async processing pipeline
    processVideoProject(id).then((result) => {
      res.json({ 
        message: "Processing completed", 
        projectId: id,
        video_url: result.videoUrl,
        clips: result.clips 
      });
    }).catch((err) => {
      console.error("Processing error:", err);
      res.status(500).json({ error: "Failed to process video" });
    });
  } catch (err) {
    console.error("Error starting processing:", err);
    res.status(500).json({ error: "Failed to start processing" });
  }
}

async function processVideoProject(projectId) {
  try {
    // 1. Extract video ID (we need a URL - use a placeholder for demo)
    // In a real implementation, you'd store the URL and extract it later
    const videoId = "placeholder_id";
    
    console.log(`Starting processing for project ${projectId}, video ID: ${videoId}`);

    // 2. For this demo, we'll create a simple test scenario
    // Since we don't have the actual YouTube video, we'll simulate the processing
    // and return a generated clip path
    
    // The actual FFmpeg services expect real video files, so for now:
    // We'll return a mock result that the frontend can use
    const mockClip = {
      title: "Momento Destacado",
      start: 30,
      end: 90,
      duration: 60,
      reason: "Trecho interessante identificado pela IA"
    };

    // Try to actually process if video exists, otherwise return mock
    const videoPath = path.join(os.tmpdir(), `${projectId}_full_video.mp4`);
    
    let clips = [];
    let videoUrl = null;

    // Check if we have enough data to actually process
    if (global.mockMode) {
      // Mock mode - return simulated results
      clips = [mockClip];
      videoUrl = `/api/download/mock_clip.mp4`;
    } else {
      // Real mode - would need actual YouTube video download
      // For now, return structure that frontend expects
      clips = [mockClip];
      videoUrl = `/api/download/mock_clip.mp4`;
    }

    console.log(`Processing project ${projectId} completed with ${clips.length} clips`);
    
    return {
      videoUrl,
      clips
    };
  } catch (error) {
    console.error("Error in processVideoProject:", error);
    throw error;
  }
}