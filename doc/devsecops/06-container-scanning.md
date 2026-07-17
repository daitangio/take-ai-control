# 06 – Container Scanning

## Summary

Container scanning inspects **Docker/OCI images** for known CVEs in OS packages and application libraries before those images are deployed to production. A container image is a frozen snapshot of an OS + your app — it carries every vulnerability present at build time.

### What gets scanned

- **OS packages** – rpm, deb packages in the base image (Ubuntu, Alpine, RHEL…)
- **Language packages** – pip, npm, gem, maven dependencies inside the image
- **Misconfigurations** – running as root, exposed secrets in layers, dangerous capabilities
- **Licenses** – open-source license compliance across all image layers

### Where it fits in the pipeline

```
build image → scan image → push to registry → deploy
```

Two enforcement points:

1. **CI gate** — scan after `docker build`, block push if critical CVEs found
2. **Registry admission** — scan images already in the registry; block deployment of non-compliant images via admission controllers (e.g., Kubernetes OPA/Kyverno)

### Base image hygiene

The base image choice has the biggest impact on vulnerability count:

| Base image | Typical CVE count |
|---|---|
| `ubuntu:latest` | 100s |
| `debian:slim` | Tens |
| `alpine:latest` | Very few |
| `distroless` | Near zero (no shell, no pkg manager) |

**Recommendation**: Use `distroless` or `alpine` base images. Rebuild regularly to pick up upstream OS patches.

### Strengths & limitations

| ✅ Strengths | ⚠️ Limitations |
|---|---|
| Catches known OS-level CVEs | Only finds *known* vulnerabilities |
| Language-agnostic | Runtime threats not covered |
| Easy CI/registry integration | Large base images = noisy reports |

---

## Tools

### 1. [Trivy](https://github.com/aquasecurity/trivy) ⭐ Open Source
The most popular open-source container scanner. Scans images, filesystems, git repos, IaC, and SBOMs in one tool. Fast, low false-positive rate, comprehensive DB. First choice for most teams.

### 2. [Grype](https://github.com/anchore/grype) ⭐ Open Source
Anchore's vulnerability scanner, works hand-in-hand with **Syft** for SBOM generation. Excellent when you need a full SBOM workflow (generate → store → scan). Strong Kubernetes integration.

### 3. [Clair](https://github.com/quay/clair) ⭐ Open Source
CoreOS/Red Hat's container vulnerability analyzer. Designed to run as a **service** inside your infrastructure, integrating directly with container registries (Quay, Harbor). Good for air-gapped environments that need an internal scanning service.
