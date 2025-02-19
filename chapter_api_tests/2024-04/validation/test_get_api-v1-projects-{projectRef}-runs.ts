import axios from 'axios';
import { describe, it, expect } from '@jest/globals';

// Read environment variables
const baseURL = process.env.API_BASE_URL;
const authToken = process.env.API_AUTH_TOKEN;

// Helper function to create an Axios instance with or without authorization
function createAxiosInstance(withAuth = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (withAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return axios.create({
    baseURL,
    headers,
    validateStatus: () => true, // We'll manually check status codes
  });
}

describe('GET /api/v1/projects/{projectRef}/runs - List project runs', () => {
  const validProjectRef = 'my-valid-project'; // Replace with a known valid project reference
  const invalidProjectRef = ''; // Intentionally invalid (empty) to test error behavior

  // This suite tests the general success scenario with valid inputs.
  it('should return 200 and a valid JSON body for a valid request', async () => {
    const axiosInstance = createAxiosInstance(true);
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`);

    // Status code validation
    expect([200]).toContain(response.status);

    // Headers validation
    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toContain('application/json');

    // Basic structure of the response body according to #/components/schemas/ListRunsResult
    // For instance, expect it to have items, etc. Adjust based on actual schema
    expect(response.data).toHaveProperty('items');
    expect(Array.isArray(response.data.items)).toBe(true);
  });

  // Test filtering with query params (e.g. status, environment, etc.)
  it('should return 200 and filter results by status query param when provided', async () => {
    const axiosInstance = createAxiosInstance(true);
    // Example of a filter param (adjust key to match #/components/parameters/runsFilterWithEnv)
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        status: 'completed',
      },
    });

    expect([200]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');

    // Check that the response structure is still valid; if runs are returned,
    // they should match the filter (if your backend enforces it).
    // If none exist, items should be an empty array.
    expect(response.data).toHaveProperty('items');
    expect(Array.isArray(response.data.items)).toBe(true);
  });

  // Test pagination parameters from #/components/parameters/cursorPagination
  it('should handle pagination parameters (e.g., cursor) correctly', async () => {
    const axiosInstance = createAxiosInstance(true);
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        // Example: 'cursor' could be a string, depending on your API
        cursor: 'some-cursor-value',
      },
    });

    // The API may return 200 even if the cursor is invalid, or it may return 400.
    // Adjust the expectation based on how your API handles invalid or missing cursors.
    expect([200, 400]).toContain(response.status);
  });

  // Invalid projectRef should result in an error (e.g., 400, 404, or similar)
  it('should return an error code (400/404) when projectRef is invalid', async () => {
    const axiosInstance = createAxiosInstance(true);
    const response = await axiosInstance.get(`/api/v1/projects/${invalidProjectRef}/runs`);

    // Depending on implementation, could be 400, 404, etc.
    expect([400, 404]).toContain(response.status);
  });

  // Check invalid query param type
  it('should return 400 or 422 for invalid query parameter type', async () => {
    const axiosInstance = createAxiosInstance(true);
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        status: 12345, // Passing a number where a string is expected
      },
    });

    // The API might return 400 or 422
    expect([400, 422]).toContain(response.status);
  });

  // Test an unauthorized request (no token)
  it('should return 401 or 403 when no auth token is provided', async () => {
    const axiosInstance = createAxiosInstance(false);
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`);

    // The API might return 401 or 403 if no credentials are provided
    expect([401, 403]).toContain(response.status);
  });

  // Test an invalid/expired token
  it('should return 401 or 403 when an invalid auth token is provided', async () => {
    // Force an invalid token by passing nonsense
    const axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token'
      },
      validateStatus: () => true,
    });

    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`);
    expect([401, 403]).toContain(response.status);
  });

  // Test scenario: no runs found (e.g., using a filter that yields zero results)
  it('should return 200 with an empty list if no runs are found', async () => {
    const axiosInstance = createAxiosInstance(true);
    // Filter that is likely to yield no results, adjust as suitable for your API
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        status: 'this-status-does-not-exist',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toHaveProperty('items');
    expect(Array.isArray(response.data.items)).toBe(true);
    expect(response.data.items.length).toBe(0);
  });

  // Test extremely large or boundary values for pagination or filters
  it('should handle large pagination values gracefully', async () => {
    const axiosInstance = createAxiosInstance(true);
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        // e.g., possibly an extremely large cursor or some parameter
        cursor: '999999999999999999999999',
      },
    });

    // The API may return 200 with an empty result, 400, or some other code.
    expect([200, 400]).toContain(response.status);
  });

  // Optionally test for unexpected server error
  // Hard to force a 500 unless we tamper with the service or it's a known scenario.
  // In real tests, you might mock or simulate a server error.
  it('should handle unexpected internal server errors gracefully (if triggered)', async () => {
    // This test is not always feasible unless you can cause 500 from the API.
    // We'll just show the pattern.

    const axiosInstance = createAxiosInstance(true);
    // Possibly pass in something that you know triggers a 500 if your API has such a scenario.
    const response = await axiosInstance.get(`/api/v1/projects/${validProjectRef}/runs`, {
      params: {
        // Example: dividing by zero if your service does that, or invalid data that triggers 500
        forceInternalServerError: true,
      },
    });

    // The service may return 500 in that scenario.
    // For demonstration, we accept 500 or 400 or 200, depending on real behavior.
    expect([200, 400, 500]).toContain(response.status);
  });
});
