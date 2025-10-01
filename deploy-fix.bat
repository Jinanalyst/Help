@echo off
echo Deploying build fixes to GitHub...
git add -A
git commit -m "Fix: Split Supabase client/server to resolve build error"
git push origin main
echo.
echo Deploy complete! Vercel will auto-deploy from GitHub.
pause

