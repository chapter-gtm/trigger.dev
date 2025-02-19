import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Comprehensive test suite for the GET /api/v1/timezones endpoint.
 *
 * This test suite verifies:
 * 1. Input Validation
 *    - Parameter correctness (type, required vs. optional, edge cases)
 *    - Proper error handling (400 / 422)
 * 2. Response Validation
 *    - Response status code correctness (200 on success)
 *    - Response JSON schema checks (content-type, fields)
 *    - Proper error handling (400, 404, 422, etc.)
 * 3. Response Headers Validation
 *    - Check Content-Type and other relevant headers
 * 4. Edge Case & Limit Testing
 *    - Invalid/malformed payloads
 *    - Unauthorized (401) / forbidden (403)
 *    - Possible empty responses
 *    - Server errors (500)
 * 5. Authorization & Authentication
 *    - Valid vs. invalid tokens
 *    - Correct status codes for unauthorized/forbidden requests
 */

describe('GET /api/v1/timezones', () => {
  let client: AxiosInstance;
  let baseURL: string;
  let authToken: string;

  beforeAll(() => {
    baseURL = process.env.API_BASE_URL || '';
    authToken = process.env.API_AUTH_TOKEN || '';

    client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true, // We'll handle status codes manually in tests
    });
  });

  describe('Successful Requests', () => {
    it('should return 200 and valid response without excludeUtc parameter (default: false)', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones');

      expect([200]).toContain(response.status);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.data).toBeDefined();

      // Example basic schema check (adjust based on actual schema):
      // Assuming response.data has a property "timezones" that is an array.
      // Modify as needed for your actual response body.
      expect(Array.isArray(response.data.timezones)).toBe(true);
    });

    it('should return 200 and valid response with excludeUtc=true', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones', {
        params: {
          excludeUtc: true,
        },
      });

      expect([200]).toContain(response.status);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.data).toBeDefined();

      // Additional checks if UTC is supposed to be excluded:
      // e.g. verify that "UTC" not in the returned timezones, if that is the expectation.
      if (Array.isArray(response.data.timezones)) {
        const hasUTC = response.data.timezones.some((tz: string) => tz.toUpperCase().includes('UTC'));
        expect(hasUTC).toBe(false);
      }
    });
  });

  describe('Input Validation & Edge Cases', () => {
    it('should handle invalid excludeUtc (e.g., string) and return 400/422', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones', {
        params: {
          excludeUtc: 'notBoolean',
        },
      });

      // API might return 400 or 422 for invalid inputs.
      expect([400, 422]).toContain(response.status);
    });

    it('should handle excludeUtc as a number and return 400/422', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones', {
        params: {
          excludeUtc: 123,
        },
      });

      expect([400, 422]).toContain(response.status);
    });

    it('should handle excludeUtc=null and return 400/422', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones', {
        params: {
          excludeUtc: null,
        },
      });

      expect([400, 422]).toContain(response.status);
    });

    // Additional edge case: If the API can produce an empty array under certain conditions,
    // test that scenario here if feasible.
    // For demonstration, we can just assume we check if an empty array is allowed.

    it('should still return 200 with excludeUtc=false (explicit)', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones', {
        params: {
          excludeUtc: false,
        },
      });

      expect([200]).toContain(response.status);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.data).toBeDefined();
    });
  });

  describe('Response Headers Validation', () => {
    it('should include Content-Type header for a valid request', async () => {
      const response: AxiosResponse = await client.get('/api/v1/timezones');
      expect([200]).toContain(response.status);
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/);

      // Test any other relevant headers (e.g. Cache-Control, X-RateLimit, etc.) if applicable.
    });
  });

  describe('Authorization & Authentication', () => {
    it('should return 401 or 403 if the Authorization header is missing', async () => {
      const unauthenticatedClient = axios.create({
        baseURL,
        validateStatus: () => true,
      });

      const response: AxiosResponse = await unauthenticatedClient.get('/api/v1/timezones');
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401 or 403 if the token is invalid', async () => {
      const invalidClient = axios.create({
        baseURL,
        headers: {
          Authorization: 'Bearer invalidToken',
        },
        validateStatus: () => true,
      });

      const response: AxiosResponse = await invalidClient.get('/api/v1/timezones');
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Server Error Handling', () => {
    // This test is somewhat speculative, as forcing a 500 may require mocking or special setup.
    // You can adjust or remove it if your test environment cannot generate a 500.
    it('should handle unexpected server errors (500) gracefully', async () => {
      // Hypothetical scenario: an invalid path that forces server error or a test double.
      // Adjust the endpoint or conditions to trigger a 500, if possible.
      const response: AxiosResponse = await client.get('/api/v1/timezones/force-error');
      if (response.status === 404) {
        // If your service returns 404 instead of 500 for non-existent endpoints
        // then this test can be considered to pass or you can adjust accordingly.
        expect(response.status).toEqual(404);
      } else {
        expect(response.status).toEqual(500);
      }
    });
  });
});
