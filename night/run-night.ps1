$repo = "D:\Quick_yt"
$log  = "D:\Quick_yt\night\logs\$(Get-Date -Format yyyyMMdd-HHmm).log"
$lock = "D:\Quick_yt\night\night.lock"

New-Item -ItemType Directory -Force -Path "D:\Quick_yt\night\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "D:\Quick_yt\night\pids" | Out-Null

if (Test-Path $lock) { 
  $age = (Get-Date) - (Get-Item $lock).LastWriteTime
  if ($age.TotalMinutes -lt 55) { 
    "locked, skip" | Out-File $log; exit 
  } 
}
New-Item -Force $lock | Out-Null

try {
  Set-Location $repo
  # Fetch latest state (optional if purely local)
  git fetch origin 2>&1 | Out-Null
  
  if (Test-Path "specs\tasks\NIGHT-DONE.flag") { 
    "queue done" | Out-File $log; exit 
  }
  
  # Headless execution for Antigravity CLI
  # Pointing to the .agy/settings.json and providing the contract
  agy -p (Get-Content "$repo\night\night-contract.md" -Raw) `
    --max-turns 70 2>&1 | Tee-Object $log
} finally {
  # Exit-clean invariant: kill ONLY what this run recorded, then verify empty
  Get-ChildItem "D:\Quick_yt\night\pids\*.pid" -ErrorAction SilentlyContinue | ForEach-Object {
    $pid = (Get-Content $_ -Raw).Trim()
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($proc) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
    Remove-Item $_ -ErrorAction SilentlyContinue
  }
  $left = Get-ChildItem "D:\Quick_yt\night\pids\" -ErrorAction SilentlyContinue
  if ($left) { "WARN: unkillable pids remain: $($left.Name)" | Out-File $log -Append }
  Remove-Item $lock -ErrorAction SilentlyContinue
}
