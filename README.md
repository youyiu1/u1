<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bba63dc7-8f6d-4952-91be-6fd3ed7bec2b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Docker

Use the repository wrapper so Docker Compose always gets a stable project name and the correct env file:

`powershell -ExecutionPolicy Bypass -File deploy/docker-compose.ps1 up -d --build`

Required private files are not stored in the repository:

- `.env.docker.local`
- `backend-java-reference/application-secret.yml`

If either file is missing, the Docker startup wrapper will fail immediately.
