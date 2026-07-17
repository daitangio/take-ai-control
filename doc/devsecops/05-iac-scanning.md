# 05 – IaC Scanning: Infrastructure as Code Security

## Summary

IaC scanning analyzes **Terraform, CloudFormation, Kubernetes manifests, Helm charts, Ansible playbooks, and Dockerfiles** for security misconfigurations before they are provisioned. If your infrastructure is code, its security review belongs in the same pipeline as application code.

### Common misconfigurations caught

- S3 buckets with public access
- Security groups open to `0.0.0.0/0` on sensitive ports
- Unencrypted storage volumes or databases
- IAM roles with wildcard (`*`) permissions
- Missing logging / audit trail configuration
- Kubernetes pods running as root or with `privileged: true`
- Missing resource limits (CPU/memory) enabling DoS
- Hardcoded secrets in Terraform variables

### Where it fits in the pipeline

```
commit (IaC change) → IaC scan → plan → apply
```

IaC scanning should block PRs that introduce high-severity misconfigurations, just like SAST does for application code.

### Shift left for infrastructure

The earlier you catch a misconfiguration, the cheaper the fix:

| Stage                   | Cost to fix                    |
| ----------------------- | ------------------------------ |
| Pre-commit / PR review  | Minutes                        |
| After `terraform apply` | Hours (tear down, reconfigure) |
| After a breach          | Days–weeks + reputation damage |

### Framework coverage

Ensure your chosen tool covers **all** IaC frameworks in use:

- Terraform (`.tf`)
- AWS CloudFormation / CDK
- Kubernetes YAML / Helm
- Dockerfile
- Bicep (Azure)
- Pulumi

---

## Tools

### 1. [Checkov](https://github.com/bridgecrewio/checkov) ⭐ Open Source
Most comprehensive open-source IaC scanner. 1000+ built-in policies covering Terraform, CloudFormation, Kubernetes, Helm, Dockerfile, ARM, Bicep. Python-based, easy to extend with custom policies. Supports SARIF output for GitHub Advanced Security.

### 2. [tfsec](https://github.com/aquasecurity/tfsec) ⭐ Open Source
Terraform-focused static analysis tool from Aqua Security. Very fast, low false-positive rate, excellent for teams using Terraform exclusively. Merging roadmap with Trivy for unified Aqua toolchain.

### 3. [KICS](https://github.com/Checkmarx/kics) ⭐ Open Source
"Keeping Infrastructure as Code Secure" by Checkmarx. Supports 15+ IaC frameworks with 2400+ queries written in OPA Rego. Good choice when you need breadth across many different IaC technologies in one tool.
