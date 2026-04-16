# BerkeleySequencingLab

## Prerequisites

- Node.js (v18 or higher) and npm
  - If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) or install via Homebrew:
    ```bash
    brew install node
    ```
- A Supabase account and project
  - Sign up at [supabase.com](https://supabase.com) if you don't have an account
  - Create a new project or use an existing one

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Configure Supabase Environment Variables

The frontend requires Supabase credentials to function. Follow these steps:

1. **Get your Supabase credentials:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project (or create a new one)
   - Navigate to **Settings** > **API**
   - Copy the following values:
     - **Project URL** (under "Project URL")
     - **anon/public key** (under "Project API keys")

2. **Configure the environment file:**
   - Open `frontend/.env.local` (this file has been created for you)
   - Replace the placeholder values:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_actual_project_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
     ```
   - Save the file

3. **Restart the frontend server** after updating the environment variables (if it's already running)

## Running the Website

You need to run both the backend and frontend servers.

### Option 1: Run in Separate Terminal Windows (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd backend
node server.js
```
The backend will run on `http://localhost:5001` (or the port specified in your `.env` file).

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000` (default Next.js port).

### Option 2: Run Both in Background

**Terminal 1 - Backend:**
```bash
cd backend
node server.js &
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Accessing the Website

Once both servers are running:
- Frontend: Open [http://localhost:3000](http://localhost:3000) in your browser
- Backend API: Available at [http://localhost:5001](http://localhost:5001)

## Environment Variables

### Frontend (.env.local)
The frontend requires the following environment variables in `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public API key

See the **Configure Supabase Environment Variables** section above for setup instructions.

### Backend (.env)
Make sure you have a `.env` file in the `backend` directory with any required environment variables (e.g., `PORT`, database credentials, etc.). The backend defaults to port 5001 if no PORT is specified.

## Development Scripts

### Frontend
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `node server.js` - Start the Express server

## GCP Deployment

The production deployment target is **Google Cloud Run** for the Next.js app in `frontend/`.

Deployment assets added in this repo:
- [frontend/Dockerfile](/Users/yirinaw/Documents/berkeley/spring26/genai_mcb/mcb2/BerkeleySequencingLab/frontend/Dockerfile)
- [deploy-cloud-run.yml](/Users/yirinaw/Documents/berkeley/spring26/genai_mcb/mcb2/.github/workflows/deploy-cloud-run.yml)
- [gcp-deployment.md](/Users/yirinaw/Documents/berkeley/spring26/genai_mcb/mcb2/BerkeleySequencingLab/docs/gcp-deployment.md)

See the deployment guide for the exact GCP and GitHub secrets you need before running the workflow.
