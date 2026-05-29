# AgriEase Azure Deployment Plan

## Target Architecture

- Frontend: Azure Static Web Apps hosting `Agriease/frontend`.
- Backend: Azure App Service running the Spring Boot JAR from `Agriease/backend`.
- Database: Azure Database for PostgreSQL Flexible Server.
- File storage: Azure Blob Storage or existing Cloudinary for persistent images. Do not rely on local `uploads/`.
- AI chat: move provider calls behind backend endpoints or Azure OpenAI when available.
- Disease AI: Azure App Service running `Agriease/ai-backend`, then the Spring backend calls `AI_SERVICE_URL`.

## Azure Resources

Create one resource group, for example `rg-agriease-prod`, in one region.

Recommended starter resources for student credits:

- Azure Database for PostgreSQL Flexible Server, Burstable tier, smallest available size, 32 GB storage.
- Azure App Service Plan for Linux Java 17.
- Azure App Service named like `agriease-api`.
- Azure Static Web App named like `agriease-web`.
- Azure Storage Account with a private container for plant/delivery images if replacing Cloudinary.

## Required Backend App Settings

Set these in Azure App Service > Configuration > Application settings:

```text
DATABASE_URL=jdbc:postgresql://<server>.postgres.database.azure.com:5432/agriease?sslmode=require
DATABASE_USERNAME=<postgres-admin-user>
DATABASE_PASSWORD=<postgres-password>
JWT_SECRET=<new-strong-base64-secret>
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
WEATHER_API_KEY=<weatherapi-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_UPLOAD_PRESET=<cloudinary-upload-preset>
APP_CORS_ALLOWED_ORIGINS=https://<static-web-app-domain>
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://<custom-domain-if-any>
AI_SERVICE_URL=https://<disease-ai-service-domain>
```

Rotate any secrets that were previously committed to git before using production.

## Required Frontend Variables

Set these in Azure Static Web Apps build configuration:

```text
VITE_API_BASE_URL=https://<backend-app-service-domain>/agriease
VITE_WEATHER_API_KEY=<weatherapi-key>
```

Long term, remove direct frontend weather and AI provider keys by proxying those calls through the backend.

## Database Deployment

1. Create the PostgreSQL server and database named `agriease`.
2. Allow Azure services or the backend App Service outbound IPs through the database firewall.
3. Run Flyway migrations by starting the backend once with the production `DATABASE_*` settings.
4. After schema is stable, use `spring.jpa.hibernate.ddl-auto=validate` in production instead of `update`.
5. Enable automated backups and keep the retention period high enough for project needs.

## Build Commands

Frontend:

```powershell
cd Agriease/frontend
npm install
npm run build
```

Backend:

```powershell
cd Agriease/backend
./mvnw -DskipTests package
```

The backend artifact is generated under `Agriease/backend/target/*.jar`.

## Current Blockers To Resolve

- Disease detection now uploads images to Cloudinary and sends multipart bytes to `AI_SERVICE_URL/predict`.
- A deployable FastAPI AI backend exists, but it is a lightweight classifier until real model weights/model loading are added.
- Browser-side chat AI keys should be removed; put AI calls behind backend or Azure OpenAI.
- Existing committed secrets must be rotated.

See `docs/azure-one-click-deploy.md` for the first-time setup and repeat deployment workflow.
