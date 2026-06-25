#!/bin/bash
SESSION_PIN=$1
if [ -z "$SESSION_PIN" ]; then
  echo "Usage: ./curl-agent-network.sh <SESSION_PIN>"
  exit 1
fi

FIREBASE_URL="https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app/sessions/$SESSION_PIN/apiQueue.json"

echo "Initializing Cyberpunk Agent Network for Session $SESSION_PIN..."

# Agent Personas
AGENTS=("p1" "p2" "p3" "p4" "p5" "p6" "p7")

# Wait a bit before starting
sleep 2

turn=1
while true; do
  for AGENT in "${AGENTS[@]}"; do
    ACTION_TYPE=$((RANDOM % 3))
    if [ $ACTION_TYPE -eq 0 ]; then
       # MOVE
       DX=$((RANDOM % 3 - 1))
       DY=$((RANDOM % 3 - 1))
       curl -s -X POST -H "Content-Type: application/json" \
         -d "{\"playerId\": \"$AGENT\", \"type\": \"MOVE\", \"dx\": $DX, \"dy\": $DY}" \
         $FIREBASE_URL > /dev/null
       echo "[Agent Network] $AGENT moved ($DX, $DY)"
    elif [ $ACTION_TYPE -eq 1 ]; then
       # ACTION
       ACTIONS=("attack" "sneak" "sabotage" "hack" "investigate")
       ACTION=${ACTIONS[$((RANDOM % 5))]}
       curl -s -X POST -H "Content-Type: application/json" \
         -d "{\"playerId\": \"$AGENT\", \"type\": \"ACTION\", \"payload\": \"$ACTION\"}" \
         $FIREBASE_URL > /dev/null
       echo "[Agent Network] $AGENT executed $ACTION"
    else
       # CHAT
       MESSAGES=("I'm in." "Sysadmin is onto us." "Sec-doors locked, bypassing." "Covering fire!" "Uploading ICE breaker." "Need a medkit here!" "Quiet, they're patrolling." "Payload delivered.")
       MESSAGE=${MESSAGES[$((RANDOM % 8))]}
       curl -s -X POST -H "Content-Type: application/json" \
         -d "{\"playerId\": \"$AGENT\", \"type\": \"CHAT\", \"payload\": \"$MESSAGE\"}" \
         $FIREBASE_URL > /dev/null
       echo "[Agent Network] $AGENT said: $MESSAGE"
    fi
    # Slight delay between agent actions to simulate human-like pacing
    sleep 0.5
  done
  echo "--- Turn $turn Complete ---"
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"type\": \"NEW_TURN\", \"turn\": $turn}" \
    $FIREBASE_URL > /dev/null
  ((turn++))
  sleep 2
done

echo "Simulation Complete."
