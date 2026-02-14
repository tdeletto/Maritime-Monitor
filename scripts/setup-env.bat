@echo off
REM Maritime Monitor - Environment Setup Script (Windows)
REM Interactive configuration wizard for API keys
REM Usage: scripts\setup-env.bat

setlocal enabledelayedexpansion
chdir /d "%~dp0\.."

color 0B
cls

echo.
echo ======================================================
echo   Maritime Monitor - Environment Setup
echo   Interactive Configuration Wizard
echo.
echo   This script helps configure API keys
echo ======================================================
echo.

REM Check if .env.local exists
if exist .env.local (
    echo WARNING: .env.local already exists
    set /p overwrite="Overwrite existing .env.local? (y/n): "
    if /i not "!overwrite!"=="y" (
        echo Setup cancelled. Existing .env.local preserved.
        pause
        exit /b 0
    )
)

REM Copy example file
if not exist .env.local.example (
    color 04
    echo ERROR: .env.local.example not found
    pause
    exit /b 1
)

copy .env.local.example .env.local >nul
echo [OK] Created .env.local from template

REM ===== AIS Hub API Configuration =====
cls
echo.
echo ===== AIS HUB API - Vessel Tracking =====
echo.
echo Purpose: Real-time vessel position tracking worldwide
echo Website: https://www.aishub.net/
echo.
echo Steps to get API key:
echo   1. Visit https://www.aishub.net/
echo   2. Sign up for a free account
echo   3. Go to Dashboard ^> API
echo   4. Copy your API key
echo.
set /p ais_ready="Do you have an AIS Hub API key? (y/n): "

if /i "!ais_ready!"=="y" (
    set /p ais_key="Enter your AIS Hub API key: "
    if not "!ais_key!"=="" (
        call :replace_env "VITE_AIS_HUB_API_KEY" "!ais_key!"
        echo [OK] AIS Hub API key configured
    ) else (
        echo [SKIP] No API key entered
    )
) else (
    echo [SKIP] Skipping AIS Hub configuration. Update .env.local later.
)

REM ===== OpenWeather API Configuration =====
cls
echo.
echo ===== OPENWEATHER API - Maritime Weather =====
echo.
echo Purpose: Ocean and marine weather forecasts
echo Website: https://openweathermap.org/api
echo.
echo Steps to get API key:
echo   1. Visit https://openweathermap.org/
echo   2. Create a free account
echo   3. Go to Account ^> My API keys
echo   4. Copy the default API key
echo.
set /p weather_ready="Do you have an OpenWeather API key? (y/n): "

if /i "!weather_ready!"=="y" (
    set /p weather_key="Enter your OpenWeather API key: "
    if not "!weather_key!"=="" (
        call :replace_env "VITE_OPENWEATHER_API_KEY" "!weather_key!"
        echo [OK] OpenWeather API key configured
    ) else (
        echo [SKIP] No API key entered
    )
) else (
    echo [SKIP] Skipping OpenWeather configuration. Update .env.local later.
)

REM ===== Maritime Awareness Configuration =====
cls
echo.
echo ===== MARITIME AWARENESS - Security Data =====
echo.
echo Purpose: Security incidents, piracy alerts, incident data
echo.
echo Options for maritime security data:
echo   1 - ReCAAP ISC (Southeast Asia, free RSS feed)
echo   2 - IMO GISIS (Global, requires registration)
echo   3 - Marine Traffic (Commercial API, paid)
echo   4 - Custom/Other provider
echo   5 - Skip for now
echo.
set /p maritime_option="Choose an option (1-5): "

if "!maritime_option!"=="1" (
    set maritime_key=recaap_rss_feed
    call :replace_env "VITE_MARITIME_AWARENESS_API_KEY" "!maritime_key!"
    call :replace_env "VITE_MARITIME_AWARENESS_API_URL" "https://www.recaap.org/rss"
    echo [OK] Maritime Awareness configured for ReCAAP ISC
) else if "!maritime_option!"=="2" (
    echo NOTE: IMO GISIS requires institutional registration
    set /p gisis_key="Enter your IMO GISIS credentials or press Enter to skip: "
    if not "!gisis_key!"=="" (
        call :replace_env "VITE_MARITIME_AWARENESS_API_KEY" "!gisis_key!"
        echo [OK] IMO GISIS credentials configured
    )
) else if "!maritime_option!"=="3" (
    set /p maritime_key="Enter Marine Traffic API key: "
    if not "!maritime_key!"=="" (
        call :replace_env "VITE_MARITIME_AWARENESS_API_KEY" "!maritime_key!"
        echo [OK] Marine Traffic API key configured
    )
) else if "!maritime_option!"=="4" (
    set /p maritime_key="Enter your custom provider API key: "
    set /p maritime_url="Enter API base URL: "
    if not "!maritime_key!"=="" (
        call :replace_env "VITE_MARITIME_AWARENESS_API_KEY" "!maritime_key!"
    )
    if not "!maritime_url!"=="" (
        call :replace_env "VITE_MARITIME_AWARENESS_API_URL" "!maritime_url!"
    )
    echo [OK] Custom maritime provider configured
) else if "!maritime_option!"=="5" (
    echo [SKIP] Skipping maritime security configuration
) else (
    echo [ERROR] Invalid option. Skipping maritime configuration.
)

REM ===== Optional: Configure Update Intervals =====
cls
echo.
echo ===== Optional: Configure Update Intervals =====
echo.
echo These control how often data is fetched from APIs
echo Longer intervals save API calls but mean older data
echo.
set /p customize_intervals="Customize update intervals? (y/n): "

if /i "!customize_intervals!"=="y" (
    set /p ais_interval="AIS update interval in seconds (default 60): "
    if not "!ais_interval!"=="" (
        set /a ais_ms=!ais_interval!*1000
        call :replace_env "VITE_AIS_UPDATE_INTERVAL" "!ais_ms!"
    )
    
    set /p weather_interval="Weather update interval in seconds (default 600): "
    if not "!weather_interval!"=="" (
        set /a weather_ms=!weather_interval!*1000
        call :replace_env "VITE_WEATHER_UPDATE_INTERVAL" "!weather_ms!"
    )
    
    set /p security_interval="Security update interval in seconds (default 300): "
    if not "!security_interval!"=="" (
        set /a security_ms=!security_interval!*1000
        call :replace_env "VITE_SECURITY_UPDATE_INTERVAL" "!security_ms!"
    )
)

REM ===== Summary =====
cls
echo.
echo ======================================================
echo   Configuration Complete!
echo ======================================================
echo.
echo Your .env.local file has been created.
echo.
echo Next steps:
echo   1. Review .env.local and verify all settings
echo   2. If you skipped any API keys, edit .env.local manually
echo   3. Run: npm run dev
echo   4. Monitor the browser console for connection status
echo.
echo IMPORTANT: .env.local is in .gitignore
echo            Never commit this file to git!
echo.
pause
exit /b 0

REM ===== Helper Functions =====

REM Replace a value in .env.local
:replace_env
set key=%1
set value=%2
REM Create temporary file
if exist .env.local.tmp del .env.local.tmp
for /f "delims=" %%i in (.env.local) do (
    set line=%%i
    if "!line:~0,25!"=="!key!=" (
        echo !key!=!value!>>.env.local.tmp
    ) else (
        echo !line!>>.env.local.tmp
    )
)
if exist .env.local.tmp (
    move /y .env.local.tmp .env.local >nul
)
goto :eof
