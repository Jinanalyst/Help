@echo off
cls
echo ============================================
echo   FINAL FIX - AppsGrid dependency array
echo ============================================
echo.
echo Fixed: Changed onClose to open in useEffect
echo.

git add .
git commit -m "Fix: Correct AppsGrid useEffect dependency array"
git push origin main

echo.
echo ============================================
echo   PUSHED! Build should succeed now.
echo ============================================
echo.
pause

