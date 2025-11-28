import { sleep } from 'k6';
import { getServiceConfig, E2E_FLOWS } from '../../../config/services-config.js';
import { defaultMonitor } from '../../../utils/performance-monitor.js';
import { testCreateAssessment, testSubmitAssessment, testGetResults } from '../services/health-assessment/health-assessment-api-test.js';
import { testUploadSequence, testAnalyzeSequence, testGetResults as getGenomicsResults } from '../services/genomics/genomics-api-test.js';
import { testCreateBooking, testGetBooking } from '../services/booking/booking-api-test.js';

/**
 * E2E Test: Full Patient Journey
 * Tests the complete flow across all three services
 * Health Assessment → Genomics Analysis → Booking
 */

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<6000'],
    http_req_failed: ['rate<0.15'],
    checks: ['rate>0.85']
  },
  scenarios: {
    e2e_full_patient_journey: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 1 },
        { duration: '3m', target: 1 },
        { duration: '30s', target: 0 }
      ]
    }
  }
};

export function setup() {
  console.log('Starting E2E Test: Full Patient Journey');
  console.log('This test simulates a complete patient journey across all services');
  console.log('Flow: Health Assessment → Genomics → Booking');
  
  return {
    testStartTime: new Date().toISOString(),
    flow: E2E_FLOWS.fullPatientJourney
  };
}

export default function(data) {
  console.log('Running full patient journey E2E flow');
  
  let assessmentId = null;
  let sequenceId = null;
  let bookingId = null;
  
  try {
    // Phase 1: Health Assessment
    console.log('Phase 1: Creating health assessment...');
    const healthConfig = getServiceConfig('healthAssessment');
    assessmentId = testCreateAssessment(healthConfig);
    sleep(1);
    
    // Phase 2: Genomics Upload
    console.log('Phase 2: Uploading genomics sequence...');
    const genomicsConfig = getServiceConfig('genomics');
    sequenceId = testUploadSequence(genomicsConfig);
    sleep(2);
    
    // Phase 3: Submit Assessment
    console.log('Phase 3: Submitting health assessment...');
    if (assessmentId) {
      testSubmitAssessment(healthConfig, assessmentId);
    }
    sleep(2);
    
    // Phase 4: Analyze Sequence
    console.log('Phase 4: Analyzing genomics sequence...');
    if (sequenceId) {
      testAnalyzeSequence(genomicsConfig, sequenceId);
    }
    sleep(3);
    
    // Phase 5: Create Booking
    console.log('Phase 5: Creating booking...');
    const bookingConfig = getServiceConfig('booking');
    bookingId = testCreateBooking(bookingConfig);
    sleep(1);
    
    // Phase 6: Get All Results
    console.log('Phase 6: Retrieving all results...');
    if (assessmentId) {
      testGetResults(healthConfig, assessmentId);
    }
    sleep(1);
    
    if (sequenceId) {
      getGenomicsResults(genomicsConfig, sequenceId);
    }
    sleep(1);
    
    if (bookingId) {
      testGetBooking(bookingConfig, bookingId);
    }
    
    console.log('Full patient journey completed successfully');
    
  } catch (error) {
    console.error(`E2E flow error: ${error.message}`);
  }
}

export function teardown(data) {
  console.log('E2E Full Patient Journey Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
  console.log(`Error rate: ${((stats.errors.length / stats.totalRequests) * 100).toFixed(2)}%`);
  console.log('Services tested: Health Assessment, Genomics, Booking');
}

