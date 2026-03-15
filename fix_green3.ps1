$lessonCss = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Lesson\Lesson.css'
$c = Get-Content $lessonCss -Raw

# Fix feedback sheet correct - green gradient -> orange gradient
$c = $c -replace 'background: linear-gradient\(135deg, #d7ffb8 0%, #c0f890 100%\);', 'background: linear-gradient(135deg, #fff3d0 0%, #ffe0a0 100%);'

# Fix the btn:hover that turns green on hover
$c = $c -replace 'background: #5ed406;', 'background: #ffb44d;'

# Fix progress bar glow - green glow -> orange glow
$c = $c -replace '0 0 15px rgba\(88, 204, 2, 0.5\)', '0 0 15px rgba(255, 150, 0, 0.5)'

# Fix blank-space that has #f0fdf4 green tint
$c = $c -replace 'background: linear-gradient\(135deg, #f0fdf4 0%, transparent 100%\)', 'background: linear-gradient(135deg, #fff8eb 0%, transparent 100%)'

# Fix sentence-area active state green background
$c = $c -replace 'background: #e8fff0;', 'background: #fff8eb;'
$c = $c -replace 'box-shadow: inset 0 3px 8px rgba\(88, 204, 2, 0.15\)', 'box-shadow: inset 0 3px 8px rgba(255, 150, 0, 0.15)'

# Fix image-card.selected green tint
$c = $c -replace 'background: linear-gradient\(145deg, #e8fff0 0%, #d0f8e0 100%\)', 'background: linear-gradient(145deg, #fff8eb 0%, #ffedd5 100%)'

# Fix pair-card.matched green background
$c = $c -replace 'background: #e8fff0;', 'background: #fff8eb;'

# Fix dark-blue-mode feedback correct - deep green -> deep orange
$c = $c -replace 'background: linear-gradient\(135deg, #14532d 0%, #166534 100%\) !important;', 'background: linear-gradient(135deg, #7c2d00 0%, #9a3900 100%) !important;'

# Fix dark blue mode second occurrence (line 1910)
$c = $c -replace 'background: linear-gradient\(135deg, #14532d 0%, #166534 100%\) !important;', 'background: linear-gradient(135deg, #7c2d00 0%, #9a3900 100%) !important;'

Set-Content $lessonCss $c -NoNewline
Write-Host "Lesson.css green fixes done"

# Fix Guidebook.tsx Unit 1 colors
$guidebook = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Guidebook\Guidebook.tsx'
$g = Get-Content $guidebook -Raw
$g = $g -replace "primary: '#58cc02',", "primary: '#ff9600',"
$g = $g -replace "primaryDark: '#23ac00',", "primaryDark: '#cc7800',"
$g = $g -replace "gradient: 'linear-gradient\(135deg, #58cc02 0%, #23ac00 100%\)',", "gradient: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)',"
$g = $g -replace "light: '#f0fdf4',", "light: '#fff8eb',"
$g = $g -replace "accent: '#dcfce7'", "accent: '#ffedd5'"
Set-Content $guidebook $g -NoNewline
Write-Host "Guidebook.tsx unit-1 green fixed"

# Fix IntermediateLearn - green gradient
$intermediate = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\IntermediateLearn\IntermediateLearn.tsx'
if (Test-Path $intermediate) {
  $i = Get-Content $intermediate -Raw
  $i = $i -replace "background: 'linear-gradient\(135deg, #22c55e 0%, #16a34a 100%\)',", "background: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)',"
  Set-Content $intermediate $i -NoNewline
  Write-Host "IntermediateLearn green fixed"
}

# Fix LandingPage.css green colors
$landing = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\LandingPage\LandingPage.css'
if (Test-Path $landing) {
  $l = Get-Content $landing -Raw
  $l = $l -replace 'rgba\(88, 204, 2, 0\.07\)', 'rgba(255, 150, 0, 0.07)'
  $l = $l -replace 'rgba\(88, 204, 2, 0\.04\)', 'rgba(255, 150, 0, 0.04)'
  $l = $l -replace '#58cc02, #3aa100', '#ff9600, #cc7800'
  $l = $l -replace '#58cc02 0%, #3aa100 100%', '#ff9600 0%, #cc7800 100%'
  $l = $l -replace '#58cc02, #3aa100\)', '#ff9600, #cc7800)'
  Set-Content $landing $l -NoNewline
  Write-Host "LandingPage.css green fixed"
}

# Fix bookDictionaryData.ts
$bookDict = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\data\bookDictionaryData.ts'
if (Test-Path $bookDict) {
  $b = Get-Content $bookDict -Raw
  $b = $b -replace "color: '#58cc02',", "color: '#ff9600',"
  $b = $b -replace "gradient: 'linear-gradient\(135deg, #58cc02 0%, #46a302 100%\)',", "gradient: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)',"
  Set-Content $bookDict $b -NoNewline
  Write-Host "bookDictionaryData.ts green fixed"
}

# Fix Button.css success variant
$buttonCss = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\components\Button\Button.css'
$bc = Get-Content $buttonCss -Raw
$bc = $bc -replace 'SUCCESS - Premium Green', 'SUCCESS - Premium Orange'
$bc = $bc -replace 'background: linear-gradient\(180deg, var\(--color-success\) 0%, var\(--color-primary-dark\) 100%\)', 'background: linear-gradient(180deg, #ffb44d 0%, #ff9600 100%)'
$bc = $bc -replace 'background: linear-gradient\(180deg, var\(--color-primary-light\) 0%, var\(--color-success\) 100%\)', 'background: linear-gradient(180deg, #ffc870 0%, #ffb44d 100%)'
$bc = $bc -replace 'PRIMARY - Premium Green with Depth', 'PRIMARY - Premium Orange with Depth'
Set-Content $buttonCss $bc -NoNewline
Write-Host "Button.css success/primary fixed"

# Fix Admin.tsx green
$admin = 'c:\Users\TOTAL TECH\Desktop\My Ai project\webapp\Zheera\src\pages\Admin\Admin.tsx'
if (Test-Path $admin) {
  $a = Get-Content $admin -Raw
  $a = $a -replace "background: '#22c55e'", "background: '#ff9600'"
  $a = $a -replace "background: '#f0fdf4'", "background: '#fff8eb'"
  $a = $a -replace "border: '2px solid #22c55e'", "border: '2px solid #ff9600'"
  $a = $a -replace "border: '2px solid #22c55e", "border: '2px solid #ff9600"
  Set-Content $admin $a -NoNewline
  Write-Host "Admin.tsx green fixed"
}

Write-Host "ALL DONE!"
