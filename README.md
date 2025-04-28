# YouTube Video Summarizer

A simple web application that summarizes YouTube videos using GPT-4o-mini. It extracts the transcript from a YouTube video and generates two types of summaries:

1. A full video summary providing an overview of the entire content
2. Incremental summaries for every 5-minute segment of the video

## Features

- Input a YouTube URL to fetch the video transcript
- Extract transcript using YouTube Transcript API
- Fallback to auto-generated captions if no transcript is available
- Generate summaries using OpenAI's GPT-4o-mini
- Responsive design for desktop and mobile

## Prerequisites

To use this application, you'll need:

1. An OpenAI API key to access GPT-4o-mini
2. A RapidAPI key to use the YouTube Transcript API

## Getting Started

### Local Development

1. Clone the repository:

   ```
   git clone https://github.com/your-username/youtube-summarizer.git
   cd youtube-summarizer
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:

   ```
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_RAPID_API_KEY=your_rapidapi_key
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory, ready to be deployed.

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

1. Fork this repository
2. In your GitHub repository settings, add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `RAPID_API_KEY`: Your RapidAPI key for YouTube Transcript API
3. Update the `base` path in `vite.config.ts` if needed (it should match your repository name)
4. Push to the `main` branch to trigger the deployment workflow

## How It Works

The application follows these steps:

1. User enters a YouTube URL
2. The application extracts the video ID from the URL
3. It fetches the transcript using the YouTube Transcript API
4. If no transcript is available, it falls back to auto-generated captions
5. The transcript is sent to OpenAI's GPT-4o-mini for summarization
6. Two summaries are generated:
   - A complete overview of the video
   - Segment-by-segment summaries for every 5 minutes

## Important Notes

- This application uses client-side API calls for simplicity, which is not recommended for production use as it exposes your API keys.
- For a production deployment, you should implement server-side API calls using serverless functions or a backend service.
- The application attempts to use auto-generated captions when a transcript isn't available, but this may not work for all videos (e.g., those without any captions).

## License

MIT
