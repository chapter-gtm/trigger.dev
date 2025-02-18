import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from 'dotenv';

// Load environment variables (API_BASE_URL, API_AUTH_TOKEN)
config();

// Utility function to build auth headers
function getAuthHeaders(token?: string) {
  return {
    Authorization: `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
  };
}

/***********************************************************
 * Jest test suite for:
 *   POST /api/v1/schedules/{schedule_id}/deactivate
 *
 * Summary:
 *   Deactivate a schedule by its ID (IMPERATIVE schedules only).
 *
 * This suite tests:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Authorization & Authentication
 ***********************************************************/
describe('/api/v1/schedules/{schedule_id}/deactivate', () => {
  const API_BASE_URL = process.env.API_BASE_URL;
  const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

  // Replace these sample IDs with actual IDs in a real test environment
  const validImperativeScheduleId = 'my-imperative-schedule-id';
  const invalidFormatScheduleId = '!!!';
  const nonexistentScheduleId = 'nonexistent-schedule-id-123';
  // Large string for testing boundary or edge-case length
  const extremelyLargeScheduleId = ''.padStart(10000, 'x');

  // Ensure environment variables are set
  if (!API_BASE_URL) {
    throw new Error('Missing API_BASE_URL in environment variables');
  }

  // Helper function to build the full endpoint
  const buildEndpoint = (scheduleId: string) => {
    return `${API_BASE_URL}/api/v1/schedules/${scheduleId}/deactivate`;
  };

  /***********************************************************
   * 1. INPUT VALIDATION
   ***********************************************************/
  describe('Input Validation', () => {
    it('should fail with 400 or 422 if schedule_id is empty string', async () => {
      expect.assertions(1);
      try {
        await axios.post(`${API_BASE_URL}/api/v1/schedules//deactivate`, {}, {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });

    it('should fail with 400 or 422 if schedule_id has invalid format', async () => {
      expect.assertions(1);
      try {
        await axios.post(buildEndpoint(invalidFormatScheduleId), {}, {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });

  /***********************************************************
   * 2. RESPONSE VALIDATION - VALID USE CASE
   ***********************************************************/
  describe('Response Validation (Valid Schedule)', () => {
    it('should return 200 and a valid schedule object for a valid IMPERATIVE schedule_id', async () => {
      // NOTE: This test expects the schedule_id to exist and be IMPERATIVE.
      //       In a real environment, set validImperativeScheduleId accordingly.
      const response: AxiosResponse = await axios.post(
        buildEndpoint(validImperativeScheduleId),
        {},
        {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        }
      );
      // Check for status code
      expect(response.status).toBe(200);

      // Basic schema validation (ScheduleObject)
      // In reality, you might check all required fields from the OpenAPI schema.
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('type');
      expect(response.data).toHaveProperty('status');

      // Additional checks can go here
    });
  });

  /***********************************************************
   * 3. RESPONSE HEADERS VALIDATION
   ***********************************************************/
  describe('Response Headers Validation', () => {
    it('should include correct headers in the successful response', async () => {
      // We assume a valid schedule for demonstration.
      const response = await axios.post(
        buildEndpoint(validImperativeScheduleId),
        {},
        {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        }
      );

      // Check the status
      expect(response.status).toBe(200);

      // Check Content-Type
      expect(response.headers['content-type']).toContain('application/json');

      // Optionally check other headers like cache-control, etc.
      // For example:
      // expect(response.headers).toHaveProperty('cache-control');
    });
  });

  /***********************************************************
   * 4. EDGE CASE & LIMIT TESTING
   ***********************************************************/
  describe('Edge Case & Limit Testing', () => {
    it('should return 404 if schedule_id is not found', async () => {
      expect.assertions(1);
      try {
        await axios.post(buildEndpoint(nonexistentScheduleId), {}, {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        // 404 indicates resource not found
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should handle extremely large schedule_id input gracefully (400 or 422)', async () => {
      expect.assertions(1);
      try {
        await axios.post(buildEndpoint(extremelyLargeScheduleId), {}, {
          headers: getAuthHeaders(API_AUTH_TOKEN),
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        // Expecting 400 or 422 as invalid or unprocessable ID
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });

  /***********************************************************
   * 5. TESTING AUTHORIZATION & AUTHENTICATION
   ***********************************************************/
  describe('Authorization & Authentication', () => {
    it('should fail with 401 or 403 if no auth token is provided', async () => {
      expect.assertions(1);
      try {
        await axios.post(buildEndpoint(validImperativeScheduleId), {}, {
          headers: getAuthHeaders(), // No token
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([401, 403]).toContain(axiosError.response?.status);
      }
    });

    it('should fail with 401 or 403 if an invalid auth token is provided', async () => {
      expect.assertions(1);
      try {
        await axios.post(buildEndpoint(validImperativeScheduleId), {}, {
          headers: getAuthHeaders('invalid-token'),
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([401, 403]).toContain(axiosError.response?.status);
      }
    });
  });
});
