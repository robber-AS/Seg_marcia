import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class VideoProcessingService {

  static async extractAudio(videoPath, projectId) {
    const audioPath = path.join(
      os.tmpdir(),
      `${projectId}_audio.mp3`
    );

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions(["-vn", "-acodec", "libmp3lame", "-ab", "128k"])
        .on("end", () => resolve(audioPath))
        .on("error", (err) => reject(err))
        .saveToFile(audioPath);
    });

    return audioPath;
  }

  static async cutVideo(videoPath, startTime, endTime, projectId) {
    const clipPath = path.join(
      os.tmpdir(),
      `${projectId}_clip_${Date.now()}.mp4`
    );

    const duration = endTime - startTime;

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .inputOptions([
          `-ss ${startTime}`,
          `-t ${duration}`
        ])
        .outputOptions([
          "-c:v", "libx264",
          "-c:a", "aac",
          "-preset", "medium",
          "-crf", "23"
        ])
        .on("end", () => resolve(clipPath))
        .on("error", (err) => reject(err))
        .saveToFile(clipPath);
    });

    return clipPath;
  }

  static async resizeToVertical(inputPath, projectId) {
    const outputPath = path.join(
      os.tmpdir(),
      `${projectId}_vertical.mp4`
    );

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-vf", "scale=1080:1920:flags=lanczos;padding=1080:1920:(ow-1080)/2:(oh-1920)/2",
          "-c:v", "libx264",
          "-c:a", "aac",
          "-preset", "medium",
          "-crf", "23"
        ])
        .on("end", () => resolve(outputPath))
        .on("error", (err) => reject(err))
        .saveToFile(outputPath);
    });

    return outputPath;
  }

  static async addSubtitles(videoPath, subtitles, projectId) {
    const subtitlesPath = path.join(
      os.tmpdir(),
      `${projectId}_subtitles_${Date.now()}.srt`
    );

    // Generate SRT file from subtitles array
    let srtContent = "";
    subtitles.forEach((sub, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${this.formatTimestamp(sub.start)} --> ${this.formatTimestamp(sub.end)}\n`;
      srtContent += `${sub.text.trim().replace(/\n/g, " ")}\n\n`;
    });

    fs.writeFileSync(subtitlesPath, srtContent);

    const outputPath = path.join(
      os.tmpdir(),
      `${projectId}_subtitled_${Date.now()}.mp4`
    );

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(subtitlesPath)
        .outputOptions([
          "-vf", "subtitles='" + subtitlesPath + "':force_style='FontName=Arial,FontSize=40,PrimaryColor=&Hffffff,BackColor=&H00000000,BorderStyle=3,BorderWidth=4,Alignment=2'",
          "-c:v", "libx264",
          "-c:a", "aac",
          "-preset", "medium",
          "-crf", "23"
        ])
        .on("end", () => {
          fs.unlinkSync(subtitlesPath);
          resolve(outputPath);
        })
        .on("error", (err) => {
          fs.unlinkSync(subtitlesPath);
          reject(err);
        })
        .saveToFile(outputPath);
    });

    return outputPath;
  }

  static formatTimestamp(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs.toFixed(1).replace(".", ",")}`;
  }

  static async generateClip(
    videoPath,
    startTime,
    endTime,
    subtitles = []
  ) {
    const clippedPath = await this.cutVideo(videoPath, startTime, endTime);
    const verticalPath = await this.resizeToVertical(clippedPath);

    if (subtitles.length > 0) {
      const finalPath = await this.addSubtitles(verticalPath, subtitles);
      fs.unlinkSync(clippedPath);
      return finalPath;
    }

    fs.unlinkSync(clippedPath);
    return verticalPath;
  }
}