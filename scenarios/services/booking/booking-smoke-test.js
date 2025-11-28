import { BASE_CONFIG, SCENARIOS } from '../../../config/base-config.js';
import { testCheckAvailability, testCreateBooking, testGetBooking } from '../../../tests/api/services/booking/booking-api-test.js';
import { getServiceConfig } from '../../../config/services-config.js';

/**
 * Booking Service Smoke Test Scenario
 * Quick validation that booking service is working
 */

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.9']
  },
  scenarios: {
    booking_smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke', service: 'booking' }
    }
  }
};

export function setup() {
  console.log('Starting Booking Service Smoke Test');
  const config = getServiceConfig('booking');
  console.log(`Booking Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  console.log('Running booking service smoke test');
  
  // Quick validation tests
  testCheckAvailability(data.serviceConfig);
  
  const bookingId = testCreateBooking(data.serviceConfig);
  if (bookingId) {
    testGetBooking(data.serviceConfig, bookingId);
  }
}

export function teardown(data) {
  console.log('Booking Service Smoke Test Completed Successfully');
}

