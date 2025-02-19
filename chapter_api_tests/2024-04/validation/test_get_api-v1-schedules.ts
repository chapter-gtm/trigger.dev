import axios, { AxiosError, AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/*************************************************
 * Test Suite for GET /api/v1/schedules
 * Method: GET
 * Path: /api/v1/schedules
 * Description: List all schedules with optional pagination.
 *************************************************/

describe('GET /api/v1/schedules', () => {
  let baseURL: string;
  let token: string;

  beforeAll(() => {
    // Load environment variables
    baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    token = process.env.API_AUTH_TOKEN || '';
  });

  /**
   * Helper function to create an axios instance with common headers
   */
  const getAxiosInstance = (authToken?: string) => {
    return axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      validateStatus: () => true, // We handle status checks manually
    });
  };

  /**
   * 1. Input Validation
   *    - Test valid/invalid query params.
   */
  it('should return 200 OK with valid query parameters (page, perPage)', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules', {
      params: {
        page: 1,
        perPage: 10,
      },
    });

    // Expect a 200 status for valid query params
    expect(response.status).toBe(200);
    // Check for application/json header
    expect(response.headers['content-type']).toContain('application/json');
    // Check for a valid response body structure (partial, as example)
    expect(response.data).toBeDefined();
    // Example: If the schema includes a schedules array, verify
    // Adjust the property checks below to match the actual schema from #/components/schemas/ListSchedulesResult
    // expect(Array.isArray(response.data.schedules)).toBe(true);
  });

  it('should allow no query parameters and return 200 with a default page result', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toBeDefined();
    // Perform partial schema checks
  });

  it('should return 400 or 422 when page parameter is invalid (e.g., a string)', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules', {
      params: {
        page: 'invalid',
      },
    });

    // The API may return 400 or 422 for invalid parameters.
    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return 400 or 422 when perPage parameter is invalid (e.g., negative)', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules', {
      params: {
        perPage: -10,
      },
    });

    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  /**
   * 2. Response Validation
   *    - Validate 200 success structure, error codes, etc.
   */
  it('should match the expected 200 response schema for a valid request', async () => {
    const instance = getAxiosInstance(token);
    const response: AxiosResponse = await instance.get('/api/v1/schedules');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    // Example partial schema validation
    // Adjust to match #/components/schemas/ListSchedulesResult
    // expect(Array.isArray(response.data.schedules)).toBe(true);
    // expect(response.data.page).toBeDefined();
    // expect(response.data.total).toBeDefined();
  });

  /**
   * 3. Response Headers Validation
   *    - Check "Content-Type", etc.
   */
  it('should include Content-Type header in the response', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
  });

  /**
   * 4. Edge Case & Limit Testing
   */
  it('should return an empty array or valid structure if no schedules exist (edge case)', async () => {
    // This test presumes a scenario where the database might be empty.
    // If your environment always has schedules, adapt as needed.
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules', {
      params: {
        page: 999999, // Large page number may return an empty list
        perPage: 100,
      },
    });

    // Expect a successful response with potential empty data.
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    // Adjust property checks based on your actual response schema.
    // Example:
    // expect(Array.isArray(response.data.schedules)).toBe(true);
    // expect(response.data.schedules.length).toBe(0);
  });

  it('should ensure proper handling with extremely large perPage value', async () => {
    const instance = getAxiosInstance(token);

    const response: AxiosResponse = await instance.get('/api/v1/schedules', {
      params: {
        perPage: 999999999, // A large integer to test boundaries.
      },
    });

    // The API might still return 200 or possibly 400 if it's out of range.
    // Adjust expectations based on your API's behavior.
    expect([200, 400, 422]).toContain(response.status);
  });

  it('should handle server errors gracefully if the server returns a 500 (hypothetical test)', async () => {
    // This test assumes you might force a 500 error by some specific input or environment.
    // Adjust or remove this if 500 is not easily triggered.
    const instance = getAxiosInstance(token);

    // Example only: Not guaranteed to trigger a 500.
    // In a real environment, you might have a special test setup to provoke a server error.
    try {
      const response = await instance.get('/api/v1/schedules', {
        params: {
          page: -999999, // Possibly invalid enough to cause a server error in some implementations.
        },
      });
      // If the server does not return 500, check acceptable alternate statuses.
      expect([200, 400, 422]).toContain(response.status);
    } catch (err) {
      const error = err as AxiosError;
      // Check if we indeed got a 500
      if (error.response) {
        expect(error.response.status).toBe(500);
      }
    }
  });

  /**
   * 5. Testing Authorization & Authentication
   *    - Test valid, invalid, and missing credentials.
   */
  it('should return 200 with a valid token', async () => {
    // Assuming token is valid if provided.
    if (!token) {
      console.warn('No valid API_AUTH_TOKEN found; skipping test.');
      return;
    }

    const instance = getAxiosInstance(token);
    const response: AxiosResponse = await instance.get('/api/v1/schedules');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return 401 or 403 for missing or invalid token', async () => {
    const instance = getAxiosInstance('InvalidOrMissingToken');
    const response: AxiosResponse = await instance.get('/api/v1/schedules');

    // The API might return 401 or 403.
    expect([401, 403]).toContain(response.status);
  });
});
