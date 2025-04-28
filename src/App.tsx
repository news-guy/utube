import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import {
  handleTranscriptRequest,
  handleSummarizeRequest,
} from "./services/mockApiHandler";

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullSummary, setFullSummary] = useState("");
  const [incrementalSummaries, setIncrementalSummaries] = useState<
    { time: string; summary: string }[]
  >([]);
  const [videoTitle, setVideoTitle] = useState("");

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFullSummary("");
    setIncrementalSummaries([]);
    setVideoTitle("");

    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      setError("Invalid YouTube URL");
      setLoading(false);
      return;
    }

    try {
      // Try to get video info from API
      const videoInfoUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      try {
        const infoResponse = await fetch(videoInfoUrl);
        if (infoResponse.ok) {
          const data = await infoResponse.json();
          if (data.title) {
            setVideoTitle(data.title);
          }
        }
      } catch (infoErr) {
        console.error("Error fetching video info:", infoErr);
        // Don't fail the whole process if just the title fetch fails
      }

      // Fetch transcript
      const transcriptResponse = await handleTranscriptRequest(videoId);

      if (transcriptResponse.status !== 200) {
        throw new Error(
          transcriptResponse.data.error ||
            "Failed to fetch transcript or auto-generated captions"
        );
      }

      const { transcript, segments } = transcriptResponse.data;

      // Get full video summary - only proceed if we have transcript data
      if (transcript) {
        const fullSummaryResponse = await handleSummarizeRequest(
          transcript,
          segments || [],
          "full"
        );

        if (fullSummaryResponse.status !== 200) {
          throw new Error(
            fullSummaryResponse.data.error || "Failed to generate full summary"
          );
        }

        if (fullSummaryResponse.data.summary) {
          setFullSummary(fullSummaryResponse.data.summary);
        }

        // Get incremental summaries (5-minute chunks)
        const incrementalResponse = await handleSummarizeRequest(
          transcript,
          segments || [],
          "incremental"
        );

        if (incrementalResponse.status !== 200) {
          throw new Error(
            incrementalResponse.data.error ||
              "Failed to generate incremental summaries"
          );
        }

        if (incrementalResponse.data.summaries) {
          setIncrementalSummaries(incrementalResponse.data.summaries);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>YouTube Video Summarizer</h1>
        <p>Enter a YouTube URL to get an AI-generated summary</p>
      </header>

      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className="url-input"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Summarizing..." : "Summarize"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-message">
          <p>Fetching transcript and generating summaries...</p>
          <p>
            If no transcript is available, we'll try to use auto-generated
            captions.
          </p>
          <p>This may take a minute depending on video length.</p>
        </div>
      )}

      {videoTitle && (
        <div className="video-title">
          <h2>Video: {videoTitle}</h2>
        </div>
      )}

      {fullSummary && (
        <div className="summary-container">
          <h2>Full Video Summary</h2>
          <div className="summary-content">
            <ReactMarkdown>{fullSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {incrementalSummaries.length > 0 && (
        <div className="summary-container">
          <h2>Segment Summaries</h2>
          {incrementalSummaries.map((segment, index) => (
            <div key={index} className="segment-summary">
              <h3>{segment.time}</h3>
              <div className="summary-content">
                <ReactMarkdown>{segment.summary}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer>
        <p>Powered by YouTube Transcript API and GPT-4o-mini</p>
      </footer>
    </div>
  );
}

export default App;
