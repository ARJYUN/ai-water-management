# Software Testing Report - Water AI Management System

## 1. Overview
This document details the software testing lifecycle implemented for the **Water-Aware AI Resource Management System**. To ensure software quality and reliability for this Software Engineering project, a multi-tier testing strategy was adopted, covering all critical layers of the application.

---

## 2. Testing Objectives
- **Data Integrity**: Ensure water calculation logic is accurate across different regions.
- **System Reliability**: Verify that AI workload states transition correctly based on environmental policies.
- **User Experience**: Validate that the frontend correctly reflects the underlying system state.
- **End-to-End Functional Validation**: Confirm that the entire user journey (Login -> Dashboard -> Management) fulfills business requirements.

---

## 3. Testing Methodology

### 3.1 Unit Testing
**Objective**: Test isolated business logic without external dependencies.
- **Backend tool**: Jest
- **Frontend tool**: Vitest / React Testing Library
- **Key implementation**: Refactored water estimation logic into an independent utility (`backend/utils/waterCalculator.js`) for granular validation.

### 3.2 Integration Testing
**Objective**: Test the interaction between the application and its architectural components (API endpoints, simulated database).
- **Tool**: Jest + Supertest
- **Scope**: Verified that the REST API correctly handles workload submissions and applies regional policies.

### 3.3 System Testing
**Objective**: Validate the system as a whole against functional specifications.
- **Tool**: Cypress (End-to-End)
- **Scope**: Simulated a real browser environment to perform complex multi-step workflows like user authentication and dashboard navigation.

### 3.4 Acceptance Testing (UAT)
**Objective**: Ensure the software meets the "User Stories" and business goals.
- **Verification**: Used Cypress to automate verification of critical business rules, such as generating alerts for high-consumption workloads.

---

## 4. Test Case Summary

### 4.1 Backend Test Cases (`npm test` in /backend)
| Test ID | Category | Description | Result |
| :--- | :--- | :--- | :--- |
| BT-01 | Unit | Calculate liters for `training` in `us-central` (440L). | ✅ Pass |
| BT-02 | Unit | Calculate liters for `inference` in `asia-east` (130L). | ✅ Pass |
| BT-03 | Unit | Use default values for unknown regions/types. | ✅ Pass |
| BT-04 | Integration | `POST /api/workloads` handles valid JSON data. | ✅ Pass |
| BT-05 | Integration | `POST /api/workloads` returns 400 for missing fields. | ✅ Pass |

### 4.2 Frontend Test Cases (`npm test` in /frontend)
| Test ID | Category | Description | Result |
| :--- | :--- | :--- | :--- |
| FT-01 | Unit | Dashboard renders `5.0K L` when API returns 5000L. | ✅ Pass |
| FT-02 | Unit | Dashboard shows "Loading..." state before data arrival. | ✅ Pass |

### 4.3 End-to-End Test Cases (`npx cypress run`)
| Test ID | Category | Description | Result |
| :--- | :--- | :--- | :--- |
| E2E-01 | System | User can log in with `admin@water.ai` and reach Dashboard. | ✅ Pass |
| E2E-02 | Acceptance | Adding a workload triggers the "Workload submitted" notification. | ✅ Pass |

---

## 5. Tools & Infrastructure
- **Test Frameworks**: Jest, Vitest, Cypress.
- **Mocking**: Used `vi.mock` and `jest.mock` to simulate external environments, ensuring tests run in 100% isolation without polluting the production database.
- **CI/CD Readiness**: All tests are integrated into `package.json` scripts for easy inclusion in a build pipeline.

---

## 6. How to Reproduce Results
1. **Backend**: Run `npm test` from the `backend/` directory.
2. **Frontend Unit**: Run `npm test` from the `frontend/` directory.
3. **E2E**: With the app running, execute `npx cypress run` from the `frontend/` directory.

> [!TIP]
> This testing suite covers the entire software stack. For the final project submission, refer to the screenshots and logs generated in the `cypress/videos` and `cypress/screenshots` directories (if configured).
