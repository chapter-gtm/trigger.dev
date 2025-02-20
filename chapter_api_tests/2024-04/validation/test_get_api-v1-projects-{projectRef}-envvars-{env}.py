import axios, { AxiosError } from 'axios';
import { describe, it, expect } from '@jest/globals';

/**
 * Jest test suite for GET /api/v1/projects/{projectRef}/envvars/{env}
 * This suite validates:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Cases & Limits
 * 5. Authorization & Authentication
 */
describe('GET /api/v1/projects/{projectRef}/envvars/{env}', () => {
  const baseURL = process.env.API_BASE_URL;
  const token = process.env.API_AUTH_TOKEN;

  // Helper to build authorization headers
  const getAuthHeaders = (authToken?: string) => {
    return {
      headers: {
        Authorization: `Bearer ${authToken || token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  it('should return 200 and a valid response for a valid request', async () => {
    const projectRef = 'validProject';
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${projectRef}/envvars/${env}`;

    try {
      const response = await axios.get(url, getAuthHeaders());
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Basic schema validation (assuming response contains an "envVars" array)
      expect(response.data).toHaveProperty('envVars');
      expect(Array.isArray(response.data.envVars)).toBe(true);
    } catch (err) {
      const axiosError = err as AxiosError;
      fail(`Expected 2xx response, but got: ${axiosError.message}`);
    }
  });

  it('should return 400 or 404 when the projectRef is missing', async () => {
    const projectRef = '';
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${projectRef}/envvars/${env}`;

    try {
      await axios.get(url, getAuthHeaders());
      fail('Expected a 400 or 404 error, but request succeeded.');
    } catch (err) {
      const axiosError = err as AxiosError;
      // Depending on the API, this may be 400 (bad request) or 404 (not found)
      expect([400, 404]).toContain(axiosError.response?.status);
      expect(axiosError.response?.headers['content-type']).toMatch(/application\/json/i);
    }
  });

  it('should return 400 or 422 when the projectRef contains invalid characters', async () => {
    const projectRef = '???!!!';
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${projectRef}/envvars/${env}`;

    try {
      await axios.get(url, getAuthHeaders());
      fail('Expected a 400/422 error, but request succeeded.');
    } catch (err) {
      const axiosError = err as AxiosError;
      // Some APIs might respond with 400 or 422 for invalid inputs
      expect([400, 422]).toContain(axiosError.response?.status);
      expect(axiosError.response?.headers['content-type']).toMatch(/application\/json/i);
    }
  });

  it('should return 401 or 403 when the request is unauthorized', async () => {
    const projectRef = 'validProject';
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${projectRef}/envvars/${env}`;

    try {
      // Passing an invalid or missing token
      await axios.get(url, getAuthHeaders('invalidOrMissingToken'));
      fail('Expected a 401 or 403 error, but request succeeded.');
    } catch (err) {
      const axiosError = err as AxiosError;
      // API might respond with 401 or 403
      expect([401, 403]).toContain(axiosError.response?.status);
      expect(axiosError.response?.headers['content-type']).toMatch(/application\/json/i);
    }
  });

  it('should return 400 or 404 for an excessively large projectRef', async () => {
    // Testing boundary/limit conditions on projectRef length
    const largeProjectRef = 'a'.repeat(1000);
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${largeProjectRef}/envvars/${env}`;

    try {
      await axios.get(url, getAuthHeaders());
      fail('Expected a 400 or 404 error for large projectRef, but request succeeded.');
    } catch (err) {
      const axiosError = err as AxiosError;
      expect([400, 404]).toContain(axiosError.response?.status);
      expect(axiosError.response?.headers['content-type']).toMatch(/application\/json/i);
    }
  });

  it('should handle no environment variables found (empty list or 404)', async () => {
    // This tests the scenario where the project/env is valid but no env vars exist
    const projectRef = 'projectWithNoEnvVars';
    const env = 'dev';
    const url = `${baseURL}/api/v1/projects/${projectRef}/envvars/${env}`;

    try {
      const response = await axios.get(url, getAuthHeaders());
      // This may return 200 with an empty array, or 404 if resource does not exist
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.data).toHaveProperty('envVars');
        expect(Array.isArray(response.data.envVars)).toBe(true);
        // Expect empty array if no env vars are found
        expect(response.data.envVars.length).toBe(0);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      // If the API strictly returns 404 for missing envvars
      expect([404]).toContain(axiosError.response?.status);
    }
  });
});
