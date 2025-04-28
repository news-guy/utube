# YouTube Summarizer API Server

This is the backend API server for the YouTube Summarizer application. It serves as a secure proxy for the OpenAI and YouTube Transcript APIs to keep API keys private.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file in the server directory based on `.env.example`:

   ```
   # Server configuration
   PORT=3001

   # API Keys (replace with your actual keys)
   OPENAI_API_KEY=your_openai_api_key_here
   RAPID_API_KEY=your_rapid_api_key_here

   # CORS (for development, use * or specify the frontend URL)
   CORS_ORIGIN=http://localhost:5173
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/transcript/:videoId` - Get transcript for a YouTube video
- `POST /api/summarize/full` - Generate a full summary of a transcript
- `POST /api/summarize/incremental` - Generate timestamped summaries by segment

## Deployment

For production deployment, consider hosting this server on:

- Vercel
- Railway
- Render
- Heroku
- AWS Lambda/API Gateway

Make sure to set the correct environment variables on your hosting provider.

## Security

This server acts as a proxy to protect your API keys. The keys are stored securely as environment variables on the server and never exposed to the client-side application.
