@echo off
title surfclaw TUI Autopilot
echo ========================================================
echo Launching surfclaw TUI Autopilot...
echo ========================================================
cd "c:\Users\YG\Desktop\SURFWANG\hermes-agent-main (1)\hermes-agent-main"
set PYTHONUTF8=1
uv run python cli.py
pause
