import axios, { AxiosResponse, AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

/**
 * This test suite verifies the behavior of the POST /api/v1/schedules/{schedule_id}/deactivate endpoint.
 * It covers:
 * 1. Input validation (required parameters, data types, edge cases)
 * 2. Response validation (status codes, body structure, error handling)
 * 3. Response headers validation (Content-Type, etc.)
 * 4. Edge cases & limit testing (boundary values, unauthorized, not found, etc.)
 * 5. Authorization & authentication tests (valid, invalid tokens)
 */

describe('POST /api/v1/schedules/:schedule_id/deactivate', () => {
  const validScheduleId = 'valid-imperative-schedule-id'; // Replace with a real or mocked schedule ID.
  const nonExistentScheduleId = 'non-existent-id';

  // Helper function to build the request URL.
  const buildUrl = (scheduleId: string) => {
    return `${API_BASE_URL}/api/v1/schedules/${scheduleId}/deactivate`;
  };

  // Shared config for axios including headers.
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  /**
   * Test: Successful deactivation with a valid schedule ID.
   * Expect: 200 OK, application/json response, valid ScheduleObject.
   */
  it('should deactivate a valid imperative schedule successfully', async () => {
    expect(API_BASE_URL).toBeDefined();
    expect(API_AUTH_TOKEN).toBeDefined();

    try {
      const response: AxiosResponse = await axios.post(buildUrl(validScheduleId), {}, axiosConfig);

      // Check response status
      expect(response.status).toBe(200);

      // Check response headers
      expect(response.headers['content-type']).toContain('application/json');

      // Validate response body structure (basic checks for ScheduleObject)
      const data = response.data;
      // For a more robust check, assert each required property in your schema.
      expect(data).toHaveProperty('id');
      expect(typeof data.id).toBe('string');
    } catch (error) {
      // If the API is down or the test config is invalid, handle here.
      const axiosError = error as AxiosError;
      // You could check axiosError.response to see if it returned a known error code.
      if (axiosError.response) {
        // If we expect success but got an error, fail the test.
        fail(
          `Expected 200, received ${axiosError.response.status}: ${JSON.stringify(
            axiosError.response.data
          )}`
        );
      } else {
        fail(`Request failed: ${axiosError.message}`);
      }
    }
  });

  /**
   * Test: Invalid schedule_id (empty or malformed) should return 400 or 422.
   * Expect: 400/422 status, proper error handling.
   */
  it('should return 400 or 422 when schedule_id is invalid (e.g., empty string)', async () => {
    const invalidScheduleId = '';
    try {
      await axios.post(buildUrl(invalidScheduleId), {}, axiosConfig);
      // If the request succeeds here, it means the API did not validate properly.
      fail('Expected 400 or 422 for invalid schedule_id but got a success response.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([400, 422]).toContain(axiosError.response?.status);
    }
  });

  /**
   * Test: Non-existent schedule ID should return 404.
   */
  it('should return 404 for a non-existent schedule_id', async () => {
    try {
      await axios.post(buildUrl(nonExistentScheduleId), {}, axiosConfig);
      fail('Expected 404 for non-existent schedule_id but got success response.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect(axiosError.response?.status).toBe(404);
    }
  });

  /**
   * Test: Missing or invalid auth token should return 401 or 403.
   */
  it('should return 401 or 403 for unauthorized or forbidden requests', async () => {
    const invalidConfig = {
      headers: {
        Authorization: 'Bearer invalid_token',
        'Content-Type': 'application/json',
      },
    };

    try {
      await axios.post(buildUrl(validScheduleId), {}, invalidConfig);
      fail('Expected 401 or 403 for invalid token but got success response.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([401, 403]).toContain(axiosError.response?.status);
    }
  });

  /**
   * Test: Check response headers for correctness on a valid request.
   */
  it('should include correct response headers on success', async () => {
    try {
      const response: AxiosResponse = await axios.post(buildUrl(validScheduleId), {}, axiosConfig);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      // Optionally check for other headers like Cache-Control, X-RateLimit, etc.
    } catch (error) {
      const axiosError = error as AxiosError;
      fail(`Request failed unexpectedly. Status: ${axiosError.response?.status}`);
    }
  });

  /**
   * Test: Large or boundary schedule_id (edge case) - usually returns 404 or maybe 400 if invalid.
   */
  it('should handle a very long schedule_id gracefully', async () => {
    const longScheduleId = 'a'.repeat(1000); // 1000-char string.
    try {
      await axios.post(buildUrl(longScheduleId), {}, axiosConfig);
      fail('Expected 404 or 400/422 for extremely long schedule_id.');
    } catch (error) {
      const axiosError = error as AxiosError;
      // Depending on API design, might be 400/422 or 404
      expect([400, 404, 422]).toContain(axiosError.response?.status);
    }
  });

  /**
   * Test: Handling a potential server error (simulate if possible or check how the API handles errors).
   * This may require mocking or an environment scenario where the server triggers a 5xx error.
   * We'll demonstrate a 500 check if triggered.
   */
  it('should handle server errors (5xx) gracefully', async () => {
    // This test is conceptual: the real trigger for a 500 would be on the server side.
    // If you can force a 500 from the server by some condition, do so here.
    // In this example, we'll call a known invalid path to simulate a possible 500 scenario.

    try {
      await axios.post(`${API_BASE_URL}/api/v1/schedules/trigger-500/deactivate`, {}, axiosConfig);
      fail('Expected 500 Internal Server Error but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      // If the server truly returns a 500 for that path or under special conditions:
      if (axiosError.response?.status !== 500) {
        // Not a 500 error, but at least we caught an error.
        // Adjust this assertion based on your actual API behavior.
        fail(`Expected 500, but received ${axiosError.response?.status}`);
      } else {
        expect(axiosError.response?.status).toBe(500);
      }
    }
  });
});
