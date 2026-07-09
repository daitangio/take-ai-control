# Design Document

## Overview

This is a documentation-only change. It adds one compact section to the existing `AGENTS.md` covering JDK 17 + Spring Boot + TDD, and appends a work-in-progress entry to `LOG.md`. No source code, build config, or Java project is created. The design keeps the addition small and consistent with the repository's "less is more" mantra: a single new top-level section with a few sub-headings and short fenced command examples, all `rtk`-prefixed.

## Architecture

Two files are touched, both at the workspace root:

- `AGENTS.md` — a new section is appended after the existing `RTK` section. It reuses (does not restate) the general rules and the `rtk` prefix convention already defined above it.
- `LOG.md` — a new dated bullet is appended under the existing `## Work In Progress Log` list.

The `var/` folder is out of scope and must not be read or modified.

### Placement

```
AGENTS.md
├── # Agent Guide            (existing, unchanged)
├── # RTK - Rust Token Killer (existing, unchanged)
└── # Java — JDK 17 + Spring Boot + TDD   (NEW)
    ├── Stack                (JDK 17, Spring Boot, Maven)
    ├── Commands             (rtk ./mvnw ...)
    ├── Test stack           (JUnit 5, Mockito, AssertJ, slices)
    └── TDD                  (red-green-refactor)
```

## Components and Interfaces

The only "interface" is the human/agent reader of `AGENTS.md`. There are no code components. The two content components are described below.

### Java_Section (new content in AGENTS.md)

A single Markdown section. Proposed content, kept intentionally terse:

```markdown
# Java — JDK 17 + Spring Boot + TDD

Target JDK 17. Framework: Spring Boot. Build: Maven via the wrapper.

## Commands

Use `./mvnw` (plain `mvn` if no wrapper). Prefix every command with `rtk`.

```bash
rtk ./mvnw test      # run tests
rtk ./mvnw verify    # full build + integration checks
rtk ./mvnw spring-boot:run
```

## Test stack

- JUnit 5 — test framework
- Mockito — mocking
- AssertJ — fluent assertions
- Spring Boot slices — `@WebMvcTest` (web layer), `@DataJpaTest` (persistence)

## TDD

Red-green-refactor: write a failing test first, make it pass with the
simplest code, then refactor. No implementation without a failing test.
```

Notes:
- The section does not repeat the general `rtk`-prefix rule's rationale; it only references it (Req 1.5).
- Command examples satisfy the required literals `rtk ./mvnw test` and `rtk ./mvnw verify` (Req 2.4, 2.5).

### Work_Log entry (new line in LOG.md)

A single bullet appended under `## Work In Progress Log`, matching the existing format `- YYYY-MM-DD: <summary> (<model name>)`.

Example shape:

```
- 2026-07-08: Added JDK 17 + Spring Boot + TDD section to AGENTS.md (Maven wrapper, rtk-prefixed commands, JUnit 5/Mockito/AssertJ, @WebMvcTest/@DataJpaTest, red-green-refactor). (<model name>)
```

## Data Models

None. Both artifacts are Markdown.

## Testing Strategy

There is no executable code, so automated testing does not apply. Verification is manual inspection of the two edited Markdown files against the acceptance criteria:

- Read the edited `AGENTS.md` and confirm each required token is present (JDK 17, Spring Boot, Maven, `./mvnw`, `mvn`, `rtk ./mvnw test`, `rtk ./mvnw verify`, JUnit 5, Mockito, AssertJ, `@WebMvcTest`, `@DataJpaTest`, red-green-refactor).
- Confirm every fenced shell command line in the new section starts with `rtk`.
- Confirm the section is added in place (no separate file) and does not restate existing general rules.
- Read the updated `LOG.md` and confirm a new WIP entry exists in the established bullet format, including the model name.
- Confirm nothing under `var/` was read or modified.

## Error Handling

- If a separate Java guide file were created instead of editing `AGENTS.md`, that violates Req 1.1 — avoid by editing in place.
- If any command example omits the `rtk` prefix, that violates Req 2.3 — every fenced shell line must start with `rtk`.
- If `LOG.md` format drifts from the existing bullet style, that breaks Req 4.1 — match the surrounding lines exactly.
- The `var/` folder must not be touched (Req 4.3).

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is a documentation edit with no executable code. Every acceptance criterion is a static content-presence check or a process constraint (see prework), so there are no universally-quantified, input-varying properties suitable for property-based testing. The single structural invariant below is verified by direct inspection rather than by a generator-driven test.

### Property 1: All example commands are rtk-prefixed

*For any* fenced shell command line in the Java_Section, that line SHALL begin with the `rtk` prefix.

**Validates: Requirements 2.3**

### Verification checklist (content-presence, not property tests)

- AGENTS.md contains a Java section, added in place (no new file). **Validates: Requirements 1.1**
- Section names JDK 17 and Spring Boot. **Validates: Requirements 1.2, 1.3**
- Section is compact and does not duplicate existing general rules (manual review). **Validates: Requirements 1.4, 1.5**
- Section presents Maven and shows `./mvnw` with `mvn` as the alternative. **Validates: Requirements 2.1, 2.2**
- Every fenced shell command in the section starts with `rtk`. **Validates: Requirements 2.3**
- Section includes `rtk ./mvnw test` and `rtk ./mvnw verify`. **Validates: Requirements 2.4, 2.5**
- Section names JUnit 5, Mockito, AssertJ, and the `@WebMvcTest` / `@DataJpaTest` slices. **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
- Section states the test-first red-green-refactor rule. **Validates: Requirements 3.5**
- LOG.md gains a new WIP entry in template form including the model name. **Validates: Requirements 4.1, 4.2**
- No files under `var/` were read or modified. **Validates: Requirements 4.3**
