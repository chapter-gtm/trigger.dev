import axios, { AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Load environment variables
// Make sure to have API_BASE_URL and API_AUTH_TOKEN set in your environment
// e.g., export API_BASE_URL="https://your-api.com" && export API_AUTH_TOKEN="secret"

const BASE_URL = process.env.API_BASE_URL as string;
const AUTH_TOKEN = process.env.API_AUTH_TOKEN as string;

// Create a reusable Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Example: using Bearer token for Auth
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
});

// Utility to check if a given status code is in an allowed array.
function expectStatusToBeIn(
  received: number,
  allowed: number[]
): void {
  expect(allowed).toContain(received);
}

describe('GET /api/v1/schedules/{schedule_id}', () => {
  // You can define a valid schedule_id (if known) that exists in the system
  const VALID_SCHEDULE_ID = 'sched_1234';

  beforeAll(async () => {
    // Optional: Any setup needed before tests, e.g., seeding DB, etc.
  });

  afterAll(async () => {
    // Optional: Any cleanup needed after tests
  });

  it('should retrieve a schedule when provided with a valid schedule_id', async () => {
    // This test expects a successful 200 response.
    // Adjust VALID_SCHEDULE_ID if you have a known existing record.
    let response: AxiosResponse;

    try {
      response = await axiosInstance.get(`/api/v1/schedules/${VALID_SCHEDULE_ID}`);
      // Check the 200 OK status
      expect(response.status).toBe(200);
    } catch (error) {
      // Fail the test if any unexpected error occurs
      throw new Error(`Request failed unexpectedly: ${error}`);
    }

    // Response Headers Validation
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Response Body Validation (basic checks)
    const data = response.data;
    // Example: Basic schema checks; in a real test, you might use a JSON schema validator.
    // Here, we assume the returned object has an 'id' property.
    expect(data).toHaveProperty('id');
    expect(typeof data.id).toBe('string');
    // (Add additional schema validations as needed)
  });

  it('should return 401 or 403 if the request is unauthorized or forbidden', async () => {
    // Create a new axios instance without the Authorization header
    const unauthorizedAxios = axios.create({
      baseURL: BASE_URL,
    });

    try {
      await unauthorizedAxios.get(`/api/v1/schedules/${VALID_SCHEDULE_ID}`);
      // If no error is thrown, the test should fail because we expect a 401 or 403.
      throw new Error('Request did not fail as expected for unauthorized call.');
    } catch (error: any) {
      if (error.response) {
        const allowedAuthErrorCodes = [401, 403];
        expectStatusToBeIn(error.response.status, allowedAuthErrorCodes);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  });

  it('should return 404 when the schedule_id does not exist', async () => {
    const NON_EXISTENT_ID = 'sched_non_existent';

    try {
      await axiosInstance.get(`/api/v1/schedules/${NON_EXISTENT_ID}`);
      // If no error is thrown, the test should fail because we expect 404.
      throw new Error('Request did not fail as expected for non-existent resource.');
    } catch (error: any) {
      if (error.response) {
        // A 404 status is expected here.
        expect(error.response.status).toBe(404);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  });

  it('should return 400 or 422 for an invalid schedule_id format', async () => {
    // Use a clearly invalid format for schedule_id (e.g., containing spaces or special characters)
    const INVALID_SCHEDULE_ID = '!!!@#';

    try {
      await axiosInstance.get(`/api/v1/schedules/${INVALID_SCHEDULE_ID}`);
      throw new Error('Request did not fail as expected for invalid schedule_id.');
    } catch (error: any) {
      if (error.response) {
        const allowedErrorCodes = [400, 422];
        expectStatusToBeIn(error.response.status, allowedErrorCodes);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  });

  it('should handle edge case with an empty schedule_id', async () => {
    // Some APIs might interpret "/api/v1/schedules/" as a 404 or 400.
    // The behavior is API-specific, so we handle whichever code is documented.
    const EMPTY_ID = '';

    try {
      await axiosInstance.get(`/api/v1/schedules/${EMPTY_ID}`);
      throw new Error('Request did not fail as expected for empty schedule_id.');
    } catch (error: any) {
      if (error.response) {
        // Depending on API implementation, this could be 400, 404, 422, etc.
        const possibleErrorCodes = [400, 404, 422];
        expectStatusToBeIn(error.response.status, possibleErrorCodes);
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  });

  it('should validate response headers for a valid request', async () => {
    let response: AxiosResponse;
    try {
      response = await axiosInstance.get(`/api/v1/schedules/${VALID_SCHEDULE_ID}`);
      expect(response.status).toBe(200);
    } catch (error) {
      throw new Error(`Request failed unexpectedly: ${error}`);
    }

    // Check content-type
    expect(response.headers['content-type'].toLowerCase()).toMatch(/application\/json/);

    // If there are other custom headers the API should return, test them here.
    // Example:
    // expect(response.headers).toHaveProperty('x-ratelimit');
  });

  it('should handle potential 500 server error gracefully', async () => {
    // Force a scenario that might cause a server error if the API is known to fail for certain inputs.
    // This test is somewhat contrived; real usage depends on how your API triggers 500 errors.
    const SERVER_ERROR_ID = 'cause_server_error';

    try {
      await axiosInstance.get(`/api/v1/schedules/${SERVER_ERROR_ID}`);
      // If no error, the test passes only if the API truly never returns 500 for such a case.
      // Typically, you'd want to confirm the expected status code. If this is entirely hypothetical,
      // you can remove or adapt.
      // We place a fail if we expect a 500.
      // throw new Error('Request did not fail as expected for server error scenario.');
    } catch (error: any) {
      if (error.response) {
        // We might check if the status is 500 or not.
        if (error.response.status === 500) {
          // Confirm we got a 500.
          expect(error.response.status).toBe(500);
        } else {
          // If we get a different error, handle or fail.
          // Adjust based on actual API behavior.
          // e.g., expectStatusToBeIn(error.response.status, [400, 404, 422, 501, etc.]);
        }
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  });
});
