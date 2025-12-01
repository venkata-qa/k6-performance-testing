import { BASE_CONFIG, SCENARIOS } from '../../config/base-config.ts';
import { default as fullJourneyTest } from '../../tests/api/e2e/full-patient-journey-test.ts';
import { default as bookingHealthTest } from '../../tests/api/e2e/booking-with-health-check-test.ts';

/**
 * Full System E2E Test Scenario
 * Comprehensive end-to-end testing across all services
 */

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<4000', 'p(99)<8000'],
    http_req_failed: ['rate<0.2'],
    checks: ['rate>0.8']
  },
  scenarios: {
    booking_health_flow: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 1 },
        { duration: '2m', target: 1 },
        { duration: '30s', target: 0 }
      ],
      exec: 'testBookingHealthFlow',
      startTime: '0s'
    },
    full_patient_journey: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 1 },
        { duration: '3m', target: 1 },
        { duration: '30s', target: 0 }
      ],
      exec: 'testFullPatientJourney',
      startTime: '2m'
    }
  }
};

export function setup() {
  console.log('Starting Full System E2E Test');
  console.log('This test runs multiple E2E flows across all services');
  
  return {
    testStartTime: new Date().toISOString()
  };
}

export function testBookingHealthFlow(data) {
  // Run booking with health check E2E flow
  bookingHealthTest(data);
}

export function testFullPatientJourney(data) {
  // Run full patient journey E2E flow
  fullJourneyTest(data);
}

export default function() {
  console.log('Full System E2E Test - Default function (should not be called)');
}

export function teardown() {
  console.log('Full System E2E Test Completed');
  console.log('E2E Test Summary:');
  console.log('- Booking with Health Check flow validated');
  console.log('- Full Patient Journey flow validated');
  console.log('- Cross-service integration validated');
}

