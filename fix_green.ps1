$files = @(
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Lesson\Lesson.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Learn\Learn.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\LessonCreator\LessonCreator.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\RolePlayChat\RolePlayChat.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\RolePlayHub\RolePlayHub.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\styles\variables.css',
  'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\LessonCreator\LessonCreator.tsx'
)
foreach ($file in $files) {
  if (Test-Path $file) {
    $c = Get-Content $file -Raw
    $c = $c -replace '#58cc02', '#ff9600'
    $c = $c -replace '#46a302', '#cc7800'
    $c = $c -replace '#7ce841', '#ffb44d'
    $c = $c -replace '#3d9001', '#995a00'
    $c = $c -replace '#22c55e', '#ff9600'
    $c = $c -replace '#16a34a', '#cc7800'
    $c = $c -replace '#4ade80', '#ff9600'
    $c = $c -replace '#86efac', '#ffb44d'
    $c = $c -replace '#dcfce7', '#fff3e0'
    Set-Content $file $c -NoNewline
    Write-Host "Fixed: $file"
  } else {
    Write-Host "Not found: $file"
  }
}
Write-Host "All done!"
