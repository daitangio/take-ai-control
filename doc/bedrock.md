# Amazon Bedrock temporary credentials

Use AWS IAM Identity Center (SSO) and temporary credentials. Do not create an IAM user and do not generate a long-term Bedrock API key: AWS documents that the CLI flow for long-term Bedrock API keys creates an IAM user.

## Requirements

- AWS CLI v2.
- Access to an AWS IAM Identity Center portal.
- An AWS account and permission set/role allowed to use Bedrock.
- Bedrock model access enabled in the Region you will call, for example `us-east-1` or `us-west-2`.

Ask the AWS administrator for these values:

- SSO start URL, for example `https://my-sso-portal.awsapps.com/start`.
- SSO Region, for example `us-east-1`.
- AWS account ID.
- Permission set/role name.
- Bedrock runtime Region.

For Bedrock runtime calls, the role normally needs at least:

- `bedrock:ListFoundationModels` to verify access.
- `bedrock:InvokeModel` for `Converse` and non-streaming inference.
- `bedrock:InvokeModelWithResponseStream` for streaming inference.

## Configure an SSO profile

Create a named profile:

```bash
aws configure sso
```

Suggested answers:

```text
SSO session name (Recommended): bedrock-sso
SSO start URL [None]: <sso-start-url>
SSO region [None]: <sso-region>
SSO registration scopes [None]: sso:account:access
```

Then select the AWS account and role/permission set. When prompted for defaults:

```text
Default client Region [None]: <bedrock-runtime-region>
CLI default output format [None]: json
Profile name [...]: bedrock
```

This writes configuration to `~/.aws/config`, not static IAM-user credentials.

## Log in

```bash
aws sso login --profile bedrock
```

Verify the caller:

```bash
aws sts get-caller-identity --profile bedrock
```

## Use the profile directly

For AWS CLI:

```bash
aws bedrock list-foundation-models --profile bedrock --region <bedrock-runtime-region>
```

For SDKs and tools that understand AWS profiles:

```bash
export AWS_PROFILE=bedrock
export AWS_REGION=<bedrock-runtime-region>
export AWS_DEFAULT_REGION=<bedrock-runtime-region>
```

## Export temporary access-key variables

Some tools require `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN`. Export them from the SSO profile:

```bash
eval "$(aws configure export-credentials --profile bedrock --format env)"
export AWS_REGION=<bedrock-runtime-region>
export AWS_DEFAULT_REGION=<bedrock-runtime-region>
```

Check that all three credential variables exist:

```bash
test -n "$AWS_ACCESS_KEY_ID" && \
test -n "$AWS_SECRET_ACCESS_KEY" && \
test -n "$AWS_SESSION_TOKEN" && \
echo "temporary credentials exported"
```

Important: SSO credentials are temporary. When they expire, run this again:

```bash
aws sso login --profile bedrock
eval "$(aws configure export-credentials --profile bedrock --format env)"
```

Do not store these temporary values in committed files. Avoid putting them in `.devcontainer/devcontainer.env`; they expire and are sensitive.

## Test Bedrock runtime

List available models:

```bash
aws bedrock list-foundation-models \
  --profile bedrock \
  --region <bedrock-runtime-region>
```

Run a minimal Converse request with a model enabled in your account:

```bash
aws bedrock-runtime converse \
  --profile bedrock \
  --region <bedrock-runtime-region> \
  --model-id <model-id> \
  --messages '[{"role":"user","content":[{"text":"Hello"}]}]'
```

If you exported environment variables, the same call can omit `--profile`:

```bash
aws bedrock-runtime converse \
  --region <bedrock-runtime-region> \
  --model-id <model-id> \
  --messages '[{"role":"user","content":[{"text":"Hello"}]}]'
```

## If a tool asks for a Bedrock API key

Prefer AWS temporary credentials above. They are AWS-wide temporary credentials and work with the AWS CLI and standard SDK credential chain.

If a tool specifically requires a Bedrock bearer token, AWS supports short-term Bedrock API keys through the console or token-generator libraries. AWS documentation does not show an AWS CLI command for generating a short-term Bedrock bearer token. Long-term Bedrock API keys are not acceptable here because the CLI flow creates an IAM user.

When using a Bedrock bearer token, tools usually expect:

```bash
export AWS_BEARER_TOKEN_BEDROCK=<short-term-bedrock-api-key>
export AWS_REGION=<bedrock-runtime-region>
```

## Cleanup

Remove exported variables from the current shell:

```bash
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE AWS_REGION AWS_DEFAULT_REGION AWS_BEARER_TOKEN_BEDROCK
```

Log out of SSO:

```bash
aws sso logout
```

## Sources

- AWS CLI IAM Identity Center setup: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
- AWS CLI `export-credentials`: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
- Amazon Bedrock API setup: https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started-api.html
- Amazon Bedrock API keys: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-reference.html
- Generate Amazon Bedrock API keys: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-generate.html
