import {
  getTranscript,
  generateFullSummary,
  generateIncrementalSummaries,
  TranscriptSegment,
} from "./api";

// Mock implementation for local development
// In a real implementation, this would be serverless functions

export async function handleTranscriptRequest(videoId: string) {
  try {
    const transcript = await getTranscript(videoId);
    return {
      status: 200,
      data: { transcript: transcript.fullText, segments: transcript.segments },
    };
  } catch (error) {
    console.error("Transcript API error:", error);
    return {
      status: 500,
      data: { error: "Failed to fetch transcript or auto-generated captions" },
    };
  }
}

export async function handleSummarizeRequest(
  transcript: string,
  segments: TranscriptSegment[],
  type: "full" | "incremental"
) {
  try {
    if (type === "full") {
      const summary = await generateFullSummary(transcript);
      return {
        status: 200,
        data: { summary },
      };
    } else {
      const summaries = await generateIncrementalSummaries(segments);
      return {
        status: 200,
        data: { summaries },
      };
    }
  } catch (error) {
    console.error("Summarize API error:", error);
    return {
      status: 500,
      data: { error: "Failed to generate summary" },
    };
  }
}
