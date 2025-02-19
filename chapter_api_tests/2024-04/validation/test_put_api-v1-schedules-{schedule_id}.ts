import axios, { AxiosError } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Comprehensive test suite for the Update Schedule endpoint.
 * Endpoint: PUT /api/v1/schedules/{schedule_id}
 * Summary: Update a schedule by its ID.
 * Description: Update a schedule by its ID. Only works on `IMPERATIVE` schedules created in the dashboard
 *             or using imperative SDK functions (e.g. schedules.create()).
 *
 * Requirements:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Testing Authorization & Authentication
 *
 * Configuration:
 * - API base URL is read from process.env.API_BASE_URL
 * - Auth token is read from process.env.API_AUTH_TOKEN
 */

describe('PUT /api/v1/schedules/:schedule_id - Update Schedule', () => {
  /**
   * Load environment variables for API base URL and auth token.
   * Make sure to set these variables in your environment before running the tests:
   *   - API_BASE_URL
   *   - API_AUTH_TOKEN
   */
  const baseURL = process.env.API_BASE_URL;
  const authToken = process.env.API_AUTH_TOKEN;

  // Replace these values with actual existing/fictitious IDs for real integration tests
  const validScheduleId = 'valid-schedule-id';
  const nonExistentScheduleId = 'does-not-exist';
  const invalidScheduleId = ''; // for testing invalid ID scenarios (empty string)

  // Sample valid payload (adjust fields according to your actual schema)
  const validPayload = {
    name: 'Updated Schedule Name',
    description: 'This schedule has been updated.',
    // add or remove fields based on your actual schema
  };

  // Sample invalid payload (e.g., missing required fields, wrong types, etc.)
  const invalidPayload = {
    name: 123, // should be a string
  };

  beforeAll(() => {
    if (!baseURL) {
      throw new Error('API_BASE_URL is not defined in environment variables');
    }
    if (!authToken) {
      throw new Error('API_AUTH_TOKEN is not defined in environment variables');
    }
  });

  /**
   * Helper function to send a PUT request.
   * @param {string} scheduleId - The schedule ID to update.
   * @param {any} payload - The request body.
   * @param {string | null} token - Authorization token (if any).
   */
  const sendPutRequest = async (scheduleId: string, payload: any, token: string | null) => {
    const url = `${baseURL}/api/v1/schedules/${scheduleId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return axios.put(url, payload, {
      headers,
      validateStatus: () => true, // Allow custom handling of status codes
    });
  };

  /**
   * 1. Happy path test - Valid token, valid scheduleId, valid payload.
   * Expect 200 OK and a properly structured response body.
   */
  it('should update the schedule successfully with valid token and valid payload', async () => {
    const response = await sendPutRequest(validScheduleId, validPayload, authToken);

    // Response Validation
    expect(response.status).toBe(200);

    // Response body schema validation (trim this to your actual schema)
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name', validPayload.name);
    expect(response.data).toHaveProperty('description', validPayload.description);

    // Headers Validation
    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toMatch(/application\/json/i);
  });

  /**
   * 2. Input validation - Missing schedule ID (empty string or null).
   * Expect 400 or 404.
   */
  it('should return 400 or 404 for empty schedule ID', async () => {
    const response = await sendPutRequest(invalidScheduleId, validPayload, authToken);
    // Could be 400 (Invalid request) or 404 (not found). Adjust as per your API behavior.
    expect([400, 404]).toContain(response.status);
  });

  /**
   * 3. Input validation - Non-existent schedule ID.
   * Expect 404 Resource not found.
   */
  it('should return 404 if schedule does not exist', async () => {
    const response = await sendPutRequest(nonExistentScheduleId, validPayload, authToken);
    // Expecting 404 for a schedule that does not exist.
    expect(response.status).toBe(404);
  });

  /**
   * 4. Input validation - Invalid payload (wrong data types, missing required fields, etc.).
   * Expect 400 or 422.
   */
  it('should return 400 or 422 for invalid payload', async () => {
    const response = await sendPutRequest(validScheduleId, invalidPayload, authToken);
    // The API might respond with 400 or 422 for invalid payload.
    expect([400, 422]).toContain(response.status);
  });

  /**
   * 5. Edge Case: Large payload.
   * We can test by sending an extremely large string in the payload.
   * Expect either a 200 (if the server fully supports large data) or a 400/422 if it fails validation.
   */
  it('should handle very large payloads appropriately', async () => {
    const largeString = 'x'.repeat(10000); // Example large input
    const largePayload = {
      name: largeString,
      description: largeString,
    };

    const response = await sendPutRequest(validScheduleId, largePayload, authToken);

    // The behavior here depends on the service's handling of large data.
    // Expect 200 if the service accepts the data; otherwise 400/422.
    expect([200, 400, 422]).toContain(response.status);

    // Check content-type header if we get a success response
    if (response.status === 200) {
      expect(response.headers['content-type']).toMatch(/application\/json/i);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name');
    }
  });

  /**
   * 6. Authorization - Missing or invalid token.
   * Expect 401 or 403.
   */
  it('should return 401 or 403 for requests without a valid token', async () => {
    const responseNoToken = await sendPutRequest(validScheduleId, validPayload, null);
    // Expecting 401 or 403 if no valid token is sent.
    expect([401, 403]).toContain(responseNoToken.status);

    const responseInvalidToken = await sendPutRequest(validScheduleId, validPayload, 'invalid_token');
    // Expecting 401 or 403 if an invalid token is sent.
    expect([401, 403]).toContain(responseInvalidToken.status);
  });

  /**
   * 7. Response Headers Validation - Confirm that Content-Type is application/json on success.
   */
  it('should return application/json as Content-Type on successful update', async () => {
    const response = await sendPutRequest(validScheduleId, validPayload, authToken);

    if (response.status === 200) {
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    } else {
      // If the request didn't succeed, we check that we've handled it correctly.
      expect([400, 401, 403, 404, 422]).toContain(response.status);
    }
  });

  /**
   * 8. Unexpected or server errors (500, etc.).
   * This is harder to test deterministically, but we can handle it gracefully.
   * Typically, we do a try/catch and see if the error is 500. Adjust as needed.
   */
  it('should handle 500 or other server errors gracefully (if triggered)', async () => {
    try {
      // Attempt to send a request that might cause a server error.
      // This is a hypothetical scenario; typically require deeper knowledge of the API to force a 500.
      const response = await sendPutRequest('cause-500-error', validPayload, authToken);
      // If the API does return a 500, we check it.
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        expect(axiosError.response.status).toBe(500);
      } else {
        // If no response, the error might be networking-related.
        throw error;
      }
    }
  });
});
