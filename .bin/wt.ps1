#Requires -Version 7
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Get-Item $ScriptDir).Parent.FullName

# Run the TypeScript CLI, streaming output and capturing exec JSON
$execJson = $null
$tempFile = [System.IO.Path]::GetTempFileName()

try {
    $process = Start-Process -FilePath "bun" -ArgumentList "$RootDir/packages/dev-tools/src/wt-cli.ts", $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput stdout.txt -RedirectStandardError stderr.txt -WorkingDirectory $RootDir

    # Read output line by line
    $stdoutContent = Get-Content stdout.txt -Raw
    foreach ($line in ($stdoutContent -split "`n")) {
        if ($line -match '^\s*\{.*"exec".*\}\s*$') {
            # It's a JSON object with "exec" key
            $line | Out-File -FilePath $tempFile -Encoding utf8
        } else {
            Write-Host $line
        }
    }

    if ($process.ExitCode -ne 0) {
        exit $process.ExitCode
    }

    # Check if we have an exec command
    if (Test-Path $tempFile) {
        $execJson = Get-Content $tempFile -Raw | ConvertFrom-Json
        
        $cwd = $execJson.exec.cwd
        $cmd = $execJson.exec.cmd
        $prompt = $execJson.exec.prompt
        
        if ($cwd) {
            Set-Location $cwd
        }
        
        if ($cmd) {
            if ($cmd -eq "opencode") {
                exec opencode
            } elseif ($cmd -eq "code") {
                $visual = $env:VISUAL
                if (-not $visual) {
                    Write-Host "Warning: `$VISUAL not set. Add to your shell profile:"
                    Write-Host "  `$env:VISUAL = `"code-insiders`"  # or your preferred editor"
                    Write-Host "Falling back to VS Code..."
                    & "code" $cwd
                } else {
                    & $visual $cwd
                }
            } else {
                & $cmd $cwd
            }
        } elseif ($prompt) {
            exec opencode --prompt="$prompt"
        } else {
            Write-Host "Error: Invalid exec format"
            exit 1
        }
    }
}
finally {
    if (Test-Path stdout.txt) { Remove-Item stdout.txt -ErrorAction SilentlyContinue }
    if (Test-Path stderr.txt) { Remove-Item stderr.txt -ErrorAction SilentlyContinue }
    if (Test-Path $tempFile) { Remove-Item $tempFile -ErrorAction SilentlyContinue }
}