# Azure One-Click Deployment Runbook

This repo is prepared for a repeatable Azure deployment:

- Backend: `.github/workflows/azure-backend.yml`
- Frontend: `.github/workflows/azure-frontend.yml`
- AI backend: `.github/workflows/azure-ai-backend.yml`
- Infrastructure: `infra/azure/main.bicep`
- Provision helper: `scripts/azure-provision.ps1`

## First-Time Setup

Install these tools locally:

- Azure CLI
- GitHub CLI, optional but useful
- JDK 17
- Node.js 20+

On Windows, install the missing cloud CLIs with:

```powershell
winget install --id Microsoft.AzureCLI -e
winget install --id GitHub.cli -e
```

Log in:

```powershell
az login
gh auth login
```

Provision Azure resources:

```powershell
./scripts/azure-provision.ps1 `
  -ResourceGroup rg-agriease-prod `
  -Location centralindia `
  -AppName agriease `
  -PostgresAdminPassword "Choose-A-Strong-Password"
```

The script prints the values that must be placed in GitHub repository settings.

## GitHub Repository Settings

Go to GitHub repo > Settings > Secrets and variables > Actions.

Add repository variables:

```text
AZURE_BACKEND_APP_NAME=<printed backend app name>
AZURE_AI_APP_NAME=<printed AI app name>
VITE_API_BASE_URL=https://<backend-app>.azurewebsites.net/agriease
```

Add repository secrets:

```text
AZURE_BACKEND_PUBLISH_PROFILE=<Azure App Service publish profile XML>
AZURE_AI_PUBLISH_PROFILE=<Azure AI App Service publish profile XML>
AZURE_STATIC_WEB_APPS_API_TOKEN=<Azure Static Web Apps deployment token>
VITE_WEATHER_API_KEY=23b206a3fc43436ca9b192042260402
VITE_GROQ_API_KEY=<optional current key>
VITE_GROK_API_KEY=<optional current key>
VITE_XAI_API_KEY=<optional current key>
```

## How To Get Azure Secrets

Backend publish profile:

1. Azure Portal > App Services > backend app.
2. Overview > Download publish profile.
3. Paste the entire XML into `AZURE_BACKEND_PUBLISH_PROFILE`.

AI publish profile:

1. Azure Portal > App Services > AI app.
2. Overview > Download publish profile.
3. Paste the entire XML into `AZURE_AI_PUBLISH_PROFILE`.

Static Web Apps token:

1. Azure Portal > Static Web Apps > frontend app.
2. Manage deployment token.
3. Paste the token into `AZURE_STATIC_WEB_APPS_API_TOKEN`.

## One-Click Deploy

After first setup:

1. Push code to `main`, or
2. GitHub > Actions > choose workflow > Run workflow.

Backend, frontend, and AI backend deploy independently. If you change only one area, only that workflow deploys.

## Required Azure Backend Settings

The Bicep template sets these on App Service:

```text
SPRING_PROFILES_ACTIVE=prod
WEBSITES_PORT=8080
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
WEATHER_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_UPLOAD_PRESET
APP_CORS_ALLOWED_ORIGINS
APP_CORS_ALLOWED_ORIGIN_PATTERNS
AI_SERVICE_URL
DISEASE_AI_FALLBACK_ENABLED=true
```

## Current AI Status

Disease upload is cloud-safe now because the backend uploads the plant image to Cloudinary and sends the image bytes to `AI_SERVICE_URL/predict`.

The repo now contains a deployable FastAPI AI service in `Agriease/ai-backend`. It validates uploaded images and returns a lightweight disease result based on known filename patterns. This keeps the full cloud flow operational. It is not a trained CNN inference service yet because the repo does not include production model weights or a clean model loader.

When the real trained model is available, replace the logic in `Agriease/ai-backend/app.py` while keeping `/predict` response fields unchanged:

```text
disease
confidence
recommendation
description
prevention
buy_link
```

## After Frontend URL Exists

Update backend CORS:

```powershell
az webapp config appsettings set `
  --resource-group rg-agriease-prod `
  --name <backend-app-name> `
  --settings APP_CORS_ALLOWED_ORIGINS=https://<your-static-web-app>.azurestaticapps.net
```
