import axios, { AxiosResponse } from 'axios';
import { describe, it, expect } from '@jest/globals';

const BASE_URL = process.env.API_BASE_URL;
const AUTH_TOKEN = process.env.API_AUTH_TOKEN;

describe('POST /api/v1/tasks/{taskIdentifier}/trigger', () => {
  const validTaskIdentifier = '12345'; // Example valid identifier

  it('should trigger the task successfully for a valid request', async () => {
    expect(BASE_URL).toBeDefined();

    try {
      const response: AxiosResponse = await axios.post(
        `${BASE_URL}/api/v1/tasks/${validTaskIdentifier}/trigger`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
          },
        }
      );

      // Response Validation
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      // Check the response body structure
      expect(response.data).toHaveProperty('message');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Expected 200, but received ${error.response.status}: ${JSON.stringify(error.response.data)}`
        );
      } else {
        throw error;
      }
    }
  });

  it('should return 400 or 422 for invalid parameters (e.g., invalid taskIdentifier)', async () => {
    expect(BASE_URL).toBeDefined();

    // Testing an invalid or empty taskIdentifier
    const invalidIdentifier = ' ';

    try {
      await axios.post(
        `${BASE_URL}/api/v1/tasks/${invalidIdentifier}/trigger`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
          },
        }
      );
      throw new Error('Expected an error (400 or 422), but request succeeded');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.headers['content-type']).toMatch(/application\/json/);
      } else {
        throw error;
      }
    }
  });

  it('should return 401 or 403 for requests without a valid auth token', async () => {
    expect(BASE_URL).toBeDefined();

    try {
      await axios.post(
        `${BASE_URL}/api/v1/tasks/${validTaskIdentifier}/trigger`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            // Purposely omit Authorization header to test unauthorized access
          },
        }
      );
      throw new Error('Expected 401 or 403, but request succeeded');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([401, 403]).toContain(error.response.status);
        expect(error.response.headers['content-type']).toMatch(/application\/json/);
      } else {
        throw error;
      }
    }
  });

  it('should return 404 when the specified taskIdentifier does not exist', async () => {
    expect(BASE_URL).toBeDefined();

    // A taskIdentifier presumed not to exist
    const nonExistentTaskId = '99999999999';

    try {
      await axios.post(
        `${BASE_URL}/api/v1/tasks/${nonExistentTaskId}/trigger`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
          },
        }
      );
      throw new Error('Expected 404, but request succeeded');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(404);
        expect(error.response.headers['content-type']).toMatch(/application\/json/);
      } else {
        throw error;
      }
    }
  });

  it('should handle server errors (e.g., 500) gracefully', async () => {
    expect(BASE_URL).toBeDefined();

    // This is conceptual. Adjust path or data to intentionally trigger a server error if possible.
    try {
      await axios.post(
        `${BASE_URL}/api/v1/tasks/errorTrigger/trigger`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status >= 500 && error.response.status < 600) {
          // Validate response headers for 5xx
          expect(error.response.headers['content-type']).toMatch(/application\/json/);
        } else {
          // If it is not 5xx, fail the test
          throw new Error(`Expected 5xx, but received ${error.response.status}`);
        }
      } else {
        throw error;
      }
    }
  });
});