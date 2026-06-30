# Install Git Hooks for DevLog Auto-Sync
# Run this script from the project root

Write-Host ""
Write-Host "GIT Hooks Installation" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$hooksDir = Join-Path $projectRoot ".git\hooks"

# Create hooks directory if it doesn't exist
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    Write-Host "Created .git/hooks directory"
}

# Hook 1: post-commit (runs after each commit)
$postCommitPath = Join-Path $hooksDir "post-commit"
@"
#!/bin/bash
echo ""
echo "Syncing devlog files..."
PROJECT_ROOT="`$(git rev-parse --show-toplevel)"
if [ -d "`$PROJECT_ROOT/admin" ]; then
    cd "`$PROJECT_ROOT/admin"
    if [ -f "package.json" ]; then
        npm run sync:devlog > /dev/null 2>&1
        if [ `$? -eq 0 ]; then
            echo "DevLog synchronized"
        fi
    fi
fi
echo ""
"@ | Set-Content -Path $postCommitPath -Encoding UTF8 -NoNewline
Write-Host "Created post-commit hook"

# Hook 2: post-merge (runs after each merge)
$postMergePath = Join-Path $hooksDir "post-merge"
@"
#!/bin/bash
echo ""
echo "Syncing devlog files after merge..."
PROJECT_ROOT="`$(git rev-parse --show-toplevel)"
if [ -d "`$PROJECT_ROOT/admin" ]; then
    cd "`$PROJECT_ROOT/admin"
    if [ -f "package.json" ]; then
        npm run sync:devlog > /dev/null 2>&1
        if [ `$? -eq 0 ]; then
            echo "DevLog synchronized"
        fi
    fi
fi
echo ""
"@ | Set-Content -Path $postMergePath -Encoding UTF8 -NoNewline
Write-Host "Created post-merge hook"

# Hook 3: pre-commit (warns about untracked devlog files)
$preCommitPath = Join-Path $hooksDir "pre-commit"
@"
#!/bin/bash
PROJECT_ROOT="`$(git rev-parse --show-toplevel)"
ADMIN_DEVLOG="`$PROJECT_ROOT/admin/notes/devlog"
if [ -d "`$ADMIN_DEVLOG" ]; then
    UNTRACKED=`$(cd "`$PROJECT_ROOT" && git ls-files --others --exclude-standard | grep "notes/devlog" | wc -l)
    if [ `$UNTRACKED -gt 0 ]; then
        echo ""
        echo "Warning: You have untracked devlog files"
        echo "Consider adding them: git add admin/notes/devlog Mobile/notes/devlog"
        echo ""
    fi
fi
exit 0
"@ | Set-Content -Path $preCommitPath -Encoding UTF8 -NoNewline
Write-Host "Created pre-commit hook"

Write-Host ""
Write-Host "Git Hooks installed!" -ForegroundColor Green
Write-Host ""
Write-Host "What happens now:" -ForegroundColor Yellow
Write-Host "  • After each commit: devlog files auto-sync" -ForegroundColor Yellow
Write-Host "  • After each merge: devlog files auto-sync" -ForegroundColor Yellow
Write-Host "  • Before each commit: warning for unstaged devlog files" -ForegroundColor Yellow
Write-Host ""
Write-Host "To disable hooks temporarily:" -ForegroundColor Cyan
Write-Host "  git commit --no-verify" -ForegroundColor Gray
Write-Host ""
