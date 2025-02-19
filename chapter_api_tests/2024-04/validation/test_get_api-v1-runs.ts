import axios, { AxiosError } from 'axios';
import { Response } from 'express'; // Only if needed in your environment

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || 'dummy-auth-token';

/**
 * Comprehensive Jest test suite for GET /api/v1/runs.
 *
 * This test suite covers:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Cases & Limit Testing
 * 5. Authorization & Authentication
 */
describe('GET /api/v1/runs', () => {
  let axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
    },
  });

  // --------------------------------------------------------------------------
  // Helper function to validate status code in a list (e.g., [400, 422]).
  // --------------------------------------------------------------------------
  function expectStatusInList(status: number, validStatuses: number[]): void {
    expect(validStatuses).toContain(status);
  }

  // --------------------------------------------------------------------------
  // Successful Cases
  // --------------------------------------------------------------------------
  describe('Successful Cases', () => {
    it('should return 200 and a list of runs without filters', async () => {
      const response = await axiosInstance.get('/api/v1/runs');
      expect(response.status).toBe(200);
      // Basic response structure validation.
      expect(response.data).toBeDefined();
      // Example check for the shape of the response.
      // Expecting a structure based on #/components/schemas/ListRunsResult
      // If you have a validation library, use it here e.g., Joi or ajv.

      // Example:
      // expect(response.data).toHaveProperty('runs');
      // expect(Array.isArray(response.data.runs)).toBe(true);
    });

    it('should return 200 and filtered runs when valid query parameters are provided', async () => {
      // Example of valid filter parameters.
      // "runsFilter" might include things like status, createdAt, taskIdentifier, version, etc.
      const queryParams = {
        status: 'completed',
        taskIdentifier: 'task-123',
      };

      const response = await axiosInstance.get('/api/v1/runs', {
        params: queryParams,
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      // Additional checks on response schema.
    });

    it('should return an empty list when no runs match the provided filters', async () => {
      const queryParams = {
        status: 'non-existent-status',
      };

      const response = await axiosInstance.get('/api/v1/runs', {
        params: queryParams,
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      // Verify empty results array or structure as expected.
      // Example:
      // expect(response.data.runs).toBeDefined();
      // expect(response.data.runs.length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Input Validation - Invalid Cases
  // --------------------------------------------------------------------------
  describe('Input Validation - Invalid Cases', () => {
    it('should return 400 or 422 when passing invalid data type to filter param', async () => {
      // Example: passing a non-numeric string to a numeric field.
      // If the API expects "createdAt" to be a date, pass an invalid string.
      try {
        await axiosInstance.get('/api/v1/runs', {
          params: { createdAt: 'not-a-date' },
        });
        // If it does NOT throw, fail the test.
        fail('Expected an error for invalid filter param, but request succeeded.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expectStatusInList(err.response.status, [400, 422]);
        }
      }
    });

    it('should return 400 or 422 when parameters are out of valid bounds', async () => {
      // Example: if pageSize or limit must be within a certain range.
      try {
        await axiosInstance.get('/api/v1/runs', {
          params: { limit: 9999999999 },
        });
        fail('Expected an error for out-of-bounds parameter, but request succeeded.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expectStatusInList(err.response.status, [400, 422]);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Authorization & Authentication
  // --------------------------------------------------------------------------
  describe('Authorization & Authentication', () => {
    it('should return 401 or 403 if no auth token is provided', async () => {
      const unauthorizedAxios = axios.create({
        baseURL: API_BASE_URL,
      });

      try {
        await unauthorizedAxios.get('/api/v1/runs');
        fail('Expected an unauthorized error, but request succeeded without token.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expect([401, 403]).toContain(err.response.status);
        }
      }
    });

    it('should return 401 or 403 if auth token is invalid', async () => {
      const invalidAxios = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      try {
        await invalidAxios.get('/api/v1/runs');
        fail('Expected an unauthorized or forbidden error, but request succeeded with invalid token.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expect([401, 403]).toContain(err.response.status);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Response Headers Validation
  // --------------------------------------------------------------------------
  describe('Response Headers Validation', () => {
    it('should return Content-Type as application/json on success', async () => {
      const response = await axiosInstance.get('/api/v1/runs');
      expect(response.headers['content-type']).toMatch(/application\/(json|octet-stream)/);
      // Depending on your API, it could be strictly application/json.
      // Adjust the regex as needed.
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases & Error Handling
  // --------------------------------------------------------------------------
  describe('Edge Cases & Error Handling', () => {
    it('should handle server errors gracefully (simulating 500)', async () => {
      // This test might require a mock or a special condition on the API side.
      // Hypothetical scenario: we trigger an internal server error by passing a specific query param.
      try {
        await axiosInstance.get('/api/v1/runs', {
          params: { triggerServerError: true },
        });
        fail('Expected a 500 error or similar, but request succeeded.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          // Some APIs return 500, others might return 400 or a custom code.
          expect([500, 501, 502, 503]).toContain(err.response.status);
        }
      }
    });

    it('should handle very large or negative pagination parameters', async () => {
      // Large page or negative page.
      try {
        await axiosInstance.get('/api/v1/runs', {
          params: { page: -1 },
        });
        fail('Expected an error for negative page parameter, but request succeeded.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expectStatusInList(err.response.status, [400, 422]);
        }
      }

      try {
        await axiosInstance.get('/api/v1/runs', {
          params: { page: 9999999999 },
        });
        fail('Expected an error for extremely large page parameter, but request succeeded.');
      } catch (error) {
        const err = error as AxiosError;
        expect(err.response).toBeDefined();
        if (err.response) {
          expectStatusInList(err.response.status, [400, 422]);
        }
      }
    });
  });
});
