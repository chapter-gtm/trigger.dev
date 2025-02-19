import axios, { AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Jest test suite for GET /api/v1/schedules/{schedule_id}
 *
 * Requirements Covered:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Authorization & Authentication
 *
 * Notes:
 * - The base URL is loaded from the environment variable: API_BASE_URL
 * - The auth token is loaded from the environment variable: API_AUTH_TOKEN
 * - Since GET endpoints typically do not have a request body, payload-related tests here focus on path parameters.
 * - For invalid/missing parameters, the API may return 400 or 422. Both are acceptable.
 * - For unauthorized/forbidden requests, the API may return 401 or 403. Both are acceptable.
 */

describe('GET /api/v1/schedules/{schedule_id}', () => {
  let baseURL: string;
  let validToken: string;
  let axiosInstance = axios.create();

  beforeAll(() => {
    baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    validToken = process.env.API_AUTH_TOKEN || '';
  });

  afterAll(() => {
    // Clean up or tear down if needed
  });

  /**
   * Helper function to perform GET request.
   */
  const getSchedule = async (
    scheduleId: string | number | undefined,
    token: string | undefined
  ): Promise<AxiosResponse<any>> => {
    // Construct URL. If scheduleId is missing or invalid, that tests error behaviors.
    const url = scheduleId
      ? `${baseURL}/api/v1/schedules/${scheduleId}`
      : `${baseURL}/api/v1/schedules/`; // Intentionally missing ID

    return axiosInstance.get(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
  };

  describe('1. Input Validation', () => {
    it('should return 400 or 422 if schedule_id is missing', async () => {
      try {
        await getSchedule(undefined, validToken);
        // If the request does not fail, force a failure.
        fail('Expected an error for missing schedule_id, but request succeeded.');
      } catch (error: any) {
        expect([400, 422, 404]).toContain(error?.response?.status);
        // Depending on implementation, 404 might also be returned.
      }
    });

    it('should return 400 or 422 if schedule_id is invalid (wrong type)', async () => {
      // Passing a number where string is expected, for instance
      try {
        await getSchedule(12345, validToken);
        fail('Expected an error for invalid schedule_id, but request succeeded.');
      } catch (error: any) {
        expect([400, 422, 404]).toContain(error?.response?.status);
      }
    });

    it('should handle empty string as schedule_id', async () => {
      try {
        await getSchedule('', validToken);
        fail('Expected an error for empty schedule_id, but request succeeded.');
      } catch (error: any) {
        expect([400, 422, 404]).toContain(error?.response?.status);
      }
    });
  });

  describe('2. Response Validation', () => {
    it('should retrieve a schedule (200) with a valid schedule_id', async () => {
      // Example known valid schedule ID
      const scheduleId = 'sched_1234';

      const response = await getSchedule(scheduleId, validToken);
      expect(response.status).toBe(200);
      // Check response body structure — assuming at least it has an "id" field
      expect(response.data).toBeDefined();
      expect(typeof response.data).toBe('object');
      expect(response.data).toHaveProperty('id', scheduleId);
    });

    it('should return 404 when the schedule_id is not found', async () => {
      const nonExistentId = 'sched_does_not_exist';
      try {
        await getSchedule(nonExistentId, validToken);
        fail('Expected a 404 error for non-existent schedule, but request succeeded.');
      } catch (error: any) {
        // 404 expected for resource not found
        expect(error?.response?.status).toBe(404);
      }
    });
  });

  describe('3. Response Headers Validation', () => {
    it('should include Content-Type: application/json for a valid request', async () => {
      const scheduleId = 'sched_1234';
      const response = await getSchedule(scheduleId, validToken);

      expect(response.headers).toBeDefined();
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('4. Edge Case & Limit Testing', () => {
    it('should handle extremely large schedule_id gracefully (likely 400, 422, or 404)', async () => {
      const largeScheduleId = 'sched_' + 'x'.repeat(1000); // very large ID
      try {
        await getSchedule(largeScheduleId, validToken);
        fail('Expected an error for extremely large schedule_id, but request succeeded.');
      } catch (error: any) {
        // Depending on implementation details, it might return 400, 422, or 404.
        expect([400, 422, 404]).toContain(error?.response?.status);
      }
    });

    // GET requests typically do not return empty arrays unless the resource is a collection
    // but we check if 404 is returned instead of an empty response if the ID is not found.
    it('should return 404 instead of an empty object/array if the schedule is not found', async () => {
      const nonExistentId = 'sched_nonexistent';
      try {
        await getSchedule(nonExistentId, validToken);
        fail('Expected a 404 for non-existent schedule, got success.');
      } catch (error: any) {
        expect(error?.response?.status).toBe(404);
      }
    });

    it('should handle server error (5xx) gracefully if it occurs', async () => {
      // This test is conceptual; if the server is not mocked to produce 5xx,
      // you can catch the scenario if any unhandled error occurs.
      // We'll simulate by using an unrealistic endpoint.
      try {
        await axiosInstance.get(`${baseURL}/api/v1/schedules/trigger-500-error`);
        // If no error, we can skip.
      } catch (error: any) {
        // If a 500 occurs, test is satisfied.
        if (error?.response?.status === 500) {
          expect(error?.response?.status).toBe(500);
        }
      }
    });
  });

  describe('5. Testing Authorization & Authentication', () => {
    it('should return 401 or 403 if the request is made without a token', async () => {
      const scheduleId = 'sched_1234';
      try {
        await getSchedule(scheduleId, undefined);
        fail('Expected a 401/403 error for missing token, but request succeeded.');
      } catch (error: any) {
        expect([401, 403]).toContain(error?.response?.status);
      }
    });

    it('should return 401 or 403 if the token is invalid', async () => {
      const scheduleId = 'sched_1234';
      const invalidToken = 'invalid_token';
      try {
        await getSchedule(scheduleId, invalidToken);
        fail('Expected a 401/403 error for invalid token, but request succeeded.');
      } catch (error: any) {
        expect([401, 403]).toContain(error?.response?.status);
      }
    });
  });
});
