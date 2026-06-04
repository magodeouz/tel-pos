@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===============================================
echo   Tel-POS Cloudflare Tunnel Başlatılıyor...
echo ===============================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo Hata: Cloudflared yüklü değil
    echo https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
    pause
    exit /b 1
)

REM Get tunnel info
cloudflared tunnel list | findstr "tel-pos" >nul
if %errorlevel% neq 0 (
    echo Hata: tel-pos tunnel bulunamadı
    echo Lütfen setup-tunnel.bat dosyasını çalıştırın
    pause
    exit /b 1
)

echo.
for /f "tokens=1" %%A in ('cloudflared tunnel list ^| findstr "tel-pos"') do set TUNNEL_ID=%%A

echo Tunnel ID: !TUNNEL_ID!
echo.
echo Backend: http://localhost:8000
echo.
echo Cloudflare Tunnel başlatılıyor...
echo (Bu pencereyi açık tutun)
echo.
pause

cloudflared tunnel run tel-pos
