import { SCENARIOS } from '../../../config/base-config.js';
import { testCreateAssessment, testGetAssessment, testListAssessments } from '../../../tests/api/services/health-assessment/health-assessment-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Health Assessment Service Smoke Test Scenario
 * Quick validation that health assessment service is working
 */

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.9']
  },
  scenarios: {
    health_assessment_smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke', service: 'health-assessment' }
    }
  }
};

export function setup() {
  console.log('Starting Health Assessment Service Smoke Test');
  const config = getServiceConfig('healthAssessment');
  console.log(`Health Assessment Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  console.log('Running health assessment service smoke test');
  
  // Quick validation tests
  const assessmentId = testCreateAssessment(data.serviceConfig);
  if (assessmentId) {
    testGetAssessment(data.serviceConfig, assessmentId);
  }
  testListAssessments(data.serviceConfig);
}

export function teardown(data) {
  console.log('Health Assessment Service Smoke Test Completed Successfully');
}

