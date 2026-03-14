#!/usr/bin/env bash
# When a subagent stops, optionally send a follow-up message to keep the workflow moving.
# Input: JSON on stdin with status, task, summary, etc.
# Output: JSON with optional "followup_message" (only used when status is "completed").

input=$(cat)
status=""

if command -v jq &>/dev/null; then
  status=$(echo "$input" | jq -r '.status // empty' 2>/dev/null)
else
  # Fallback: grep for status (less robust but works without jq)
  if echo "$input" | grep -qE '"status"[[:space:]]*:[[:space:]]*"completed"'; then
    status="completed"
  fi
fi

if [ "$status" = "completed" ]; then
  echo '{"followup_message": "PM: Review the builder output above for this phase. If the phase is complete and correct, approve and instruct the builder to proceed to the next phase (see docs/engineering-spec.md §8). If something is wrong or missing, list the fixes, then tell the builder to address them and then proceed to the next phase."}'
else
  echo '{}'
fi
