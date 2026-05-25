@echo off
REM Deployment script for Business Consulting Toolkit
REM This script copies the application files to a deployment directory

set "SOURCE_DIR=C:\Users\vinayak\Desktop\research\consultancy-suite\consulting_app"
set "DEPLOY_DIR=deployment"

echo Creating deployment directory...
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

echo Copying files to deployment directory...
xcopy "%SOURCE_DIR%" "%DEPLOY_DIR%" /E /I /Y

echo Deployment ready in %DEPLOY_DIR% folder
echo To host locally, run: python -m http.server 8000 -d %DEPLOY_DIR%
echo.
echo Press any key to exit...
pause >nul