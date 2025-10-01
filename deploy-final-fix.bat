@echo off
echo Adding all SSG fixes and API route updates...
git add .
echo Committing changes...
git commit -m "fix: add dynamic flags to all API routes; replace createServerSupabaseClient with regular client; prevent SSG build errors"
echo Pushing to GitHub...
git push origin main
echo Done! Vercel should now build successfully without SSG issues.
echo.
echo Make sure to set these environment variables in Vercel:
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY  
echo - WALLET_JWT_SECRET
echo - SUPABASE_JWT_SECRET
pause
