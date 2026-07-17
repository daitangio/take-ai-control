# 02 – DAST: Dynamic Application Security Testing

## Summary

DAST tests a **running application** by sending crafted HTTP requests and observing responses. Unlike SAST it has no access to source code — it behaves like an external attacker probing your live system. This makes it excellent at catching runtime and configuration vulnerabilities that static analysis misses.

### How it works

The DAST tool acts as an automated attacker:

1. **Spider/crawl** the application to discover endpoints
2. **Fuzz inputs** with malicious payloads (XSS, SQLi, path traversal…)
3. **Analyze responses** for error messages, unexpected behavior, data leaks
4. **Report findings** with request/response evidence

### Where it fits in the pipeline

```
build → deploy to staging → DAST scan → promote to prod
```

DAST requires a deployed, running application — it lives later in the pipeline than SAST. Often runs nightly against a staging environment or as part of an integration test stage.

### Strengths & limitations

| ✅ Strengths                | ⚠️ Limitations                         |
| --------------------------- | ---------------------------------------- |
| Language/framework agnostic | Needs a running environment              |
| Finds runtime config issues | Slower than SAST                         |
| Low false-positive rate     | May not cover all code paths             |
| Catches auth/session issues | Can produce noisy output on complex SPAs |

### Integration tips

- Use **authenticated scanning** (provide session cookies or credentials) to reach protected routes.
- Pair with an **API definition** (OpenAPI/Swagger) so the scanner knows all endpoints.
- Run in passive mode during development, active attack mode on staging only.

---

## Tools

### 1. [OWASP ZAP](https://github.com/zaproxy/zaproxy) ⭐ Open Source
The de-facto open-source DAST tool. Provides GUI, CLI, and a full API for CI integration. Supports both automated scan and manual proxy-based testing. Actively maintained by OWASP.

### 2. [Nuclei](https://github.com/projectdiscovery/nuclei) ⭐ Open Source
Fast, template-based vulnerability scanner by ProjectDiscovery. Huge community template library covering CVEs, misconfigs, and web vulnerabilities. Extremely fast and CI-friendly.

### 3. [Nikto](https://github.com/sullo/nikto) ⭐ Open Source
Veteran web server scanner. Checks for dangerous files, outdated server software, and common misconfigurations. Lightweight and easy to add to any pipeline as a first-pass check.
