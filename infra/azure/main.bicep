targetScope = 'resourceGroup'

@description('Base name used for Azure resources.')
param appName string = 'agriease'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Azure Static Web Apps supported region.')
param staticWebAppLocation string = 'eastasia'

@description('Azure App Service Linux compute region.')
param appServiceLocation string = 'eastasia'

@description('PostgreSQL administrator username.')
param postgresAdminUser string = 'agrieaseadmin'

@secure()
@description('PostgreSQL administrator password.')
param postgresAdminPassword string

@description('PostgreSQL database name.')
param postgresDatabaseName string = 'agriease'

@description('Backend App Service SKU. B1 is a practical starter; use F1 only if available and sufficient.')
param appServiceSku string = 'B1'

@secure()
param jwtSecret string = 'VGhpc0lzQVN1cGVyU2VjdXJlS2V5Rm9yQWdyaUVhc2UxMjM0NTY3ODkwMTIzNDU2Nzg5MDE='

@secure()
param razorpayKeyId string = 'rzp_test_SDpGBoZf01jCMw'

@secure()
param razorpayKeySecret string = 'aLWc3Bf6EF8GU3hO8PMviQMW'

@secure()
param weatherApiKey string = '23b206a3fc43436ca9b192042260402'

param cloudinaryCloudName string = 'dx2zuilnt'
param cloudinaryUploadPreset string = 'agriease_preset'

@description('Optional external disease AI service URL. Leave empty to use the Azure AI App Service created by this template.')
param aiServiceUrl string = ''

@description('Static Web App URL used for backend CORS after first frontend deployment.')
param frontendOrigin string = ''

var uniqueSuffix = uniqueString(resourceGroup().id, appName)
var webAppName = '${appName}-api-${uniqueSuffix}'
var aiAppName = '${appName}-ai-${uniqueSuffix}'
var appServicePlanName = '${appName}-plan-${uniqueSuffix}'
var postgresServerName = '${appName}-pg-${uniqueSuffix}'
var staticWebAppName = '${appName}-web-${uniqueSuffix}'
var storageAccountName = toLower(replace('${appName}st${uniqueSuffix}', '-', ''))
var databaseUrl = 'jdbc:postgresql://${postgresServerName}.postgres.database.azure.com:5432/${postgresDatabaseName}?sslmode=require'
var corsOrigins = empty(frontendOrigin) ? 'http://localhost:5173,http://localhost:5174,http://localhost:5175' : '${frontendOrigin},http://localhost:5173,http://localhost:5174,http://localhost:5175'
var resolvedAiServiceUrl = empty(aiServiceUrl) ? 'https://${aiAppName}.azurewebsites.net' : aiServiceUrl

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: appServiceLocation
  sku: {
    name: appServiceSku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgres
  name: postgresDatabaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource allowAzureServices 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgres
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource backend 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: appServiceLocation
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'JAVA|17-java17'
      appSettings: [
        {
          name: 'SPRING_PROFILES_ACTIVE'
          value: 'prod'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'DATABASE_URL'
          value: databaseUrl
        }
        {
          name: 'DATABASE_USERNAME'
          value: postgresAdminUser
        }
        {
          name: 'DATABASE_PASSWORD'
          value: postgresAdminPassword
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'RAZORPAY_KEY_ID'
          value: razorpayKeyId
        }
        {
          name: 'RAZORPAY_KEY_SECRET'
          value: razorpayKeySecret
        }
        {
          name: 'WEATHER_API_KEY'
          value: weatherApiKey
        }
        {
          name: 'CLOUDINARY_CLOUD_NAME'
          value: cloudinaryCloudName
        }
        {
          name: 'CLOUDINARY_UPLOAD_PRESET'
          value: cloudinaryUploadPreset
        }
        {
          name: 'APP_CORS_ALLOWED_ORIGINS'
          value: corsOrigins
        }
        {
          name: 'APP_CORS_ALLOWED_ORIGIN_PATTERNS'
          value: 'https://*.azurestaticapps.net,https://*.azurewebsites.net,http://localhost:*'
        }
        {
          name: 'AI_SERVICE_URL'
          value: resolvedAiServiceUrl
        }
        {
          name: 'DISEASE_AI_FALLBACK_ENABLED'
          value: 'true'
        }
      ]
    }
  }
}

resource aiBackend 'Microsoft.Web/sites@2023-12-01' = {
  name: aiAppName
  location: appServiceLocation
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appCommandLine: 'gunicorn -w 2 -k uvicorn.workers.UvicornWorker app:app --bind=0.0.0.0:8000'
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
        {
          name: 'MODEL_MODE'
          value: 'keyword-fallback'
        }
      ]
    }
  }
}

resource frontend 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: staticWebAppLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: take(storageAccountName, 24)
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource plantImages 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: '${storage.name}/default/plant-images'
  properties: {
    publicAccess: 'None'
  }
}

output backendAppName string = backend.name
output backendUrl string = 'https://${backend.properties.defaultHostName}/agriease'
output aiAppName string = aiBackend.name
output aiUrl string = 'https://${aiBackend.properties.defaultHostName}'
output staticWebAppName string = frontend.name
output postgresServerName string = postgres.name
output postgresDatabase string = database.name
output storageAccount string = storage.name
