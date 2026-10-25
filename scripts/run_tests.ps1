Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running Panta x NectarFi Analytics Hub Verification Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "[1/2] Running automated Node.js unit tests..." -ForegroundColor Yellow
node --test tests/*.test.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[2/2] Validating Web Portal static assets..." -ForegroundColor Yellow
if ((Test-Path web/index.html) -and (Test-Path web/styles.css) -and (Test-Path web/app.js)) {
    Write-Host "Web assets intact: OK" -ForegroundColor Green
} else {
    Write-Error "Missing web assets!"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " All tests passed 100%! Ready for Superteam Earn Submission." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
