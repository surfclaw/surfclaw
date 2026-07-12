@echo off
:: ====================================================================
:: Surfclaw - One-click Setup and Build Script (Windows)
:: ====================================================================

echo ==========================================================
echo   ____              __      _                     
echo  / ___| _   _ _ __ / _| ___| | __ _ __      __    
echo  \___ \| | | | '__| |_ / __| |/ _` | \ /\ / /    
echo   ___) | |_| | |  |  _| (__| | (_| |\ V  V /     
echo  |____/ \__,_|_|  |_|  \___|_|\__,_| \_/\_/      
echo ==========================================================
echo Starting Surfclaw GPU Accelerator Environment Setup...
echo ==========================================================

if not exist "AIOS-main" (
    echo [1/4] Cloning AIOS Core repository...
    git clone https://github.com/agiresearch/AIOS.git AIOS-main
) else (
    echo AIOS Core repository already exists.
)

if not exist "Cerebrum-main" (
    echo [2/4] Cloning Cerebrum SDK repository...
    git clone https://github.com/agiresearch/Cerebrum.git Cerebrum-main
) else (
    echo Cerebrum SDK repository already exists.
)

echo [3/4] Installing Python dependency packages...
set PYTHON_EXE=python
where uv >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo detected uv package manager.
    set PYTHON_EXE=C:\Users\YG\AppData\Roaming\uv\python\cpython-3.11.15-windows-x86_64-none\python.exe
)

"%PYTHON_EXE%" -m pip install pydantic --break-system-packages
if exist "Cerebrum-main" (
    "%PYTHON_EXE%" -m pip install -e Cerebrum-main --break-system-packages
)
if exist "AIOS-main\requirements.txt" (
    "%PYTHON_EXE%" -m pip install -r AIOS-main\requirements.txt --break-system-packages
)

echo [4/4] Building and installing Surfclaw Rust scheduler core...
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
where cargo >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Rust compiler not found. Initiating Rustup installation...
    powershell -Command "Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile '%TEMP%\rustup-init.exe'; Start-Process -FilePath '%TEMP%\rustup-init.exe' -ArgumentList '-y --profile minimal' -NoNewWindow -Wait"
    set PATH=%USERPROFILE%\.cargo\bin;%PATH%
)

"%PYTHON_EXE%" -m pip install maturin --break-system-packages
echo Building Rust package wheel via Maturin...
"%PYTHON_EXE%" -m maturin build --release -i "%PYTHON_EXE%"
if %ERRORLEVEL% neq 0 (
    echo Building Rust core failed.
    pause
    exit /b %ERRORLEVEL%
)

echo Installing native wheel into Python environment...
for /f "tokens=*" %%f in ('dir /b /s target\wheels\*.whl') do (
    "%PYTHON_EXE%" -m pip install "%%f" --break-system-packages --force-reinstall
)

echo ==========================================================
echo Setup and Rust build completed successfully!
echo  -^> Miner: "%PYTHON_EXE%" neurons/miner.py
echo  -^> Validator: "%PYTHON_EXE%" neurons/validator.py
echo ==========================================================
pause
