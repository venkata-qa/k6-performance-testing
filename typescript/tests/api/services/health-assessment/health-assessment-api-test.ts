import http from 'k6/http';
import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.ts';
import { makeRequest, validateResponse } from '../../../../utils/helpers.ts';
import { defaultMonitor } from '../../../../utils/performance-monitor.ts';

/**
 * Health Assessment Service API Tests
 * Tests all health assessment service endpoints
 */

export const options = {
  thresholds: getServiceConfig('healthAssessment').THRESHOLDS,
  scenarios: {
    health_assessment_api_test: {
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
  console.log('Starting Health Assessment Service API Test');
  const config = getServiceConfig('healthAssessment');
  console.log(`Health Assessment Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  const testStartTime = Date.now();
  
  // Test 1: Create assessment
  const assessmentId = testCreateAssessment(data.serviceConfig);
  sleep(1);
  
  // Test 2: Get assessment
  if (assessmentId) {
    testGetAssessment(assessmentId);
    sleep(1);
  }
  
  // Test 3: Update assessment
  if (assessmentId) {
    testUpdateAssessment(assessmentId);
    sleep(1);
  }
  
  // Test 4: Submit assessment
  if (assessmentId) {
    testSubmitAssessment(assessmentId);
    sleep(2);
  }
  
  // Test 5: Get results
  if (assessmentId) {
    testGetResults(assessmentId);
    sleep(1);
  }
  
  // Test 6: List assessments
  testListAssessments(data.serviceConfig);
  sleep(1);
}

/**
 * Test create assessment endpoint
 */
export function testCreateAssessment(data) {  const url = getServiceUrl('healthAssessment', 'createAssessment');
  const assessmentData = {
    patientId: `patient_${Math.floor(Math.random() * 1000)}`,
    assessmentType: 'general',
    questions: [
      { id: 1, answer: 'yes' },
      { id: 2, answer: 'no' },
      { id: 3, answer: 'sometimes' }
    ]
  };
  
  const response = makeRequest('POST', url, JSON.stringify(assessmentData));
  
  check(response, {
    'create assessment status is 201': (r) => r.status === 201,
    'create assessment response time < 800ms': (r) => r.timings.duration < 800,
    'create assessment returns ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_create', Date.now());
  
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

/**
 * Test get assessment endpoint
 */
export function testGetAssessment(assessmentId) {
  const url = getServiceUrl('healthAssessment', 'getAssessment', { id: assessmentId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'get assessment status is 200': (r) => r.status === 200,
    'get assessment response time < 600ms': (r) => r.timings.duration < 600
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_get', Date.now());
}

/**
 * Test update assessment endpoint
 */
export function testUpdateAssessment(assessmentId) {
  const url = getServiceUrl('healthAssessment', 'updateAssessment', { id: assessmentId });
  const updateData = {
    questions: [
      { id: 1, answer: 'yes' },
      { id: 2, answer: 'yes' },
      { id: 3, answer: 'no' }
    ]
  };
  
  const response = makeRequest('PUT', url, JSON.stringify(updateData));
  
  check(response, {
    'update assessment status is 200': (r) => r.status === 200,
    'update assessment response time < 700ms': (r) => r.timings.duration < 700
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_update', Date.now());
}

/**
 * Test submit assessment endpoint
 */
export function testSubmitAssessment(assessmentId) {
  const url = getServiceUrl('healthAssessment', 'submitAssessment', { id: assessmentId });
  const response = makeRequest('POST', url);
  
  check(response, {
    'submit assessment status is 200': (r) => r.status === 200,
    'submit assessment response time < 1000ms': (r) => r.timings.duration < 1000
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_submit', Date.now());
}

/**
 * Test get results endpoint
 */
export function testGetResults(assessmentId) {
  const url = getServiceUrl('healthAssessment', 'getResults', { id: assessmentId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'get results status is 200': (r) => r.status === 200,
    'get results response time < 800ms': (r) => r.timings.duration < 800
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_get_results', Date.now());
}

/**
 * Test list assessments endpoint
 */
export function testListAssessments(data) {
  const url = getServiceUrl('healthAssessment', 'listAssessments');
  const response = makeRequest('GET', url);
  
  check(response, {
    'list assessments status is 200': (r) => r.status === 200,
    'list assessments response time < 600ms': (r) => r.timings.duration < 600
  });
  
  defaultMonitor.trackRequest(response, 'health_assessment_list', Date.now());
}

export function teardown(data) {
  console.log('Health Assessment Service API Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
}

