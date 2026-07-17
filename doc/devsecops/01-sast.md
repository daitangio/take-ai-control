# 01 – SAST: Static Application Security Testing

## Summary

SAST analyzes source code, bytecode, or binaries **without executing the application**. It runs directly in the CI pipeline, giving developers immediate feedback on security issues as they write code — the "shift left" cornerstone of DevSecOps.

### How it works

A SAST tool parses your code into an AST (Abstract Syntax Tree) or performs data-flow / taint analysis to detect patterns associated with vulnerabilities:

- **Injection flaws** – SQL injection, command injection, XSS
- **Insecure crypto usage** – weak algorithms, hardcoded keys
- **Dangerous API calls** – use of `eval`, unsafe deserialization
- **Missing authorization checks** – privilege escalation paths

### Where it fits in the pipeline

```
commit → lint → SAST scan → unit tests → build → ...
```

Ideally triggered on every pull request. Results are reported as PR comments or pipeline failures, keeping the feedback loop tight.

### Strengths & limitations

| ✅ Strengths | ⚠️ Limitations |
|---|---|
| Runs without a live environment | Higher false-positive rate than DAST |
| Covers 100% of code paths (theoretical) | Language/framework specific |
| Fast feedback to developers | Misses runtime-only vulnerabilities |

### Integration tips

- Start in **audit mode** (report only, don't block) to build a baseline.
- Gradually enable blocking rules as the team addresses findings.
- Integrate with IDE plugins so issues surface before commit.

---

## Tools

### 1. [Semgrep](https://github.com/semgrep/semgrep) ⭐ Open Source
Lightweight, pattern-based static analysis supporting 30+ languages. Uses a simple YAML rule syntax that teams can write themselves. Large community rule registry at `r2c` (returntocorp).

### 2. [CodeQL](https://github.com/github/codeql) ⭐ Open Source
GitHub's semantic code analysis engine. Treats code as data and uses a Datalog-like query language (QL) to find complex vulnerability patterns. Free for open source repos via GitHub Actions.

### 3. [Bandit](https://github.com/PyCQA/bandit) ⭐ Open Source
Python-specific SAST tool from the PyCQA project. Simple to add to any Python project and CI pipeline. Good starting point before investing in a broader multi-language tool.
