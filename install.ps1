<#
🌻 Install script for Windows - creates desktop shortcut
#>
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "C:\SpiderNet\cockpit.py"
$Shortcut.IconLocation = "C:\SpiderNet\assets\sunflower.ico"
$Shortcut.Save()
Write-Output "🌻 Cockpit shortcut created on Desktop."
