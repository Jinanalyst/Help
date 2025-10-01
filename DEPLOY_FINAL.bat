@echo off
echo ========================================
echo Deploying Final Build Fix to GitHub
echo ========================================
echo.

git add .
git commit -m "Fix: Update all imports to use correct Supabase client paths"
git push origin main

echo.
echo ========================================
echo Deploy complete!
echo ========================================
echo.
echo Vercel will automatically rebuild.
echo Build should succeed in ~2-3 minutes.
echo.
pause

