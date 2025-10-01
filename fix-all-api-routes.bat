@echo off
echo Adding dynamic flags to all API routes...

REM Add dynamic flags to community API routes
echo Adding flags to community questions routes...
for %%f in (app\api\community\questions\[id]\*.ts) do (
    echo Processing %%f
    powershell -Command "(Get-Content '%%f') -replace '^import', '// Force dynamic rendering to prevent SSG issues\nexport const dynamic = ''force-dynamic''\nexport const revalidate = 0\nexport const fetchCache = ''force-no-store''\nexport const runtime = ''nodejs''\n\nimport' | Set-Content '%%f'"
)

echo Adding flags to other API routes...
for %%f in (app\api\community\answers\[id]\*.ts app\api\community\questions\[id]\*.ts) do (
    echo Processing %%f
    powershell -Command "(Get-Content '%%f') -replace '^import', '// Force dynamic rendering to prevent SSG issues\nexport const dynamic = ''force-dynamic''\nexport const revalidate = 0\nexport const fetchCache = ''force-no-store''\nexport const runtime = ''nodejs''\n\nimport' | Set-Content '%%f'"
)

echo Done! All API routes should now have dynamic flags.
pause
