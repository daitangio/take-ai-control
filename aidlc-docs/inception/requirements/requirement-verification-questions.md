# Requirements Verification Questions — nello

Please fill in all `[Answer]:` tags below. Use the letter(s) of your choice, or write a custom answer after `[Answer]:`.

---

## Q1: Board Model
How many boards will the application support?

A) Single shared board — all users see and collaborate on one global board  
B) Multiple boards per user — each user can create and own multiple boards  
C) Multiple boards with sharing — users create boards and invite others to collaborate  
X) Other (please describe after [Answer]:)

[Answer]: C

---

## Q2: User Registration
How are user accounts created?

A) Self-registration — users sign up themselves via a registration page  
B) Admin-only — an administrator creates user accounts; no self-registration  
C) Pre-seeded — users are defined in application.properties/config only (no runtime management)  
X) Other

[Answer]: X

To login, users need to receive a login-email with a link they can use just one time. The link expires after 15 minutes.
Define iside application.properties a propery named allowed_email_domains_list.
allowed_email_domains_list defines a set of email regexp to check if the user email is accepeted.

Upon first login, the user is created and initialized.
No password or user name is stored in the database.

---

## Q3: Real-Time Updates
When multiple users share a board, how should updates be handled?

A) Real-time — all users see changes instantly (WebSocket/SSE)  
B) Polling — frontend periodically refreshes the board (e.g., every 5–10 seconds)  
C) Manual refresh — user clicks a button to reload  
X) Other

[Answer]: A

---

## Q4: Audit Log Visibility
Where should the audit/action log be accessible?

A) Database only — logs stored in DB, accessible via backend API (no dedicated UI panel)  
B) In-app panel — a visible "Activity Log" panel or sidebar in the React UI  
C) Both — stored in DB and shown in a compact UI panel  
X) Other

[Answer]: X

Database only, no API exposed.
Use standard hibernate libraries if possible.

---

## Q5: Card Details
What information can a card hold?

A) Minimal — title only  
B) Standard — title + optional description  
C) Rich — title + description + due date + assignee  
X) Other (list fields you need)

[Answer]: C

---

## Q6: Frontend Tech Preferences
Any specific React tooling preferences?

A) Vite + React + TypeScript (recommended — fast, modern)  
B) Vite + React + JavaScript  
C) Create React App + TypeScript  
X) Other

[Answer]: A

---

## Q7: Drag-and-Drop Library
For card reordering and moving between lists:

A) @dnd-kit/core (recommended — modern, accessible, no jQuery)  
B) react-beautiful-dnd (popular, well-documented)  
C) Custom HTML5 drag-and-drop  
X) Other

[Answer]: A

---

## Q8: Security Extension
Should security baseline rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)  
B) No — skip all SECURITY rules (suitable for PoCs, prototypes)  
X) Other

[Answer]: B

---

## Q9: Resiliency Extension
Should the resiliency baseline (AWS Well-Architected Reliability patterns) be applied?

A) Yes — apply as directional best practices  
B) No — skip (suitable for PoCs and prototypes)  
X) Other

[Answer]: B

---

## Q10: Property-Based Testing Extension
Should property-based testing rules be enforced?

A) Yes — enforce all PBT rules  
B) Partial — only for pure functions and serialization  
C) No — skip (this is a CRUD-heavy app; standard unit tests suffice)  
X) Other

[Answer]: N

---

*Once all answers are filled in, the Requirements Analysis will complete and Workflow Planning will begin.*
