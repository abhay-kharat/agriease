param(
  [string]$ResourceGroup = "rg-agriease-prod",
  [string]$Location = "centralindia",
  [string]$AppServiceLocation = "eastasia",
  [string]$StaticWebAppLocation = "eastasia",
  [string]$AppName = "agriease",
  [string]$PostgresAdminUser = "agrieaseadmin",
  [Parameter(Mandatory = $true)]
  [string]$PostgresAdminPassword,
  [string]$FrontendOrigin = "",
  [string]$AiServiceUrl = ""
)

$ErrorActionPreference = "Stop"

az account show | Out-Null

az group create `
  --name $ResourceGroup `
  --location $Location `
  --output table

az deployment group create `
  --resource-group $ResourceGroup `
  --template-file "infra/azure/main.bicep" `
  --parameters `
    appName=$AppName `
    location=$Location `
    appServiceLocation=$AppServiceLocation `
    staticWebAppLocation=$StaticWebAppLocation `
    postgresAdminUser=$PostgresAdminUser `
    postgresAdminPassword=$PostgresAdminPassword `
    frontendOrigin=$FrontendOrigin `
    aiServiceUrl=$AiServiceUrl `
  --output table

if ($LASTEXITCODE -ne 0) {
  throw "Azure deployment failed."
}

$outputs = az deployment group show `
  --resource-group $ResourceGroup `
  --name main `
  --query properties.outputs `
  --output json | ConvertFrom-Json

Write-Host ""
Write-Host "Azure resources are ready."
Write-Host "Backend app name: $($outputs.backendAppName.value)"
Write-Host "Backend API URL:  $($outputs.backendUrl.value)"
Write-Host "AI app name:      $($outputs.aiAppName.value)"
Write-Host "AI service URL:   $($outputs.aiUrl.value)"
Write-Host "Static app name:  $($outputs.staticWebAppName.value)"
Write-Host ""
Write-Host "Set these GitHub repository values:"
Write-Host "Variable AZURE_BACKEND_APP_NAME=$($outputs.backendAppName.value)"
Write-Host "Variable AZURE_AI_APP_NAME=$($outputs.aiAppName.value)"
Write-Host "Variable VITE_API_BASE_URL=$($outputs.backendUrl.value)"
Write-Host "Secret AZURE_BACKEND_PUBLISH_PROFILE=<download from Azure App Service publish profile>"
Write-Host "Secret AZURE_AI_PUBLISH_PROFILE=<download from Azure AI App Service publish profile>"
Write-Host "Secret AZURE_STATIC_WEB_APPS_API_TOKEN=<copy from Static Web App deployment token>"
Write-Host "Secret VITE_WEATHER_API_KEY=<your current WeatherAPI key>"
