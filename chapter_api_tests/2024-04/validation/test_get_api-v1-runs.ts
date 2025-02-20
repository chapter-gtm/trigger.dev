import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config as loadEnv } from 'dotenv';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

// Load environment variables
loadEnv();

// Create an axios instance for our tests
let apiClient: AxiosInstance;

beforeAll(() => {
  apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
});

afterAll(() => {
  // Any cleanup logic can go here
});

describe('GET /api/v1/runs - List runs', () => {
  it('should return 200 and a valid response body for a valid request with default parameters', async () => {
    const response: AxiosResponse = await apiClient.get('/api/v1/runs');

    // Response status
    expect(response.status).toBe(200);

    // Response headers
    expect(response.headers['content-type']).toContain('application/json');

    // Basic body validation (assuming the response returns an object with "runs")
    expect(response.data).toHaveProperty('runs');
    // Further validation can be performed if the OpenAPI schema is available.
  });

  it('should handle valid pagination query parameters (cursorPagination) and return 200', async () => {
    // Example: Using page/limit or "cursor" style pagination if applicable
    const params = {
      limit: 5,
      page: 1,
    };

    const response: AxiosResponse = await apiClient.get('/api/v1/runs', {
      params,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toHaveProperty('runs');
    // Optionally check if returned "runs" length is <= limit
  });

  it('should filter runs by valid filter parameters (runsFilter) and return 200', async () => {
    // Example status: "completed", version: "1.0.0"
    const params = {
      status: 'completed',
      version: '1.0.0',
    };

    const response: AxiosResponse = await apiClient.get('/api/v1/runs', {
      params,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toHaveProperty('runs');
    // Validate if the returned data actually matches the filter criteria if test data is known
  });

  it('should return an empty list if no matches are found for a given filter', async () => {
    const params = {
      status: 'nonexistent-status',
    };

    const response: AxiosResponse = await apiClient.get('/api/v1/runs', {
      params,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toHaveProperty('runs');
    // Expect possibly an empty array
    expect(Array.isArray(response.data.runs)).toBe(true);
    // If the system returns an empty array for no matches:
    expect(response.data.runs.length).toBe(0);
  });

  it('should return 400 or 422 for invalid query parameter types', async () => {
    try {
      // Passing a string where a number is expected, e.g., limit = 'invalid'
      await apiClient.get('/api/v1/runs', {
        params: {
          limit: 'invalid',
        },
      });
      // If it doesn’t throw, force fail
      fail('Expected an error for invalid query parameters.');
    } catch (error: any) {
      // The API may return 400 or 422 in this scenario
      const status = error.response?.status;
      expect([400, 422]).toContain(status);
    }
  });

  it('should return 401 or 403 when authorization token is invalid', async () => {
    const invalidClient = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        Authorization: 'Bearer invalid_token',
        'Content-Type': 'application/json',
      },
    });

    try {
      await invalidClient.get('/api/v1/runs');
      fail('Expected an unauthorized or forbidden error.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([401, 403]).toContain(status);
    }
  });

  it('should return 401 or 403 when authorization header is missing', async () => {
    const noAuthClient = axios.create({
      baseURL: process.env.API_BASE_URL,
    });

    try {
      await noAuthClient.get('/api/v1/runs');
      fail('Expected an unauthorized or forbidden error.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([401, 403]).toContain(status);
    }
  });

  it('should return 400 if request includes malformed query parameter', async () => {
    try {
      await apiClient.get('/api/v1/runs', {
        params: {
          status: '', // Possibly an empty string if status must be non-empty
        },
      });
      // If no error, force fail
      fail('Expected a 400 or 422 error for malformed query parameter.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([400, 422]).toContain(status);
    }
  });

  it('should return 404 for a non-existing endpoint', async () => {
    try {
      await apiClient.get('/api/v1/runs-nonexisting');
      fail('Expected a 404 Not Found error.');
    } catch (error: any) {
      // Some APIs might return 404 or 400, but typically 404 is expected for a missing route
      expect(error.response?.status).toBe(404);
    }
  });

  it('should handle server errors (5xx) gracefully if they occur', async () => {
    // This test simulates or checks the API’s behavior for server-side errors.
    // Without a real way to force a 5xx error, we typically rely on error conditions in local/dev environment.
    // You might skip this test or simulate a scenario if your test environment can trigger a server error.
    // Example is shown here for completeness:

    try {
      // Attempt a request that might trigger a server-side error
      await apiClient.get('/api/v1/runs', {
        params: {
          causeServerError: true, // If the API has some debug flag (this is hypothetical)
        },
      });
      fail('Expected a 5xx server error.');
    } catch (error: any) {
      const status = error.response?.status;
      // Commonly, status would be 500 or maybe 503
      if (status) {
        expect(status).toBeGreaterThanOrEqual(500);
        expect(status).toBeLessThan(600);
      } else {
        // If no status is returned, we fail the test
        fail('Expected a 5xx server error, but none was received.');
      }
    }
  });
});
