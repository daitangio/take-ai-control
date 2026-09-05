#!/bin/sh
set -eu

PROFILE="${AWS_PROFILE:-bedrock}"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}"

usage() {
    cat <<EOF
Usage: $0 <command> [args]

Commands:
  configure             Run AWS CLI SSO profile setup.
  login                 Login with IAM Identity Center.
  whoami                Show the current AWS caller identity.
  export-env            Print temporary credential exports for eval.
  check-env             Verify temporary credential variables are set.
  list-models           List Bedrock foundation models.
  converse MODEL [TEXT] Send a minimal Bedrock Converse request.

Environment:
  AWS_PROFILE           Profile name. Default: bedrock
  AWS_REGION            Bedrock Region. Default: us-east-1

Examples:
  $0 configure
  $0 login
  eval "\$($0 export-env)"
  $0 list-models
  $0 converse anthropic.claude-3-haiku-20240307-v1:0 "Hello"
EOF
}

need_aws() {
    if ! command -v aws >/dev/null 2>&1; then
        echo "aws CLI not found. Install AWS CLI v2 first." >&2
        exit 127
    fi
}

configure() {
    need_aws
    aws configure sso
}

login() {
    need_aws
    aws sso login --profile "$PROFILE"
}

whoami() {
    need_aws
    aws sts get-caller-identity --profile "$PROFILE"
}

export_env() {
    need_aws
    aws configure export-credentials --profile "$PROFILE" --format env
    echo "export AWS_PROFILE=\"$PROFILE\""
    echo "export AWS_REGION=\"$REGION\""
    echo "export AWS_DEFAULT_REGION=\"$REGION\""
}

check_env() {
    if test -n "${AWS_ACCESS_KEY_ID:-}" &&
        test -n "${AWS_SECRET_ACCESS_KEY:-}" &&
        test -n "${AWS_SESSION_TOKEN:-}"; then
        echo "temporary credentials exported"
    else
        echo "temporary credentials are not exported" >&2
        exit 1
    fi
}

list_models() {
    need_aws
    aws bedrock list-foundation-models \
        --profile "$PROFILE" \
        --region "$REGION"
}

converse() {
    need_aws
    if [ "$#" -lt 1 ]; then
        echo "missing MODEL argument" >&2
        usage >&2
        exit 2
    fi

    MODEL_ID="$1"
    TEXT="${2:-Hello}"
    case "$TEXT" in
        *\"* | *\\*)
            echo "TEXT cannot contain double quotes or backslashes in this compact demo" >&2
            exit 2
            ;;
    esac

    aws bedrock-runtime converse \
        --profile "$PROFILE" \
        --region "$REGION" \
        --model-id "$MODEL_ID" \
        --messages "[{\"role\":\"user\",\"content\":[{\"text\":\"$TEXT\"}]}]"
}

if [ "$#" -eq 0 ]; then
    usage
    exit 0
fi

COMMAND="$1"
shift

case "$COMMAND" in
    configure)
        configure "$@"
        ;;
    login)
        login "$@"
        ;;
    whoami)
        whoami "$@"
        ;;
    export-env)
        export_env "$@"
        ;;
    check-env)
        check_env "$@"
        ;;
    list-models)
        list_models "$@"
        ;;
    converse)
        converse "$@"
        ;;
    help | -h | --help)
        usage
        ;;
    *)
        echo "unknown command: $COMMAND" >&2
        usage >&2
        exit 2
        ;;
esac
