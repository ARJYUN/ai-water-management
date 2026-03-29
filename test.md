# Walkthrough - Software Testing Suite

I have successfully implemented a full-tier software testing suite for your project. This suite fulfills the requirements for **Unit**, **Integration**, **System**, and **Acceptance** testing.

## 1. Backend Testing (Unit & Integration)
We use **Jest** and **Supertest** for the backend.

### How to Run:
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run all tests:
   ```bash
   npm test
   ```
3. **What's included**:
   - **Unit Test**: `tests/unit/policies.test.js` (Tests the water calculation logic).
   - **Integration Test**: `tests/integration/workloads.test.js` (Tests the Workload API with mocked DB).

## 2. Frontend Unit Testing
We use **Vitest** and **React Testing Library**.

### How to Run:
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Run unit tests:
   ```bash
   npm test
   ```
3. **What's included**:
   - **Unit Test**: `src/tests/Dashboard.test.jsx` (Verifies the Dashboard correctly displays stats and handles loading states).

## 3. System & Acceptance Testing (E2E)
We use **Cypress** for end-to-end testing of the entire application flow.

### How to Run:
> [!IMPORTANT]
> Ensure both your backend (`node server.js`) and frontend (`npm run dev`) are running before starting Cypress.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Open the Cypress UI:
   ```bash
   npx cypress open
   ```
3. Or run in headless mode (for CLI output):
   ```bash
   npx cypress run
   ```
4. **What's included**:
   - **System Test**: Logs into the system and verifies the dashboard state.
   - **Acceptance Test**: Simulates adding a workload and verifies it reaches the "Submitted" state.

---

## Technical Summary
- **Backend Refactoring**: Extracted core water calculation logic into `backend/utils/waterCalculator.js` to enable isolated unit testing.
- **Mocking Strategy**: Used `jest.mock` for the database and `vi.mock` for the frontend API to ensure tests are fast and don't depend on external services.
- **E2E Automation**: Configured Cypress to target your local development server (`http://localhost:5173`).
