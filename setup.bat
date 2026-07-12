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
echo 🚀 Surfclaw 고성능 DePIN 채굴 가속 엔진 설치를 시작합니다...
echo ==========================================================

:: 1. AIOS 및 Cerebrum 원본 오픈소스 자동 복제
if not exist "AIOS-main" (
    echo 📦 [1/4] AIOS 커널 원본 레포지토리를 복제합니다...
    git clone https://github.com/agiresearch/AIOS.git AIOS-main
) else (
    echo ✅ AIOS 커널 폴더가 이미 존재합니다.
)

if not exist "Cerebrum-main" (
    echo 📦 [2/4] Cerebrum SDK 레포지토리를 복제합니다...
    git clone https://github.com/agiresearch/Cerebrum.git Cerebrum-main
) else (
    echo ✅ Cerebrum SDK 폴더가 이미 존재합니다.
)

:: 2. 파이썬 가상환경 의존성 설치
echo 📦 [3/4] 파이썬 패키지 의존성을 설치합니다...
set PYTHON_EXE=python
where uv >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ⚙️  uv 패키지 가속 관리자를 감지했습니다.
    set PYTHON_EXE=C:\Users\YG\AppData\Roaming\uv\python\cpython-3.11.15-windows-x86_64-none\python.exe
)

"%PYTHON_EXE%" -m pip install pydantic --break-system-packages
if exist "Cerebrum-main" (
    "%PYTHON_EXE%" -m pip install -e Cerebrum-main --break-system-packages
)
if exist "AIOS-main\requirements.txt" (
    "%PYTHON_EXE%" -m pip install -r AIOS-main\requirements.txt --break-system-packages
)

:: 3. Rust surfclaw-core 네이티브 모듈 빌드 및 강제 설치
echo 📦 [4/4] Rust 고성능 스케줄러 코어를 빌드 및 설치합니다...
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
where cargo >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 시스템에 Rust 컴파일러가 감지되지 않았습니다.
    echo ⚙️  오픈소스 웹 인스톨러를 통해 Rust 설치를 시도합니다...
    powershell -Command "Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile '%TEMP%\rustup-init.exe'; Start-Process -FilePath '%TEMP%\rustup-init.exe' -ArgumentList '-y --profile minimal' -NoNewWindow -Wait"
    set PATH=%USERPROFILE%\.cargo\bin;%PATH%
)

"%PYTHON_EXE%" -m pip install maturin --break-system-packages
echo ⚙️  Maturin을 사용해 Rust 휠 패키지를 빌드 중...
"%PYTHON_EXE%" -m maturin build --release -i "%PYTHON_EXE%"
if %ERRORLEVEL% neq 0 (
    echo ❌ Rust 빌드 중 오류가 발생했습니다.
    pause
    exit /b %ERRORLEVEL%
)

echo ⚙️  빌드된 네이티브 모듈을 파이썬에 설치 중...
for /f "tokens=*" %%f in ('dir /b /s target\wheels\*.whl') do (
    "%PYTHON_EXE%" -m pip install "%%f" --break-system-packages --force-reinstall
)

echo ==========================================================
echo 🎉 모든 설치와 Rust 빌드가 완료되었습니다!
echo  -^> 마이너 실행: "%PYTHON_EXE%" neurons/miner.py
echo  -^> 검증자 실행: "%PYTHON_EXE%" neurons/validator.py
echo ==========================================================
pause
