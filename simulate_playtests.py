#!/usr/bin/env python3
import subprocess
import time

TOTAL_SESSIONS = 50
START_SESSION = 1
LOG_FILE = "Mass_Playtest_Aggregated_Log.md"

def run_session(session_id):
    prompt = f"""
    Du bist der autonome Playtest-Orchestrator für das Zero-Sum RPG.
    Führe jetzt exakt 'Session {session_id}' als pure Gedanken-Simulation durch. 
    Lies mental die Regeln aus 'Player_Handbook.md' und 'Mission_01_The_Riot.md'.
    Simuliere 4 Spieler (Medic, Tech, Infiltrator, Ghost). Lass sie würfeln, lass sie 
    Zero-Sum (150MB) Entscheidungen treffen. 
    Gib mir am Ende einen kurzen (ca. 10 Zeilen) Markdown-Bericht über den Ausgang 
    der Mission und 1 zentrales Feedback zur Spielbalance.
    """
    
    print(f"Starte Simulation für Session {session_id}...")
    
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
    print("Initiating Mass Playtest Simulator via Antigravity CLI...")
    
    with open(LOG_FILE, "a") as f:
        f.write("# 🧪 Mass Playtest Aggregation Log\n\n")
        
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
