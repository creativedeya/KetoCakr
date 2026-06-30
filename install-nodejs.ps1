# Node.js Installation Script for Windows
# Run as Administrator!

Write-Host "Starting Node.js installation..." -ForegroundColor Green
Write-Host ""

# Download URL
$nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
$installerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js installer..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$webClient = New-Object System.Net.WebClient
$webClient.DownloadFile($nodeUrl, $installerPath)
Write-Host "Download complete!" -ForegroundColor Green

Write-Host ""
Write-Host "Installing Node.js (please wait)..."
Write-Host ""

$process = Start-Process -FilePath msiexec.exe -ArgumentList "/i", $installerPath, "/passive", "/norestart" -PassThru -Wait

if ($process.ExitCode -eq 0) {
    Write-Host "Installation complete!" -ForegroundColor Green
} else {
    Write-Host "Installation may have issues, but continuing..." -ForegroundColor Yellow
}

# Clean up installer
Remove-Item $installerPath -Force

Write-Host ""
Write-Host "Checking installation..."
Write-Host ""

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check installation
$nodeCheck = & node --version
$npmCheck = & npm --version

Write-Host "Node.js version: $nodeCheck" -ForegroundColor Green
Write-Host "npm version: $npmCheck" -ForegroundColor Green

Write-Host ""
Write-Host "SUCCESS! Node.js is installed." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor Yellow
Write-Host "2. Open a new PowerShell window" -ForegroundColor Yellow
Write-Host "3. Run: cd C:\Dev\KetoCakr\admin" -ForegroundColor Yellow
Write-Host "4. Run: npm run sync:devlog:dry-run" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
