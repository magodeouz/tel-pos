@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===============================================
echo   Tel-POS Cloudflare Tunnel Setup
echo ===============================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo Cloudflared yüklü değil. İndiriliyor...
    echo.
    echo 1. https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
    echo    adresinden cloudflared.exe indir
    echo.
    echo 2. Bu dosyanın bulunduğu klasöre koy veya PATH'e ekle
    echo.
    pause
    exit /b 1
)

echo ✓ Cloudflared bulundu
echo.
echo Cloudflare'de oturum açmanız gerekiyor...
pause
cloudflared tunnel login

if %errorlevel% neq 0 (
    echo Hata: Login başarısız
    pause
    exit /b 1
)

echo.
echo ✓ Login başarılı
echo.
echo Tunnel oluşturuluyor: tel-pos
cloudflared tunnel create tel-pos

if %errorlevel% neq 0 (
    echo Hata: Tunnel oluşturulamadı
    pause
    exit /b 1
)

echo.
echo ✓ Tunnel oluşturuldu
echo.
echo Konfigürasyon dosyası oluşturuluyor...

REM Get tunnel ID from list
for /f "tokens=1" %%A in ('cloudflared tunnel list ^| findstr "tel-pos"') do set TUNNEL_ID=%%A

if "!TUNNEL_ID!"=="" (
    echo Hata: Tunnel ID bulunamadı
    pause
    exit /b 1
)

REM Create config file
set CONFIG_DIR=%APPDATA%\.cloudflared
if not exist "!CONFIG_DIR!" mkdir "!CONFIG_DIR!"

(
    echo tunnel: !TUNNEL_ID!
    echo credentials-file: !CONFIG_DIR!\!TUNNEL_ID!.json
    echo.
    echo ingress:
    echo   - service: http://localhost:8000
) > "!CONFIG_DIR!\config.yml"

echo ✓ Konfigürasyon kaydedildi: !CONFIG_DIR!\config.yml
echo.
echo Tunnel ID: !TUNNEL_ID!
echo.
echo ===============================================
echo   Kurulum Tamamlandı!
echo ===============================================
echo.
echo Tunnel'ı başlatmak için:
echo   cloudflared tunnel run tel-pos
echo.
echo Veya "start-tunnel.bat" dosyasını çalıştır
echo.
pause
