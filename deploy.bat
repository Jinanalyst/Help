@echo off
echo ========================================
echo Deploying Help Community to GitHub
echo ========================================
echo.

echo Step 1: Adding all files...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Add Ask Question flow with Supabase integration"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com
echo 2. Import your GitHub repository
echo 3. Add environment variables (see SUPABASE_SETUP.md)
echo 4. Deploy!
echo.
pause

