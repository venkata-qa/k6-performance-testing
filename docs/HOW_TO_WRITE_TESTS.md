# How to Write Test Cases and Scenarios

A comprehensive guide to writing test cases and scenarios in the k6 Performance Testing Framework.

## 📚 Table of Contents

1. [Understanding the Structure](#understanding-the-structure)
2. [Writing Test Cases](#writing-test-cases)
3. [Writing Scenarios](#writing-scenarios)
4. [Configuration Setup](#configuration-setup)
5. [Using Helper Functions](#using-helper-functions)
6. [Complete Examples](#complete-examples)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Understanding the Structure

### Test Case vs Scenario

**Test Case (`/tests`)** = **WHAT** to test
- Contains test logic
- Makes HTTP requests
- Validates responses
- Reusable functions

**Scenario (`/scenarios`)** = **HOW** to run tests
- Defines load patterns
- Sets thresholds
- Orchestrates execution
- Imports test functions

### File Organization

```
tests/
└── api/
    └── services/
        └── your-service/
            └── your-service-api-test.js    ← Test Case

scenarios/
└── services/
    └── your-service/
        ├── your-service-smoke-test.js      ← Scenario
        ├── your-service-load-test.js       ← Scenario
        └── your-service-stress-test.js     ← Scenario
```

---

## Writing Test Cases

### Step 1: Create Test File Structure

Create a new test file: `tests/api/services/your-service/your-service-api-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest, validateResponse } from '../../../../utils/helpers.js';
import { defaultMonitor } from '../../../../utils/performance-monitor.js';

/**
 * Your Service API Tests
 * Description of what this test file does
 */

export const options = {
  thresholds: getServiceConfig('yourService').THRESHOLDS,
  scenarios: {
    your_service_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 3 },
        { duration: '1m', target: 3 },
        { duration: '30s', target: 0 }
      ]
    }
  }
};

export function setup() {
  console.log('Starting Your Service API Test');
  const config = getServiceConfig('yourService');
  console.log(`Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  // Your test logic here
}

export function teardown(data) {
  console.log('Your Service API Test Completed');
}
```

### Step 2: Write Individual Test Functions

Each endpoint should have its own test function:

```javascript
/**
 * Test GET endpoint
 * @param {Object} serviceConfig - Service configuration object
 */
export function testGetEndpoint(serviceConfig) {
  // Step 1: Build URL
  const url = getServiceUrl('yourService', 'getEndpoint');
  
  // Step 2: Make request
  const response = makeRequest('GET', url);
  
  // Step 3: Validate response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Step 4: Track metrics (optional)
  defaultMonitor.trackRequest(response, 'your_service_get', Date.now());
}
```

### Step 3: Write POST/PUT/DELETE Tests

```javascript
/**
 * Test POST endpoint
 * @param {Object} serviceConfig - Service configuration
 * @returns {string|null} - Returns created ID if successful
 */
export function testCreateEndpoint(serviceConfig) {
  const url = getServiceUrl('yourService', 'createEndpoint');
  
  // Prepare request data
  const requestData = {
    name: `Test Item ${Date.now()}`,
    description: 'Test description',
    value: Math.floor(Math.random() * 100)
  };
  
  // Make request
  const response = makeRequest('POST', url, JSON.stringify(requestData));
  
  // Validate
  check(response, {
    'create status is 201': (r) => r.status === 201,
    'create response time < 800ms': (r) => r.timings.duration < 800,
    'create returns ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Return ID for use in other tests
  if (response.status === 201) {
    try {
      const body = JSON.parse(response.body);
      return body.id;
    } catch (e) {
      return null;
    }
  }
  return null;
}
```

### Step 4: Chain Tests Together

In the `default function`, chain your tests:

```javascript
export default function(data) {
  const testStartTime = Date.now();
  
  // Test 1: GET endpoint
  testGetEndpoint(data.serviceConfig);
  sleep(1);
  
  // Test 2: Create resource
  const resourceId = testCreateEndpoint(data.serviceConfig);
  sleep(1);
  
  // Test 3: Get created resource (if creation succeeded)
  if (resourceId) {
    testGetSpecificEndpoint(data.serviceConfig, resourceId);
    sleep(1);
  }
  
  // Test 4: Update resource
  if (resourceId) {
    testUpdateEndpoint(data.serviceConfig, resourceId);
    sleep(1);
  }
  
  // Test 5: List all resources
  testListEndpoints(data.serviceConfig);
}
```

### Step 5: Handle Errors Gracefully

```javascript
export default function(data) {
  try {
    const resourceId = testCreateEndpoint(data.serviceConfig);
    
    if (resourceId) {
      testGetSpecificEndpoint(data.serviceConfig, resourceId);
    } else {
      console.error('Failed to create resource, skipping dependent tests');
    }
  } catch (error) {
    console.error(`Test error: ${error.message}`);
    // Continue with other tests
  }
}
```

---

## Writing Scenarios

### Step 1: Create Scenario File

Create: `scenarios/services/your-service/your-service-load-test.js`

```javascript
import { BASE_CONFIG, SCENARIOS } from '../../../config/base-config.js';
import { default as yourServiceTest } from '../../../tests/api/services/your-service/your-service-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Your Service Load Test Scenario
 * Description of what this scenario tests
 */
```

### Step 2: Define Options and Scenarios

```javascript
export const options = {
  // Merge service thresholds with scenario-specific overrides
  thresholds: Object.assign({}, getServiceConfig('yourService').THRESHOLDS, {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>15']
  }),
  
  // Define scenarios
  scenarios: {
    your_service_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testYourService'  // Custom execution function
    })
  }
};
```

### Step 3: Setup Function

```javascript
export function setup() {
  console.log('Starting Your Service Load Test');
  const config = getServiceConfig('yourService');
  console.log(`Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}
```

### Step 4: Execution Function

```javascript
export function testYourService(data) {
  // Call the test file's default function
  yourServiceTest(data);
}
```

### Step 5: Teardown Function

```javascript
export function teardown(data) {
  console.log('Your Service Load Test Completed');
  console.log('Test Summary:');
  console.log('- Endpoint 1 performance validated');
  console.log('- Endpoint 2 performance validated');
}
```

### Complete Scenario Example

```javascript
import { BASE_CONFIG, SCENARIOS } from '../../../config/base-config.js';
import { default as yourServiceTest } from '../../../tests/api/services/your-service/your-service-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Your Service Load Test Scenario
 */

export const options = {
  thresholds: Object.assign({}, getServiceConfig('yourService').THRESHOLDS, {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.05']
  }),
  scenarios: {
    your_service_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testYourService'
    })
  }
};

export function setup() {
  console.log('Starting Your Service Load Test');
  const config = getServiceConfig('yourService');
  console.log(`Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export function testYourService(data) {
  yourServiceTest(data);
}

export default function(data) {
  console.log('Default function (should not be called)');
}

export function teardown(data) {
  console.log('Your Service Load Test Completed');
}
```

---

## Configuration Setup

### Step 1: Add Service to services-config.js

Edit `config/services-config.js`:

```javascript
export const SERVICES_CONFIG = {
  // ... existing services
  
  yourService: {
    BASE_URL: __ENV.YOUR_SERVICE_URL || 'https://your-service.example.com',
    API_VERSION: __ENV.YOUR_SERVICE_API_VERSION || 'v1',
    THRESHOLDS: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    ENDPOINTS: {
      getEndpoint: '/endpoint',
      createEndpoint: '/endpoint',
      getSpecificEndpoint: '/endpoint/{id}',
      updateEndpoint: '/endpoint/{id}',
      deleteEndpoint: '/endpoint/{id}',
      listEndpoints: '/endpoints'
    }
  }
};
```

### Step 2: Set Environment Variables

Add to `.env` or export:

```bash
export YOUR_SERVICE_URL=https://your-service-api.com
export YOUR_SERVICE_API_VERSION=v1
```

### Step 3: Use Configuration in Tests

```javascript
// Get service configuration
const config = getServiceConfig('yourService');

// Build URLs
const url = getServiceUrl('yourService', 'getEndpoint');
const urlWithParams = getServiceUrl('yourService', 'getSpecificEndpoint', { id: '123' });
```

---

## Using Helper Functions

### Available Helper Functions

#### 1. makeRequest()

Makes HTTP requests with default options:

```javascript
import { makeRequest } from '../../../../utils/helpers.js';

// GET request
const response = makeRequest('GET', url);

// POST request
const response = makeRequest('POST', url, JSON.stringify(data));

// PUT request with custom headers
const response = makeRequest('PUT', url, JSON.stringify(data), {
  'Authorization': 'Bearer token123'
});
```

#### 2. validateResponse()

Validates response with common checks:

```javascript
import { validateResponse } from '../../../../utils/helpers.js';

const response = makeRequest('GET', url);
validateResponse(response, 200);  // Expects status 200
```

#### 3. generateRandomData()

Generates random test data:

```javascript
import { generateRandomData } from '../../../../utils/helpers.js';

const data = generateRandomData();
// Returns: { id, title, body, userId, timestamp }
```

#### 4. generateRandomUser()

Generates random user credentials:

```javascript
import { generateRandomUser } from '../../../../utils/helpers.js';

const user = generateRandomUser();
// Returns: { username, password, email, name }
```

#### 5. authenticateUser()

Authenticates and returns token:

```javascript
import { authenticateUser } from '../../../../utils/helpers.js';

const token = authenticateUser('username', 'password');
if (token) {
  // Use token for authenticated requests
}
```

#### 6. makeAuthenticatedRequest()

Makes authenticated requests:

```javascript
import { makeAuthenticatedRequest } from '../../../../utils/helpers.js';

const response = makeAuthenticatedRequest('GET', url, token);
```

#### 7. simulateUserBehavior()

Adds realistic delays:

```javascript
import { simulateUserBehavior } from '../../../../utils/helpers.js';

// Before making request
simulateUserBehavior();  // Random delay between 0.5-3 seconds
const response = makeRequest('GET', url);
```

### Performance Monitor

Track requests and get statistics:

```javascript
import { defaultMonitor } from '../../../../utils/performance-monitor.js';

// Track a request
defaultMonitor.trackRequest(response, 'test_name', startTime);

// Get statistics
const stats = defaultMonitor.getStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Average response time: ${stats.avgResponseTime}ms`);
```

---

## Complete Examples

### Example 1: Simple GET Test

```javascript
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest } from '../../../../utils/helpers.js';
import { check } from 'k6';

export function testGetUsers(serviceConfig) {
  const url = getServiceUrl('yourService', 'listUsers');
  const response = makeRequest('GET', url);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'returns array': (r) => {
      try {
        return Array.isArray(JSON.parse(r.body));
      } catch (e) {
        return false;
      }
    }
  });
}
```

### Example 2: POST with Data Validation

```javascript
export function testCreateUser(serviceConfig) {
  const url = getServiceUrl('yourService', 'createUser');
  const userData = {
    name: `User ${Date.now()}`,
    email: `user${Date.now()}@example.com`,
    role: 'member'
  };
  
  const response = makeRequest('POST', url, JSON.stringify(userData));
  
  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 800ms': (r) => r.timings.duration < 800,
    'returns user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.email === userData.email;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Return created user ID
  if (response.status === 201) {
    try {
      return JSON.parse(response.body).id;
    } catch (e) {
      return null;
    }
  }
  return null;
}
```

### Example 3: Test with Path Parameters

```javascript
export function testGetUserById(serviceConfig, userId) {
  // Use getServiceUrl with parameters
  const url = getServiceUrl('yourService', 'getUser', { id: userId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'returns correct user': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id === userId;
      } catch (e) {
        return false;
      }
    }
  });
}
```

### Example 4: Complete Test File

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest } from '../../../../utils/helpers.js';
import { defaultMonitor } from '../../../../utils/performance-monitor.js';

/**
 * Your Service API Tests
 */

export const options = {
  thresholds: getServiceConfig('yourService').THRESHOLDS,
  scenarios: {
    your_service_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 3 },
        { duration: '1m', target: 3 },
        { duration: '30s', target: 0 }
      ]
    }
  }
};

export function setup() {
  console.log('Starting Your Service API Test');
  const config = getServiceConfig('yourService');
  console.log(`Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  const startTime = Date.now();
  
  // Test 1: List users
  testListUsers(data.serviceConfig);
  sleep(1);
  
  // Test 2: Create user
  const userId = testCreateUser(data.serviceConfig);
  sleep(1);
  
  // Test 3: Get user (if created)
  if (userId) {
    testGetUser(data.serviceConfig, userId);
    sleep(1);
    
    // Test 4: Update user
    testUpdateUser(data.serviceConfig, userId);
    sleep(1);
    
    // Test 5: Delete user
    testDeleteUser(data.serviceConfig, userId);
  }
}

export function testListUsers(serviceConfig) {
  const url = getServiceUrl('yourService', 'listUsers');
  const response = makeRequest('GET', url);
  
  check(response, {
    'list users status is 200': (r) => r.status === 200,
    'list users response time < 500ms': (r) => r.timings.duration < 500
  });
  
  defaultMonitor.trackRequest(response, 'list_users', Date.now());
}

export function testCreateUser(serviceConfig) {
  const url = getServiceUrl('yourService', 'createUser');
  const userData = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`
  };
  
  const response = makeRequest('POST', url, JSON.stringify(userData));
  
  check(response, {
    'create user status is 201': (r) => r.status === 201,
    'create user returns ID': (r) => {
      try {
        return JSON.parse(r.body).id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (response.status === 201) {
    try {
      return JSON.parse(response.body).id;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function testGetUser(serviceConfig, userId) {
  const url = getServiceUrl('yourService', 'getUser', { id: userId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'get user status is 200': (r) => r.status === 200,
    'get user returns correct ID': (r) => {
      try {
        return JSON.parse(r.body).id === userId;
      } catch (e) {
        return false;
      }
    }
  });
}

export function testUpdateUser(serviceConfig, userId) {
  const url = getServiceUrl('yourService', 'updateUser', { id: userId });
  const updateData = { name: 'Updated Name' };
  
  const response = makeRequest('PUT', url, JSON.stringify(updateData));
  
  check(response, {
    'update user status is 200': (r) => r.status === 200
  });
}

export function testDeleteUser(serviceConfig, userId) {
  const url = getServiceUrl('yourService', 'deleteUser', { id: userId });
  const response = makeRequest('DELETE', url);
  
  check(response, {
    'delete user status is 200': (r) => r.status === 200 || r.status === 204
  });
}

export function teardown(data) {
  console.log('Your Service API Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
}
```

### Example 5: Complete Scenario File

```javascript
import { BASE_CONFIG, SCENARIOS } from '../../../config/base-config.js';
import { default as yourServiceTest } from '../../../tests/api/services/your-service/your-service-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Your Service Load Test Scenario
 */

export const options = {
  thresholds: Object.assign({}, getServiceConfig('yourService').THRESHOLDS, {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>15']
  }),
  scenarios: {
    your_service_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testYourService'
    })
  }
};

export function setup() {
  console.log('Starting Your Service Load Test');
  const config = getServiceConfig('yourService');
  console.log(`Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export function testYourService(data) {
  yourServiceTest(data);
}

export default function(data) {
  console.log('Default function (should not be called)');
}

export function teardown(data) {
  console.log('Your Service Load Test Completed');
  console.log('Load Test Summary:');
  console.log('- User creation performance validated');
  console.log('- User retrieval performance validated');
  console.log('- User update performance validated');
}
```

---

## Best Practices

### Test Case Best Practices

1. **One function per endpoint**
   ```javascript
   // ✅ Good
   export function testCreateUser() { ... }
   export function testGetUser() { ... }
   
   // ❌ Bad
   export function testAllUserEndpoints() { ... }
   ```

2. **Make functions reusable**
   ```javascript
   // ✅ Good - Can be imported
   export function testCreateUser(serviceConfig) { ... }
   
   // ❌ Bad - Hard to reuse
   function testCreateUser() { ... }
   ```

3. **Return values for chaining**
   ```javascript
   // ✅ Good - Returns ID for use in other tests
   export function testCreateUser(serviceConfig) {
     // ... create user
     return userId;
   }
   ```

4. **Validate thoroughly**
   ```javascript
   check(response, {
     'status is correct': (r) => r.status === 201,
     'response time acceptable': (r) => r.timings.duration < 800,
     'response has required fields': (r) => {
       const body = JSON.parse(r.body);
       return body.id && body.email;
     }
   });
   ```

5. **Handle errors gracefully**
   ```javascript
   try {
     const body = JSON.parse(response.body);
     return body.id;
   } catch (e) {
     console.error('Failed to parse response');
     return null;
   }
   ```

6. **Use descriptive function names**
   ```javascript
   // ✅ Good
   testCreateBooking()
   testGetBookingById()
   
   // ❌ Bad
   test1()
   testBooking()
   ```

### Scenario Best Practices

1. **Use SCENARIOS from base-config**
   ```javascript
   // ✅ Good
   Object.assign({}, SCENARIOS.LOAD, { exec: 'testFunction' })
   
   // ❌ Bad
   { executor: 'ramping-vus', startVUs: 1, ... }  // Duplicated
   ```

2. **Set appropriate thresholds**
   ```javascript
   // ✅ Good - Service-specific thresholds
   thresholds: Object.assign({}, getServiceConfig('service').THRESHOLDS, {
     http_req_duration: ['p(95)<600']
   })
   ```

3. **Use custom exec functions**
   ```javascript
   // ✅ Good
   scenarios: {
     my_test: { exec: 'testMyService' }
   }
   
   export function testMyService(data) {
     myTest(data);
   }
   ```

4. **Provide clear teardown messages**
   ```javascript
   export function teardown(data) {
     console.log('Test Summary:');
     console.log('- Endpoint 1 validated');
     console.log('- Endpoint 2 validated');
   }
   ```

---

## Common Patterns

### Pattern 1: CRUD Operations

```javascript
export default function(data) {
  // Create
  const id = testCreate(data.serviceConfig);
  sleep(1);
  
  // Read
  if (id) {
    testRead(data.serviceConfig, id);
    sleep(1);
  }
  
  // Update
  if (id) {
    testUpdate(data.serviceConfig, id);
    sleep(1);
  }
  
  // Delete
  if (id) {
    testDelete(data.serviceConfig, id);
  }
}
```

### Pattern 2: Authentication Flow

```javascript
export default function(data) {
  // Step 1: Login
  const token = testLogin(data.serviceConfig);
  sleep(1);
  
  // Step 2: Use token for authenticated requests
  if (token) {
    testAuthenticatedEndpoint(data.serviceConfig, token);
    sleep(1);
  }
  
  // Step 3: Validate token
  if (token) {
    testValidateToken(data.serviceConfig, token);
  }
}
```

### Pattern 3: List then Detail

```javascript
export default function(data) {
  // Step 1: List all items
  const items = testListItems(data.serviceConfig);
  sleep(1);
  
  // Step 2: Get details of first item
  if (items && items.length > 0) {
    testGetItemDetails(data.serviceConfig, items[0].id);
  }
}
```

### Pattern 4: Conditional Testing

```javascript
export default function(data) {
  const resourceId = testCreateResource(data.serviceConfig);
  
  if (resourceId) {
    // Only run these if creation succeeded
    testGetResource(data.serviceConfig, resourceId);
    testUpdateResource(data.serviceConfig, resourceId);
    testDeleteResource(data.serviceConfig, resourceId);
  } else {
    console.error('Resource creation failed, skipping dependent tests');
  }
}
```

### Pattern 5: Error Handling

```javascript
export default function(data) {
  try {
    const id = testCreate(data.serviceConfig);
    if (id) {
      testGet(data.serviceConfig, id);
    }
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    // Continue with other tests
  }
  
  // Always run this test
  testList(data.serviceConfig);
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Import Path Errors

**Error:**
```
Cannot find module '../../../../config/services-config.js'
```

**Solution:**
- Count directory levels correctly
- From `tests/api/services/your-service/` you need `../../../../` to reach root
- Use absolute paths if needed

#### Issue 2: Service Not Found

**Error:**
```
Service yourService not found
```

**Solution:**
- Check service name in `services-config.js` matches exactly (case-sensitive)
- Verify service is added to `SERVICES_CONFIG` object

#### Issue 3: Endpoint Not Found

**Error:**
```
Endpoint getEndpoint not found for service yourService
```

**Solution:**
- Check endpoint key exists in service's `ENDPOINTS` object
- Verify spelling matches exactly

#### Issue 4: Response Parsing Errors

**Error:**
```
JSON.parse error
```

**Solution:**
```javascript
// ✅ Good - Always wrap in try-catch
try {
  const body = JSON.parse(response.body);
  return body.id;
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  return null;
}
```

#### Issue 5: Tests Not Running

**Problem:** Scenario doesn't execute test functions

**Solution:**
- Ensure `exec` property points to correct function name
- Function must be exported
- Check function signature matches: `export function testName(data) { }`

#### Issue 6: Threshold Failures

**Problem:** Tests fail due to threshold violations

**Solution:**
- Adjust thresholds in service config
- Check if service is actually slow or if threshold is too strict
- Use environment-specific thresholds

---

## Quick Reference

### Test Case Template

```javascript
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest } from '../../../../utils/helpers.js';
import { check } from 'k6';

export function testYourEndpoint(serviceConfig) {
  const url = getServiceUrl('yourService', 'yourEndpoint');
  const response = makeRequest('GET', url);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
  
  return response;  // Optional: return for chaining
}
```

### Scenario Template

```javascript
import { SCENARIOS } from '../../../config/base-config.js';
import { default as yourTest } from '../../../tests/api/services/your-service/your-service-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

export const options = {
  thresholds: getServiceConfig('yourService').THRESHOLDS,
  scenarios: {
    your_scenario: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testYourService'
    })
  }
};

export function setup() {
  return { serviceConfig: getServiceConfig('yourService') };
}

export function testYourService(data) {
  yourTest(data);
}

export function teardown(data) {
  console.log('Test completed');
}
```

### Configuration Template

```javascript
// In config/services-config.js
yourService: {
  BASE_URL: __ENV.YOUR_SERVICE_URL || 'https://default-url.com',
  API_VERSION: 'v1',
  THRESHOLDS: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05']
  },
  ENDPOINTS: {
    yourEndpoint: '/endpoint',
    yourEndpointWithParam: '/endpoint/{id}'
  }
}
```

---

## Next Steps

1. **Start with a simple test** - Create one GET endpoint test
2. **Add more endpoints** - Expand to full CRUD operations
3. **Create scenarios** - Add smoke, load, and stress scenarios
4. **Add to npm scripts** - Update `package.json` with new test commands
5. **Test and iterate** - Run tests, adjust thresholds, improve coverage

---

## Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 JavaScript API](https://k6.io/docs/javascript-api/)
- [MICROSERVICES_STRUCTURE.md](./MICROSERVICES_STRUCTURE.md) - Framework structure
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project organization

---

**Happy Testing!** 🚀

