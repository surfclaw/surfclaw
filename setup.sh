#!/bin/bash

# ====================================================================
# Surfclaw - One-click Setup and Build Script (Linux/macOS)
# ====================================================================

echo "=========================================================="
echo "  ____              __      _                     "
echo " / ___| _   _ _ __ / _| ___| | __ _ __      __    "
echo " \___ \| | | | '__| |_ / __| |/ _\` | \ /\ / /    "
echo "  ___) | |_| | |  |  _| (__| | (_| |\ V  V /     "
echo " |____/ \__,_|_|  |_|  \___|_|\__,_| \_/\_/      "
echo "=========================================================="
echo "🚀 Surfclaw 고성능 DePIN 채굴 가속 엔진 설치를 시작합니다..."
echo "=========================================================="

# 1. AIOS 및 Cerebrum 원본 오픈소스 레포지토리가 없으면 자동으로 Clone
if [ ! -d "AIOS-main" ]; then
    echo "📦 [1/4] AIOS 커널 원본 레포지토리를 복제합니다..."
    git clone https://github.com/agiresearch/AIOS.git AIOS-main
else
    echo "✅ AIOS 커널 폴더가 이미 존재합니다."
fi

if [ ! -d "Cerebrum-main" ]; then
    echo "📦 [2/4] Cerebrum SDK 레포지토리를 복제합니다..."
    git clone https://github.com/agiresearch/Cerebrum.git Cerebrum-main
else
    echo "✅ Cerebrum SDK 폴더가 이미 존재합니다."
fi

# 2. 파이썬 가상환경 라이브러리 및 의존성 설치
echo "📦 [3/4] 파이썬 패키지 의존성을 설치합니다..."
PYTHON_EXE="python"
if command -v uv &> /dev/null; then
    echo "⚙️  uv 패키지 가속 관리자를 감지했습니다."
    PYTHON_EXE="uv run python"
fi

$PYTHON_EXE -m pip install pydantic --break-system-packages

if [ -d "Cerebrum-main" ]; then
    echo "⚙️  Cerebrum SDK 패키지 빌드 설치 중..."
    $PYTHON_EXE -m pip install -e Cerebrum-main --break-system-packages
fi

if [ -f "AIOS-main/requirements.txt" ]; then
    echo "⚙️  AIOS 커널 라이브러리 의존성 설치 중..."
    $PYTHON_EXE -m pip install -r AIOS-main/requirements.txt --break-system-packages
fi

# 3. Rust surfclaw-core 네이티브 모듈 빌드 및 강제 설치
echo "📦 [4/4] Rust 고성능 스케줄러 코어를 빌드 및 설치합니다..."
export PATH="$HOME/.cargo/bin:$PATH"
if ! command -v cargo &> /dev/null; then
    echo "❌ 시스템에 Rust 컴파일러가 감지되지 않았습니다."
    echo "⚙️  rustup을 통해 Rust 설치를 시도합니다..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
    export PATH="$HOME/.cargo/bin:$PATH"
fi

$PYTHON_EXE -m pip install maturin --break-system-packages
echo "⚙️  Maturin을 사용해 Rust 휠 패키지를 빌드 중..."
$PYTHON_EXE -m maturin build --release

echo "⚙️  빌드된 네이티브 모듈을 파이썬에 설치 중..."
$PYTHON_EXE -m pip install target/wheels/*.whl --break-system-packages --force-reinstall

echo "=========================================================="
echo "🎉 모든 설치와 Rust 빌드가 완료되었습니다!"
echo " -> 마이너 실행: $PYTHON_EXE neurons/miner.py"
echo " -> 검증자 실행: $PYTHON_EXE neurons/validator.py"
echo "=========================================================="
