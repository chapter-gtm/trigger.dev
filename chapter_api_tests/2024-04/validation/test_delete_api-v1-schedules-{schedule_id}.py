import axios, { AxiosInstance } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * This test suite validates the DELETE /api/v1/schedules/{schedule_id} endpoint.
 * It covers:
 *  1. Input Validation
 *  2. Response Validation
 *  3. Response Headers Validation
 *  4. Edge Cases & Limit Testing
 *  5. Authorization & Authentication
 *
 * Requirements:
 *  - You must have API_BASE_URL and API_AUTH_TOKEN set in your environment variables.
 *  - The endpoint is DELETE /api/v1/schedules/{schedule_id}
 *  - A valid schedule_id corresponds to an IMPERATIVE schedule that actually exists.
 *  - The endpoint may respond with 400 or 422 for invalid input.
 *  - The endpoint may respond with 401 or 403 for unauthorized or forbidden access.
 *  - The endpoint may respond with 404 if the resource is not found.
 */

describe('DELETE /api/v1/schedules/{schedule_id}', () => {
  let apiClient: AxiosInstance;
  let baseURL = '';
  let authToken = '';

  beforeAll(() => {
    // Load environment variables
    baseURL = process.env.API_BASE_URL || '';
    authToken = process.env.API_AUTH_TOKEN || '';

    // Create an Axios instance
    apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // We'll manually check status codes to handle multiple possible outcomes
    });
  });

  // Utility function to get the Authorization header
  function getAuthHeaders(token?: string) {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (authToken) {
      return { Authorization: `Bearer ${authToken}` };
    }
    return {};
  }

  /**
   * Note on test data:
   *  - Adjust these IDs to match real data in your test environment.
   *  - "validScheduleId" should be an existing imperative schedule ID.
   *  - "nonExistentScheduleId" doesn't exist, triggering a 404.
   *  - "invalidScheduleId" simulates malformed input.
   */
  const validScheduleId = 'validScheduleId';
  const nonExistentScheduleId = 'nonExistentScheduleId';
  const invalidScheduleId = ''; // Empty string or any invalid type

  /******************
   * 1) Input Validation
   ******************/
  describe('Input Validation', () => {
    it('should return 404 or 400/422 when schedule_id is missing in the path', async () => {
      // Some servers might interpret a missing ID as a 404 (route not found)
      // Others might throw 400/422 if the path was recognized but the ID was empty.
      const response = await apiClient.delete('/api/v1/schedules/', {
        headers: getAuthHeaders(),
      });
      expect([400, 404, 422]).toContain(response.status);
    });

    it('should return 400 or 422 if schedule_id is invalid (empty string)', async () => {
      const response = await apiClient.delete(`/api/v1/schedules/${invalidScheduleId}`, {
        headers: getAuthHeaders(),
      });
      // Depending on implementation, could be 400, 422, or even 404.
      expect([400, 404, 422]).toContain(response.status);
    });

    // If your API expects strictly string type for schedule_id, you can add more tests for numeric or other malformed types.
  });

  /******************
   * 2) Response Validation
   ******************/
  describe('Response Validation', () => {
    it('should delete the schedule and return 200 for a valid existing schedule_id', async () => {
      // This test assumes the validScheduleId is a real schedule.
      // If the schedule is not truly existing, the test may fail or return 404.
      // Ensure validScheduleId references an actual IMPERATIVE schedule.
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`, {
        headers: getAuthHeaders(),
      });

      // We expect 200 for a successful deletion.
      expect(response.status).toBe(200);
      // Optionally, if response has a body, we can validate the schema.
      // Example: expect(response.data).toHaveProperty('message', 'Schedule deleted successfully');
    });

    it('should return 404 if the schedule_id does not exist', async () => {
      const response = await apiClient.delete(`/api/v1/schedules/${nonExistentScheduleId}`, {
        headers: getAuthHeaders(),
      });

      expect(response.status).toBe(404);
      // Optionally check response body if the API returns an error message.
      // Example: expect(response.data).toHaveProperty('error', 'Resource not found');
    });
  });

  /******************
   * 3) Response Headers Validation
   ******************/
  describe('Response Headers Validation', () => {
    it('should return application/json in Content-Type header under normal conditions', async () => {
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`, {
        headers: getAuthHeaders(),
      });

      // Some APIs only return a body for certain status codes. If there's no body, it can differ.
      // But typically for a JSON-based API, we expect "application/json".
      const contentType = response.headers['content-type'] || '';
      expect(contentType).toContain('application/json');
    });
  });

  /******************
   * 4) Edge Cases & Limit Testing
   ******************/
  describe('Edge Cases & Limit Testing', () => {
    it('should handle unauthorized requests (missing token) with 401 or 403', async () => {
      // Calling without Authorization header
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`);
      expect([401, 403]).toContain(response.status);
    });

    it('should handle requests with an invalid token with 401 or 403', async () => {
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`, {
        headers: getAuthHeaders('invalidToken'),
      });
      expect([401, 403]).toContain(response.status);
    });

    it('should handle server errors (5xx) gracefully if the server triggers such an error', async () => {
      // This test is hypothetical. The actual occurrence might require a special setup.
      // We simply show that we expect 5xx if something goes wrong on the server.
      // In practice, you could mock or simulate an internal server error.
      // Here we just illustrate how to handle if it occurs.

      // Example pseudo-code:
      // const response = await apiClient.delete(`/api/v1/schedules/specialCaseIdThatCausesError`, {
      //   headers: getAuthHeaders(),
      // });

      // For demonstration, we won't actually throw a server error; just a placeholder.
      // If you had a special route that triggers a 500, you could test it.
      // expect(response.status).toBe(500);
    });
  });

  /******************
   * 5) Testing Authorization & Authentication
   ******************/
  describe('Authorization & Authentication', () => {
    it('should delete a schedule successfully when authorized', async () => {
      // Re-using validScheduleId, ensuring token is provided.
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`, {
        headers: getAuthHeaders(),
      });

      // 200 is expected if the schedule exists, 404 if it was already deleted.
      // Some implementations might return 204 No Content for a successful delete.
      expect([200, 404]).toContain(response.status);
    });

    it('should return 401 or 403 if token is expired or invalid', async () => {
      const response = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`, {
        headers: getAuthHeaders('expiredOrInvalidToken'),
      });

      expect([401, 403]).toContain(response.status);
    });
  });
});
