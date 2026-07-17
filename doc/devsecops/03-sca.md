# 03 – SCA: Software Composition Analysis

## Summary

Modern applications are 80–90% open-source dependencies. SCA tools **inventory your third-party packages** and check them against vulnerability databases (NVD, OSV, GitHub Advisory Database) to flag known CVEs and license risks.

### How it works

1. **Parse manifests** – `package.json`, `requirements.txt`, `pom.xml`, `go.sum`, etc.
2. **Build dependency graph** – direct + transitive dependencies
3. **Query vulnerability DBs** – match package@version against CVE feeds
4. **Report & remediate** – suggest fixed versions or alternative packages
5. **License compliance** – flag GPL in proprietary projects, AGPL concerns, etc.

### Where it fits in the pipeline

```
commit → SCA scan → SAST → build → ...
```

Can also run as a **background bot** that opens PRs automatically when new CVEs are published for your dependencies (e.g., Dependabot).

### Key concepts

- **Direct vs transitive vulnerabilities** — A vulnerability in a dependency of a dependency is still your problem.
- **EPSS score** — Exploit Prediction Scoring System. Helps prioritize which CVEs are actually being exploited in the wild.
- **SBOM** (Software Bill of Materials) — Machine-readable inventory of all components. Increasingly required by regulation (e.g., US EO 14028).

### Strengths & limitations

| ✅ Strengths                 | ⚠️ Limitations                         |
| ---------------------------- | ---------------------------------------- |
| Catches known CVEs instantly | Only finds *known* vulnerabilities       |
| Automated fix PRs            | Transitive graph can be noisy            |
| License risk detection       | False positives on non-exploitable paths |

---

## Tools

### 1. [Dependabot](https://github.com/dependabot/dependabot-core) ⭐ Open Source
GitHub-native SCA bot. Automatically opens PRs to bump vulnerable dependencies. Supports most ecosystems. Zero setup for GitHub-hosted repos — just enable in repository settings.

### 2. [OWASP Dependency-Check](https://github.com/jeremylong/DependencyCheck) ⭐ Open Source
Battle-tested Java-originated tool supporting many languages. Produces HTML/JSON/XML reports. Easy to embed in Maven, Gradle, or any CI pipeline as a standalone CLI.

### 3. [Syft + Grype](https://github.com/anchore/grype) ⭐ Open Source
Two complementary tools from Anchore: **Syft** generates an SBOM from source or container images, **Grype** scans the SBOM for vulnerabilities. Excellent for container-centric workflows.
