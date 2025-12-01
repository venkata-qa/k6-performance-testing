import { BASE_CONFIG } from './base-config.ts';

/**
 * Microservices Configuration
 * Defines base URLs and configuration for each microservice
 */

export const SERVICES_CONFIG = {
  // Booking Service
  booking: {
    BASE_URL: __ENV.BOOKING_SERVICE_URL || 'https://booking-api.example.com',
    API_VERSION: __ENV.BOOKING_API_VERSION || 'v1',
    THRESHOLDS: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    ENDPOINTS: {
      createBooking: '/bookings',
      getBooking: '/bookings/{id}',
      updateBooking: '/bookings/{id}',
      cancelBooking: '/bookings/{id}/cancel',
      listBookings: '/bookings',
      availability: '/bookings/availability'
    }
  },

  // Genomics Service
  genomics: {
    BASE_URL: __ENV.GENOMICS_SERVICE_URL || 'https://genomics-api.example.com',
    API_VERSION: __ENV.GENOMICS_API_VERSION || 'v1',
    THRESHOLDS: {
      http_req_duration: ['p(95)<2000', 'p(99)<5000'], // Genomics can be slower
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.9']
    },
    ENDPOINTS: {
      uploadSequence: '/genomics/sequences',
      analyzeSequence: '/genomics/sequences/{id}/analyze',
      getResults: '/genomics/results/{id}',
      listSequences: '/genomics/sequences',
      getReport: '/genomics/reports/{id}'
    }
  },

  // Health Assessment Service
  healthAssessment: {
    BASE_URL: __ENV.HEALTH_ASSESSMENT_SERVICE_URL || 'https://health-api.example.com',
    API_VERSION: __ENV.HEALTH_ASSESSMENT_API_VERSION || 'v1',
    THRESHOLDS: {
      http_req_duration: ['p(95)<800', 'p(99)<1500'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    ENDPOINTS: {
      createAssessment: '/assessments',
      getAssessment: '/assessments/{id}',
      updateAssessment: '/assessments/{id}',
      submitAssessment: '/assessments/{id}/submit',
      getResults: '/assessments/{id}/results',
      listAssessments: '/assessments'
    }
  }
};

/**
 * Get full URL for a service endpoint
 * @param {string} serviceName - Name of the service (booking, genomics, healthAssessment)
 * @param {string} endpointKey - Key from ENDPOINTS object
 * @param {Object} params - Parameters to replace in endpoint (e.g., {id: '123'})
 * @returns {string} Full URL
 */
export function getServiceUrl(serviceName, endpointKey, params = {}) {
  const service = SERVICES_CONFIG[serviceName as keyof typeof SERVICES_CONFIG];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  let endpoint = service.ENDPOINTS[endpointKey as keyof typeof service.ENDPOINTS] as string;
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} not found for service ${serviceName}`);
  }

  // Replace path parameters
  Object.keys(params).forEach(key => {
    endpoint = endpoint.replace(`{${key}}`, params[key]);
  });

  return `${service.BASE_URL}/${service.API_VERSION}${endpoint}`;
}

/**
 * Get service configuration
 * @param {string} serviceName - Name of the service
 * @returns {Object} Service configuration
 */
export function getServiceConfig(serviceName) {
  const service = SERVICES_CONFIG[serviceName as keyof typeof SERVICES_CONFIG];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }
  return service;
}

/**
 * E2E Test Configuration
 * Defines flows that span multiple services
 */
export const E2E_FLOWS = {
  // Complete booking flow with health assessment
  bookingWithHealthCheck: {
    services: ['booking', 'healthAssessment'],
    flow: [
      { service: 'healthAssessment', action: 'createAssessment' },
      { service: 'booking', action: 'createBooking' },
      { service: 'healthAssessment', action: 'submitAssessment' },
      { service: 'booking', action: 'getBooking' }
    ]
  },

  // Genomics analysis with booking
  genomicsAnalysisFlow: {
    services: ['genomics', 'booking'],
    flow: [
      { service: 'genomics', action: 'uploadSequence' },
      { service: 'genomics', action: 'analyzeSequence' },
      { service: 'booking', action: 'createBooking' },
      { service: 'genomics', action: 'getResults' }
    ]
  },

  // Full patient journey
  fullPatientJourney: {
    services: ['healthAssessment', 'genomics', 'booking'],
    flow: [
      { service: 'healthAssessment', action: 'createAssessment' },
      { service: 'genomics', action: 'uploadSequence' },
      { service: 'healthAssessment', action: 'submitAssessment' },
      { service: 'genomics', action: 'analyzeSequence' },
      { service: 'booking', action: 'createBooking' },
      { service: 'healthAssessment', action: 'getResults' },
      { service: 'genomics', action: 'getResults' },
      { service: 'booking', action: 'getBooking' }
    ]
  }
};

