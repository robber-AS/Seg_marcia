export class YouTubeService {

  static async validateURL(url) {
    try {
      const validPatterns = [
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/i,
        /^(https?:\/\/)?youtu\.be\/[\w-]+/i
      ];

      const isValid = validPatterns.some(pattern => pattern.test(url));
      return { valid: isValid };
    } catch (error) {
      return { valid: false, error: "Erro ao validar URL" };
    }
  }

  static async getVideoInfo(url) {
    // This will be implemented to extract video info without downloading
    // For now, return basic info
    const videoId = this.extractVideoId(url);
    return { videoId, success: !!videoId };
  }

  static extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }
}