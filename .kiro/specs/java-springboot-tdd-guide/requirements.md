# Requirements Document

## Introduction

This feature extends the existing `AGENTS.md` guide with a new, compact section that instructs agents on how to work in a JDK 17 Java project built with Spring Boot, following a Test-Driven Development (TDD) discipline. The section is added in-place within `AGENTS.md` (not a separate file), respects the existing "less is more" style, uses Maven with the `mvnw` wrapper, and applies the mandatory `rtk` prefix to every example shell command. TDD guidance is opinionated: JUnit 5, Mockito, AssertJ, and Spring Boot test slices, enforcing a red-green-refactor cycle. Completing this work also requires updating `LOG.md` per its template, including the model name.

## Glossary

- **Agent_Guide**: The `AGENTS.md` file at the workspace root that holds guidance for AI agents.
- **Java_Section**: The new section added to Agent_Guide covering JDK 17, Spring Boot, and TDD.
- **RTK_Prefix**: The mandatory `rtk` command prefix convention required for all example shell commands.
- **Maven_Wrapper**: The Maven wrapper invocation `./mvnw` (with `mvn` as the plain alternative).
- **TDD_Cycle**: The red-green-refactor discipline requiring a failing test to be written before implementation.
- **Test_Stack**: The opinionated testing toolset: JUnit 5, Mockito, AssertJ, and Spring Boot test slices (`@WebMvcTest`, `@DataJpaTest`).
- **Work_Log**: The `LOG.md` file that records work-in-progress entries following its template.
- **Author**: The person or agent editing Agent_Guide.

## Requirements

### Requirement 1: JDK 17 + Spring Boot + TDD section in AGENTS.md

**User Story:** As an agent working on this repository, I want a dedicated JDK 17 + Spring Boot + TDD section inside AGENTS.md, so that I have clear, project-consistent guidance without a separate file.

#### Acceptance Criteria

1. THE Java_Section SHALL be added within the existing Agent_Guide file rather than as a separate file.
2. THE Java_Section SHALL declare JDK 17 as the target Java version.
3. THE Java_Section SHALL declare Spring Boot as the application framework.
4. THE Java_Section SHALL follow the compact "less is more" style consistent with the existing Agent_Guide content.
5. WHERE the Agent_Guide already defines general rules, THE Java_Section SHALL avoid duplicating those rules.

### Requirement 2: Maven wrapper commands with RTK prefix

**User Story:** As an agent running build and test commands, I want all example commands to use Maven via the wrapper and the RTK prefix, so that examples match the project's tooling conventions.

#### Acceptance Criteria

1. THE Java_Section SHALL present Maven as the build tool.
2. THE Java_Section SHALL show Maven_Wrapper usage (`./mvnw`) with `mvn` documented as the plain alternative.
3. WHERE the Java_Section includes an example shell command, THE Java_Section SHALL prefix that command with RTK_Prefix.
4. THE Java_Section SHALL include an example test command in the form `rtk ./mvnw test`.
5. THE Java_Section SHALL include an example verification command in the form `rtk ./mvnw verify`.

### Requirement 3: Opinionated TDD stack and red-green-refactor

**User Story:** As an agent implementing features, I want an opinionated TDD stack and a red-green-refactor rule, so that I write tests first and use consistent testing libraries.

#### Acceptance Criteria

1. THE Java_Section SHALL specify JUnit 5 as the test framework.
2. THE Java_Section SHALL specify Mockito for mocking.
3. THE Java_Section SHALL specify AssertJ for assertions.
4. THE Java_Section SHALL specify Spring Boot test slices including `@WebMvcTest` and `@DataJpaTest`.
5. THE Java_Section SHALL require that a failing test is written before implementation code, following the TDD_Cycle.

### Requirement 4: Work-log update per template

**User Story:** As a maintainer, I want the work-log updated when this guide change is made, so that project history stays accurate per the repository template.

#### Acceptance Criteria

1. WHEN the Java_Section edit is completed, THE Author SHALL append a work-in-progress entry to Work_Log following its template.
2. THE Work_Log entry SHALL include the name of the model used.
3. THE Author SHALL exclude the `var/` folder from all inspection and modification during this work.
