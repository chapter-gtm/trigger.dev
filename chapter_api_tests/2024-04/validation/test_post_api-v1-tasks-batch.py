import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';

// Load environment variables from .env (if present)
config();

// Retrieve base URL and auth token from environment variables
const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
const authToken = process.env.API_AUTH_TOKEN || '';

// Helper to create an axios instance with/without auth token
function getAxiosInstance(token?: string): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/v1/tasks/batch - Batch trigger tasks', () => {
  /**
   * 1. Valid request test
   * - Ensure the API responds with status 200.
   * - Validate the response headers and body.
   */
  it('should trigger tasks successfully with a valid payload', async () => {
    const axiosInstance = getAxiosInstance(authToken);
    const payload = {
      tasks: [
        { name: 'Task 1', payload: { param: 'value1' } },
        { name: 'Task 2', payload: { param: 'value2' } },
      ],
    };

    const response = await axiosInstance.post('/api/v1/tasks/batch', payload);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    // Basic response body validation
    expect(response.data).toBeDefined();
    // Additional schema validation checks can be added here
  });

  /**
   * 2. Invalid request body tests
   * - Missing or invalid request body
   * - Expect 400 or 422 (both are acceptable per instructions).
   */
  it('should return 400 or 422 for missing or invalid request body', async () => {
    const axiosInstance = getAxiosInstance(authToken);

    try {
      await axiosInstance.post('/api/v1/tasks/batch', {});
      fail('Expected an error but request succeeded');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response?.status);
      expect(error.response?.headers['content-type']).toContain('application/json');
    }
  });

  /**
   * 3. Exceeding payload limit test
   * - The endpoint supports up to 500 tasks.
   * - Sending more should trigger a 400 or 422.
   */
  it('should return 400 or 422 when tasks exceed the limit of 500', async () => {
    const axiosInstance = getAxiosInstance(authToken);
    const bigArray = new Array(501).fill({ name: 'Excess Task', payload: {} });

    try {
      await axiosInstance.post('/api/v1/tasks/batch', { tasks: bigArray });
      fail('Expected an error but request succeeded');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response?.status);
      expect(error.response?.headers['content-type']).toContain('application/json');
    }
  });

  /**
   * 4. Edge case: Empty tasks array
   * - The API might allow an empty array or reject it.
   * - Adjust the expected status accordingly if your API specifically disallows empty arrays.
   */
  it('should handle empty tasks array (boundary condition)', async () => {
    const axiosInstance = getAxiosInstance(authToken);
    const payload = {
      tasks: [],
    };

    let response;
    try {
      response = await axiosInstance.post('/api/v1/tasks/batch', payload);
    } catch (error: any) {
      response = error.response;
    }

    // Depending on your API design, 200, 400, or 422 are possible
    expect([200, 400, 422]).toContain(response?.status);
    if (response?.status === 200) {
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.data).toBeDefined();
    }
  });

  /**
   * 5. Unauthorized or forbidden tests
   * - API might return 401 or 403 when token is missing or invalid.
   */
  it('should fail with 401 or 403 when no authorization token is provided', async () => {
    const axiosInstance = getAxiosInstance(); // No token
    const payload = {
      tasks: [{ name: 'Task 1', payload: { param: 'value1' } }],
    };

    try {
      await axiosInstance.post('/api/v1/tasks/batch', payload);
      fail('Expected an error but request succeeded');
    } catch (error: any) {
      expect([401, 403]).toContain(error.response?.status);
      expect(error.response?.headers['content-type']).toContain('application/json');
    }
  });

  it('should fail with 401 or 403 when invalid token is provided', async () => {
    const axiosInstance = getAxiosInstance('InvalidToken123');
    const payload = {
      tasks: [{ name: 'Task 1', payload: { param: 'value1' } }],
    };

    try {
      await axiosInstance.post('/api/v1/tasks/batch', payload);
      fail('Expected an error but request succeeded');
    } catch (error: any) {
      expect([401, 403]).toContain(error.response?.status);
      expect(error.response?.headers['content-type']).toContain('application/json');
    }
  });

  /**
   * 6. Resource not found tests
   * - 404 can occur if the endpoint is incorrect or resource is missing.
   */
  it('should return 404 for an invalid endpoint path', async () => {
    const axiosInstance = getAxiosInstance(authToken);

    try {
      // Intentionally using a non-existent path
      await axiosInstance.post('/api/v1/tasks/batch/does-not-exist', {});
      fail('Expected an error but request succeeded');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
      expect(error.response?.headers['content-type']).toContain('application/json');
    }
  });
});
