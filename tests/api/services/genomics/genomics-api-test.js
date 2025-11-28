import http from 'k6/http';
import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest, validateResponse } from '../../../../utils/helpers.js';
import { defaultMonitor } from '../../../../utils/performance-monitor.js';

/**
 * Genomics Service API Tests
 * Tests all genomics service endpoints
 */

export const options = {
  thresholds: getServiceConfig('genomics').THRESHOLDS,
  scenarios: {
    genomics_api_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '1m', target: 2 },
        { duration: '30s', target: 0 }
      ]
    }
  }
};

export function setup() {
  console.log('Starting Genomics Service API Test');
  const config = getServiceConfig('genomics');
  console.log(`Genomics Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  const testStartTime = Date.now();
  
  // Test 1: Upload sequence
  const sequenceId = testUploadSequence(data.serviceConfig);
  sleep(2);
  
  // Test 2: Analyze sequence (if upload succeeded)
  if (sequenceId) {
    testAnalyzeSequence(data.serviceConfig, sequenceId);
    sleep(3); // Genomics analysis takes longer
  }
  
  // Test 3: List sequences
  testListSequences(data.serviceConfig);
  sleep(1);
  
  // Test 4: Get results (if we have a sequence ID)
  if (sequenceId) {
    testGetResults(data.serviceConfig, sequenceId);
    sleep(1);
  }
}

/**
 * Test upload sequence endpoint
 */
export function testUploadSequence(serviceConfig) {
  const url = getServiceUrl('genomics', 'uploadSequence');
  const sequenceData = {
    sequence: generateMockSequence(),
    name: `test_sequence_${Date.now()}`,
    type: 'DNA'
  };
  
  const response = makeRequest('POST', url, JSON.stringify(sequenceData));
  
  check(response, {
    'upload sequence status is 201': (r) => r.status === 201,
    'upload sequence response time < 3000ms': (r) => r.timings.duration < 3000,
    'upload sequence returns ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'genomics_upload', Date.now());
  
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
 * Test analyze sequence endpoint
 */
export function testAnalyzeSequence(serviceConfig, sequenceId) {
  const url = getServiceUrl('genomics', 'analyzeSequence', { id: sequenceId });
  const response = makeRequest('POST', url);
  
  check(response, {
    'analyze sequence status is 202': (r) => r.status === 202 || r.status === 200,
    'analyze sequence response time < 5000ms': (r) => r.timings.duration < 5000
  });
  
  defaultMonitor.trackRequest(response, 'genomics_analyze', Date.now());
}

/**
 * Test get results endpoint
 */
export function testGetResults(serviceConfig, resultId) {
  const url = getServiceUrl('genomics', 'getResults', { id: resultId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'get results status is 200': (r) => r.status === 200,
    'get results response time < 2000ms': (r) => r.timings.duration < 2000,
    'get results returns data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && (body.status !== undefined || body.results !== undefined);
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'genomics_get_results', Date.now());
}

/**
 * Test list sequences endpoint
 */
export function testListSequences(serviceConfig) {
  const url = getServiceUrl('genomics', 'listSequences');
  const response = makeRequest('GET', url);
  
  check(response, {
    'list sequences status is 200': (r) => r.status === 200,
    'list sequences response time < 1500ms': (r) => r.timings.duration < 1500
  });
  
  defaultMonitor.trackRequest(response, 'genomics_list', Date.now());
}

/**
 * Generate mock DNA sequence for testing
 */
function generateMockSequence() {
  const bases = ['A', 'T', 'G', 'C'];
  let sequence = '';
  for (let i = 0; i < 100; i++) {
    sequence += bases[Math.floor(Math.random() * bases.length)];
  }
  return sequence;
}

export function teardown(data) {
  console.log('Genomics Service API Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
}

