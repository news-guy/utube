# Deploying to Vercel

This guide walks you through deploying the YouTube Summarizer API to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (you can sign up with GitHub)
- Your OpenAI API key
- Your RapidAPI key for YouTube Transcript API

## Option 1: Deploy from Vercel Dashboard (Recommended)

1. **Create a GitHub Repository**

   - Make sure your code is pushed to a GitHub repository
   - If you haven't already done this, create a new repository and push your code

2. **Log in to Vercel**

   - Go to [vercel.com](https://vercel.com) and log in with your account

3. **Import Your Repository**

   - Click "Add New..." → "Project"
   - Select your repository from the list
   - If you don't see it, you may need to configure Vercel to access your repositories

4. **Configure Project**

   - Set the framework preset to "Other"
   - Set the root directory to "server" (the directory containing your API code)
   - In the "Build and Output Settings" section, leave defaults or adjust if needed

5. **Add Environment Variables**

   - Scroll down to the "Environment Variables" section
   - Add the following variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `RAPID_API_KEY`: Your RapidAPI key
     - `CORS_ORIGIN`: Your GitHub Pages URL (e.g., `https://your-username.github.io/utube`)

6. **Deploy**

   - Click "Deploy"
   - Wait for deployment to complete

7. **Get Your Deployment URL**
   - Once deployed, you'll get a URL like `https://your-project.vercel.app`
   - Add `/api` to this URL to get your API base URL
   - This is the URL you'll use for the `API_BASE_URL` secret in GitHub

## Option 2: Deploy Using Vercel CLI

If you prefer using the command line:

1. **Install Dependencies**

   ```
   npm install
   ```

2. **Log in to Vercel**

   ```
   npx vercel login
   ```

   - This will open a browser window for authentication

3. **Deploy**

   ```
   npx vercel
   ```

   - Follow the prompts to configure your project
   - When asked about environment variables, add:
     - `OPENAI_API_KEY`
     - `RAPID_API_KEY`
     - `CORS_ORIGIN`

4. **For Production Deployment**
   ```
   npx vercel --prod
   ```

## After Deploying

1. **Set GitHub Secret**

   - Go to your GitHub repository settings
   - Navigate to Secrets and variables → Actions
   - Add a new repository secret named `API_BASE_URL`
   - Set its value to your Vercel API URL with `/api` at the end
     (e.g., `https://your-project.vercel.app/api`)

2. **Test Your API**
   - Try accessing the health endpoint: `https://your-project.vercel.app/api/health`
   - You should see a JSON response with `{"status":"ok","message":"Server is running"}`

## Troubleshooting

- **CORS Issues**: Make sure your `CORS_ORIGIN` environment variable is set correctly to match your frontend URL
- **API Keys**: Double-check that your API keys are set correctly in the Vercel environment variables
- **Node.js Version**: Vercel uses Node.js 18 by default, which should work with this project
