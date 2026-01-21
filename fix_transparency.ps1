
Add-Type -AssemblyName System.Drawing

$inputPath = "C:\Users\blueberyy\.gemini\antigravity\brain\2c1375bb-2200-444c-b39d-31060c795973\hechlink_icon_1768993072292.png"
$outputPath = "c:\Users\blueberyy\Downloads\Student-Card-Management\web\assets\hechlink_logo_v5.png"

try {
    Write-Host "Loading image from $inputPath"
    $srcImage = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    # Create a new bitmap to modify
    $bmp = New-Object System.Drawing.Bitmap($srcImage.Width, $srcImage.Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImage, 0, 0, $srcImage.Width, $srcImage.Height)
    
    # Get the background color from top-left pixel
    $bgColor = $bmp.GetPixel(0, 0)
    Write-Host "Detected background color: $bgColor"
    
    # Apply transparency
    $bmp.MakeTransparent($bgColor)
    
    # Save
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved transparent image to $outputPath"
}
catch {
    Write-Error "Failed to process image: $_"
}
finally {
    if ($g) { $g.Dispose() }
    if ($bmp) { $bmp.Dispose() }
    if ($srcImage) { $srcImage.Dispose() }
}
