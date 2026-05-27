Param(
    [switch]$SkipSoftwareInstall,
    [switch]$SkipDependencyInstall
)

$ErrorActionPreference = 'Stop'

function Write-Section {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Assert-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Please run this script from an elevated (Run as Administrator) PowerShell session.'
    }
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw 'winget is required but not available. Install App Installer from Microsoft Store and rerun the script.'
    }
}

function Invoke-WingetInstall {
    param(
        [Parameter(Mandatory)] [string]$PackageId,
        [Parameter(Mandatory)] [string]$DisplayName
    )

    Write-Host "Installing $DisplayName via winget..."
    winget install --id $PackageId -e --silent --accept-package-agreements --accept-source-agreements | Out-Null
}

function Get-JavaVersionOrNull {
    try {
        $line = & java -version 2>&1 | Select-Object -First 1
        if ($line -match '"([0-9]+)\.([0-9]+).*"') {
            return [int]$Matches[1]
        }
    } catch {
        return $null
    }
    return $null
}

function Ensure-Java17 {
    $major = Get-JavaVersionOrNull
    if ($null -eq $major -or $major -lt 17) {
        Invoke-WingetInstall -PackageId 'Microsoft.OpenJDK.17' -DisplayName 'Microsoft OpenJDK 17'
    } else {
        Write-Host "Java $major detected." -ForegroundColor Green
    }
}

function Ensure-Maven {
    if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
        Invoke-WingetInstall -PackageId 'Apache.Maven' -DisplayName 'Apache Maven'
    } else {
        Write-Host 'Maven detected.' -ForegroundColor Green
    }
}

function Ensure-Node18 {
    try {
        $versionText = (& node --version 2>$null).Trim('v')
        $major = [int]($versionText.Split('.')[0])
        if ($major -ge 18) {
            Write-Host "Node.js $versionText detected." -ForegroundColor Green
            return
        }
    } catch {
    }
    Invoke-WingetInstall -PackageId 'OpenJS.NodeJS.LTS' -DisplayName 'Node.js LTS'
}

function Ensure-Python39 {
    $launcher = Get-Command py -ErrorAction SilentlyContinue
    if ($launcher) {
        $py39 = & py -3.9 --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Python (py -3.9) detected." -ForegroundColor Green
            return
        }
    }

    $pythonExe = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonExe) {
        $output = & python --version 2>&1
        if ($output -match 'Python\s+3\.9') {
            Write-Host 'Python 3.9 detected.' -ForegroundColor Green
            return
        }
    }

    Invoke-WingetInstall -PackageId 'Python.Python.3.9' -DisplayName 'Python 3.9'
}

function Invoke-Python39 {
    param([string[]]$Arguments)

    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3.9 @Arguments
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        & python @Arguments
    } else {
        throw 'Python executable not found even after installation.'
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Python command failed: $($Arguments -join ' ')"
    }
}

Assert-Admin
Ensure-Winget

$repoRoot = Split-Path -Parent $PSCommandPath
$backendPath = Join-Path $repoRoot 'Agriease\backend'
$frontendPath = Join-Path $repoRoot 'Agriease\frontend'
$aiBackendPath = Join-Path $repoRoot 'Agriease\ai-backend\Flask Deployed App'

Write-Section 'Software prerequisites'
if (-not $SkipSoftwareInstall) {
    Ensure-Java17
    Ensure-Maven
    Ensure-Node18
    Ensure-Python39
} else {
    Write-Host 'Software installation skipped by parameter.' -ForegroundColor Yellow
}

if (-not $SkipDependencyInstall) {
    Write-Section 'Frontend dependencies'
    Push-Location $frontendPath
    try {
        if (-not (Test-Path 'node_modules')) {
            Write-Host 'Installing npm packages...'
            npm install --legacy-peer-deps | Out-Null
        } else {
            Write-Host 'node_modules already present. Run npm install manually if needed.'
        }
    } finally {
        Pop-Location
    }

    Write-Section 'Backend dependencies'
    Push-Location $backendPath
    try {
        Write-Host 'Pre-fetching Maven dependencies...'
        mvn dependency:go-offline | Out-Null
    } finally {
        Pop-Location
    }

    Write-Section 'AI backend dependencies'
    Push-Location $aiBackendPath
    try {
        Write-Host 'Upgrading pip...'
        Invoke-Python39 @('-m','pip','install','--upgrade','pip')
        Write-Host 'Installing Flask AI requirements...'
        Invoke-Python39 @('-m','pip','install','-r','requirements.txt')
    } finally {
        Pop-Location
    }
} else {
    Write-Host 'Dependency installation skipped by parameter.' -ForegroundColor Yellow
}

Write-Section 'Done'
Write-Host 'Environment checks and installations completed successfully.' -ForegroundColor Green
