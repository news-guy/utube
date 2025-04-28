# YouTube Summarizer

An application that uses AI to automatically summarize YouTube videos based on their transcripts.

## Project Structure

The application consists of two main parts:

1. **Frontend**: A React application that provides the user interface for entering YouTube video URLs and displaying summaries.
2. **Backend**: A Node.js server that securely handles API calls to YouTube and OpenAI services.

## Features

- Extract transcripts from YouTube videos
- Generate concise summaries of entire videos
- Create time-stamped segment summaries for longer videos
- Secure API key handling through backend proxy

## Development Setup

### Backend Setup

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the server directory with your API keys:

   ```
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key
   RAPID_API_KEY=your_rapidapi_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install dependencies in the root directory:

   ```
   npm install
   ```

2. Create a `.env` file in the root directory:

   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Backend Deployment

The backend server needs to be deployed to a service that supports Node.js applications, such as:

- Vercel
- Railway
- Render
- Heroku
- AWS Lambda/API Gateway

Make sure to set the appropriate environment variables on your hosting provider.

### Frontend Deployment

The frontend is configured for GitHub Pages deployment. The workflow is set up in `.github/workflows/deploy.yml`.

To deploy:

1. Push changes to the main branch
2. GitHub Actions will automatically build and deploy the site
3. Ensure the `API_BASE_URL` secret is set in your GitHub repository settings to point to your deployed backend API

## Security

This application uses a server-side approach to protect API keys:

- API keys are stored only on the backend server as environment variables
- The frontend makes requests to the backend server, which then makes authenticated requests to third-party APIs
- No API keys are included in the frontend code or GitHub Pages deployment

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
