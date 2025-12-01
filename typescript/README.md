# K6 Performance Testing Framework - TypeScript Edition

A comprehensive k6 performance testing framework written in **TypeScript** for microservices architecture. This is a complete standalone project with full type safety and modern TypeScript features.

## 🎯 What This Framework Does

This TypeScript framework provides a structured, type-safe approach to performance testing in a microservices environment:

- **Type Safety**: Full TypeScript support with interfaces, types, and compile-time checks
- **Service-Level Testing**: Test each microservice independently (booking, genomics, health-assessment)
- **End-to-End Testing**: Test complete user journeys across multiple services
- **Multiple Test Types**: Smoke tests, load tests, stress tests, spike tests
- **Flexible Configuration**: Service-specific thresholds and endpoints
- **Reusable Components**: Type-safe test functions that can be shared across scenarios
- **Easy Organization**: Clear separation between test logic and execution patterns

## 📁 Project Structure

```
typescript/
├── config/
│   ├── base-config.ts              # Base configuration with types
│   └── services-config.ts          # Microservices configuration
├── tests/
│   ├── api/
│   │   ├── services/              # Service-level tests
│   │   │   ├── booking/
│   │   │   ├── genomics/
│   │   │   └── health-assessment/
│   │   ├── e2e/                   # End-to-end tests
│   │   ├── auth-test.ts
│   │   └── rest-api-test.ts
│   └── ui/                        # UI tests
├── scenarios/
│   ├── services/                  # Service-level scenarios
│   │   ├── booking/
│   │   ├── genomics/
│   │   └── health-assessment/
│   │   ├── e2e/                   # E2E scenarios
│   │   ├── api-*.ts              # General API scenarios
│   │   └── ui-*.ts               # UI scenarios
├── utils/                         # Utility functions with types
│   ├── helpers.ts
│   └── performance-monitor.ts
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- **k6** installed on your system (v0.47.0 or later)
- **Node.js** (v16 or later) for npm scripts
- **TypeScript** (installed via npm)

### Installation

**1. Install k6:**

**macOS:**
```bash
brew install k6
```

**Windows:**
```bash
choco install k6
```

**Linux (Ubuntu/Debian):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Verify installation:**
```bash
k6 version
```

**2. Install Project Dependencies:**

```bash
cd typescript
npm install
```

This will install:
- `@types/k6` - TypeScript type definitions for k6
- `typescript` - TypeScript compiler
- `k6` - k6 runtime (for type checking)

**3. Type Check (Optional):**

```bash
npm run type-check
```

## ⚙️ Configuration

### 1. Configure Microservices

Edit `config/services-config.ts` or set environment variables:

```bash
export BOOKING_SERVICE_URL=https://booking-api.yourdomain.com
export GENOMICS_SERVICE_URL=https://genomics-api.yourdomain.com
export HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.yourdomain.com
```

Or create a `.env` file:
```bash
BOOKING_SERVICE_URL=https://booking-api.yourdomain.com
GENOMICS_SERVICE_URL=https://genomics-api.yourdomain.com
HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.yourdomain.com
```

### 2. Configure Base Settings

Edit `config/base-config.ts` for general settings:
- Base URLs
- Authentication credentials
- Default thresholds
- Test data

## 🧪 Running Tests

### Service-Level Tests

Test individual microservices in isolation:

```bash
# Booking Service
npm run test:service:booking:smoke    # Quick validation
npm run test:service:booking:load     # Load testing

# Genomics Service
npm run test:service:genomics:smoke
npm run test:service:genomics:load

# Health Assessment Service
npm run test:service:health:smoke
npm run test:service:health:load
```

### End-to-End Tests

Test complete flows across multiple services:

```bash
# Booking with Health Check flow
npm run test:e2e:booking-health

# Full Patient Journey (all services)
npm run test:e2e:full-journey

# All E2E flows
npm run test:e2e:all
```

### General API/UI Tests

```bash
# API Tests
npm run test:api:smoke              # Quick API validation
npm run test:api:load                # API load testing
npm run test:api:stress             # API stress testing
npm run test:api:auth               # Authentication tests
npm run test:api:rest               # REST API tests

# UI Tests
npm run test:ui:smoke                # UI smoke test
npm run test:ui:load                 # UI load test
npm run test:ui:pages                # Page load tests
npm run test:ui:interactions         # User interaction tests

# Combined Tests
npm run test:all                     # Comprehensive test suite
```

### Running Tests Directly

You can also run tests directly with k6:

```bash
# Service test
k6 run tests/api/services/booking/booking-api-test.ts

# Service scenario
k6 run scenarios/services/booking/booking-load-test.ts

# E2E test
k6 run tests/api/e2e/full-patient-journey-test.ts
```

## 🔷 TypeScript Features

### Type Safety

All functions, parameters, and return types are fully typed:

```typescript
// Fully typed function
export function makeRequest(
  method: string, 
  url: string, 
  payload: string | null = null, 
  customHeaders: Record<string, string> = {}
): http.Response {
  // Implementation
}
```

### Interfaces

Complex data structures are defined with interfaces:

```typescript
interface RequestData {
  testName: string;
  status: number;
  responseTime: number;
  timestamp: string;
  url: string;
  method: string;
}
```

### Type-Safe Configuration

Service configurations are type-safe:

```typescript
export function getServiceUrl(
  serviceName: string, 
  endpointKey: string, 
  params: Record<string, string> = {}
): string {
  // Type-safe implementation
}
```

## 📊 Understanding Test Results

### Key Metrics

- **http_req_duration**: Response time (avg, p95, p99)
- **http_req_failed**: Percentage of failed requests
- **http_reqs**: Total requests and requests per second
- **checks**: Percentage of passed assertions
- **vus**: Virtual users (concurrent users)

### Example Output

```
✓ http_req_duration: p(95)=245ms (threshold: 500ms)
✓ http_req_failed: 0.5% (threshold: 5%)
✓ checks: 98.5% (threshold: 90%)
```

## 🏗️ Architecture: Tests vs Scenarios

### `/tests` - Test Implementation (WHAT to test)

Contains the actual test logic with full TypeScript types:
- HTTP requests
- Response validation
- Type-safe test functions (reusable)
- Can run standalone

**Example:**
```typescript
// tests/api/services/booking/booking-api-test.ts
export function testCreateBooking(serviceConfig: any): string | null {
  const url = getServiceUrl('booking', 'createBooking');
  const response = makeRequest('POST', url, JSON.stringify(bookingData));
  check(response, { 'status is 201': (r) => r.status === 201 });
  return bookingId;
}
```

### `/scenarios` - Test Orchestration (HOW to run tests)

Defines how tests execute with typed configurations:
- Load patterns (VUs, duration, stages)
- Thresholds
- Imports and calls test functions

**Example:**
```typescript
// scenarios/services/booking/booking-load-test.ts
export const options = {
  scenarios: {
    booking_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 }
      ]
    }
  }
};
```

## 🔧 Adding a New Microservice

### Step 1: Add Service Configuration

Edit `config/services-config.ts`:

```typescript
export const SERVICES_CONFIG = {
  // ... existing services
  newService: {
    BASE_URL: __ENV.NEW_SERVICE_URL || 'https://new-service.example.com',
    API_VERSION: __ENV.NEW_SERVICE_API_VERSION || 'v1',
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

Create `tests/api/services/new-service/new-service-api-test.ts`:

```typescript
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest } from '../../../../utils/helpers.js';
import { check } from 'k6';

export function testEndpoint1(serviceConfig: any): void {
  const url = getServiceUrl('newService', 'endpoint1');
  const response = makeRequest('GET', url);
  check(response, { 'status is 200': (r) => r.status === 200 });
}
```

### Step 3: Create Service Scenarios

Create `scenarios/services/new-service/new-service-smoke-test.ts` and load/stress tests.

### Step 4: Add npm Scripts

Update `package.json`:

```json
"test:service:new-service:smoke": "k6 run scenarios/services/new-service/new-service-smoke-test.ts",
"test:service:new-service:load": "k6 run scenarios/services/new-service/new-service-load-test.ts"
```

## 🎯 Testing Strategy

### Development/CI Pipeline

1. **Service smoke tests** - Run after each service deployment
2. **Service load tests** - Run nightly for each service
3. **E2E smoke tests** - Run after all services deployed
4. **E2E load tests** - Run weekly for full system validation

### Production Validation

1. **Service-level load tests** - Validate individual service performance
2. **E2E load tests** - Validate complete system performance
3. **Stress tests** - Identify breaking points per service and system-wide

## 💡 TypeScript Best Practices

### Type Safety

1. **Always type function parameters and return types**
2. **Use interfaces for complex objects**
3. **Leverage TypeScript's type inference where appropriate**
4. **Use `any` sparingly - prefer specific types**

### Code Organization

1. **Keep types close to where they're used**
2. **Export reusable types and interfaces**
3. **Use type aliases for complex types**
4. **Document complex types with JSDoc comments**

### Error Handling

1. **Type error objects properly**
2. **Use type guards for runtime type checking**
3. **Handle null/undefined explicitly**

## 🐛 Troubleshooting

### Type Errors

If you see TypeScript errors, run:
```bash
npm run type-check
```

### Service Not Found Error

Make sure the service name in `SERVICES_CONFIG` matches what you're using:
```typescript
getServiceConfig('booking')  // ✅ Correct
getServiceConfig('Booking')  // ❌ Wrong (case-sensitive)
```

### Import Errors

Use correct relative paths with `.js` extension (required by k6):
```typescript
// From tests/api/services/booking/
import { getServiceConfig } from '../../../../config/services-config.js';
```

### k6 TypeScript Support

k6 supports TypeScript natively. Make sure you have:
- `@types/k6` installed
- `tsconfig.json` configured correctly
- Files use `.ts` extension

## 📈 Test Types Explained

### Smoke Tests
- **Purpose**: Quick validation
- **Load**: 1 VU, short duration (30s)
- **Use**: After deployments, quick checks

### Load Tests
- **Purpose**: Normal usage simulation
- **Load**: Moderate VUs (5-10), sustained duration
- **Use**: Validate performance under expected load

### Stress Tests
- **Purpose**: Find breaking points
- **Load**: High VUs (50+), ramping up
- **Use**: Identify system limits

### Spike Tests
- **Purpose**: Sudden traffic spikes
- **Load**: Rapid VU increase
- **Use**: Test system resilience

## 🔄 Environment Variables

Key environment variables:

```bash
# Service URLs (Required for microservices testing)
BOOKING_SERVICE_URL=https://booking-api.example.com
GENOMICS_SERVICE_URL=https://genomics-api.example.com
HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.example.com

# API Versions (Optional, defaults to v1)
BOOKING_API_VERSION=v1
GENOMICS_API_VERSION=v1
HEALTH_ASSESSMENT_API_VERSION=v1

# General Configuration
BASE_URL=https://your-api.com
API_BASE_URL=https://your-api.com/api
ENV=staging
```

## 🎉 Quick Start Summary

1. **Install k6**: `brew install k6` (or see installation section)
2. **Install dependencies**: `npm install`
3. **Configure services**: Set service URLs in environment variables
4. **Run smoke test**: `npm run test:service:booking:smoke`
5. **Review results**: Check console output for metrics
6. **Run load test**: `npm run test:service:booking:load`
7. **Run E2E test**: `npm run test:e2e:full-journey`

## 🔷 TypeScript vs JavaScript

This TypeScript version provides:

✅ **Type Safety** - Catch errors at compile time  
✅ **Better IDE Support** - Autocomplete, refactoring, navigation  
✅ **Self-Documenting Code** - Types serve as documentation  
✅ **Easier Refactoring** - TypeScript helps catch breaking changes  
✅ **Modern Features** - Latest TypeScript and ES features  

The JavaScript version is still available in the parent directory for those who prefer it.

## 📝 Example: Complete Test Flow

### 1. Service-Level Test

```bash
# Test booking service in isolation
npm run test:service:booking:load
```

This tests:
- Booking creation
- Booking retrieval
- Availability checks
- Booking updates
- Booking cancellation

### 2. E2E Test

```bash
# Test complete patient journey
npm run test:e2e:full-journey
```

This tests:
- Health assessment creation
- Genomics sequence upload
- Assessment submission
- Sequence analysis
- Booking creation
- Results retrieval (all services)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Run type checking: `npm run type-check`
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Getting Help

- **k6 Documentation**: [k6.io/docs](https://k6.io/docs)
- **TypeScript Documentation**: [typescriptlang.org](https://www.typescriptlang.org/docs/)
- **k6 TypeScript Guide**: [k6.io/docs/using-k6/typescript](https://k6.io/docs/using-k6/typescript)
- **Issues**: Create an issue in the repository

---

**Happy Testing with TypeScript!** 🚀

For the JavaScript version, see the parent directory.

