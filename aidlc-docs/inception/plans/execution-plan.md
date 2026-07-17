# Execution Plan — nello

## Intent Analysis Summary
- **Request**: Build "nello" Trello-clone (React + Java Spring Boot)
- **Type**: Greenfield, New Project
- **Complexity**: Moderate-Complex
- **Risk Level**: Medium (WebSocket, magic-link auth, multi-user real-time)

## Change Impact Assessment
- **User-facing changes**: Yes — full new UI (boards, lists, cards, drag-and-drop)
- **Structural changes**: Yes — new full-stack system
- **Data model changes**: Yes — new schema (users, boards, lists, cards, tokens, audit)
- **API changes**: Yes — new REST + WebSocket endpoints
- **NFR impact**: Yes — real-time WebSocket, magic-link auth, Hibernate Envers audit

## Risk Assessment
- **Risk Level**: Medium
- **Rollback Complexity**: Easy (greenfield, no existing system)
- **Testing Complexity**: Moderate (WebSocket, token expiry, DnD)

---

## Workflow Visualization

```mermaid
flowchart TD
    Start(["User Request: nello"])

    subgraph INCEPTION["🔵 INCEPTION PHASE"]
        WD["Workspace Detection<br/><b>COMPLETED</b>"]
        RE["Reverse Engineering<br/><b>SKIPPED</b>"]
        RA["Requirements Analysis<br/><b>COMPLETED</b>"]
        US["User Stories<br/><b>EXECUTE</b>"]
        WP["Workflow Planning<br/><b>IN PROGRESS</b>"]
        AD["Application Design<br/><b>EXECUTE</b>"]
        UG["Units Generation<br/><b>EXECUTE</b>"]
    end

    subgraph CONSTRUCTION["🟢 CONSTRUCTION PHASE"]
        subgraph UNIT1["Unit 1: Backend (tbe)"]
            FD1["Functional Design<br/><b>EXECUTE</b>"]
            NFRA1["NFR Requirements<br/><b>EXECUTE</b>"]
            NFRD1["NFR Design<br/><b>EXECUTE</b>"]
            ID1["Infrastructure Design<br/><b>SKIPPED</b>"]
            CG1["Code Generation<br/><b>EXECUTE</b>"]
        end
        subgraph UNIT2["Unit 2: Frontend (nello-frontend)"]
            FD2["Functional Design<br/><b>EXECUTE</b>"]
            NFRA2["NFR Requirements<br/><b>SKIPPED</b>"]
            NFRD2["NFR Design<br/><b>SKIPPED</b>"]
            ID2["Infrastructure Design<br/><b>SKIPPED</b>"]
            CG2["Code Generation<br/><b>EXECUTE</b>"]
        end
        BT["Build and Test<br/><b>EXECUTE</b>"]
    end

    subgraph OPERATIONS["🟡 OPERATIONS PHASE"]
        OPS["Operations<br/><b>PLACEHOLDER</b>"]
    end

    Start --> WD --> RA --> US --> WP --> AD --> UG
    UG --> FD1 --> NFRA1 --> NFRD1 --> CG1
    CG1 --> FD2 --> CG2
    CG2 --> BT --> OPS

    style WD fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RA fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style WP fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style CG1 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style CG2 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style BT fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RE fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style ID1 fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style NFRA2 fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style NFRD2 fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style ID2 fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style US fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style AD fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style UG fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style FD1 fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style NFRA1 fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style NFRD1 fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style FD2 fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000
    style OPS fill:#FFF59D,stroke:#F57F17,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style INCEPTION fill:#BBDEFB,stroke:#1565C0,stroke-width:3px,color:#000
    style CONSTRUCTION fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px,color:#000
    style OPERATIONS fill:#FFF59D,stroke:#F57F17,stroke-width:3px,color:#000
    style Start fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    linkStyle default stroke:#333,stroke-width:2px
```

---

## Phases to Execute

### 🔵 INCEPTION PHASE
- [x] Workspace Detection — COMPLETED
- [x] Reverse Engineering — SKIPPED (Greenfield)
- [x] Requirements Analysis — COMPLETED
- [ ] User Stories — **EXECUTE**
  - *Rationale*: Multiple user personas (board owner, collaborator), user-facing features, acceptance criteria valuable
- [x] Workflow Planning — IN PROGRESS
- [ ] Application Design — **EXECUTE**
  - *Rationale*: New components, REST API + WebSocket design, service layer, magic-link auth flow
- [ ] Units Generation — **EXECUTE**
  - *Rationale*: Two separate packages (backend tbe + frontend nello-frontend) with clear boundaries

### 🟢 CONSTRUCTION PHASE — Unit 1: Backend (tbe)
- [ ] Functional Design — **EXECUTE**
  - *Rationale*: Complex data model (users, boards, lists, cards, tokens, audit), business rules (token expiry, domain validation, permissions)
- [ ] NFR Requirements — **EXECUTE**
  - *Rationale*: Real-time WebSocket, magic-link auth, Hibernate Envers audit — all require NFR design
- [ ] NFR Design — **EXECUTE**
  - *Rationale*: Follows from NFR Requirements
- [ ] Infrastructure Design — **SKIP**
  - *Rationale*: SQLite local file, no cloud/container infrastructure
- [ ] Code Generation — **EXECUTE** (ALWAYS)

### 🟢 CONSTRUCTION PHASE — Unit 2: Frontend (nello-frontend)
- [ ] Functional Design — **EXECUTE**
  - *Rationale*: Component hierarchy, state management, WebSocket integration, DnD interaction design
- [ ] NFR Requirements — **SKIP**
  - *Rationale*: Frontend NFRs (performance, bundle size) are standard Vite defaults; no special requirements
- [ ] NFR Design — **SKIP**
  - *Rationale*: Follows from NFR Requirements skip
- [ ] Infrastructure Design — **SKIP**
  - *Rationale*: Static build served locally / dev server; no deployment infrastructure
- [ ] Code Generation — **EXECUTE** (ALWAYS)

### 🟢 CONSTRUCTION PHASE
- [ ] Build and Test — **EXECUTE** (ALWAYS)

### 🟡 OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

---

## Two-Unit Summary

| Unit | Location | Tech |
|------|----------|------|
| tbe (backend) | `apps/tbe/` | Java 25, Spring Boot, Hibernate 7.4, SQLite, Liquibase, Maven |
| nello-frontend | `apps/nello-frontend/` | Vite, React, TypeScript, @dnd-kit |

## Success Criteria
- Users can log in via email magic link (no password)
- Email domain validated against `allowed_email_domains_list`
- Users can create/share boards, manage lists and cards
- Drag-and-drop reorder and move cards in real-time across all connected users
- All actions audited in DB via Hibernate Envers
