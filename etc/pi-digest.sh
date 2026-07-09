#!/usr/bin/env bash
# pi-digest — Session analytics for pi.dev JSONL session logs
# Usage: pi-digest [--all | --latest | --week | --model-stats | --cost]
# Requires: jq
set -euo pipefail

# --- Configuration -----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRICING_FILE="${PI_DIGEST_PRICING:-$SCRIPT_DIR/pricing.json}"

# Session dir: respect env or fall back to ../var/pi-sessions relative to etc/
SESSION_DIR="${PI_CODING_AGENT_SESSION_DIR:-$(cd "$SCRIPT_DIR/../var/pi-sessions" 2>/dev/null && pwd)}"

# --- Colors ------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# --- Helpers -----------------------------------------------------------------
die()  { printf "${RED}error:${NC} %s\n" "$1" >&2; exit 1; }
info() { printf "${GREEN}▸${NC} %s\n" "$1"; }
bold() { printf "${BOLD}%s${NC}" "$1"; }

check_deps() {
  command -v jq >/dev/null 2>&1 || die "jq is required but not installed. Install with: apt install jq / brew install jq"
}

# --- Core: parse one session file --------------------------------------------
# Outputs a single JSON object with aggregated stats for the session.
parse_session() {
  local file="$1"
  jq -s '
    # Extract session metadata
    (map(select(.type == "session")) | first) as $sess |
    # Collect all model changes (last one is the effective model)
    (map(select(.type == "model_change")) | last) as $model |
    # Collect assistant messages with usage
    [.[] | select(.type == "message" and .message.role == "assistant" and .message.usage != null)] as $msgs |
    # Collect user messages
    [.[] | select(.type == "message" and .message.role == "user")] as $user_msgs |
    # Collect tool calls
    [.[] | select(.type == "message" and .message.role == "assistant")
      | .message.content[]? | select(.type == "toolCall")] as $tools |
    # Timestamps
    ([$msgs[].timestamp, $user_msgs[].timestamp] | map(. // empty) | sort) as $times |
    # Aggregate
    {
      id: ($sess.id // "unknown"),
      timestamp: ($sess.timestamp // "unknown"),
      cwd: ($sess.cwd // "unknown"),
      model: ($model.modelId // "unknown"),
      provider: ($model.provider // "unknown"),
      user_messages: ($user_msgs | length),
      assistant_messages: ($msgs | length),
      tool_calls: ($tools | length),
      total_input_tokens: ([$msgs[].message.usage.input // 0] | add // 0),
      total_output_tokens: ([$msgs[].message.usage.output // 0] | add // 0),
      total_tokens: ([$msgs[].message.usage.totalTokens // 0] | add // 0),
      total_cost: ([$msgs[].message.usage.cost.total // 0] | add // 0),
      cache_read_tokens: ([$msgs[].message.usage.cacheRead // 0] | add // 0),
      cache_write_tokens: ([$msgs[].message.usage.cacheWrite // 0] | add // 0),
      duration_seconds: (
        if ($times | length) > 1 then
          (($times | last) as $end | ($times | first) as $start |
           (($end | split("T") | .[0]) as $d1 | ($start | split("T") | .[0]) as $d2 |
            # Approximate: just use the raw timestamps difference via jq date if available
            null))
        else null end
      ),
      first_timestamp: ($times | first // null),
      last_timestamp: ($times | last // null)
    }
  ' "$file"
}

# --- Commands ----------------------------------------------------------------

cmd_summary() {
  local file="$1"
  local data
  data=$(parse_session "$file")

  local id model provider user_msgs assistant_msgs tools tokens cost ts
  id=$(echo "$data" | jq -r '.id')
  model=$(echo "$data" | jq -r '.model')
  provider=$(echo "$data" | jq -r '.provider')
  user_msgs=$(echo "$data" | jq -r '.user_messages')
  assistant_msgs=$(echo "$data" | jq -r '.assistant_messages')
  tools=$(echo "$data" | jq -r '.tool_calls')
  tokens=$(echo "$data" | jq -r '.total_tokens')
  cost=$(echo "$data" | jq -r '.total_cost')
  ts=$(echo "$data" | jq -r '.timestamp')

  printf "\n${CYAN}━━━ Session: %.8s ━━━${NC}\n" "$id"
  printf "  ${BOLD}Started:${NC}   %s\n" "$ts"
  printf "  ${BOLD}Model:${NC}     %s (%s)\n" "$model" "$provider"
  printf "  ${BOLD}Messages:${NC}  %s user / %s assistant\n" "$user_msgs" "$assistant_msgs"
  printf "  ${BOLD}Tool calls:${NC} %s\n" "$tools"
  printf "  ${BOLD}Tokens:${NC}    %s total\n" "$tokens"
  printf "  ${BOLD}Cost:${NC}      \$%.6f\n" "$cost"
  echo ""
}

cmd_latest() {
  local latest
  latest=$(find "$SESSION_DIR" -name "*.jsonl" -type f | sort | tail -1)
  if [ -z "$latest" ]; then
    die "No session files found in $SESSION_DIR"
  fi
  info "Latest session: $(basename "$latest")"
  cmd_summary "$latest"
}

cmd_all() {
  local files
  files=$(find "$SESSION_DIR" -name "*.jsonl" -type f | sort)
  if [ -z "$files" ]; then
    die "No session files found in $SESSION_DIR"
  fi
  local count
  count=$(echo "$files" | wc -l | tr -d ' ')
  info "Found $count session(s)"
  echo "$files" | while IFS= read -r f; do
    cmd_summary "$f"
  done
}

cmd_week() {
  # Sessions from last 7 days
  local cutoff files
  if date -v-7d +%Y-%m-%dT%H:%M:%S 2>/dev/null >&2; then
    cutoff=$(date -v-7d +%Y-%m-%dT%H:%M:%S)  # macOS
  else
    cutoff=$(date -d '7 days ago' +%Y-%m-%dT%H:%M:%S)  # GNU
  fi

  files=$(find "$SESSION_DIR" -name "*.jsonl" -type f | sort)
  if [ -z "$files" ]; then
    die "No session files found in $SESSION_DIR"
  fi

  printf "\n${CYAN}━━━ Weekly Summary (since %s) ━━━${NC}\n\n" "${cutoff:0:10}"

  local total_tokens=0 total_cost=0 total_sessions=0 total_tools=0

  echo "$files" | while IFS= read -r f; do
    # Filename starts with timestamp, quick filter
    local fname
    fname=$(basename "$f")
    local file_ts="${fname:0:19}"
    # Replace dashes in time portion back to colons for comparison
    # Filenames look like: 2026-07-07T10-46-11-085Z_...
    # Just compare lexicographically (works for ISO-ish formats)
    if [[ "$file_ts" > "${cutoff:0:19}" ]] || [[ "$file_ts" == "${cutoff:0:19}" ]]; then
      local data
      data=$(parse_session "$f")
      local t c tools model
      t=$(echo "$data" | jq -r '.total_tokens')
      c=$(echo "$data" | jq -r '.total_cost')
      tools=$(echo "$data" | jq -r '.tool_calls')
      model=$(echo "$data" | jq -r '.model')
      printf "  %s  %-25s  %6s tok  \$%.4f  %s tools\n" \
        "${fname:0:19}" "$model" "$t" "$c" "$tools"
    fi
  done

  # Aggregate
  local agg
  agg=$(find "$SESSION_DIR" -name "*.jsonl" -type f -print0 | sort -z | \
    xargs -0 -I{} sh -c "cat \"{}\"" | \
    jq -s '
      [.[] | select(.type == "message" and .message.role == "assistant" and .message.usage != null)] |
      {
        sessions: "n/a",
        total_tokens: ([.[].message.usage.totalTokens // 0] | add // 0),
        total_cost: ([.[].message.usage.cost.total // 0] | add // 0),
        tool_calls: 0
      }
    ')

  local agg_tokens agg_cost
  agg_tokens=$(echo "$agg" | jq -r '.total_tokens')
  agg_cost=$(echo "$agg" | jq -r '.total_cost')

  printf "\n  ${BOLD}Totals:${NC} %s tokens | \$%.6f\n\n" "$agg_tokens" "$agg_cost"
}

cmd_model_stats() {
  local files
  files=$(find "$SESSION_DIR" -name "*.jsonl" -type f)
  if [ -z "$files" ]; then
    die "No session files found in $SESSION_DIR"
  fi

  printf "\n${CYAN}━━━ Model Usage Stats ━━━${NC}\n\n"

  # Aggregate per-model from all sessions
  find "$SESSION_DIR" -name "*.jsonl" -type f -print0 | sort -z | \
    xargs -0 cat | \
    jq -s '
      [.[] | select(.type == "message" and .message.role == "assistant" and .message.usage != null)] |
      group_by(.message.model) |
      map({
        model: (.[0].message.model // "unknown"),
        messages: length,
        total_tokens: ([.[].message.usage.totalTokens // 0] | add // 0),
        total_cost: ([.[].message.usage.cost.total // 0] | add // 0)
      }) |
      sort_by(-.total_tokens)
    ' | jq -r '
      .[] | "  \(.model)\t\(.messages) msgs\t\(.total_tokens) tok\t$\(.total_cost | tostring | .[0:8])"
    ' | column -t -s $'\t'

  echo ""
}

cmd_cost() {
  local files
  files=$(find "$SESSION_DIR" -name "*.jsonl" -type f)
  if [ -z "$files" ]; then
    die "No session files found in $SESSION_DIR"
  fi

  printf "\n${CYAN}━━━ Cost Breakdown ━━━${NC}\n\n"

  find "$SESSION_DIR" -name "*.jsonl" -type f -print0 | sort -z | \
    xargs -0 cat | \
    jq -s '
      [.[] | select(.type == "message" and .message.role == "assistant" and .message.usage != null)] as $msgs |
      {
        total_messages: ($msgs | length),
        total_input_tokens: ([$msgs[].message.usage.input // 0] | add // 0),
        total_output_tokens: ([$msgs[].message.usage.output // 0] | add // 0),
        total_cache_read: ([$msgs[].message.usage.cacheRead // 0] | add // 0),
        total_cache_write: ([$msgs[].message.usage.cacheWrite // 0] | add // 0),
        total_tokens: ([$msgs[].message.usage.totalTokens // 0] | add // 0),
        cost_input: ([$msgs[].message.usage.cost.input // 0] | add // 0),
        cost_output: ([$msgs[].message.usage.cost.output // 0] | add // 0),
        cost_cache_read: ([$msgs[].message.usage.cost.cacheRead // 0] | add // 0),
        cost_cache_write: ([$msgs[].message.usage.cost.cacheWrite // 0] | add // 0),
        cost_total: ([$msgs[].message.usage.cost.total // 0] | add // 0),
        by_model: ($msgs | group_by(.message.model) | map({
          model: (.[0].message.model // "unknown"),
          tokens: ([.[].message.usage.totalTokens // 0] | add // 0),
          cost: ([.[].message.usage.cost.total // 0] | add // 0)
        }) | sort_by(-.cost))
      }
    ' | jq -r '
      "  Messages:         \(.total_messages)",
      "  Input tokens:     \(.total_input_tokens)",
      "  Output tokens:    \(.total_output_tokens)",
      "  Cache read:       \(.total_cache_read)",
      "  Cache write:      \(.total_cache_write)",
      "  Total tokens:     \(.total_tokens)",
      "",
      "  Cost by model:",
      (.by_model[] | "    \(.model):\t$\(.cost | tostring | .[0:10])\t(\(.tokens) tok)"),
      "",
      "  Cost breakdown:",
      "    Input:          $\(.cost_input | tostring | .[0:10])",
      "    Output:         $\(.cost_output | tostring | .[0:10])",
      "    Cache read:     $\(.cost_cache_read | tostring | .[0:10])",
      "    Cache write:    $\(.cost_cache_write | tostring | .[0:10])",
      "    ─────────────────",
      "    TOTAL:          $\(.cost_total | tostring | .[0:10])"
    '

  echo ""
}

# --- Usage -------------------------------------------------------------------
usage() {
  cat <<EOF
${BOLD}pi-digest${NC} — pi.dev session analytics

${BOLD}Usage:${NC}
  pi-digest [command]

${BOLD}Commands:${NC}
  (none), --latest   Summarize the most recent session
  --all              Summarize all sessions
  --week             Weekly overview with per-session breakdown
  --model-stats      Model usage rankings
  --cost             Detailed cost breakdown across all sessions
  --help             Show this help

${BOLD}Environment:${NC}
  PI_CODING_AGENT_SESSION_DIR   Override session directory
  PI_DIGEST_PRICING             Override pricing.json path
EOF
}

# --- Main --------------------------------------------------------------------
main() {
  check_deps

  if [ ! -d "$SESSION_DIR" ]; then
    die "Session directory not found: $SESSION_DIR"
  fi

  local cmd="${1:---latest}"

  case "$cmd" in
    --latest|-l)      cmd_latest ;;
    --all|-a)         cmd_all ;;
    --week|-w)        cmd_week ;;
    --model-stats|-m) cmd_model_stats ;;
    --cost|-c)        cmd_cost ;;
    --help|-h)        usage ;;
    *)                die "Unknown command: $cmd. Use --help for usage." ;;
  esac
}

main "$@"
