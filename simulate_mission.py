#!/usr/bin/env python3
import subprocess
import time
import sys

TOTAL_SESSIONS = 50
START_SESSION = 1

if len(sys.argv) < 2:
    print("Usage: ./simulate_mission.py <Mission_Filename>")
    sys.exit(1)

mission_file = sys.argv[1]
LOG_FILE = f"Mass_Playtest_Aggregated_Log_{mission_file.split('.')[0]}.md"

def run_session(session_id):
    prompt = f"""
    Du bist der autonome Playtest-Orchestrator für das Zero-Sum RPG.
    Führe jetzt exakt 'Session {session_id}' für die Mission '{mission_file}' als pure Gedanken-Simulation durch. 
    Lies mental die Regeln aus 'Player_Handbook.md' (inklusive des Patch v1.1 Notfall-Cache) und die Story aus '{mission_file}'.
    Simuliere 4 Spieler (Medic, Tech, Infiltrator, Ghost). Lass sie würfeln, lass sie 
    Zero-Sum (150MB) Entscheidungen treffen. 
    Gib mir am Ende einen kurzen (ca. 10 Zeilen) Markdown-Bericht über den Ausgang 
    der Mission und 1 zentrales Feedback zur Spielbalance für *genau diese* Mission.
    """
    
    print(f"Starte Simulation für Session {session_id} in {mission_file}...")
    
    # Nutze das Antigravity CLI (--print) für einen Non-Interactive Run!
    result = subprocess.run(
        ["agy", "--print", prompt],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        return result.stdout
    else:
        return f"FEHLER BEI SESSION {session_id}:\n{result.stderr}"

def main():
    print(f"Initiating Mass Playtest Simulator for {mission_file}...")
    
    with open(LOG_FILE, "a") as f:
        f.write(f"# 🧪 Mass Playtest Aggregation Log: {mission_file}\n\n")
        
    for i in range(START_SESSION, TOTAL_SESSIONS + 1):
        output = run_session(i)
        
        with open(LOG_FILE, "a") as f:
            f.write(f"## Session {i} Report\n")
            f.write(output + "\n\n")
            f.write("---\n")
            
        print(f"Session {i} abgeschlossen. Log gespeichert.")
        
        # Kurze Pause, um das System/Ratelimit zu schonen
        time.sleep(5)
        
    print(f"Alle Sessions simuliert! Siehe {LOG_FILE}.")

if __name__ == "__main__":
    main()
