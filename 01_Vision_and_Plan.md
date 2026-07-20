# Project Vision & Antigravity-CLI Execution Plan

## Executive Summary
This document outlines the end-to-end specifications for a highly optimized React Native (Expo) utility application designed for a Pixel 8a. The core functionality centers on a lightweight, offline-first SQLite database that synchronizes seamlessly with a local Windows development environment. An AI-augmented pipeline extracts YouTube transcripts and leverages the Gemini API to generate structured Markdown and PDF reports.

The architecture leverages standard multi-agent orchestration patterns. The tool specifications are formatted for immediate ingestion by Antigravity-CLI or Hero Kiro, ensuring agentic workflow generation remains uninterrupted.

## Application Constraints & UX Guidelines
*   **Target Device:** Pixel 8a.
*   **UI/UX:** React Native Paper (Material Design 3). Native haptic feedback (`expo-haptics`) mapped to all state-changing interactions.
*   **Performance:** Background processing via `expo-task-manager` to ensure the main JS thread remains unblocked, minimizing battery consumption.
*   **State Management:** Zustand for ephemeral UI states; Drizzle ORM + `expo-sqlite` for persistent local storage.

## Antigravity-CLI Master Prompt
*Copy and paste the following prompt into your Antigravity-CLI session to initiate the build:*

> "Agy, initialize a new monorepo workspace for an AI-augmented React Native Expo application. 
> 
> **Step 1:** Scaffold the monorepo with `apps/mobile` (Expo SDK 51+, React Native Paper, Zustand, Drizzle ORM, expo-sqlite) and `tools/sync-server` (Node.js, Express, Multer). 
> **Step 2:** Implement the Drizzle schemas for `videos` and `audit_logs`. Setup the Jest TDD harness in `apps/mobile` mocking `expo-sqlite`. Write tests asserting schema migrations apply cleanly.
> **Step 3:** Build the standalone `transcript-skill` module in pure TypeScript to scrape YouTube initial player response JSON and extract caption tracks without paid APIs. 
> **Step 4:** Implement the Gemini 1.5 Pro processing pipeline to ingest the raw transcript and output structured Markdown. Use `expo-print` to convert the Markdown to PDF natively on the device.
> **Step 5:** Build the local sync workflow. The Express server on port 4000 must accept and serve SQLite `.db` files. The Expo app must use `expo-file-system` to push its DB to the PC, or pull a restored DB and trigger `Updates.reloadAsync()`. 
> 
> Proceed sequentially. Ensure all TDD specs pass before moving to the next step. Use the attached specification markdown files for strict architectural adherence."
