import { SCENARIOS } from '../../../config/base-config.ts';
import { default as genomicsTest } from '../../../tests/api/services/genomics/genomics-api-test.ts';
import { getServiceConfig } from '../../../config/services-config.ts';

/**
 * Genomics Service Load Test Scenario
 * Moderate load testing for genomics service
 */

export const options = {
  thresholds: Object.assign({}, getServiceConfig('genomics').THRESHOLDS, {
    http_req_duration: ['p(95)<2500', 'p(99)<5000'],
    http_req_failed: ['rate<0.05']
  }),
  scenarios: {
    genomics_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testGenomicsService'
    })
  }
};

export function setup() {
  console.log('Starting Genomics Service Load Test');
  const config = getServiceConfig('genomics');
  console.log(`Genomics Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export function testGenomicsService(data) {
  // Run genomics service tests with load
  genomicsTest(data);
}

export default function() {
  console.log('Genomics Service Load Test - Default function (should not be called)');
}

export function teardown() {
  console.log('Genomics Service Load Test Completed');
  console.log('Load Test Summary:');
  console.log('- Sequence upload performance validated');
  console.log('- Sequence analysis performance validated');
  console.log('- Results retrieval performance validated');
}

