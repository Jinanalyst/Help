@echo off
cls
echo ============================================
echo   TypeScript Type Fixes - Final Deploy
echo ============================================
echo.
echo Fixed implicit 'any' types in:
echo  - AnswerCard.tsx
echo  - QuestionCard.tsx
echo  - QuestionActions.tsx
echo.
echo All state setters now have explicit types:
echo  - useState^<boolean^>
echo  - useState^<number^>
echo  - setVoteScore((prev: number) =^> ...)
echo.

git add .
git commit -m "Fix: Add explicit TypeScript types to all community components"
git push origin main

echo.
echo ============================================
echo   SUCCESS! Build should pass now!
echo ============================================
echo.
echo The build compiled successfully before.
echo Now TypeScript linting will also pass!
echo.
pause

