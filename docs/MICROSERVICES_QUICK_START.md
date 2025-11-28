# Microservices Testing - Quick Start Guide

## 🎯 What Was Created

Your framework now supports **two-level testing**:

1. **Service-Level Testing** - Test each microservice independently
2. **End-to-End (E2E) Testing** - Test complete flows across services

## 📁 New Structure

```
tests/api/
├── services/                    # Service-level tests
│   ├── booking/
│   │   └── booking-api-test.js
│   ├── genomics/
│   │   └── genomics-api-test.js
│   └── health-assessment/
│       └── health-assessment-api-test.js
└── e2e/                        # E2E tests
    ├── booking-with-health-check-test.js
    └── full-patient-journey-test.js

scenarios/
├── services/                    # Service-level scenarios
│   ├── booking/
│   │   ├── booking-smoke-test.js
│   │   └── booking-load-test.js
│   ├── genomics/
│   │   ├── genomics-smoke-test.js
│   │   └── genomics-load-test.js
│   └── health-assessment/
│       ├── health-assessment-smoke-test.js
│       └── health-assessment-load-test.js
└── e2e/                        # E2E scenarios
    └── full-system-e2e-test.js

config/
└── services-config.js          # Microservices configuration
```

## 🚀 Quick Start

### 1. Configure Service URLs

Set your service URLs in environment variables:

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

### 2. Run Service-Level Tests

```bash
# Booking service
npm run test:service:booking:smoke
npm run test:service:booking:load

# Genomics service
npm run test:service:genomics:smoke
npm run test:service:genomics:load

# Health Assessment service
npm run test:service:health:smoke
npm run test:service:health:load
```

### 3. Run E2E Tests

```bash
# Booking with health check flow
npm run test:e2e:booking-health

# Full patient journey (all services)
npm run test:e2e:full-journey

# All E2E flows
npm run test:e2e:all
```

## 📝 Available npm Scripts

### Service-Level Tests
- `test:service:booking:smoke` - Booking service smoke test
- `test:service:booking:load` - Booking service load test
- `test:service:genomics:smoke` - Genomics service smoke test
- `test:service:genomics:load` - Genomics service load test
- `test:service:health:smoke` - Health assessment smoke test
- `test:service:health:load` - Health assessment load test

### E2E Tests
- `test:e2e:booking-health` - Booking + Health Check flow
- `test:e2e:full-journey` - Full patient journey (all services)
- `test:e2e:all` - All E2E flows

## 🔧 Configuration

All service configuration is in `config/services-config.js`:

- Service URLs (from environment variables)
- API versions
- Service-specific thresholds
- Endpoint definitions

## 📚 Documentation

- **MICROSERVICES_STRUCTURE.md** - Complete structure documentation
- **config/services-config.js** - Service configuration with comments
- **tests/api/services/** - Service test implementations
- **tests/api/e2e/** - E2E test implementations

## 🎯 Testing Strategy

### Development
1. Run service smoke tests after each service deployment
2. Run service load tests nightly
3. Run E2E smoke tests after all services deployed

### Production
1. Run service-level load tests per service
2. Run E2E load tests for complete system validation
3. Run stress tests to identify breaking points

## ✨ Next Steps

1. **Update service URLs** in environment variables
2. **Customize endpoints** in `config/services-config.js` to match your APIs
3. **Adjust thresholds** per service based on your requirements
4. **Add more services** following the same pattern
5. **Create custom E2E flows** for your specific use cases

## 📖 Example: Adding a New Service

1. Add service config to `config/services-config.js`
2. Create test file in `tests/api/services/{service-name}/`
3. Create scenarios in `scenarios/services/{service-name}/`
4. Add npm scripts to `package.json`

See `MICROSERVICES_STRUCTURE.md` for detailed instructions.

---

**Ready to test!** Start with service smoke tests to validate your setup, then move to load and E2E tests.

