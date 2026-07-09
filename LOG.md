## Work In Progress Log

- 2026-07-05: First setup of the Take-AI-Control-Back repository (GG)
- 2026-07-07: Security fix — container no longer runs as root. Added `devcontainer` user (uid 1000), moved installs to system paths, enabled `remoteUser` in devcontainer.json. User has passwordless sudo for when root is needed. (Copilot CLI / Opus 4.6)
- 2026-07-07: Node.js install simplified via multi-stage build (`COPY --from=node:22-slim`). Removes manual curl/tar/arch logic entirely. (Copilot CLI / Opus 4.6)
- 2026-07-07: Added runInContainer.sh (GG)
- 2026-07-07: Upgraded Node.js donor stage from node:22-slim to node:24-slim in Dockerfile. Single line change, no other modifications. (claude-sonnet-4-5)
- 2026-07-08: Security review identified 7 issues: passwordless sudo, unquoted shell vars, host credential mounts, env file tracking, inconsistent --ignore-scripts, unpinned RTK version, auth.json in workspace. No critical vulnerabilities. (Kiro/Auto/Claude)
- 2026-07-08: Pinned RTK version to v0.43.0 in Dockerfile for reproducible builds. (Kiro/Auto/Claude)
- 2026-07-08: Investigated --ignore-scripts for claude-code and copilot: both require postinstall scripts to download platform-specific native binaries. Added comment documenting why the flag cannot be used. (Kiro/Auto/Claude)
- 2026-07-08: Fixed issue #3 (host credentials mounted read-write) — .copilot volumes now mounted :ro. Fixed issue #4 (env file tracking) — added explicit .devcontainer/devcontainer.env to .gitignore and .dockerignore. Also quoted all shell variables in runInContainer.sh. (Kiro/Auto/Claude)
- 2026-07-08: Task 1.3 (java-springboot-tdd-guide spec) — appended `## Test stack` (JUnit 5, Mockito, AssertJ, `@WebMvcTest`/`@DataJpaTest` slices) and `## TDD` (red-green-refactor rule) subsections to the Java section in AGENTS.md. (Kiro/Auto/Claude)
- 2026-07-08: Task 2.1 (java-springboot-tdd-guide spec) — added the "Java — JDK 17 + Spring Boot + TDD" section to AGENTS.md: target JDK 17 + Spring Boot, Maven wrapper commands (`./mvnw`, `mvn` alternative) with every example `rtk`-prefixed (`rtk ./mvnw test`, `rtk ./mvnw verify`, `rtk ./mvnw spring-boot:run`), test stack (JUnit 5, Mockito, AssertJ, `@WebMvcTest`/`@DataJpaTest` slices), and the red-green-refactor TDD rule. (Kiro/Auto/Claude)
