# Project Structure Documentation

This document provides a comprehensive overview of the k6 Performance Testing Framework project structure, explaining each folder and file's purpose and functionality.

## 📁 Project Overview

```
K6-PerformanceTests/
├── config/              # Configuration files
├── scenarios/           # Test scenarios (smoke, load, stress)
├── tests/               # Individual test implementations
│   ├── api/            # API-specific tests
│   └── ui/             # UI-specific tests
├── utils/              # Utility functions and helpers
├── examples/            # Example scripts (currently empty)
├── Root files           # Configuration and documentation
└── Documentation         # Project documentation
```

---

## 📂 Folder Structure

### `/config` - Configuration Files

**Purpose:** Centralized configuration for all tests

#### `base-config.js`
- **Purpose:** Main configuration file containing base settings for all tests
- **Exports:**
  - `BASE_CONFIG` - Base URLs, authentication, thresholds, request options
  - `TEST_DATA` - Shared test data arrays (posts, users, etc.)
  - `USER_CREDENTIALS` - User credentials for authentication tests
  - `SCENARIOS` - Reusable test scenario configurations (SMOKE, LOAD, STRESS, SPIKE)
- **Usage:** Imported by all test files to maintain consistency
- **Key Features:**
  - Environment variable support via `__ENV`
  - SharedArray for efficient memory usage
  - Default thresholds for performance metrics
  - Reusable scenario templates

---

### `/scenarios` - Test Scenarios

**Purpose:** Orchestrate multiple tests into comprehensive scenarios

#### `api-smoke-test.js`
- **Purpose:** Quick validation that all major API endpoints are working
- **Test Type:** Smoke test (1 VU, 30 seconds)
- **Tests:**
  - REST API endpoints (GET posts, GET specific post, POST create)
  - Authentication (login, token validation)
- **Use Case:** Run after deployments to verify basic functionality

#### `api-load-test.js`
- **Purpose:** Moderate load testing to validate performance under normal usage
- **Test Type:** Load test (ramping VUs: 1→5→0 over 2 minutes)
- **Scenarios:**
  - REST API load (starts immediately)
  - Authentication load (starts after 30s)
- **Use Case:** Validate system performance under expected production load

#### `api-stress-test.js`
- **Purpose:** High load testing to find breaking points and validate system stability
- **Test Type:** Stress test (ramping VUs up to 50)
- **Scenarios:**
  - REST API stress
  - Authentication stress (starts after 1m)
  - Spike test (starts after 5m)
- **Use Case:** Identify system limits and breaking points

#### `ui-smoke-test.js`
- **Purpose:** Quick validation of UI endpoints and page loads
- **Test Type:** Smoke test (1 VU, 30 seconds)
- **Tests:** Basic UI page loads and static asset loading
- **Use Case:** Verify UI is accessible and loads correctly

#### `ui-load-test.js`
- **Purpose:** Moderate load testing for UI performance
- **Test Type:** Load test with multiple scenarios
- **Scenarios:**
  - Page load test (ramping VUs)
  - User interaction test (starts after 30s)
  - Mobile simulation (2 VUs, 3 minutes, starts after 1m)
- **Use Case:** Validate UI performance under normal user load

#### `combined-test.js`
- **Purpose:** Comprehensive test covering both API and UI performance
- **Test Type:** Multi-phase test simulating real-world usage
- **Phases:**
  1. System check (1 VU, 2 minutes)
  2. API load testing (starts after 30s)
  3. UI load testing (starts after 1m)
  4. Mixed workload (starts after 3m)
  5. Stress test (starts after 5m)
  6. Recovery test (starts after 8m)
- **Use Case:** End-to-end performance validation before major releases

---

### `/tests/api` - API Test Implementations

**Purpose:** Individual API test functions that can be reused across scenarios

#### `rest-api-test.js`
- **Purpose:** REST API endpoint testing
- **Functions:**
  - `testGetAllPosts()` - GET all posts endpoint
  - `testGetSpecificPost()` - GET specific post by ID
  - `testCreatePost()` - POST create new post
- **Features:**
  - Response validation
  - Performance checks
  - Error handling
- **Usage:** Imported by scenario files

#### `auth-test.js`
- **Purpose:** Authentication and authorization testing
- **Functions:**
  - `testUserLogin()` - User login flow
  - `testTokenValidation()` - Token validation
  - `testUserRegistration()` - User registration
  - `testPasswordReset()` - Password reset flow
- **Features:**
  - Token management
  - Session handling
  - Security validation
- **Usage:** Used in authentication scenarios

---

### `/tests/ui` - UI Test Implementations

**Purpose:** UI and frontend performance testing

#### `page-load-test.js`
- **Purpose:** Page load performance testing
- **Functions:**
  - `testHomepageLoad()` - Homepage load time
  - `testStaticAssetsLoad()` - CSS, JS, images loading
  - `testPageNavigation()` - Page-to-page navigation
- **Features:**
  - Core Web Vitals measurement
  - Resource loading validation
  - Performance timing metrics
- **Usage:** UI load and smoke test scenarios

#### `user-interaction-test.js`
- **Purpose:** User interaction and form testing
- **Functions:**
  - `testSearchFunctionality()` - Search feature testing
  - `testFormInteractions()` - Form submission testing
  - `testDynamicContent()` - Dynamic content loading
- **Features:**
  - Form validation
  - AJAX request testing
  - User flow simulation
- **Usage:** UI interaction scenarios

---

### `/utils` - Utility Functions

**Purpose:** Reusable helper functions and utilities

#### `helpers.js`
- **Purpose:** Common utility functions for all tests
- **Functions:**
  - `generateRandomData()` - Generate random test data
  - `generateRandomUser()` - Generate random user credentials
  - `makeRequest()` - HTTP request wrapper with defaults
  - `validateResponse()` - Response validation helper
  - `authenticateUser()` - User authentication helper
  - `makeAuthenticatedRequest()` - Authenticated request wrapper
  - `simulateUserBehavior()` - Simulate realistic user delays
  - `generateLoadPattern()` - Generate load patterns
  - `isRateLimited()` - Check for rate limiting
  - `extractMetrics()` - Extract performance metrics
  - `createTestSummary()` - Create test summary object
  - `handleError()` - Error handling helper
  - `waitForCondition()` - Wait for condition with timeout
  - `generateTestReport()` - Generate test report data
- **Usage:** Imported by test files for common operations

#### `performance-monitor.js`
- **Purpose:** Performance monitoring and tracking utilities
- **Classes:**
  - `PerformanceMonitor` - Track request metrics, errors, response times
  - `ConnectionPoolMonitor` - Monitor connection pool usage
  - `CacheSimulator` - Simulate caching behavior
- **Functions:**
  - `trackMemoryUsage()` - Track memory consumption
  - `simulateCpuIntensiveTask()` - Simulate CPU load
  - `simulateNetworkLatency()` - Simulate network delays
  - `simulateLoadBalancing()` - Simulate load balancing
  - `detectPerformanceRegression()` - Detect performance regressions
- **Usage:** Advanced performance monitoring in tests

---

### `/examples` - Example Scripts

**Purpose:** Example test scripts (currently empty after AI removal)

**Note:** This folder was previously used for AI-enhanced examples but is now available for custom example scripts.

---

## 📄 Root Files

### `package.json`
- **Purpose:** Node.js project configuration and npm scripts
- **Scripts:**
  - `test:api:smoke` - Run API smoke test
  - `test:api:load` - Run API load test
  - `test:api:stress` - Run API stress test
  - `test:ui:smoke` - Run UI smoke test
  - `test:ui:load` - Run UI load test
  - `test:all` - Run combined comprehensive test
  - `test:api:auth` - Run authentication test
  - `test:api:rest` - Run REST API test
  - `test:ui:pages` - Run page load test
  - `test:ui:interactions` - Run user interaction test
- **Dependencies:**
  - `k6` - k6 performance testing tool
  - `@types/k6` - TypeScript definitions (for IDE support)

### `k6.config.js`
- **Purpose:** Central k6 configuration file
- **Exports:**
  - `defaultConfig` - Default k6 configuration
  - `environmentConfigs` - Environment-specific configs (dev, staging, prod)
  - `testTypeConfigs` - Test type configs (smoke, load, stress, spike)
  - `getConfig()` - Helper to merge configs
- **Features:**
  - Global thresholds
  - Summary statistics configuration
  - DNS settings
  - Timeout configurations
  - Environment-based configuration

### `env.example`
- **Purpose:** Example environment variables file
- **Variables:**
  - `ENV` - Environment (staging, production, etc.)
  - `BASE_URL` - Base URL override
  - `API_BASE_URL` - API base URL override
- **Usage:** Copy to `.env` and fill in actual values

### `demo.sh`
- **Purpose:** Quick demo script to run various test types
- **Features:**
  - Checks if k6 is installed
  - Sets default URLs for demo
  - Runs sample tests
  - Shows test results
- **Usage:** `./demo.sh` to run a quick demonstration

---

## 📚 Documentation Files

### `README.md`
- **Purpose:** Main project documentation
- **Contents:**
  - Project overview
  - Installation instructions
  - Getting started guide
  - Configuration guide
  - Running tests
  - Understanding results
  - Best practices
  - Troubleshooting

### `CHANGELOG.md`
- **Purpose:** Project version history and changes
- **Contents:** List of changes, features, and updates

### `WHY_JAVASCRIPT.md`
- **Purpose:** Explanation of why JavaScript is used instead of TypeScript
- **Contents:**
  - k6 runtime compatibility
  - Technical advantages
  - Practical benefits
  - Industry context

### `PROJECT_STRUCTURE.md` (this file)
- **Purpose:** Comprehensive project structure documentation
- **Contents:** Detailed explanation of all folders and files

---

## 🔄 File Relationships

### Import Flow

```
scenarios/*.js
  ├── imports from config/base-config.js
  ├── imports from tests/api/*.js
  └── imports from tests/ui/*.js

tests/api/*.js
  ├── imports from config/base-config.js
  └── imports from utils/helpers.js

tests/ui/*.js
  ├── imports from config/base-config.js
  └── imports from utils/helpers.js

utils/*.js
  └── imports from config/base-config.js
```

### Execution Flow

1. **User runs npm script** → `package.json` script executes
2. **k6 runs scenario file** → `scenarios/*.js` file executed
3. **Scenario imports test files** → `tests/api/*.js` or `tests/ui/*.js`
4. **Tests use utilities** → `utils/helpers.js` and `utils/performance-monitor.js`
5. **Tests use configuration** → `config/base-config.js`
6. **Results output** → Console output with metrics

---

## 🎯 Usage Patterns

### Running Individual Tests
```bash
npm run test:api:rest      # Run REST API test
npm run test:api:auth      # Run authentication test
npm run test:ui:pages      # Run page load test
```

### Running Scenarios
```bash
npm run test:api:smoke     # Quick API validation
npm run test:api:load       # API load testing
npm run test:api:stress     # API stress testing
npm run test:all            # Comprehensive test
```

### Custom Configuration
```bash
BASE_URL=https://your-api.com npm run test:api:smoke
ENV=production npm run test:api:load
```

---

## 📊 Test Types Explained

### Smoke Tests
- **Purpose:** Quick validation
- **Load:** 1 VU, short duration
- **Use:** After deployments, quick checks

### Load Tests
- **Purpose:** Normal usage simulation
- **Load:** Moderate VUs, sustained duration
- **Use:** Validate performance under expected load

### Stress Tests
- **Purpose:** Find breaking points
- **Load:** High VUs, ramping up
- **Use:** Identify system limits

### Spike Tests
- **Purpose:** Sudden traffic spikes
- **Load:** Rapid VU increase
- **Use:** Test system resilience

---

## 🔧 Customization Guide

### Adding New Tests
1. Create test file in `tests/api/` or `tests/ui/`
2. Export test functions
3. Import in scenario files
4. Add npm script in `package.json`

### Modifying Configuration
1. Edit `config/base-config.js` for base settings
2. Edit `k6.config.js` for k6-specific settings
3. Use environment variables for runtime changes

### Adding Utilities
1. Add functions to `utils/helpers.js`
2. Or create new file in `utils/`
3. Import where needed

---

## 📝 Best Practices

1. **Use base-config.js** for all shared configuration
2. **Reuse test functions** from `/tests` folders
3. **Use utility functions** from `/utils` instead of duplicating code
4. **Follow naming conventions** - descriptive function and file names
5. **Document custom tests** with comments
6. **Keep scenarios focused** - one scenario per test type
7. **Use environment variables** for different environments

---

## 🚀 Quick Start

1. **Install k6:** `brew install k6` (macOS)
2. **Configure:** Copy `env.example` to `.env` and update URLs
3. **Run smoke test:** `npm run test:api:smoke`
4. **Review results:** Check console output for metrics
5. **Run load test:** `npm run test:api:load`
6. **Customize:** Modify `config/base-config.js` for your needs

---

## 📞 Support

For questions or issues:
- Check `README.md` for detailed instructions
- Review test files for examples
- Check k6 documentation: https://k6.io/docs

---

**Last Updated:** 2025-11-27
**Project Version:** 1.0.0

