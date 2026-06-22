#!/usr/bin/env python3
import os
import sys
import struct
import glob

def verify_cloud_simulation():
    errors = []
    
    # 1. APK checks
    apk_dir = "/home/matthias/project/zero_sum_rpg/zero_sum_android/app/build/outputs/apk/"
    app_apk = os.path.join(apk_dir, "debug/app-debug.apk")
    test_apk = os.path.join(apk_dir, "androidTest/debug/app-debug-androidTest.apk")
    
    print("Checking APKs...")
    for path, name in [(app_apk, "debug/app-debug.apk"), (test_apk, "androidTest/debug/app-debug-androidTest.apk")]:
        if not os.path.exists(path):
            errors.append(f"APK file does not exist: {name} (expected at {path})")
        elif not os.path.isfile(path):
            errors.append(f"APK path is not a file: {name} ({path})")
        elif os.path.getsize(path) == 0:
            errors.append(f"APK file is empty: {name} ({path})")
        else:
            print(f"  [PASS] {name} exists and is non-empty ({os.path.getsize(path)} bytes)")

    # 2. Session log checks
    logs_dir = "/home/matthias/project/zero_sum_rpg/cloud_simulation_logs/"
    print("\nChecking narrative session logs...")
    
    # Verify exactly 3 session log files matching session_*.md exist
    log_files = sorted(glob.glob(os.path.join(logs_dir, "session_*.md")))
    log_basenames = [os.path.basename(f) for f in log_files]
    expected_logs = ["session_1.md", "session_2.md", "session_3.md"]
    
    if log_basenames != expected_logs:
        errors.append(f"Expected exactly {expected_logs} in logs directory, but found: {log_basenames}")
    else:
        print(f"  [PASS] Found exactly 3 session logs: {expected_logs}")
        
    for i in [1, 2, 3]:
        log_name = f"session_{i}.md"
        log_path = os.path.join(logs_dir, log_name)
        if not os.path.exists(log_path):
            errors.append(f"Session log {log_name} does not exist at {log_path}")
            continue
            
        size = os.path.getsize(log_path)
        if size == 0:
            errors.append(f"Session log {log_name} is empty")
            continue
            
        with open(log_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check Scenario reference and ZSCM scores or twists
        scenario_str = f"Scenario 00{i}"
        scenario_alt_str = f"Scenario: 00{i}"
        
        has_scenario = (scenario_str in content) or (scenario_alt_str in content)
        has_zscm = ("ZSCM" in content) or ("Zero Sum Consistency Matrix" in content)
        
        if not has_scenario:
            errors.append(f"Session log {log_name} does not contain references to '{scenario_str}'")
        if not has_zscm:
            errors.append(f"Session log {log_name} does not contain references to 'ZSCM' or 'Zero Sum Consistency Matrix'")
            
        if has_scenario and has_zscm:
            print(f"  [PASS] {log_name} is valid, refers to {scenario_str} and ZSCM")

    # 3. Screenshot checks
    print("\nChecking screenshots...")
    screenshot_files = sorted(glob.glob(os.path.join(logs_dir, "play_session_*.png")))
    screenshot_basenames = [os.path.basename(f) for f in screenshot_files]
    expected_screenshots = ["play_session_1.png", "play_session_2.png", "play_session_3.png"]
    
    if screenshot_basenames != expected_screenshots:
        errors.append(f"Expected exactly {expected_screenshots} in logs directory, but found: {screenshot_basenames}")
    else:
        print(f"  [PASS] Found exactly 3 screenshot files: {expected_screenshots}")
        
    for i in [1, 2, 3]:
        ss_name = f"play_session_{i}.png"
        ss_path = os.path.join(logs_dir, ss_name)
        if not os.path.exists(ss_path):
            errors.append(f"Screenshot {ss_name} does not exist at {ss_path}")
            continue
            
        size = os.path.getsize(ss_path)
        if size == 0:
            errors.append(f"Screenshot {ss_name} is empty")
            continue
            
        # Parse PNG dimensions programmatically
        with open(ss_path, "rb") as f:
            data = f.read(30)
            
        if len(data) < 24:
            errors.append(f"Screenshot {ss_name} has insufficient bytes ({len(data)}) to parse header")
            continue
            
        # Check PNG signature
        expected_sig = b"\x89PNG\r\n\x1a\n"
        sig = data[:8]
        if sig != expected_sig:
            errors.append(f"Screenshot {ss_name} has invalid PNG signature: {sig.hex().upper()}")
            continue
            
        # Check chunk type
        chunk_type = data[12:16]
        if chunk_type != b"IHDR":
            errors.append(f"Screenshot {ss_name} has invalid IHDR chunk type: {chunk_type}")
            continue
            
        # Parse width and height
        try:
            width, height = struct.unpack(">II", data[16:24])
        except Exception as e:
            errors.append(f"Screenshot {ss_name} failed to unpack dimensions: {e}")
            continue
            
        if width <= 0 or height <= 0:
            errors.append(f"Screenshot {ss_name} has invalid dimensions: {width}x{height}")
        else:
            print(f"  [PASS] {ss_name} is valid PNG. Dimensions: {width}x{height} (Positive)")

    print()
    if errors:
        print("VERIFICATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL CLOUD SIMULATION CHECKS PASSED SUCCESSFULLY!")
        sys.exit(0)

if __name__ == "__main__":
    verify_cloud_simulation()
