import { SCENARIOS } from '../../../config/base-config.ts';
import { default as healthAssessmentTest } from '../../../tests/api/services/health-assessment/health-assessment-api-test.ts';
import { getServiceConfig } from '../../../config/services-config.ts';

/**
 * Health Assessment Service Load Test Scenario
 * Moderate load testing for health assessment service
 */

export const options = {
  thresholds: Object.assign({}, getServiceConfig('healthAssessment').THRESHOLDS, {
    http_req_duration: ['p(95)<900', 'p(99)<1800'],
    http_req_failed: ['rate<0.05']
  }),
  scenarios: {
    health_assessment_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testHealthAssessmentService'
    })
  }
};

export function setup() {
  console.log('Starting Health Assessment Service Load Test');
  const config = getServiceConfig('healthAssessment');
  console.log(`Health Assessment Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export function testHealthAssessmentService(data) {
  // Run health assessment service tests with load
  healthAssessmentTest(data);
}

export default function() {
  console.log('Health Assessment Service Load Test - Default function (should not be called)');
}

export function teardown() {
  console.log('Health Assessment Service Load Test Completed');
  console.log('Load Test Summary:');
  console.log('- Assessment creation performance validated');
  console.log('- Assessment submission performance validated');
  console.log('- Results retrieval performance validated');
}

