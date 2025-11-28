import { SCENARIOS } from '../../../config/base-config.js';
import { testUploadSequence, testListSequences } from '../../../tests/api/services/genomics/genomics-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Genomics Service Smoke Test Scenario
 * Quick validation that genomics service is working
 */

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.8']
  },
  scenarios: {
    genomics_smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke', service: 'genomics' }
    }
  }
};

export function setup() {
  console.log('Starting Genomics Service Smoke Test');
  const config = getServiceConfig('genomics');
  console.log(`Genomics Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  console.log('Running genomics service smoke test');
  
  // Quick validation tests
  testUploadSequence(data.serviceConfig);
  testListSequences(data.serviceConfig);
}

export function teardown(data) {
  console.log('Genomics Service Smoke Test Completed Successfully');
}

