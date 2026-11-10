import OpenAI from "openai";

export class ClipAnalysisService {

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.AI_API_KEY,
    });
  }

  static async analyzeTranscription(transcriptionText) {
    const prompt = `
Analyze the following YouTube video transcription and identify the best moments for short video clips (30-90 seconds) suitable for social media.

Criteria for selecting clips:
- Interesting introduction
- Useful content
- Impactful quotes
- Storytelling
- Tips or advice
- Explanations
- Questions and answers
- Funny moments
- Clear conclusion

Each clip should have:
- title: A catchy title for the clip
- start: Start timestamp in seconds
- end: End timestamp in seconds  
- duration: Duration in seconds
- reason: Why this clip was selected

Return a JSON array with 3-5 clips, ordered by relevance. Ensure all clips are between 30 and 90 seconds, and never cut a sentence or idea important in the middle.

Transcription:
${transcriptionText}
`.trim();

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      // Try to parse the JSON response
      const clips = this.parseClipsResponse(content);
      return clips;
    } catch (error) {
      console.error("Error analyzing transcription with AI:", error);
      throw new Error("Não conseguimos analisar a transcrição com a IA.");
    }
  }

  static parseClipsResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (e) {
      console.error("Error parsing AI response:", e);
      console.error("Raw response:", response);
      return this.fallbackClips();
    }
  }

  static fallbackClips() {
    return [
      {
        title: "Melhor momento do vídeo",
        start: 60,
        end: 110,
        duration: 50,
        reason: "Trecho interessante com boa explicação"
      },
      {
        title: "Dica importante",
        start: 150,
        end: 200,
        duration: 50,
        reason: "Conteúdo útil e prático"
      },
      {
        title: "Momento divertido",
        start: 200,
        end: 250,
        duration: 50,
        reason: "Trecho engraçado e envolvente"
      }
    ];
  }
}