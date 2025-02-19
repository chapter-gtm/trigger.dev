import axios, { AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Jest test suite for POST /api/v1/schedules
 * Requirements:
 *  1. Input Validation
 *  2. Response Validation
 *  3. Response Headers Validation
 *  4. Edge Case & Limit Testing
 *  5. Authorization & Authentication
 *
 *  - Loads API base URL from process.env.API_BASE_URL
 *  - Loads auth token from process.env.API_AUTH_TOKEN
 *  - Uses axios as HTTP client
 *  - Written in TypeScript (with Jest as test framework)
 *  - Ensures Prettier style formatting
 */

describe('POST /api/v1/schedules', () => {
  let baseURL: string;
  let authToken: string;

  beforeAll(() => {
    baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    authToken = process.env.API_AUTH_TOKEN || '';
  });

  /**
   * Helper function to create a schedule.
   * Attaches Authorization header if provided.
   */
  const createSchedule = async (
    payload: Record<string, unknown>,
    token?: string
  ): Promise<AxiosResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return axios.post(`${baseURL}/api/v1/schedules`, payload, { headers });
  };

  /**
   * TEST 1: Valid Payload (Happy Path)
   *
   * - Expects 200 response code ("Schedule created successfully").
   * - Verifies JSON response matches expected schema.
   * - Checks response headers.
   */
  it('should create a schedule with valid payload', async () => {
    const validPayload = {
      // Example payload conforming to #/components/schemas/ScheduleObject
      // Adjust fields according to your actual schema.
      type: 'IMPERATIVE',
      title: 'Automated Test Schedule',
      startTime: '2023-01-01T00:00:00Z',
      endTime: '2023-01-01T01:00:00Z',
      // Add other required fields as needed
    };

    const response = await createSchedule(validPayload, authToken);

    // Response Validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    // Sample checks against the response body schema
    // Adjust these checks depending on your actual ScheduleObject schema.
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('type', 'IMPERATIVE');
    expect(response.data).toHaveProperty('title', 'Automated Test Schedule');
  });

  /**
   * TEST 2: Missing Required Fields => 400 or 422
   *
   * - Expects error code 400 or 422 when payload is invalid.
   */
  it('should return 400 or 422 for invalid payload (missing fields)', async () => {
    const invalidPayload = {
      // Omit required fields to trigger validation error
      type: 'IMPERATIVE',
      // title missing, startTime missing, etc.
    };

    try {
      await createSchedule(invalidPayload, authToken);
      // If request succeeds unexpectedly
      fail('Expected request to fail for invalid payload, but it succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      // The API might respond with 400 or 422 for invalid payload.
      expect([400, 422]).toContain(status);
    }
  });

  /**
   * TEST 3: Wrong Data Types => 400 or 422
   *
   * - Expects error code 400 or 422 when data types are incorrect.
   */
  it('should return 400 or 422 for incorrect data types', async () => {
    const invalidPayload = {
      type: 'IMPERATIVE',
      title: 1234, // title should be a string
      startTime: true, // startTime should be a string/timestamp, not boolean
      endTime: null, // etc.
    };

    try {
      await createSchedule(invalidPayload, authToken);
      fail('Expected request to fail for incorrect data types, but it succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([400, 422]).toContain(status);
    }
  });

  /**
   * TEST 4: Unauthorized Access => 401 or 403
   *
   * - No token or invalid token should yield 401 or 403.
   */
  it('should return 401 or 403 for unauthorized (missing or invalid token)', async () => {
    const validPayload = {
      type: 'IMPERATIVE',
      title: 'Unauthorized Test Schedule',
      startTime: '2023-01-01T02:00:00Z',
      endTime: '2023-01-01T03:00:00Z',
    };

    try {
      // Call without token
      await createSchedule(validPayload);
      fail('Expected 401 or 403 for unauthorized access, but it succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([401, 403]).toContain(status);
    }
  });

  /**
   * TEST 5: Empty Request Body => 400 or 422
   *
   * - Expects the API to reject empty body.
   */
  it('should return 400 or 422 when request body is empty', async () => {
    try {
      await createSchedule({}, authToken);
      fail('Expected 400 or 422 for empty body, but request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([400, 422]).toContain(status);
    }
  });

  /**
   * TEST 6: Large Payload => check for 400, 413 (Payload Too Large), or success
   *
   * - Sends a large string to ensure the API handles or rejects appropriately.
   */
  it('should handle large payload gracefully', async () => {
    // Generate a large string.
    const largeString = 'x'.repeat(10000); // 10k characters

    const largePayload = {
      type: 'IMPERATIVE',
      title: largeString,
      startTime: '2023-01-02T00:00:00Z',
      endTime: '2023-01-02T01:00:00Z',
    };

    let responseStatus: number = 0;

    try {
      const response = await createSchedule(largePayload, authToken);
      responseStatus = response.status;
    } catch (error: any) {
      responseStatus = error.response?.status;
    }

    // The API might accept it (200) or reject it (400, 413, 422, etc.).
    // Adjust as appropriate for your API's expected behavior.
    expect([200, 400, 413, 422]).toContain(responseStatus);
  });

  /**
   * TEST 7: Endpoint Not Found => 404
   *
   * - Calls a non-existent path to ensure we get a 404.
   */
  it('should return 404 for invalid endpoint', async () => {
    try {
      await axios.post(`${baseURL}/api/v1/schedulezzz`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Expected 404 for invalid endpoint, but request succeeded.');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });

  /**
   * TEST 8: Server Error Handling => 500
   *
   * - This test is illustrative if your API might throw a 500 for certain conditions.
   *   Adjust to match a scenario that triggers a 500 in your environment.
   */
  it('should handle 500 Internal Server Error (if applicable)', async () => {
    // This scenario is highly dependent on your API's implementation.
    // Example approach: pass in data that forces a server error.

    const erroneousPayload = {
      type: 'IMPERATIVE',
      title: 'Trigger Server Error',
      // Suppose passing a specific field or invalid data triggers a 500.
      forceServerError: true,
    };

    let statusCode: number | undefined;

    try {
      await createSchedule(erroneousPayload, authToken);
    } catch (error: any) {
      statusCode = error.response?.status;
    }

    // If the API can return 500 under certain conditions
    // We check if that scenario can occur.
    // Remove or adjust this test if 500 isn't expected.
    if (statusCode === 500) {
      expect(statusCode).toBe(500);
    } else {
      // If your API won't return 500 for such scenarios, you may want to adjust expectations.
      expect([400, 422, 500]).toContain(statusCode);
    }
  });
});
