import OpenAI from "openai";

export class TranscriptionService {

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.AI_API_KEY,
    });
  }

  static async transcribeAudio(audioPath) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: require("fs").createReadStream(audioPath),
        model: "whisper-1",
        language: "pt",
        response_format: "verbose_json",
      });

      const segments = transcription.segments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text,
      }));

      return {
        success: true,
        segments,
        language: transcription.language,
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return {
        success: false,
        error: "Não conseguimos gerar uma transcrição.",
      };
    }
  }
}