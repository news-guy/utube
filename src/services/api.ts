import axios from "axios";

const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const YOUTUBE_TRANSCRIPT_API =
  "https://youtube-transcript3.p.rapidapi.com/api/transcript";

// Use environment variables without default values
// This will cause the app to fail if keys aren't provided rather than exposing empty strings
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

// Function to check API key configuration to prevent runtime errors
function checkApiKeys() {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY environment variable."
    );
  }
  if (!RAPID_API_KEY) {
    throw new Error(
      "RapidAPI key is not configured. Please set VITE_RAPID_API_KEY environment variable."
    );
  }
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

// New interface for the API response format
interface ApiTranscriptItem {
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
    // Check API keys before making requests
    checkApiKeys();

    // First try to get the regular transcript
    const response = await axios.get(YOUTUBE_TRANSCRIPT_API, {
      params: { videoId },
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": "youtube-transcript3.p.rapidapi.com",
      },
    });

    let responseData = response.data;

    // If no transcript found, try to get auto-generated captions
    if (!responseData || !responseData.transcript) {
      console.log(
        "No regular transcript found, trying auto-generated captions..."
      );

      const autoCaptionsResponse = await axios.get(YOUTUBE_TRANSCRIPT_API, {
        params: {
          videoId,
          lang: "en",
          country: "US",
          auto: true,
        },
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "youtube-transcript3.p.rapidapi.com",
        },
      });

      responseData = autoCaptionsResponse.data;

      if (!responseData || !responseData.transcript) {
        throw new Error(
          "No transcript or auto-generated captions found for this video"
        );
      }
    }

    // Map the response to our expected format
    const segments = responseData.transcript.map((item: ApiTranscriptItem) => ({
      text: item.text,
      start: item.start,
      duration: item.duration,
    }));

    // Combine all transcript text
    const fullText = segments
      .map((segment: TranscriptSegment) => segment.text)
      .join(" ");

    return { segments, fullText };
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw new Error("Failed to fetch transcript or auto-generated captions");
  }
}

export async function generateFullSummary(transcript: string): Promise<string> {
  try {
    // Check API keys before making requests
    checkApiKeys();

    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes YouTube video transcripts concisely.",
          },
          {
            role: "user",
            content: `Please provide a concise summary of the following YouTube video transcript. Focus on the main points and key insights:\n\n${transcript}`,
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function generateIncrementalSummaries(
  segments: TranscriptSegment[]
): Promise<Summary[]> {
  try {
    // Check API keys before making requests
    checkApiKeys();

    // Group segments into 5-minute chunks
    const CHUNK_SIZE = 5 * 60; // 5 minutes in seconds
    const chunks: TranscriptSegment[][] = [];
    let currentChunk: TranscriptSegment[] = [];
    let currentChunkDuration = 0;

    // Filter out segments with invalid start times or durations
    const validSegments = segments.filter(
      (segment) =>
        !isNaN(segment.start) &&
        !isNaN(segment.duration) &&
        segment.duration >= 0
    );

    // If no valid segments, throw error
    if (validSegments.length === 0) {
      throw new Error("No valid segments found in transcript");
    }

    for (const segment of validSegments) {
      if (
        currentChunkDuration + segment.duration > CHUNK_SIZE &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk);
        currentChunk = [segment];
        currentChunkDuration = segment.duration;
      } else {
        currentChunk.push(segment);
        currentChunkDuration += segment.duration;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Generate summaries for each chunk
    const summaries: Summary[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkText = chunk.map((segment) => segment.text).join(" ");

      // Get start and end times with validation
      const startTime = formatTime(chunk[0].start);
      const endTime = formatTime(
        chunk[chunk.length - 1].start + chunk[chunk.length - 1].duration
      );

      // Add segment index to the time label for better context
      const timeLabel = `Segment ${i + 1}: ${startTime} - ${endTime}`;

      const response = await axios.post(
        OPENAI_API_ENDPOINT,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes segments of YouTube video transcripts concisely.",
            },
            {
              role: "user",
              content: `Please provide a brief summary of this segment of a YouTube video transcript:\n\n${chunkText}`,
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      summaries.push({
        time: timeLabel,
        summary: response.data.choices[0].message.content.trim(),
      });
    }

    return summaries;
  } catch (error) {
    console.error("Error generating incremental summaries:", error);
    throw new Error("Failed to generate incremental summaries");
  }
}

// Helper function to format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
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
