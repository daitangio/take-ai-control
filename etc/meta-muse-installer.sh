#!/usr/bin/env bash
set -euo pipefail

command_name="muse"
install_dir="${MUSE_INSTALL_DIR:-${HOME:?HOME is not set}/.local/bin}"
launcher="$install_dir/$command_name"
launcher_url="${MUSE_LAUNCHER_URL:-https://api.meta.ai/muse-launcher.sh}"
launcher_tmp=""
launcher_headers=""

die() {
  printf '%s: %s\n' "$command_name" "$*" >&2
  exit 1
}

display_path() {
  if [[ -n "${HOME:-}" && "$1" == "$HOME"/* ]]; then
    printf '~/%s\n' "${1#"$HOME"/}"
  else
    printf '%s\n' "$1"
  fi
}

cleanup() {
  [[ -z "$launcher_tmp" ]] || rm -f "$launcher_tmp"
  [[ -z "$launcher_headers" ]] || rm -f "$launcher_headers"
}

sha256_file() {
  local output
  if command -v sha256sum >/dev/null 2>&1; then
    output="$(sha256sum "$1")" || return 1
  else
    output="$(shasum -a 256 "$1")" || return 1
  fi
  printf '%s\n' "${output%% *}"
}

# Final response only: --location dumps one header block per response.
read_response_header() {
  local file="$1" wanted="$2" line name value=""
  [[ -r "$file" ]] || return 0
  while IFS= read -r line; do
    line="${line%$'\r'}"
    if [[ "$line" == HTTP/* ]]; then
      value=""
      continue
    fi
    [[ "$line" == *:* ]] || continue
    name="$(printf '%s' "${line%%:*}" | tr '[:upper:]' '[:lower:]')"
    [[ "$name" == "$wanted" ]] || continue
    value="${line#*:}"
  done <"$file"
  while [[ "$value" == [[:space:]]* ]]; do value="${value#?}"; done
  while [[ "$value" == *[[:space:]] ]]; do value="${value%?}"; done
  printf '%s\n' "$value"
}

path_line() {
  printf "export PATH=\"%s:\$PATH\" # added by %s installer" \
    "$install_dir" "$command_name"
}

fish_path_line() {
  printf "contains -- \"%s\" \$PATH; or set -gx PATH \"%s\" \$PATH" \
    "$install_dir" "$install_dir"
  printf ' # added by %s installer' "$command_name"
}

strip_leading_space() {
  local value="$1"
  while [[ "$value" == [[:space:]]* ]]; do
    value="${value#?}"
  done
  printf '%s' "$value"
}

file_has_line() {
  local file="$1" wanted="$2" line
  [[ -f "$file" ]] || return 1
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "$wanted" ]]; then
      return 0
    fi
  done <"$file"
  return 1
}

resolve_zdotdir() {
  local line value=""
  resolved_zdotdir="${ZDOTDIR:-}"
  [[ -z "$resolved_zdotdir" ]] || return 0
  [[ -n "${HOME:-}" && -f "$HOME/.zshenv" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="$(strip_leading_space "$line")"
    if [[ "$line" == export[[:space:]]* ]]; then
      line="$(strip_leading_space "${line#export}")"
    fi
    [[ "$line" == ZDOTDIR=* ]] || continue
    value="${line#ZDOTDIR=}"
  done <"$HOME/.zshenv"
  case "$value" in
    '"'*)
      value="${value#\"}"
      value="${value%%\"*}"
      ;;
    "'"*)
      value="${value#"'"}"
      value="${value%%"'"*}"
      ;;
    *)
      value="${value%%;*}"
      value="${value%%#*}"
      value="${value%%[[:space:]]*}"
      ;;
  esac
  case "$value" in
    [~]) value="$HOME" ;;
    [~]/*) value="$HOME/${value#?/}" ;;
    "\$HOME"|"\${HOME}") value="$HOME" ;;
    "\$HOME"/*) value="$HOME/${value#*/}" ;;
    "\${HOME}"/*) value="$HOME/${value#*/}" ;;
  esac
  case "$value" in
    /*) resolved_zdotdir="$value" ;;
    *) resolved_zdotdir="" ;;
  esac
}

append_path_line() {
  local profile="$1" line
  case ":$path_touched_files:" in
    *":$profile:"*) return 0 ;;
  esac
  path_touched_files="$path_touched_files:$profile"
  line="$(path_line)"
  if file_has_line "$profile" "$line"; then
    path_present_files="${path_present_files:+$path_present_files, }$(
      display_path "$profile")"
    return 0
  fi
  mkdir -p -- "${profile%/*}" 2>/dev/null || return 0
  { printf '\n%s\n' "$line" >>"$profile"; } 2>/dev/null || return 0
  path_updated_files="${path_updated_files:+$path_updated_files, }$(
    display_path "$profile")"
}

append_fish_path_line() {
  local conf_dir fish_file line
  conf_dir="${XDG_CONFIG_HOME:-$HOME/.config}/fish/conf.d"
  fish_file="$conf_dir/$command_name.fish"
  line="$(fish_path_line)"
  if file_has_line "$fish_file" "$line"; then
    path_present_files="${path_present_files:+$path_present_files, }$(
      display_path "$fish_file")"
    return 0
  fi
  mkdir -p -- "$conf_dir" 2>/dev/null || return 0
  { printf '%s\n' "$line" >>"$fish_file"; } 2>/dev/null || return 0
  path_updated_files="${path_updated_files:+$path_updated_files, }$(
    display_path "$fish_file")"
}

configure_path() {
  case ":$PATH:" in
    *":$install_dir:"*) return 0 ;;
  esac
  local shell_name manual_line zsh_rc fish_rc source_file source_line
  local resolved_zdotdir
  local path_updated_files="" path_present_files="" path_touched_files=""
  shell_name="${SHELL:-}"
  shell_name="${shell_name##*/}"
  if [[ "$shell_name" == fish ]]; then
    manual_line="set -gx PATH \"$install_dir\" \$PATH"
  else
    manual_line="export PATH=\"$install_dir:\$PATH\""
  fi
  if [[ -n "${MUSE_NO_MODIFY_PATH:-}" ]]; then
    printf '\n%s is not on your PATH (skipped by MUSE_NO_MODIFY_PATH).\n' \
      "$(display_path "$install_dir")"
    printf 'To run %s by name, add it yourself:\n  %s\n' \
      "$command_name" "$manual_line"
    return 1
  fi
  if [[ -z "${HOME:-}" ]]; then
    printf '\n%s is not on your PATH and HOME is unset. Add it yourself:\n' \
      "$install_dir"
    printf '  %s\n' "$manual_line"
    return 1
  fi

  resolve_zdotdir
  zsh_rc="${resolved_zdotdir:-$HOME}/.zshrc"
  fish_rc="${XDG_CONFIG_HOME:-$HOME/.config}/fish/conf.d/$command_name.fish"
  case "$shell_name" in
    zsh) source_file="$zsh_rc" ;;
    bash) source_file="$HOME/.bashrc" ;;
    fish) source_file="$fish_rc" ;;
    *) source_file="$HOME/.profile" ;;
  esac
  source_line="source $(display_path "$source_file")"
  if [[ "$shell_name" == zsh || -f "$zsh_rc" ]]; then
    append_path_line "$zsh_rc"
    if [[ "$zsh_rc" != "$HOME/.zshrc" && -f "$HOME/.zshrc" ]]; then
      append_path_line "$HOME/.zshrc"
    fi
  fi
  if [[ "$shell_name" == bash || -f "$HOME/.bashrc" ||
    -f "$HOME/.bash_profile" || -f "$HOME/.bash_login" ]]; then
    append_path_line "$HOME/.bashrc"
    if [[ -f "$HOME/.bash_profile" ]]; then
      append_path_line "$HOME/.bash_profile"
    elif [[ -f "$HOME/.bash_login" ]]; then
      append_path_line "$HOME/.bash_login"
    else
      append_path_line "$HOME/.profile"
    fi
  fi
  if [[ "$shell_name" == fish ||
    -d "${XDG_CONFIG_HOME:-$HOME/.config}/fish" ]]; then
    append_fish_path_line
  fi
  case "$shell_name" in
    zsh|bash|fish) ;;
    *) append_path_line "$HOME/.profile" ;;
  esac

  printf '\n'
  if [[ -n "$path_updated_files" ]]; then
    printf 'Added %s to PATH in %s.\n' \
      "$(display_path "$install_dir")" "$path_updated_files"
    printf 'Restart your shell, or start in this one by running:\n'
    printf '  %s\n' "$source_line"
    printf 'Then run %s\n' "$command_name"
  elif [[ -n "$path_present_files" ]]; then
    printf 'A PATH entry for %s is already present in %s.\n' \
      "$(display_path "$install_dir")" "$path_present_files"
    printf 'Restart your shell, or start in this one by running:\n'
    printf '  %s\n' "$source_line"
    printf 'Then run %s\n' "$command_name"
  else
    printf '%s is not on your PATH and no profile could be updated. Add it yourself:\n' \
      "$(display_path "$install_dir")"
    printf '  %s\n' "$manual_line"
  fi
  return 1
}

_muse_install() {
  for required_command in curl mktemp; do
    command -v "$required_command" >/dev/null 2>&1 || \
      die "required command not found: $required_command"
  done
  [[ -n "$install_dir" && "$install_dir" != / ]] || \
    die "refusing to install into $install_dir"
  umask 022
  mkdir -p -- "$install_dir"

  trap cleanup EXIT
  trap 'exit 129' HUP
  trap 'exit 130' INT
  trap 'exit 143' TERM

  launcher_tmp="$(mktemp "$install_dir/.muse-launcher.XXXXXX")"
  launcher_headers="$launcher_tmp.headers"
  curl \
    --fail \
    --silent \
    --show-error \
    --location \
    --max-redirs 3 \
    --proto '=https' \
    --proto-redir '=https' \
    --tlsv1.2 \
    --dump-header "$launcher_headers" \
    --output "$launcher_tmp" \
    "$launcher_url"
  bash -n "$launcher_tmp" || die "downloaded launcher is invalid"

  # Verified when advertised; older serving code sends none.
  advertised="$(read_response_header "$launcher_headers" x-content-sha256)"
  advertised="$(printf '%s' "$advertised" | tr '[:upper:]' '[:lower:]')"
  if [[ "$advertised" =~ ^[0-9a-f]{64}$ ]]; then
    downloaded="$(sha256_file "$launcher_tmp")" || \
      die "could not checksum the downloaded launcher"
    downloaded="$(printf '%s' "$downloaded" | tr '[:upper:]' '[:lower:]')"
    [[ "$downloaded" == "$advertised" ]] || \
      die "downloaded launcher failed checksum verification"
  fi

  if [[ -f "$launcher" ]] && \
      [[ "$(<"$launcher_tmp")" == "$(<"$launcher")" ]]; then
    rm -f -- "$launcher_tmp"
  else
    chmod -- 0755 "$launcher_tmp"
    mv -f -- "$launcher_tmp" "$launcher"
  fi
  launcher_tmp=""

  MUSE_LAUNCHER_INSTALL=1 "$launcher"
  rm -rf -- \
    "$install_dir/.muse-updater" \
    "$install_dir/.muse-install-lock"

  if [[ "${MUSE_UPGRADE_MODE:-0}" != 1 ]]; then
    printf 'Installed %s to %s\n' \
      "$command_name" "$(display_path "$launcher")"
    if configure_path; then
      printf '\nTo get started, run %s\n' "$command_name"
    fi
  fi
}

_muse_install
