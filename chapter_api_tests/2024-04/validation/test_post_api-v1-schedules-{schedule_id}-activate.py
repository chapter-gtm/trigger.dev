import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// This interface can be updated to match the actual ScheduleObject schema
interface ScheduleObject {
  id: string;
  name?: string;
  status?: string;
  // Add any other fields expected in the response
}

// Create an Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
  },
});

describe('/api/v1/schedules/{schedule_id}/activate (POST) - Activate Schedule', () => {
  // 1) Input Validation - Required parameter test
  test('Should return 400 or 422 when schedule_id is missing or invalid', async () => {
    // Example of an invalid schedule id
    const invalidScheduleIds = ['', ' ', '!!!', '12345'];

    for (const scheduleId of invalidScheduleIds) {
      try {
        await apiClient.post(`/api/v1/schedules/${scheduleId}/activate`);
        // If the request does not throw, the test should fail
        fail(
          `Expected an error for invalid schedule_id "${scheduleId}", but request succeeded.`
        );
      } catch (error: any) {
        // Check if the response is 400 or 422, which indicates invalid input
        const statusCode = error?.response?.status;
        expect([400, 422]).toContain(statusCode);
      }
    }
  });

  // 2) Response Validation - Successful activation
  // NOTE: Update "validScheduleId" with a valid IMPERATIVE schedule ID in your test environment.
  test('Should successfully activate a valid schedule (200)', async () => {
    const validScheduleId = 'test-schedule-imperative-001'; // Replace with a real existing schedule ID

    // Attempt to activate a valid schedule
    const response = await apiClient.post(`/api/v1/schedules/${validScheduleId}/activate`);

    // Check response status
    expect(response.status).toBe(200);

    // 3) Response Headers Validation
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // 4) Check the response body shape matches an expected schema
    const responseData = response.data as ScheduleObject;
    expect(responseData).toHaveProperty('id');
    // Additional checks can be made by comparing to the full ScheduleObject schema
  });

  // 5) Edge Case: Non-existing schedule ID should return 404
  // NOTE: Update "nonExistingScheduleId" if needed or keep it random
  test('Should return 404 for non-existing schedule_id', async () => {
    const nonExistingScheduleId = 'non-existing-schedule-id-123';
    try {
      await apiClient.post(`/api/v1/schedules/${nonExistingScheduleId}/activate`);
      fail('Expected 404 for non-existing schedule_id, but request succeeded.');
    } catch (error: any) {
      expect(error?.response?.status).toBe(404);
    }
  });

  // 6) Authorization & Authentication - Missing or invalid token
  test('Should return 401 or 403 when token is invalid or missing', async () => {
    // Create a client without authorization header
    const unauthorizedClient = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const scheduleId = 'test-schedule-imperative-001'; // Replace with a real existing schedule

    try {
      await unauthorizedClient.post(`/api/v1/schedules/${scheduleId}/activate`);
      fail('Expected 401 or 403 for unauthorized request, but request succeeded.');
    } catch (error: any) {
      expect([401, 403]).toContain(error?.response?.status);
    }
  });

  // 7) Edge Case: Large or special schedule_id
  test('Should handle requests with unexpectedly large schedule_id values', async () => {
    // Arbitrarily large string
    const largeScheduleId = 'a'.repeat(1000);

    try {
      await apiClient.post(`/api/v1/schedules/${largeScheduleId}/activate`);
      fail('Expected failure for excessively large schedule_id, but request succeeded.');
    } catch (error: any) {
      // Should respond with 400, 422, or possibly 404 if not found
      const statusCode = error?.response?.status;
      expect([400, 422, 404]).toContain(statusCode);
    }
  });

  // 8) Server Error Simulation (500)
  // NOTE: Typically, you cannot force a 500 unless the server is misconfigured or there's a mock.
  // This is a placeholder test to illustrate how you might test for server errors.
  test('Should handle 500 Internal Server Error gracefully (if the server responds with such)', async () => {
    // The actual approach to trigger a 500 depends on the API. This is a purely illustrative test.
    const scheduleId = 'trigger-500-error';

    try {
      await apiClient.post(`/api/v1/schedules/${scheduleId}/activate`);
      // If no error is thrown, the API did not produce a 500.
    } catch (error: any) {
      if (error?.response?.status === 500) {
        expect(error?.response?.status).toBe(500);
      } else {
        // If the server does not respond with 500, skip the assertion or check other statuses.
        expect([400, 401, 403, 404, 422, 500]).toContain(error?.response?.status);
      }
    }
  });
});
