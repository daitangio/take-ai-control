# Proposal: Rewrite Backend to TypeScript

## Problem
The current backend is written in Python (FastAPI). To improve the full-stack developer experience, maximize type safety across the stack (frontend and backend), and maintain a lightweight "zero dependency" footprint, we need to rewrite the backend in TypeScript.

## Goal
Replace the Python/FastAPI backend located in `nello/backend` with a modern, high-performance TypeScript Node.js backend.

## Scope
- Replace Python FastAPI with Fastify.
- Retain the SQLite database (using native `node:sqlite` or `better-sqlite3`).
- Replace raw SQL schema definition with Drizzle ORM to prevent SQL injection and provide type safety.
- Share generated TS types with the React frontend.
- Utilize modern Node.js execution (using `tsx` for dev, `tsc` for production).
- Re-implement all existing routes (`auth`, `boards`, `lists`, `cards`, `members`).

## Out of Scope
- Changing the frontend React app (other than pointing it to the new shared types and endpoints, if necessary).
- Altering the core application features. The product remains a Trello-like application.
