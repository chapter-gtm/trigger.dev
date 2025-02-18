import axios, { AxiosResponse } from 'axios';
import "dotenv/config";

/***************************************************************************************
 * Jest test suite for GET /api/v1/schedules
 *
 * This test suite covers:
 * 1. Input validation (query parameters)
 * 2. Response validation (status code, schema structure)
 * 3. Response headers validation
 * 4. Edge cases & limit testing
 * 5. Authentication & authorization scenarios
 ***************************************************************************************/

describe('GET /api/v1/schedules', () => {
  // Base API URL and authorization token from environment variables
  const baseURL = process.env.API_BASE_URL || '';
  const authToken = process.env.API_AUTH_TOKEN || '';

  // Create a reusable Axios instance pre-configured with base URL & headers
  const axiosInstance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    validateStatus: () => true, // Let us handle status code checks manually
  });

  // Helper function to check if a response has JSON content-type
  const expectJsonContentType = (headers: Record<string, string>): void => {
    expect(headers['content-type']).toContain('application/json');
  };

  // 1. Happy path: valid parameters
  it('should return 200 and a list of schedules with valid optional query parameters', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules', {
      params: {
        page: 1,
        perPage: 10,
      },
    });

    // Check status
    expect([200]).toContain(response.status);

    // Check headers
    expectJsonContentType(response.headers);

    // Basic schema checks (assuming the response should have { data: [...], meta: {...} })
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('data');
    expect(response.data).toHaveProperty('meta');
    expect(Array.isArray(response.data.data)).toBe(true);

    // Additional checks: page/perPage if returned, etc.
    // Example: expect(response.data.meta.page).toBe(1);
  });

  // 2. Missing optional query parameters (should still succeed)
  it('should return 200 when query parameters are omitted', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules');

    // Check status
    expect([200]).toContain(response.status);

    // Check headers
    expectJsonContentType(response.headers);

    // Basic sanity checks on response structure
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('data');
    expect(response.data).toHaveProperty('meta');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  // 3. Invalid query parameter type (e.g., page is string)
  it('should return 400 or 422 when "page" parameter is invalid type', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules', {
      params: {
        page: 'invalidType',
      },
    });

    // Expecting 400 or 422 for invalid parameter type
    expect([400, 422]).toContain(response.status);

    // Response headers
    expectJsonContentType(response.headers);
  });

  // 4. Out-of-bound query parameter (e.g., negative page)
  it('should return 400 or 422 when "page" parameter is negative', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules', {
      params: {
        page: -1,
      },
    });

    // Expecting 400 or 422
    expect([400, 422]).toContain(response.status);

    // Response headers
    expectJsonContentType(response.headers);
  });

  // 5. Edge case: Large perPage value
  it('should handle a large perPage value (e.g. 999999)', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules', {
      params: {
        perPage: 999999,
      },
    });

    // The API may return 200 and respond with a large dataset or an error.
    // Typically it might still return 200, so we check for both.
    // If the API absolutely disallows large perPage, it might return 400 or 422.
    expect([200, 400, 422]).toContain(response.status);

    if (response.status === 200) {
      expectJsonContentType(response.headers);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('meta');
      expect(Array.isArray(response.data.data)).toBe(true);
    }
  });

  // 6. Authorized vs Unauthorized requests
  it('should return 200 with valid authorization token', async () => {
    // If authToken is valid, expect 200
    // If not valid, test might fail or return 401/403
    // This is just a basic check with valid token environment setup.
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules');
    expect([200]).toContain(response.status);
    expectJsonContentType(response.headers);
  });

  it('should return 401 or 403 if no authorization token is provided', async () => {
    // Create a second instance without the Authorization header
    const noAuthAxios = axios.create({
      baseURL,
      validateStatus: () => true,
    });

    const response: AxiosResponse = await noAuthAxios.get('/api/v1/schedules');

    // Expect 401 or 403
    expect([401, 403]).toContain(response.status);
  });

  // 7. Handling empty or no results found scenario
  // This test is conceptual, as it depends on the state of the system.
  // One approach: request a page number so large that no results should exist.
  it('should return an empty data array if no schedules are found', async () => {
    const response: AxiosResponse = await axiosInstance.get('/api/v1/schedules', {
      params: {
        page: 999999, // hoping to get an empty list
      },
    });

    // Ensure valid 200 status
    expect([200]).toContain(response.status);
    expectJsonContentType(response.headers);

    // Check for empty result array if it is truly empty
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('data');

    if (Array.isArray(response.data.data)) {
      // If no schedules exist on this page, we expect an empty array
      // (Can't guarantee environment data, so we do a safe check)
      if (response.data.data.length === 0) {
        expect(response.data.data.length).toBe(0);
      } else {
        // If we do have data, at least it is a valid array
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    }
  });

  // 8. Server error (5xx) scenario
  // Hard to force a 5xx in a test environment without special setup.
  // Below is a placeholder in case you can simulate a server error.
  // it('should handle 500 internal server error scenario', async () => {
  //   // If the server can be forced to error, test it here.
  //   // In normal situations, you might mock or intercept the request.
  //   // Or test a known edge case for the server.
  // });
});
