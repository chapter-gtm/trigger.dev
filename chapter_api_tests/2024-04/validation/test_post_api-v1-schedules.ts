import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Utility function to create an Axios instance with base URL and auth token
function createAxiosInstance(authToken?: string): AxiosInstance {
  return axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Example Schedule creation payload.
 * Adjust fields according to the actual OpenAPI schema if needed.
 */
const validSchedulePayload = {
  name: 'Test Schedule',
  type: 'IMPERATIVE',
  // Add any other required fields here
  // e.g., startTime, endTime, etc.
  // startTime: '2023-01-01T09:00:00Z',
  // endTime: '2023-01-01T17:00:00Z',
};

describe('POST /api/v1/schedules', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    // Create an axios instance with valid auth token from environment
    axiosInstance = createAxiosInstance(process.env.API_AUTH_TOKEN);
  });

  /**
   * 1. Valid request
   *    - Should create schedule with valid data.
   *    - Expect 200, check response body structure, headers, etc.
   */
  it('should create a schedule with valid data (expect 200)', async () => {
    const response: AxiosResponse = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    // Response Validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Basic body/schema checks (add more detailed checks according to the actual schema)
    expect(response.data).toBeDefined();
    // For example, if the returned schedule has an id, type, name, etc.
    // expect(response.data).toHaveProperty('id');
    // expect(response.data.type).toBe('IMPERATIVE');
  });

  /**
   * 2. Missing or invalid fields (body validation)
   *    - Should return 400 or 422 for invalid data.
   */
  it('should reject invalid payload (expect 400 or 422)', async () => {
    const invalidPayload = {
      // Missing required fields or incorrect types
      // e.g., type is an invalid string
      type: 'UNKNOWN_TYPE',
    };

    try {
      await axiosInstance.post('/api/v1/schedules', invalidPayload);
      // If the request unexpectedly succeeds, fail the test
      fail('Request should have failed with a 400 or 422 status.');
    } catch (error: any) {
      // Axios attaches status code to error.response.status
      expect([400, 422]).toContain(error?.response?.status);
    }
  });

  /**
   * 3. Authorization & Authentication Tests
   *    - If token is missing or invalid, should return 401 or 403.
   */
  it('should return 401 or 403 if auth token is missing or invalid', async () => {
    // Create an axios instance without a valid token
    const unauthenticatedAxios = createAxiosInstance('invalid-token');

    try {
      await unauthenticatedAxios.post('/api/v1/schedules', validSchedulePayload);
      fail('Request should have failed due to authentication issues.');
    } catch (error: any) {
      expect([401, 403]).toContain(error?.response?.status);
    }
  });

  /**
   * 4. Edge Case & Limit Testing
   *    - Large payloads, boundary values, empty strings.
   *    - Ensure we get a valid error (400 or 422) or success if the API allows it.
   */
  it('should handle large payloads (boundary testing)', async () => {
    const largeName = 'A'.repeat(10000); // Very long name
    const largePayload = {
      ...validSchedulePayload,
      name: largeName,
    };

    // Some APIs may accept large strings, some may fail
    // We expect either success (200) or a client error (400/422) if the payload is too large.
    try {
      const response = await axiosInstance.post('/api/v1/schedules', largePayload);
      // If successful, check response status and body
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.headers['content-type']).toMatch(/application\/json/);
    } catch (error: any) {
      if (error?.response?.status) {
        // Acceptable error codes for large payload issues
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error; // If it's another error, re-throw
      }
    }
  });

  it('should handle empty string or null fields (boundary testing)', async () => {
    const emptyFieldPayload = {
      ...validSchedulePayload,
      name: '', // Empty where name is potentially required
    };

    try {
      await axiosInstance.post('/api/v1/schedules', emptyFieldPayload);
      fail('Request with empty required field should fail.');
    } catch (error: any) {
      expect([400, 422]).toContain(error?.response?.status);
    }
  });

  /**
   * 5. Malformed requests, server errors.
   *    - 500 errors are typically internal server errors, but we can test a malformed request scenario.
   *    - This is an example; forcing a 500 depends on server logic.
   */
  it('should gracefully handle invalid JSON (malformed request)', async () => {
    // Send a malformed JSON string. We simulate by using a custom request.
    try {
      const response = await axiosInstance.post(
        '/api/v1/schedules',
        '"malformed JSON" : test', // This is intentionally malformed
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // If the server tries to parse and fails, it may throw 400 or 422
      expect([400, 422]).toContain(response.status);
    } catch (error: any) {
      if (error?.response?.status) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        // If a 500 or other code occurs, it's also possible
        expect([400, 422, 500]).toContain(error.response.status);
      }
    }
  });

  /**
   * 6. Response Headers Validation
   *    - Confirm Content-Type = application/json, etc.
   *    - For either success or error, the Content-Type may differ, but we typically expect JSON.
   */
  it('should return JSON content-type header on valid request', async () => {
    const response: AxiosResponse = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  /**
   * Additional tests like no results found (not directly applicable to POST create),
   * but included if the server logic might return an empty list or object.
   * Typically, 200 with an empty object if, for instance, no schedule data is created.
   */
  it('should handle scenario if the server returns an empty object', async () => {
    // This test is speculative. If the API can respond with an empty object, handle the check.
    // Force a condition that might return empty data if possible.

    try {
      const response: AxiosResponse = await axiosInstance.post(
        '/api/v1/schedules',
        {
          // Possibly some condition that leads to an empty response.
          // Implementation depends on actual server logic.
          name: 'Name that causes empty response',
          type: 'IMPERATIVE',
        }
      );
      // Validate that if we get a 200, the body might be empty.
      expect(response.status).toBe(200);
      // If the server returns an empty object
      expect(response.data).toBeDefined();
    } catch (error: any) {
      // Not expected but handle possible 400,422 etc.
      expect([400, 422]).toContain(error?.response?.status);
    }
  });
});
