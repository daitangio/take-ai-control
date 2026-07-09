# Implementation Plan: Java — JDK 17 + Spring Boot + TDD Guide

## Overview

This is a documentation-only change. The work edits two Markdown files at the workspace root: it appends a compact JDK 17 + Spring Boot + TDD section to `AGENTS.md` (after the existing `RTK` section), then appends a work-in-progress entry to `LOG.md` per its template. No Java project, build config, or executable code is produced, so there are no automated test tasks — verification is manual inspection against the acceptance criteria. The `var/` folder is out of scope and must not be read or modified.

## Tasks

- [x] 1. Add the Java section to AGENTS.md
  - [x] 1.1 Append the "Java — JDK 17 + Spring Boot + TDD" section in-place after the existing RTK section
    - Edit `AGENTS.md` directly (do not create a separate file)
    - Add a new top-level section stating JDK 17 as target version and Spring Boot as the framework
    - Keep it compact ("less is more"); reference, do not restate, the existing general rules and `rtk`-prefix rationale
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Add the Maven wrapper Commands subsection with rtk-prefixed examples
    - Present Maven as the build tool; show `./mvnw` with `mvn` documented as the plain alternative
    - Include a fenced shell block where every command begins with `rtk`
    - Include the literal `rtk ./mvnw test` and `rtk ./mvnw verify`, plus `rtk ./mvnw spring-boot:run`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.3 Add the Test stack and TDD subsections
    - List JUnit 5 (framework), Mockito (mocking), AssertJ (assertions)
    - Name Spring Boot test slices `@WebMvcTest` and `@DataJpaTest`
    - State the red-green-refactor rule: a failing test must be written before implementation code
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.4 Verify AGENTS.md content against the acceptance criteria
    - Read the edited `AGENTS.md` and confirm required tokens are present: JDK 17, Spring Boot, Maven, `./mvnw`, `mvn`, `rtk ./mvnw test`, `rtk ./mvnw verify`, JUnit 5, Mockito, AssertJ, `@WebMvcTest`, `@DataJpaTest`, red-green-refactor
    - Confirm every fenced shell command line in the new section begins with `rtk` (Property 1)
    - Confirm the section was added in place and does not duplicate existing general rules
    - _Requirements: 1.1, 1.4, 1.5, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Update LOG.md
  - [x] 2.1 Append a work-in-progress entry to LOG.md per the template
    - Add a new dated bullet under `## Work In Progress Log` matching the existing `- YYYY-MM-DD: <summary> (<model name>)` format
    - Summarize the AGENTS.md change and include the name of the model used
    - Do not read or modify anything under `var/`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Final checkpoint
  - Ensure both files match the acceptance criteria and nothing under `var/` was touched. Ask the user if questions arise.

## Notes

- This feature is documentation-only, so there are no unit, property, or integration test tasks — the design's single structural invariant (Property 1: all example commands are rtk-prefixed) is verified by inspection in task 1.4.
- Each task references specific requirements for traceability.
- Both edits are in-place appends to existing root files; the `var/` folder is excluded from all inspection and modification.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4", "2.1"] }
  ]
}
```
