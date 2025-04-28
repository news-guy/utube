require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Environment variables for API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RAPID_API_KEY = process.env.RAPID_API_KEY;

// API endpoints
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const YOUTUBE_TRANSCRIPT_API =
  "https://youtube-transcript3.p.rapidapi.com/api/transcript";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Check if API keys are configured
if (!OPENAI_API_KEY || !RAPID_API_KEY) {
  console.error(
    "Error: API keys are not configured. Please set OPENAI_API_KEY and RAPID_API_KEY environment variables."
  );
  process.exit(1);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Endpoint to get video transcript
app.get("/api/transcript/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    // First try to get the regular transcript
    let response = await axios.get(YOUTUBE_TRANSCRIPT_API, {
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

      response = await axios.get(YOUTUBE_TRANSCRIPT_API, {
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

      responseData = response.data;

      if (!responseData || !responseData.transcript) {
        return res
          .status(404)
          .json({
            error:
              "No transcript or auto-generated captions found for this video",
          });
      }
    }

    // Process transcript segments
    const segments = responseData.transcript.map((item) => ({
      text: item.text,
      start: item.start,
      duration: item.duration,
    }));

    // Combine all transcript text
    const fullText = segments.map((segment) => segment.text).join(" ");

    res.json({ segments, fullText });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
});

// Endpoint to generate a full summary
app.post("/api/summarize/full", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

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

    const summary = response.data.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Endpoint to generate incremental summaries
app.post("/api/summarize/incremental", async (req, res) => {
  try {
    const { segments } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res
        .status(400)
        .json({ error: "Valid segments array is required" });
    }

    // Group segments into 5-minute chunks
    const CHUNK_SIZE = 5 * 60; // 5 minutes in seconds
    const chunks = [];
    let currentChunk = [];
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
      return res
        .status(400)
        .json({ error: "No valid segments found in transcript" });
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
    const summaries = [];

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

    res.json({ summaries });
  } catch (error) {
    console.error("Error generating incremental summaries:", error);
    res.status(500).json({ error: "Failed to generate incremental summaries" });
  }
});

// Helper function to format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
