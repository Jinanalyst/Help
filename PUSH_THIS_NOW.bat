@echo off
cls
echo ============================================
echo   AppsGrid onClose Prop Fix
echo ============================================
echo.
echo Fixed: Added onClose prop to AppsGridProps
echo Fixed: handleClose function calls onClose
echo Fixed: useEffect properly depends on open and onClose
echo.

git add .
git commit -m "Fix: Add onClose prop to AppsGrid component"
git push origin main

echo.
echo ============================================
echo   PUSHED! Vercel building...
echo ============================================
echo.
pause

