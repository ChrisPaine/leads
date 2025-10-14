@echo off
echo Deploying Supabase Edge Functions...
echo.

cd /d "%~dp0"

echo.
echo Logging in to Supabase...
call npx supabase@latest login

echo.
echo Linking project...
call npx supabase@latest link

echo.
echo Deploying serp-search function...
call npx supabase@latest functions deploy serp-search

echo.
echo Deploying generate-report function...
call npx supabase@latest functions deploy generate-report

echo.
echo Done!
pause
