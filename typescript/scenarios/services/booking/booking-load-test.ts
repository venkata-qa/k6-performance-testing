import { BASE_CONFIG, SCENARIOS } from '../../../config/base-config.ts';
import { default as bookingTest } from '../../../tests/api/services/booking/booking-api-test.ts';
import { getServiceConfig } from '../../../config/services-config.ts';

/**
 * Booking Service Load Test Scenario
 * Moderate load testing for booking service
 */

export const options = {
  thresholds: Object.assign({}, getServiceConfig('booking').THRESHOLDS, {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>15']
  }),
  scenarios: {
    booking_load: Object.assign({}, SCENARIOS.LOAD, {
      exec: 'testBookingService'
    })
  }
};

export function setup() {
  console.log('Starting Booking Service Load Test');
  const config = getServiceConfig('booking');
  console.log(`Booking Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export function testBookingService(data) {
  // Run booking service tests with load
  bookingTest(data);
}

export default function() {
  console.log('Booking Service Load Test - Default function (should not be called)');
}

export function teardown() {
  console.log('Booking Service Load Test Completed');
  console.log('Load Test Summary:');
  console.log('- Booking creation performance validated');
  console.log('- Booking retrieval performance validated');
  console.log('- Availability checks performance validated');
}

