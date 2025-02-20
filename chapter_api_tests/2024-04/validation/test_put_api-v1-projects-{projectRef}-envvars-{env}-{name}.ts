import axios, { AxiosError, AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Test suite for PUT /api/v1/projects/{projectRef}/envvars/{env}/{name}
 *
 * This suite covers:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Authorization & Authentication Testing
 */

describe('PUT /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  let apiBaseUrl: string;
  let authToken: string;

  const validProjectRef = 'testProject';
  const validEnv = 'development';
  const validName = 'TEST_VAR';

  /**
   * Utility function to build the full endpoint URL.
   */
  const buildUrl = (
    projectRef: string,
    env: string,
    name: string
  ): string => {
    return `${apiBaseUrl}/api/v1/projects/${projectRef}/envvars/${env}/${name}`;
  };

  /**
   * Axios configuration with optional authorization.
   */
  const createAxiosConfig = (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { headers };
  };

  /**
   * Validate the response headers for JSON content type.
   */
  const expectJsonContentType = (response: AxiosResponse) => {
    expect(response.headers['content-type']).toMatch(/application\/json/i);
  };

  beforeAll(() => {
    apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    authToken = process.env.API_AUTH_TOKEN || '';
  });

  /**
   * 1) Testing a successful update with valid data.
   */
  it('should update the environment variable successfully with valid data (200)', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);
    const requestData = {
      value: 'UpdatedValue',
      // Add any other required fields based on the actual schema, e.g. type/secret...
    };

    let response: AxiosResponse;
    try {
      response = await axios.put(url, requestData, createAxiosConfig(authToken));
      expect(response.status).toBe(200);
      expectJsonContentType(response);

      // Example response schema check (Update according to actual SucceedResponse schema)
      // For instance, if SucceedResponse has { success: boolean, message: string }
      expect(response.data).toHaveProperty('success');
      expect(response.data).toHaveProperty('message');
      expect(response.data.success).toBe(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        // If this call unexpectedly fails, report details.
        console.error('Unexpected error response:', err.response.data);
      }
      throw err;
    }
  });

  /**
   * 2) Testing invalid request body -> expect 400 or 422.
   */
  it('should return 400 or 422 for invalid request body', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    // Missing required fields or invalid data type.
    const invalidRequestData = {
      // e.g., missing "value" or using an invalid data type
      value: 1234, // Suppose "value" must be a string based on the schema.
    };

    try {
      await axios.put(url, invalidRequestData, createAxiosConfig(authToken));
      // If the request does not fail, then we did not get the expected error.
      throw new Error('Expected 400 or 422 error, but request succeeded.');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        expect([400, 422]).toContain(err.response.status);
        expectJsonContentType(err.response);
        // Example schema check for an error response
        // Could be { error: string, details?: any } depending on actual schema
        expect(err.response.data).toHaveProperty('error');
      } else {
        throw err;
      }
    }
  });

  /**
   * 3) Testing missing or invalid auth token -> expect 401 or 403.
   */
  it('should return 401 or 403 if the auth token is missing or invalid', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    const requestData = {
      value: 'AnyValue',
    };

    try {
      await axios.put(url, requestData, createAxiosConfig('invalid-token'));
      throw new Error('Expected 401 or 403 error, but request succeeded.');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        expect([401, 403]).toContain(err.response.status);
        expectJsonContentType(err.response);
        expect(err.response.data).toHaveProperty('error');
      } else {
        throw err;
      }
    }
  });

  /**
   * 4) Testing resource not found -> expect 404.
   */
  it('should return 404 if the specified project/env/name does not exist', async () => {
    const invalidProjectRef = 'doesNotExist';
    const invalidEnv = 'notARealEnv';
    const invalidName = 'UNKNOWN_VAR';

    const url = buildUrl(invalidProjectRef, invalidEnv, invalidName);
    const requestData = { value: 'AnyValue' };

    try {
      await axios.put(url, requestData, createAxiosConfig(authToken));
      throw new Error('Expected 404 error, but request succeeded.');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        expect(err.response.status).toBe(404);
        expectJsonContentType(err.response);
        expect(err.response.data).toHaveProperty('error');
      } else {
        throw err;
      }
    }
  });

  /**
   * 5) Testing large input data (edge case & limit testing).
   * Provide an extremely long value.
   */
  it('should handle large payloads correctly', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    // 10,000 characters string as an example
    const largeValue = 'X'.repeat(10000);
    const requestData = {
      value: largeValue,
    };

    try {
      const response = await axios.put(url, requestData, createAxiosConfig(authToken));
      // Depending on the API's limits, it may succeed or fail with 400.
      // Adjust expectations as per your API specification.

      // If we expect success:
      expect(response.status).toBe(200);
      expectJsonContentType(response);
      expect(response.data).toHaveProperty('success');
      expect(response.data.success).toBe(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        // If there's a size limit, we might get 400 or 413.
        expect([400, 413]).toContain(err.response.status);
        expectJsonContentType(err.response);
        expect(err.response.data).toHaveProperty('error');
      } else {
        throw err;
      }
    }
  });

  /**
   * 6) Testing behavior when no request body is provided.
   */
  it('should return 400 or 422 if no request body is provided', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    try {
      await axios.put(url, {}, createAxiosConfig(authToken));
      throw new Error('Expected 400 or 422 error, but request succeeded.');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        expect([400, 422]).toContain(err.response.status);
        expectJsonContentType(err.response);
        expect(err.response.data).toHaveProperty('error');
      } else {
        throw err;
      }
    }
  });

  /**
   * 7) (Optional) Testing rate limiting (429) if applicable.
   * This test is commented out by default because it might require multiple calls.
   * Uncomment if the API has rate-limit enforcement in place.
   */
  // it('should return 429 if the request is rate-limited', async () => {
  //   const url = buildUrl(validProjectRef, validEnv, validName);
  //   const requestData = { value: 'RateTest' };
  //
  //   for (let i = 0; i < 1000; i++) {
  //     try {
  //       await axios.put(url, requestData, createAxiosConfig(authToken));
  //     } catch (err: unknown) {
  //       if (err instanceof AxiosError && err.response) {
  //         if (err.response.status === 429) {
  //           expect(err.response.data).toHaveProperty('error');
  //           return;
  //         }
  //       }
  //     }
  //   }
  //   throw new Error('Expected 429 error, but request did not reach rate limit.');
  // });

  /**
   * 8) (Optional) Testing server errors (5xx). This is hard to force from the client side.
   * You could mock or intercept axios to simulate a 500 response.
   */
  // it('should handle 500 server error gracefully', async () => {
  //   // This test is typically done by mocking the API or error.
  // });
});
