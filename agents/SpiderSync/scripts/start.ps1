<#
Start SpiderSync on Windows
#>
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
python "$PSScriptRoot\..\spidersync.py"
