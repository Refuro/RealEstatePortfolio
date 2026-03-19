# When a subagent stops, optionally send a follow-up message to keep the workflow moving.
# Input: JSON on stdin with status, task, summary, etc.
# Output: JSON with optional "followup_message" (only used when status is "completed").
# Use this script on Windows when Git Bash/WSL is not available. In hooks.json, set:
#   "command": ".cursor/hooks/on-subagent-stop.ps1"

$input = [System.Console]::In.ReadToEnd()
$status = ""

try {
    $json = $input | ConvertFrom-Json
    $status = $json.status
} catch {
    # Fallback: simple string match
    if ($input -match '"status"\s*:\s*"completed"') {
        $status = "completed"
    }
}

if ($status -eq "completed") {
    Write-Output '{"followup_message": "PM: Review the builder output above for this phase. If the phase is complete and correct, approve and instruct the builder to proceed to the next phase (see docs/reference/engineering-spec.md §8). If something is wrong or missing, list the fixes, then tell the builder to address them and then proceed to the next phase."}'
} else {
    Write-Output '{}'
}
