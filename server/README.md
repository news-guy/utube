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

## Deployment on Vercel (Recommended)

This server is set up for simple deployment on Vercel:

1. Install Vercel CLI (if not already installed):

   ```
   npm install -g vercel
   ```

2. Deploy to Vercel:

   ```
   vercel
   ```

3. For production deployment:

   ```
   vercel --prod
   ```

4. Set up environment variables in the Vercel dashboard:

   - Go to your project settings
   - Add the following environment variables:
     - `OPENAI_API_KEY`
     - `RAPID_API_KEY`
     - `CORS_ORIGIN` (set to your GitHub Pages URL, e.g., `https://your-username.github.io/utube`)

5. Get your API URL from the Vercel dashboard or CLI output.

6. Set this URL (e.g., `https://your-api.vercel.app/api`) as the `API_BASE_URL` secret in your GitHub repository.

## Alternative Deployment Options

You can also deploy the server on:

- Railway
- Render
- Heroku
- AWS Lambda/API Gateway

Make sure to set the correct environment variables on your hosting provider.

## Security

This server acts as a proxy to protect your API keys. The keys are stored securely as environment variables on the server and never exposed to the client-side application.
