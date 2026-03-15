$file = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Lesson\Lesson.css'
$c = Get-Content $file -Raw
$c = $c -replace 'rgba\(34, 197, 94, 0\.3\)', 'rgba(255, 150, 0, 0.3)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.15\)', 'rgba(255, 150, 0, 0.15)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.4\)', 'rgba(255, 150, 0, 0.4)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.5\)', 'rgba(255, 150, 0, 0.5)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.1\)', 'rgba(255, 150, 0, 0.1)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.2\)', 'rgba(255, 150, 0, 0.2)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.08\)', 'rgba(255, 150, 0, 0.08)'
$c = $c -replace 'rgba\(34, 197, 94, 0\.06\)', 'rgba(255, 150, 0, 0.06)'
Set-Content $file $c -NoNewline
Write-Host "Done fixing rgba green values in Lesson.css"
