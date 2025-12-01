import { BASE_CONFIG, SCENARIOS } from '../config/base-config.ts';
import { default as restApiTest } from '../tests/api/rest-api-test.ts';
import { default as authTest } from '../tests/api/auth-test.ts';

/**
 * API Load Test Scenario
 * Moderate load testing to validate performance under normal usage
 */

export const options = {
  thresholds: Object.assign({}, BASE_CONFIG.THRESHOLDS, {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>20'],
    checks: ['rate>0.9']
  }),
  scenarios: {
    rest_api_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testRestAPI'
    }),
    auth_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testAuthentication',
      startTime: '30s' // Start auth tests 30s after REST API tests
    })
  }
};

export function setup() {
  console.log('Starting API Load Test');
  console.log(`Base URL: ${BASE_CONFIG.BASE_URL}`);
  console.log(`API Base URL: ${BASE_CONFIG.API_BASE_URL}`);
  
  return {
    baseUrl: BASE_CONFIG.BASE_URL,
    apiBaseUrl: BASE_CONFIG.API_BASE_URL,
    testStartTime: new Date().toISOString()
  };
}

export function testRestAPI(data) {
  // Run REST API tests with load
  restApiTest(data);
}

export function testAuthentication(data) {
  // Run authentication tests with load
  authTest(data);
}

export default function(data) {
  // This function won't be called due to custom exec functions in scenarios
  console.log('API Load Test - Default function called (should not happen)');
}

export function teardown(data) {
  console.log('API Load Test Completed');
  console.log('Load Test Summary:');
  console.log('- REST API: Moderate load validation');
  console.log('- Authentication: User session management under load');
}

