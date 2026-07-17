# 07 – Policy as Code

## Summary

Policy as Code (PaC) expresses **security, compliance, and operational rules as machine-readable, version-controlled code** rather than PDF documents or tribal knowledge. Policies are enforced automatically at every relevant decision point — CI pipelines, Kubernetes admission, API gateways, cloud provisioning.

### The problem it solves

Traditional security controls:

- Live in Word documents or wikis
- Are checked manually during quarterly audits
- Are inconsistently applied across teams

Policy as Code replaces this with **automated, consistent enforcement** that scales with your organization.

### Core use cases

| Where | What gets enforced |
|---|---|
| **CI/CD pipelines** | Required security scans passed, approved base images only |
| **Kubernetes admission** | No privileged pods, required labels, resource limits |
| **Cloud provisioning** | Tagging standards, allowed regions, encryption required |
| **API authorization** | Fine-grained RBAC, attribute-based access control (ABAC) |
| **Compliance** | CIS benchmarks, SOC2, PCI-DSS, HIPAA controls automated |

### The policy lifecycle

```
write policy (code) → review (PR) → test → deploy → audit log
```

Policies go through the same review process as application code. Policy violations produce structured output that feeds into dashboards and compliance reports.

### Enforcement modes

- **Enforce** – Block the action (hard gate, use for critical policies)
- **Warn** – Allow but log/alert (soft gate, use while rolling out new policies)
- **Audit** – Log only, no blocking (observe before enforcing)

### Integration with other DevSecOps practices

Policy as Code is the **glue layer** that enforces outputs from all other practices:

- "A container image must have a clean Trivy scan to be deployed" → Kubernetes admission policy
- "All Terraform PRs must pass Checkov with no HIGH findings" → CI pipeline policy
- "No secrets found by Gitleaks" → required status check policy

---

## Tools

### 1. [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) ⭐ Open Source
The CNCF standard for policy as code. Uses the **Rego** language to write policies for any context — Kubernetes, Terraform, HTTP APIs, CI pipelines. `conftest` (built on OPA) is the CLI tool for testing IaC and config files against Rego policies.

### 2. [Kyverno](https://github.com/kyverno/kyverno) ⭐ Open Source
Kubernetes-native policy engine using **YAML** instead of a custom language. Lower learning curve than OPA/Rego for Kubernetes-focused teams. Supports generate, mutate, and validate operations. CNCF graduated project.

### 3. [Cedar](https://github.com/cedar-policy/cedar) ⭐ Open Source
Amazon's open-source policy language and engine, designed for **application-level authorization** (ABAC/RBAC). Purpose-built for high performance, human readability, and formal verification. Powers AWS Verified Access and Amazon Verified Permissions.
