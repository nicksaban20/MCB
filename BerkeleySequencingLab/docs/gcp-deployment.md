# GCP Deployment Guide

This project deploys the active Next.js application in `frontend/` to **Google Cloud Run**.
The Express app in `backend/` is still a starter stub, so the Cloud Run deployment targets the frontend service, which already contains the live API routes under `src/app/api/`.

## Deployment Architecture

- **Runtime**: Cloud Run
- **Image registry**: Artifact Registry
- **CI/CD**: GitHub Actions
- **Authentication**: Workload Identity Federation from GitHub Actions to Google Cloud

## Required GCP Setup

1. Create or choose a GCP project.
2. Enable these APIs:
   - Cloud Run API
   - Artifact Registry API
   - IAM Credentials API
3. Create an Artifact Registry Docker repository.
4. Create a Cloud Run service account with permissions to:
   - deploy Cloud Run services
   - push/read Artifact Registry images
5. Configure Workload Identity Federation so GitHub Actions can impersonate that service account.

## Required GitHub Secrets

Add these repository secrets before running the deployment workflow:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GAR_REPOSITORY`
- `CLOUD_RUN_SERVICE`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`

## Workflow Files

- CI checks: [frontend-tests.yml](/Users/yirinaw/Documents/berkeley/spring26/genai_mcb/mcb2/.github/workflows/frontend-tests.yml)
- Cloud Run deploy: [deploy-cloud-run.yml](/Users/yirinaw/Documents/berkeley/spring26/genai_mcb/mcb2/.github/workflows/deploy-cloud-run.yml)

## How Deployment Works

1. GitHub Actions authenticates to GCP using Workload Identity Federation.
2. The frontend app is built into a production Docker image.
3. The image is pushed to Artifact Registry.
4. GitHub Actions deploys that image to Cloud Run.

## Manual First Deploy Checklist

1. Add the required GitHub secrets.
2. Push the repo to GitHub.
3. Open the `Deploy Frontend To Cloud Run` workflow in GitHub Actions.
4. Run the workflow manually with `workflow_dispatch`, or push to `main`.
5. After deployment, verify the Cloud Run service URL.
6. Update `NEXT_PUBLIC_SITE_URL` to the real Cloud Run URL once the first deploy succeeds.

## Local Build Validation

Run this from `frontend/`:

```bash
npm run build
```

This verifies the app can build in production mode before Cloud Run deployment.
