# Decisions Ledger for Task 13 (UI TDD)

## 1. Testing Framework
**Decision:** Use `@testing-library/react-native` coupled with Jest.
**Rationale:** Standard practice for React Native UI testing. It encourages testing the app as a user would (finding elements by text/role) rather than testing implementation details (like component state), which makes the tests less brittle.

## 2. Functional vs Snapshot Testing
**Decision:** Prioritize Functional Interaction Tests over Snapshots.
**Rationale:** Snapshot tests frequently break during iterative design phases (like applying the Editorial Archive theme) leading to "snapshot fatigue" where developers just blindly update them. Functional tests asserting the presence of specific textual labels, buttons, and accessibility roles provide actual value and guarantee the UI contract remains intact.
