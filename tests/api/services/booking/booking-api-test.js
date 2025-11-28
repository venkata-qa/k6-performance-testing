import http from 'k6/http';
import { check, sleep } from 'k6';
import { getServiceUrl, getServiceConfig } from '../../../../config/services-config.js';
import { makeRequest, validateResponse, generateRandomData } from '../../../../utils/helpers.js';
import { defaultMonitor } from '../../../../utils/performance-monitor.js';

/**
 * Booking Service API Tests
 * Tests all booking service endpoints
 */

export const options = {
  thresholds: getServiceConfig('booking').THRESHOLDS,
  scenarios: {
    booking_api_test: {
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
  console.log('Starting Booking Service API Test');
  const config = getServiceConfig('booking');
  console.log(`Booking Service URL: ${config.BASE_URL}`);
  
  return {
    serviceConfig: config,
    testStartTime: new Date().toISOString()
  };
}

export default function(data) {
  const testStartTime = Date.now();
  
  // Test 1: Check availability
  testCheckAvailability(data.serviceConfig);
  sleep(1);
  
  // Test 2: Create booking
  const bookingId = testCreateBooking(data.serviceConfig);
  sleep(1);
  
  // Test 3: Get booking
  if (bookingId) {
    testGetBooking(data.serviceConfig, bookingId);
    sleep(1);
  }
  
  // Test 4: List bookings
  testListBookings(data.serviceConfig);
  sleep(1);
  
  // Test 5: Update booking (if we have a booking ID)
  if (bookingId) {
    testUpdateBooking(data.serviceConfig, bookingId);
    sleep(1);
  }
}

/**
 * Test booking availability endpoint
 */
export function testCheckAvailability(serviceConfig) {
  const url = getServiceUrl('booking', 'availability');
  const response = makeRequest('GET', url);
  
  check(response, {
    'availability check status is 200': (r) => r.status === 200,
    'availability response time < 500ms': (r) => r.timings.duration < 500,
    'availability response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && (body.available !== undefined || Array.isArray(body));
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'booking_availability', Date.now());
}

/**
 * Test create booking endpoint
 */
export function testCreateBooking(serviceConfig) {
  const url = getServiceUrl('booking', 'createBooking');
  const bookingData = {
    date: new Date().toISOString(),
    duration: 60,
    serviceType: 'consultation',
    patientId: `patient_${Math.floor(Math.random() * 1000)}`
  };
  
  const response = makeRequest('POST', url, JSON.stringify(bookingData));
  
  check(response, {
    'create booking status is 201': (r) => r.status === 201,
    'create booking response time < 800ms': (r) => r.timings.duration < 800,
    'create booking returns ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'booking_create', Date.now());
  
  // Return booking ID if created successfully
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
 * Test get booking endpoint
 */
export function testGetBooking(serviceConfig, bookingId) {
  const url = getServiceUrl('booking', 'getBooking', { id: bookingId });
  const response = makeRequest('GET', url);
  
  check(response, {
    'get booking status is 200': (r) => r.status === 200,
    'get booking response time < 500ms': (r) => r.timings.duration < 500,
    'get booking returns booking data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id === bookingId;
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'booking_get', Date.now());
}

/**
 * Test list bookings endpoint
 */
export function testListBookings(serviceConfig) {
  const url = getServiceUrl('booking', 'listBookings');
  const response = makeRequest('GET', url);
  
  check(response, {
    'list bookings status is 200': (r) => r.status === 200,
    'list bookings response time < 600ms': (r) => r.timings.duration < 600,
    'list bookings returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) || (body.bookings && Array.isArray(body.bookings));
      } catch (e) {
        return false;
      }
    }
  });
  
  defaultMonitor.trackRequest(response, 'booking_list', Date.now());
}

/**
 * Test update booking endpoint
 */
export function testUpdateBooking(serviceConfig, bookingId) {
  const url = getServiceUrl('booking', 'updateBooking', { id: bookingId });
  const updateData = {
    duration: 90,
    notes: 'Updated booking notes'
  };
  
  const response = makeRequest('PUT', url, JSON.stringify(updateData));
  
  check(response, {
    'update booking status is 200': (r) => r.status === 200,
    'update booking response time < 600ms': (r) => r.timings.duration < 600
  });
  
  defaultMonitor.trackRequest(response, 'booking_update', Date.now());
}

/**
 * Test cancel booking endpoint
 */
export function testCancelBooking(serviceConfig, bookingId) {
  const url = getServiceUrl('booking', 'cancelBooking', { id: bookingId });
  const response = makeRequest('POST', url);
  
  check(response, {
    'cancel booking status is 200': (r) => r.status === 200,
    'cancel booking response time < 500ms': (r) => r.timings.duration < 500
  });
  
  defaultMonitor.trackRequest(response, 'booking_cancel', Date.now());
}

export function teardown(data) {
  console.log('Booking Service API Test Completed');
  const stats = defaultMonitor.getStats();
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Average response time: ${stats.avgResponseTime.toFixed(2)}ms`);
}

