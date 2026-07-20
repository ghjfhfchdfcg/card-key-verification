Set-Location "C:\Users\Administrator\Desktop\验证服务器升级版"

for ($i=1; $i -le 10; $i++) {
    Write-Host "========================================"
    Write-Host "Attempting to push to GitHub ($i/10)..."
    Write-Host "========================================"
    
    $result = git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! Push completed!"
        Write-Host ""
        Write-Host "Render will automatically redeploy in 2-3 minutes"
        Write-Host "URL: https://card-key-verification.onrender.com"
        exit 0
    } else {
        Write-Host ""
        Write-Host "FAILED to push"
        Write-Host "Error: $result"
        
        if ($i -lt 10) {
            Write-Host ""
            Write-Host "Waiting 15 seconds before retry..."
            Start-Sleep -Seconds 15
        }
    }
}

Write-Host ""
Write-Host "WARNING: Failed after 10 attempts. Please check network connection"
Write-Host "Manual push command: git push origin main"
exit 1
