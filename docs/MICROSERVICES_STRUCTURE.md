# Microservices Performance Testing Structure

This document explains how the framework is structured to support microservices-level and end-to-end (E2E) performance testing.

## 📁 New Structure Overview

```
K6-PerformanceTests/
├── config/
│   ├── base-config.js          # Base configuration (existing)
│   └── services-config.js      # Microservices configuration (NEW)
│
├── tests/
│   ├── api/
│   │   ├── services/           # Service-level tests (NEW)
│   │   │   ├── booking/
│   │   │   │   └── booking-api-test.js
│   │   │   ├── genomics/
│   │   │   │   └── genomics-api-test.js
│   │   │   └── health-assessment/
│   │   │       └── health-assessment-api-test.js
│   │   └── e2e/                # End-to-end tests (NEW)
│   │       ├── booking-with-health-check-test.js
│   │       └── full-patient-journey-test.js
│   └── ui/                     # UI tests (existing)
│
├── scenarios/
│   ├── services/               # Service-level scenarios (NEW)
│   │   ├── booking/
│   │   │   ├── booking-smoke-test.js
│   │   │   └── booking-load-test.js
│   │   ├── genomics/
│   │   │   ├── genomics-smoke-test.js
│   │   │   └── genomics-load-test.js
│   │   └── health-assessment/
│   │       ├── health-assessment-smoke-test.js
│   │       └── health-assessment-load-test.js
│   └── e2e/                    # E2E scenarios (NEW)
│       └── full-system-e2e-test.js
│
└── utils/                      # Utilities (existing)
```

---

## 🎯 Two-Level Testing Strategy

### 1. **Service-Level Testing** (`/tests/api/services/`)

**Purpose:** Test individual microservices in isolation

**Benefits:**
- Isolate performance issues to specific services
- Test services independently
- Easier debugging and optimization
- Service-specific thresholds and configurations

**Structure:**
- Each service has its own folder
- Each service has its own test file with all endpoints
- Service-specific thresholds and configurations

**Example Services:**
- `booking/` - Booking service tests
- `genomics/` - Genomics service tests
- `health-assessment/` - Health assessment service tests

### 2. **End-to-End (E2E) Testing** (`/tests/api/e2e/`)

**Purpose:** Test complete flows across multiple services

**Benefits:**
- Validate cross-service integration
- Test real user journeys
- Identify bottlenecks in service interactions
- Validate data flow between services

**Example Flows:**
- Booking with Health Check - Tests booking + health assessment integration
- Full Patient Journey - Tests all three services in sequence

---

## ⚙️ Configuration: `config/services-config.js`

### Service Configuration

Each service is configured with:
- **BASE_URL** - Service base URL (from environment variables)
- **API_VERSION** - API version (e.g., v1, v2)
- **THRESHOLDS** - Service-specific performance thresholds
- **ENDPOINTS** - All service endpoints defined

```javascript
booking: {
  BASE_URL: __ENV.BOOKING_SERVICE_URL || 'https://booking-api.example.com',
  API_VERSION: 'v1',
  THRESHOLDS: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05']
  },
  ENDPOINTS: {
    createBooking: '/bookings',
    getBooking: '/bookings/{id}',
    // ... more endpoints
  }
}
```

### Helper Functions

- `getServiceUrl(serviceName, endpointKey, params)` - Build service URLs
- `getServiceConfig(serviceName)` - Get service configuration
- `E2E_FLOWS` - Predefined E2E test flows

---

## 🧪 Service-Level Tests

### Structure

Each service test file (`tests/api/services/{service}/{service}-api-test.js`) contains:

1. **Service-specific thresholds** from config
2. **All service endpoints** as test functions
3. **Reusable test functions** that can be imported
4. **Default function** for standalone execution

### Example: Booking Service Test

```javascript
// tests/api/services/booking/booking-api-test.js

export function testCreateBooking(serviceConfig) { ... }
export function testGetBooking(serviceConfig, bookingId) { ... }
export function testListBookings(serviceConfig) { ... }
export function testUpdateBooking(serviceConfig, bookingId) { ... }
export function testCancelBooking(serviceConfig, bookingId) { ... }
```

**Usage:**
- Can be run standalone: `k6 run tests/api/services/booking/booking-api-test.js`
- Can be imported by scenarios
- Can be imported by E2E tests

---

## 🔄 End-to-End Tests

### Structure

E2E test files (`tests/api/e2e/{flow-name}-test.js`) contain:

1. **Multi-service thresholds** (combined from all services)
2. **Complete user flows** across services
3. **Data passing** between service calls
4. **Flow validation** at each step

### Example: Booking with Health Check

```javascript
// Flow:
1. Create health assessment
2. Create booking
3. Submit assessment
4. Get booking details
5. Get assessment results
```

### Example: Full Patient Journey

```javascript
// Flow:
1. Create health assessment
2. Upload genomics sequence
3. Submit assessment
4. Analyze sequence
5. Create booking
6. Get all results (assessment, genomics, booking)
```

---

## 📊 Scenarios

### Service-Level Scenarios

Located in `scenarios/services/{service}/`:

- **Smoke tests** - Quick validation
- **Load tests** - Normal load testing
- **Stress tests** - Breaking point testing

Each scenario:
- Imports the service test file
- Defines load patterns
- Sets service-specific thresholds
- Orchestrates test execution

### E2E Scenarios

Located in `scenarios/e2e/`:

- **Full System E2E** - Runs multiple E2E flows
- Can run flows in parallel or sequence
- Validates cross-service integration

---

## 🚀 Usage Examples

### Running Service-Level Tests

```bash
# Booking service smoke test
npm run test:service:booking:smoke

# Genomics service load test
npm run test:service:genomics:load

# Health assessment service load test
npm run test:service:health:load
```

### Running E2E Tests

```bash
# Booking with health check E2E flow
npm run test:e2e:booking-health

# Full patient journey E2E flow
npm run test:e2e:full-journey

# All E2E flows
npm run test:e2e:all
```

### Running Tests Directly

```bash
# Service test directly
k6 run tests/api/services/booking/booking-api-test.js

# E2E test directly
k6 run tests/api/e2e/full-patient-journey-test.js

# Service scenario
k6 run scenarios/services/booking/booking-load-test.js
```

---

## 🔧 Environment Variables

Set service URLs via environment variables:

```bash
export BOOKING_SERVICE_URL=https://booking-api.production.com
export GENOMICS_SERVICE_URL=https://genomics-api.production.com
export HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.production.com

# Run tests
npm run test:service:booking:load
```

Or in `.env` file:
```bash
BOOKING_SERVICE_URL=https://booking-api.production.com
GENOMICS_SERVICE_URL=https://genomics-api.production.com
HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.production.com
```

---

## 📝 Adding a New Service

### Step 1: Add Service Configuration

Edit `config/services-config.js`:

```javascript
export const SERVICES_CONFIG = {
  // ... existing services
  newService: {
    BASE_URL: __ENV.NEW_SERVICE_URL || 'https://new-service.example.com',
    API_VERSION: 'v1',
    THRESHOLDS: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.05']
    },
    ENDPOINTS: {
      endpoint1: '/endpoint1',
      endpoint2: '/endpoint2/{id}'
    }
  }
};
```

### Step 2: Create Service Test File

Create `tests/api/services/new-service/new-service-api-test.js`:

```javascript
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
// ... implement test functions
```

### Step 3: Create Service Scenarios

Create `scenarios/services/new-service/new-service-smoke-test.js` and load/stress tests.

### Step 4: Add npm Scripts

Update `package.json`:

```json
"test:service:new-service:smoke": "k6 run scenarios/services/new-service/new-service-smoke-test.js",
"test:service:new-service:load": "k6 run scenarios/services/new-service/new-service-load-test.js"
```

---

## 🎯 Best Practices

### Service-Level Testing

1. **Test in isolation** - Each service should be testable independently
2. **Service-specific thresholds** - Different services may have different performance requirements
3. **Comprehensive endpoint coverage** - Test all endpoints for each service
4. **Reusable functions** - Make test functions importable for E2E tests

### E2E Testing

1. **Real user flows** - Test actual user journeys, not just random API calls
2. **Data flow validation** - Ensure data flows correctly between services
3. **Error handling** - Test what happens when one service fails
4. **Realistic delays** - Add appropriate delays between service calls

### Configuration

1. **Environment-based URLs** - Use environment variables for different environments
2. **Service-specific thresholds** - Genomics might be slower than booking
3. **Centralized configuration** - Keep all service configs in one place
4. **Version management** - Support different API versions per service

---

## 📈 Test Execution Strategy

### Development/CI Pipeline

1. **Service smoke tests** - Run after each service deployment
2. **Service load tests** - Run nightly for each service
3. **E2E smoke tests** - Run after all services deployed
4. **E2E load tests** - Run weekly for full system validation

### Production Validation

1. **Service-level load tests** - Validate individual service performance
2. **E2E load tests** - Validate complete system performance
3. **Stress tests** - Identify breaking points per service and system-wide

---

## 🔍 Troubleshooting

### Service Not Found Error

Make sure the service name in `SERVICES_CONFIG` matches what you're using:
```javascript
getServiceConfig('booking')  // ✅ Correct
getServiceConfig('Booking')  // ❌ Wrong (case-sensitive)
```

### Endpoint Not Found Error

Check that the endpoint key exists in the service's `ENDPOINTS` object:
```javascript
getServiceUrl('booking', 'createBooking')  // ✅ Correct
getServiceUrl('booking', 'create')        // ❌ Wrong
```

### Import Errors

Use correct relative paths:
```javascript
// From tests/api/services/booking/
import { getServiceConfig } from '../../../../config/services-config.js';
```

---

## 📚 Summary

This structure provides:

✅ **Service isolation** - Test each microservice independently  
✅ **E2E validation** - Test complete user journeys  
✅ **Scalability** - Easy to add new services  
✅ **Flexibility** - Mix and match services in E2E flows  
✅ **Maintainability** - Clear organization and separation of concerns  

The framework now supports both microservice-level and system-level performance testing, giving you comprehensive coverage of your distributed system.

