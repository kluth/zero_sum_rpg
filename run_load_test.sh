#!/usr/bin/env bash
set -euo pipefail

# Get directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

EMULATOR_STARTED=false
EMULATOR_PID=""

check_emulator() {
    node -e 'const net = require("net"); const client = net.createConnection({ port: 9000, host: "127.0.0.1" }, () => { process.exit(0); }); client.on("error", () => { process.exit(1); });' 2>/dev/null
}

cleanup() {
    if [ "$EMULATOR_STARTED" = true ]; then
        echo "Shutting down Firebase database emulator..."
        # Find PID listening on port 9000
        PID=$(ss -tlpn 2>/dev/null | grep :9000 | grep -o 'pid=[0-9]*' | cut -d= -f2 || true)
        if [ -n "$PID" ]; then
            echo "Killing Firebase database emulator process (PID $PID)..."
            kill "$PID" || true
            
            # Wait for it to exit
            for i in {1..10}; do
                if ! check_emulator; then
                    echo "Emulator shut down gracefully."
                    break
                fi
                sleep 0.5
            done
            
            # Force kill if still running
            if check_emulator; then
                echo "Emulator process did not terminate. Force killing PID $PID..."
                kill -9 "$PID" 2>/dev/null || true
            fi
        else
            echo "No emulator process found on port 9000."
        fi
        
        # Clean up background job shell wrapper
        if [ -n "$EMULATOR_PID" ]; then
            kill "$EMULATOR_PID" 2>/dev/null || true
        fi
    fi
}

trap cleanup EXIT

if check_emulator; then
    echo "Firebase database emulator is already running on port 9000."
else
    echo "Firebase database emulator is not running. Starting it..."
    npx firebase emulators:start --only database &
    EMULATOR_PID=$!
    EMULATOR_STARTED=true
    
    # Wait for emulator to start
    STARTED=false
    for i in {1..30}; do
        if check_emulator; then
            echo "Firebase emulator is ready."
            STARTED=true
            break
        fi
        echo "Waiting for emulator to start (attempt $i/30)..."
        sleep 1
    done
    
    if [ "$STARTED" = false ]; then
        echo "Error: Firebase emulator failed to start on port 9000 within 30 seconds."
        exit 1
    fi
fi

echo "Running load test..."
node tools/load_tester/runner.js

echo "Load test complete."
