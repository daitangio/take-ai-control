# Agent Guide

## General rules

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- The overall project aims to be very compact (*less is more* mantra)
- Always ignore the var/ folder: nothing interesting is there.

- At the end of LOG.md, create a work in progress log, where you note what you already did, what is missing. Always update LOG.md following the template. Always include the name of the model used


# RTK - Rust Token Killer (Codex CLI)

**Usage**: Token-optimized CLI proxy for shell commands.

## Rule

Always prefix shell commands with `rtk`.

Examples:

```bash
rtk git status
rtk cargo test
rtk npm run build
rtk pytest -q
```

## Meta Commands

```bash
rtk gain            # Token savings analytics
rtk gain --history  # Recent command savings history
rtk proxy <cmd>     # Run raw command without filtering
```

## Verification

```bash
rtk --version
rtk gain
which rtk
```


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
