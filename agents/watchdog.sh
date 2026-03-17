#!/bin/bash
# Watchdog: monitors a pipeline PID and sends a macOS notification on exit.
# Usage: ./watchdog.sh <pid> [reports_dir]

PID="$1"
REPORTS_DIR="${2:-$(dirname "$0")/.reports}"
POLL_INTERVAL=5

if [ -z "$PID" ]; then
  echo "Usage: watchdog.sh <pid> [reports_dir]" >&2
  exit 1
fi

if ! kill -0 "$PID" 2>/dev/null; then
  echo "PID $PID is not running." >&2
  exit 1
fi

# Poll until the process exits
while kill -0 "$PID" 2>/dev/null; do
  sleep "$POLL_INTERVAL"
done

# Determine outcome
if [ -f "$REPORTS_DIR/wrapup.md" ]; then
  TITLE="Pipeline Complete"
  MSG="All 9 steps finished. Check wrapup.md for results."
  SOUND="Glass"
else
  # Find which step it died on
  STEP="unknown"
  if [ -f "$REPORTS_DIR/pipeline-health.json" ]; then
    STEP=$(python3 -c "
import json, sys
h = json.load(open('$REPORTS_DIR/pipeline-health.json'))
running = [s for s in h.get('steps', []) if s['status'] == 'running']
if running:
    print(running[0]['name'])
else:
    print('step ' + str(h.get('currentStep', '?')))
" 2>/dev/null || echo "unknown")
  fi
  TITLE="Pipeline Crashed"
  MSG="Process exited during: $STEP"
  SOUND="Sosumi"
fi

osascript -e "display notification \"$MSG\" with title \"DITA Architect\" subtitle \"$TITLE\" sound name \"$SOUND\""
