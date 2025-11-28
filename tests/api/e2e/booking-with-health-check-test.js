import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig, E2E_FLOWS } from '../../../config/services-config.js';
import { makeRequest } from '../../../utils/helpers.js';
import { defaultMonitor } from '../../../utils/performance-monitor.js';
import { testCreateAssessment, testSubmitAssessment, testGetResults } from '../services/health-assessment/health-assessment-api-test.js';
import { testCreateBooking, testGetBooking } from '../services/booking/booking-api-test.js';

/**
 * E2E Test: Booking with Health Check Flow
 * Tests the complete flow of creating a health assessment and booking
 */

export const options = {
  thresholds: Object.assign(
    {},
    getServiceConfig('booking').THRESHOLDS,
    getServiceConfig('healthAssessment').THRESHOLDS,
    {
      http_req_duration: ['p(95)<1500', 'p(99)<3000'],
      http_req_failed: ['rate<0.1']
    }
  ),
  scenarios: {
    e2e_booking_health_check: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '2m', target: 2 },
        { duration: '30s', target: 0 }
      ]
    }
  }
};

export function setup() {
  console.log('Starting E2E Test: Booking with Health Check');
  console.log('This test simulates a complete patient journey');
  
  return {
    testStartTime: new Date().toISOString(),
    flow: E2E_FLOWS.bookingWithHealthCheck
  };
}

export default function(data) {
  console.log('Running E2E booking with health check flow');
  
  let assessmentId = null;
  let bookingId = null;
  
  try {
    // Step 1: Create health assessment
    console.log('Step 1: Creating health assessment...');
    const healthConfig = getServiceConfig('healthAssessment');
    assessmentId = testCreateAssessment(healthConfig);
    
    if (!assessmentId) {
      console.error('Failed to create assessment');
      return;
    }
    
    sleep(1);
    
    // Step 2: Create booking
    console.log('Step 2: Creating booking...');
    const bookingConfig = getServiceConfig('booking');
    bookingId = testCreateBooking(bookingConfig);
    
    if (!bookingId) {
      console.error('Failed to create booking');
      return;
    }
    
    sleep(1);
    
    // Step 3: Submit assessment
    console.log('Step 3: Submitting health assessment...');
    testSubmitAssessment(healthConfig, assessmentId);
    sleep(2);
    
    // Step 4: Get booking details
    console.log('Step 4: Retrieving booking details...');
    testGetBooking(bookingConfig, bookingId);
    sleep(1);
    
    // Step 5: Get assessment results
    console.log('Step 5: Retrieving assessment results...');
    testGetResults(healthConfig, assessmentId);
    
    console.log('E2E flow completed successfully');
    
  } catch (error) {
    console.error(`E2E flow error: ${error.message}`);
  }
}

export function teardown(data) {
  console.log('E2E Booking with Health Check Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
  console.log(`Error rate: ${((stats.errors.length / stats.totalRequests) * 100).toFixed(2)}%`);
}

