# K6 Performance Testing Framework

A comprehensive k6 performance testing framework designed for microservices architecture. This framework supports both **service-level testing** (testing individual microservices) and **end-to-end (E2E) testing** (testing complete flows across multiple services).

## 🎯 What This Framework Does

This framework provides a structured approach to performance testing in a microservices environment:

- **Service-Level Testing**: Test each microservice independently (booking, genomics, health-assessment)
- **End-to-End Testing**: Test complete user journeys across multiple services
- **Multiple Test Types**: Smoke tests, load tests, stress tests, spike tests
- **Flexible Configuration**: Service-specific thresholds and endpoints
- **Reusable Components**: Test functions that can be shared across scenarios
- **Easy Organization**: Clear separation between test logic and execution patterns

## 📁 Project Structure

```
K6-PerformanceTests/
├── config/
│   ├── base-config.js              # Base configuration
│   └── services-config.js          # Microservices configuration
├── tests/
│   ├── api/
│   │   ├── services/              # Service-level tests
│   │   │   ├── booking/
│   │   │   ├── genomics/
│   │   │   └── health-assessment/
│   │   ├── e2e/                   # End-to-end tests
│   │   ├── auth-test.js
│   │   └── rest-api-test.js
│   └── ui/                        # UI tests
├── scenarios/
│   ├── services/                  # Service-level scenarios
│   │   ├── booking/
│   │   ├── genomics/
│   │   └── health-assessment/
│   ├── e2e/                       # E2E scenarios
│   ├── api-*.js                   # General API scenarios
│   └── ui-*.js                    # UI scenarios
├── utils/                         # Utility functions
└── Documentation/
    ├── MICROSERVICES_STRUCTURE.md
    ├── MICROSERVICES_QUICK_START.md
    └── PROJECT_STRUCTURE.md
```

## 🚀 Getting Started

### Prerequisites

- **k6** installed on your system
- **Node.js** (for npm scripts, optional)

### Installation

**Install k6:**

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

## ⚙️ Configuration

### 1. Configure Microservices

Edit `config/services-config.js` or set environment variables:

```bash
export BOOKING_SERVICE_URL=https://booking-api.yourdomain.com
export GENOMICS_SERVICE_URL=https://genomics-api.yourdomain.com
export HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.yourdomain.com
```

Or create a `.env` file (copy from `env.example`):
```bash
BOOKING_SERVICE_URL=https://booking-api.yourdomain.com
GENOMICS_SERVICE_URL=https://genomics-api.yourdomain.com
HEALTH_ASSESSMENT_SERVICE_URL=https://health-api.yourdomain.com
```

### 2. Configure Base Settings

Edit `config/base-config.js` for general settings:
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
npm run test:api:stress              # API stress testing
npm run test:api:auth                # Authentication tests
npm run test:api:rest                # REST API tests

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
k6 run tests/api/services/booking/booking-api-test.js

# Service scenario
k6 run scenarios/services/booking/booking-load-test.js

# E2E test
k6 run tests/api/e2e/full-patient-journey-test.js
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

Contains the actual test logic:
- HTTP requests
- Response validation
- Test functions (reusable)
- Can run standalone

**Example:**
```javascript
// tests/api/services/booking/booking-api-test.js
export function testCreateBooking(serviceConfig) {
  const response = makeRequest('POST', url, data);
  check(response, { 'status is 201': (r) => r.status === 201 });
}
```

### `/scenarios` - Test Orchestration (HOW to run tests)

Defines how tests execute:
- Load patterns (VUs, duration, stages)
- Thresholds
- Imports and calls test functions

**Example:**
```javascript
// scenarios/services/booking/booking-load-test.js
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

export function testEndpoint1(serviceConfig) {
  const url = getServiceUrl('newService', 'endpoint1');
  const response = makeRequest('GET', url);
  check(response, { 'status is 200': (r) => r.status === 200 });
}
```

### Step 3: Create Service Scenarios

Create `scenarios/services/new-service/new-service-smoke-test.js` and load/stress tests.

### Step 4: Add npm Scripts

Update `package.json`:

```json
"test:service:new-service:smoke": "k6 run scenarios/services/new-service/new-service-smoke-test.js",
"test:service:new-service:load": "k6 run scenarios/services/new-service/new-service-load-test.js"
```

## 📚 Documentation

- **[MICROSERVICES_STRUCTURE.md](./MICROSERVICES_STRUCTURE.md)** - Complete microservices structure guide
- **[MICROSERVICES_QUICK_START.md](./MICROSERVICES_QUICK_START.md)** - Quick start guide for microservices testing
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Detailed project structure documentation
- **[WHY_JAVASCRIPT.md](./WHY_JAVASCRIPT.md)** - Why JavaScript is used instead of TypeScript

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

## 💡 Best Practices

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

## 🐛 Troubleshooting

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

### High Error Rates

- Check service URLs are correct
- Verify services are running
- Check network connectivity
- Review service logs

### Slow Response Times

- Adjust thresholds for service characteristics
- Check service performance
- Verify test environment matches production
- Review service resource usage

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Getting Help

- **k6 Documentation**: [k6.io/docs](https://k6.io/docs)
- **Project Documentation**: See `/Documentation` folder
- **Issues**: Create an issue in the repository
- **Community**: Join the k6 community

## 🎉 Quick Start Summary

1. **Install k6**: `brew install k6` (or see installation section)
2. **Configure services**: Set service URLs in environment variables
3. **Run smoke test**: `npm run test:service:booking:smoke`
4. **Review results**: Check console output for metrics
5. **Run load test**: `npm run test:service:booking:load`
6. **Run E2E test**: `npm run test:e2e:full-journey`

---

**Happy Testing!** 🚀

For detailed information, see:
- [MICROSERVICES_QUICK_START.md](./MICROSERVICES_QUICK_START.md) - Quick start guide
- [MICROSERVICES_STRUCTURE.md](./MICROSERVICES_STRUCTURE.md) - Complete structure guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure details
