import axios from "axios";

// API base URL - will be different in development vs production
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://server-p9k2wiu1z-news-guy1s-projects.vercel.app/api";

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface Transcript {
  segments: TranscriptSegment[];
  fullText: string;
}

export interface Summary {
  time: string;
  summary: string;
}

export async function getTranscript(videoId: string): Promise<Transcript> {
  try {
    // Call our backend API instead of the YouTube API directly
    const response = await axios.get(`${API_BASE_URL}/transcript/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw new Error("Failed to fetch transcript or auto-generated captions");
  }
}

export async function generateFullSummary(transcript: string): Promise<string> {
  try {
    // Call our backend API instead of OpenAI API directly
    const response = await axios.post(`${API_BASE_URL}/summarize/full`, {
      transcript,
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function generateIncrementalSummaries(
  segments: TranscriptSegment[]
): Promise<Summary[]> {
  try {
    // Call our backend API instead of OpenAI API directly
    const response = await axios.post(`${API_BASE_URL}/summarize/incremental`, {
      segments,
    });
    return response.data.summaries;
  } catch (error) {
    console.error("Error generating incremental summaries:", error);
    throw new Error("Failed to generate incremental summaries");
  }
}

// Helper function to format seconds to MM:SS or HH:MM:SS (kept client-side for formatting)
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00"; // Return default value for invalid input
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}
