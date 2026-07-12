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
echo "Starting Surfclaw GPU Accelerator Environment Setup..."
echo "=========================================================="

if [ ! -d "AIOS-main" ]; then
    echo "[1/4] Cloning AIOS Core repository..."
    git clone https://github.com/agiresearch/AIOS.git AIOS-main
else
    echo "AIOS Core repository already exists."
fi

if [ ! -d "Cerebrum-main" ]; then
    echo "[2/4] Cloning Cerebrum SDK repository..."
    git clone https://github.com/agiresearch/Cerebrum.git Cerebrum-main
else
    echo "Cerebrum SDK repository already exists."
fi

echo "[3/4] Installing Python dependency packages..."
PYTHON_EXE="python"
if command -v uv &> /dev/null; then
    echo "detected uv package manager."
    PYTHON_EXE="uv run python"
fi

$PYTHON_EXE -m pip install pydantic --break-system-packages

if [ -d "Cerebrum-main" ]; then
    echo "Installing Cerebrum SDK package..."
    $PYTHON_EXE -m pip install -e Cerebrum-main --break-system-packages
fi

if [ -f "AIOS-main/requirements.txt" ]; then
    echo "Installing AIOS dependency requirements..."
    $PYTHON_EXE -m pip install -r AIOS-main/requirements.txt --break-system-packages
fi

echo "[4/4] Building and installing Surfclaw Rust scheduler core..."
export PATH="$HOME/.cargo/bin:$PATH"
if ! command -v cargo &> /dev/null; then
    echo "Rust compiler not found. Initiating rustup installation..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
    export PATH="$HOME/.cargo/bin:$PATH"
fi

$PYTHON_EXE -m pip install maturin --break-system-packages
echo "Building Rust package wheel via Maturin..."
$PYTHON_EXE -m maturin build --release

echo "Installing native wheel into Python environment..."
$PYTHON_EXE -m pip install target/wheels/*.whl --break-system-packages --force-reinstall

echo "=========================================================="
echo "Setup and Rust build completed successfully!"
echo " -> Miner: $PYTHON_EXE neurons/miner.py"
echo " -> Validator: $PYTHON_EXE neurons/validator.py"
echo "=========================================================="
