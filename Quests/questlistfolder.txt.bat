@echo off
setlocal enabledelayedexpansion

if not exist "output" (
    mkdir "output"
)

for /f "tokens=1,2 delims=," %%a in (questlist.txt) do (
    set folder_name=%%a
    set subfolder_name=%%b

    if not exist "output\!folder_name!" (
        mkdir "output\!folder_name!"
    )

    if not "!subfolder_name!"=="" (
        mkdir "output\!folder_name!\!subfolder_name!"
    )
)

echo Folders created successfully.
