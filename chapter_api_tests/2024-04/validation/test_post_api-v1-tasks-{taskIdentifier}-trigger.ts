import axios, { AxiosError } from 'axios';
import { describe, test, expect, beforeAll } from '@jest/globals';

const baseURL = process.env.API_BASE_URL || '';
const validAuthToken = process.env.API_AUTH_TOKEN || '';

function createAxiosInstance(token?: string) {
  return axios.create({
    baseURL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/v1/tasks/{taskIdentifier}/trigger', () => {
  let axiosInstance = createAxiosInstance(validAuthToken);

  beforeAll(() => {
    // Recreate axios instance if needed, for example ensuring fresh tokens
    axiosInstance = createAxiosInstance(validAuthToken);
  });

  test('should trigger a task successfully with valid data (200)', async () => {
    const taskIdentifier = 'validTask123';

    const response = await axiosInstance.post(`/api/v1/tasks/${taskIdentifier}/trigger`, {});

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    // Example response schema validation
    expect(response.data).toHaveProperty('status');
    expect(typeof response.data.status).toBe('string');
  });

  test('should return 401 or 403 for unauthorized requests when token is missing or invalid', async () => {
    const noAuthInstance = createAxiosInstance();
    const taskIdentifier = 'validTask123';

    try {
      await noAuthInstance.post(`/api/v1/tasks/${taskIdentifier}/trigger`, {});
      fail('Request should not succeed without a valid token');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // API might respond with 401 or 403 if unauthorized
        expect([401, 403]).toContain(error.response.status);
        expect(error.response.headers['content-type']).toMatch(/application\/json/i);
      } else {
        throw error;
      }
    }
  });

  test('should return 400 or 422 for invalid or malformed request data', async () => {
    // For example, invalid or empty taskIdentifier
    const invalidTaskIdentifier = '';

    try {
      await axiosInstance.post(`/api/v1/tasks/${invalidTaskIdentifier}/trigger`, { foo: 'bar' });
      fail('Request should not succeed with an invalid path parameter');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // Depending on implementation, API might return 400 or 422
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.headers['content-type']).toMatch(/application\/json/i);
        // Validate error response structure
        expect(error.response.data).toHaveProperty('error');
        expect(typeof error.response.data.error).toBe('string');
      } else {
        throw error;
      }
    }
  });

  test('should return 404 if the task identifier does not exist', async () => {
    const nonExistentTaskIdentifier = 'does-not-exist-000';

    try {
      await axiosInstance.post(`/api/v1/tasks/${nonExistentTaskIdentifier}/trigger`, {});
      fail('Request should not succeed for a non-existent resource');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        expect(error.response.status).toBe(404);
        expect(error.response.headers['content-type']).toMatch(/application\/json/i);
      } else {
        throw error;
      }
    }
  });

  test('should handle large payload gracefully', async () => {
    const taskIdentifier = 'validTask123';
    // Simulate a large request body
    const largeData = 'x'.repeat(1000000);

    const response = await axiosInstance.post(`/api/v1/tasks/${taskIdentifier}/trigger`, { testData: largeData });
    // Depending on API limits, we might get 200, 400, or 413
    expect([200, 400, 413]).toContain(response.status);
  });

  test('should include correct response headers when successful', async () => {
    const taskIdentifier = 'validTask123';
    const response = await axiosInstance.post(`/api/v1/tasks/${taskIdentifier}/trigger`, {});

    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toMatch(/application\/json/i);
  });

  test('should handle server errors (5xx) gracefully (simulated)', async () => {
    // This test assumes there is a way to simulate a server error by using a special identifier
    try {
      await axiosInstance.post('/api/v1/tasks/errorTrigger/trigger', {});
      fail('Request should have triggered an error');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // We expect certain 5xx codes here
        expect([500, 503]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });
});
