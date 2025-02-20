import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Below tests focus on DELETE /api/v1/schedules/{schedule_id}
 * using Jest (test framework) + axios (HTTP client) in TypeScript.
 *
 * Make sure to:
 * 1. Set process.env.API_BASE_URL to your API base URL.
 * 2. Set process.env.API_AUTH_TOKEN to a valid auth token for authorization.
 * 3. Provide a valid IMPERATIVE schedule ID below if you want to test 200 success.
 *    (or create one in a setup step if needed.)
 */

// Example schedule IDs for testing. Modify these to valid/invalid values in your environment.
// The validScheduleId should reference an existing "IMPERATIVE" schedule.
const validScheduleId = 'YOUR_VALID_IMPERATIVE_SCHEDULE_ID';
// A schedule ID that does not exist.
const nonExistentScheduleId = 'nonexistent-schedule-id';
// A malformed schedule ID.
const invalidScheduleId = '!!!';

// Utility function to create an Axios instance.
function createApiClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    validateStatus: () => true, // allow us to handle status codes ourselves
  });
}

// Main test suite
describe('DELETE /api/v1/schedules/{schedule_id}', () => {
  let apiClient: AxiosInstance;

  beforeAll(() => {
    // Create a client with valid auth token
    apiClient = createApiClient(process.env.API_AUTH_TOKEN);
  });

  // 1. Input Validation: Missing or invalid parameters

  it('should return 404 (or possibly 400) when schedule_id is empty', async () => {
    // Attempt to DELETE with an empty schedule ID (effectively /api/v1/schedules/)
    const response: AxiosResponse = await apiClient.delete('/api/v1/schedules/');
    // Depending on the server’s configuration, this might return 404, 400, or another error.
    // We expect an error since the path is incomplete.
    expect(response.status).toBeGreaterThanOrEqual(400);
    // Some servers might treat it as 404 Not Found.
    // If your API returns 400 or 422 for invalid path params, adapt expectations accordingly.
  });

  it('should return 400 or 422 for a malformed schedule_id', async () => {
    const response: AxiosResponse = await apiClient.delete(`/api/v1/schedules/${invalidScheduleId}`);
    // Many APIs will respond with 400 or 422 for invalid ID formats.
    expect([400, 422]).toContain(response.status);
  });

  // 2. Response Validation (200 success, 404 Not Found, etc.)

  it('should delete schedule successfully (200) for a valid IMPERATIVE schedule_id', async () => {
    // If validScheduleId references an existing schedule, we expect a 200.
    // This test will fail if that schedule does not exist.
    const response: AxiosResponse = await apiClient.delete(`/api/v1/schedules/${validScheduleId}`);
    // Check status code
    expect(response.status).toBe(200);
    // If the response body has a schema, verify required fields.
    // e.g., expect(response.data).toHaveProperty('message', 'Schedule deleted successfully');

    // 3. Response Headers Validation
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    // If other headers are relevant, check them here.
  });

  it('should return 404 Not Found for a non-existent schedule_id', async () => {
    const response: AxiosResponse = await apiClient.delete(`/api/v1/schedules/${nonExistentScheduleId}`);
    expect(response.status).toBe(404);
    // Optionally check the response body for error details, if defined.
    // e.g. expect(response.data).toHaveProperty('error', 'Resource not found');
  });

  // 4. Edge Case & Limit Testing

  it('should handle extremely large schedule_id gracefully', async () => {
    const largeScheduleId = 'a'.repeat(1000); // artificially large string
    const response: AxiosResponse = await apiClient.delete(`/api/v1/schedules/${largeScheduleId}`);
    // Could be 400, 404, or 414 (URI Too Long) depending on server config.
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  // 5. Testing Authorization & Authentication

  it('should return 401 or 403 when no auth token is provided', async () => {
    const unauthorizedClient = createApiClient(); // no token
    const response: AxiosResponse = await unauthorizedClient.delete(`/api/v1/schedules/${validScheduleId}`);
    expect([401, 403]).toContain(response.status);
  });

  it('should return 401 or 403 for an invalid auth token', async () => {
    const invalidAuthClient = createApiClient('invalid-token');
    const response: AxiosResponse = await invalidAuthClient.delete(`/api/v1/schedules/${validScheduleId}`);
    expect([401, 403]).toContain(response.status);
  });

  // Additional tests could be added for server errors (e.g., 500) if you have a way to trigger them.

  afterAll(() => {
    // Cleanup or restore any resources if needed
  });
});
