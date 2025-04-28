# YouTube Summarizer

An application that uses AI to automatically summarize YouTube videos based on their transcripts.

## Project Structure

The application consists of two main parts:

1. **Frontend**: A React application deployed on GitHub Pages
2. **Backend**: A Node.js server deployed as serverless functions on Vercel

## Features

- Extract transcripts from YouTube videos
- Generate concise summaries of entire videos
- Create time-stamped segment summaries for longer videos
- Secure API key handling through backend proxy

## Quick Deployment Guide

For a complete deployment using GitHub Pages (frontend) and Vercel (backend):

1. **Deploy the backend first:**

   - Fork this repository
   - Deploy the server directory to Vercel:
     ```
     cd server
     vercel
     ```
   - Set the required environment variables in Vercel
     - `OPENAI_API_KEY`
     - `RAPID_API_KEY`
     - `CORS_ORIGIN` (set to `https://your-username.github.io/utube`)

2. **Deploy the frontend:**
   - Set the `API_BASE_URL` secret in your GitHub repository
     - Go to Settings > Secrets and variables > Actions
     - Add a new repository secret named `API_BASE_URL`
     - Set the value to your Vercel API URL (e.g., `https://your-api.vercel.app/api`)
   - Push changes to the main branch to trigger GitHub Pages deployment

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

## Detailed Deployment

### Backend Deployment on Vercel

The `server` directory contains a Vercel-ready Node.js application:

1. Deploy with Vercel CLI:

   ```
   cd server
   vercel login
   vercel
   ```

2. For production deployment:

   ```
   vercel --prod
   ```

3. Configure environment variables in the Vercel dashboard:

   - `OPENAI_API_KEY` - Your OpenAI API key
   - `RAPID_API_KEY` - Your RapidAPI key for YouTube transcripts
   - `CORS_ORIGIN` - Your GitHub Pages URL (e.g., `https://your-username.github.io/utube`)

4. Note your deployment URL, which should look like `https://your-api.vercel.app`

### Frontend Deployment on GitHub Pages

The frontend is automatically deployed to GitHub Pages using GitHub Actions:

1. Set up the repository secret:

   - Go to your GitHub repository's Settings > Secrets and variables > Actions
   - Add a new repository secret named `API_BASE_URL`
   - Set its value to your Vercel API URL (e.g., `https://your-api.vercel.app/api`)

2. Push to the main branch or manually trigger the workflow in the Actions tab

3. After deployment completes, your site will be available at `https://your-username.github.io/utube`

## Security

This application uses a server-side approach to protect API keys:

- API keys are stored only on the Vercel serverless functions as environment variables
- The frontend makes requests to the Vercel API, which then makes authenticated requests to third-party APIs
- No API keys are included in the frontend code or GitHub Pages deployment

## How It Works

The application follows these steps:

1. User enters a YouTube URL
2. The application extracts the video ID from the URL
3. It calls the Vercel serverless API to fetch the transcript
4. The API fetches the transcript from YouTube Transcript API
5. If no transcript is available, it falls back to auto-generated captions
6. The transcript is sent to OpenAI's GPT-4o-mini for summarization via the API
7. Two summaries are generated:
   - A complete overview of the video
   - Segment-by-segment summaries for every 5 minutes

## License

MIT
