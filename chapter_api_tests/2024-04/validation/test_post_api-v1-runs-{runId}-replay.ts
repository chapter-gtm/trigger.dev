import axios, { AxiosResponse } from 'axios';
import { describe, it, expect } from '@jest/globals';

// These environment variables should be set in your test environment.
// Example:
// API_BASE_URL=https://your-api-endpoint.com
// API_AUTH_TOKEN=someValidAuthToken
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

// Helper function to create configured axios instance.
// We disable axios' default status throwing so we can test response codes explicitly.
function createAxiosInstance(token?: string) {
  return axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true, // Let us handle response codes manually
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}

/**
 * Comprehensive Jest test suite for POST /api/v1/runs/{runId}/replay
 *
 * This covers:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Testing Authorization & Authentication
 */
describe('POST /api/v1/runs/{runId}/replay', () => {
  // A known valid runId for testing (replace with a real one if available).
  // In a real-world setting, you might first create a run, then replay it.
  const validRunId = 'existing-run-id';
  
  // A runId that is presumably not found in the system.
  const nonExistentRunId = 'non-existent-run-id';

  // A runId that is invalid (e.g., empty), expected to cause error 400 or 422.
  const invalidRunId = '';

  // A runId that is malformed or extremely large.
  const largeRunId = 'x'.repeat(1024); // 1024 characters

  it('should replay a run successfully with a valid runId (expect 200)', async () => {
    const axiosInstance = createAxiosInstance(AUTH_TOKEN);
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${validRunId}/replay`
    );

    // Check status code
    expect(response.status).toBe(200);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check response body schema
    expect(response.data).toHaveProperty('id');
    expect(typeof response.data.id).toBe('string');
  });

  it('should return 400 or 422 for an invalid or empty runId', async () => {
    const axiosInstance = createAxiosInstance(AUTH_TOKEN);
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${invalidRunId}/replay`
    );

    // Expect 400 or 422
    expect([400, 422]).toContain(response.status);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check error structure
    expect(response.data).toHaveProperty('error');
    // The error might be one of:
    //  - "Invalid or missing run ID"
    //  - "Failed to create new run"
    // or another validation message if 422 is used.
  });

  it('should return 404 if the runId does not exist', async () => {
    const axiosInstance = createAxiosInstance(AUTH_TOKEN);
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${nonExistentRunId}/replay`
    );

    // Expect 404
    expect(response.status).toBe(404);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    expect(response.data).toHaveProperty('error');
    // Should be "Run not found" as per schema
    expect(response.data.error).toBe('Run not found');
  });

  it('should handle extremely large runId (expect 400 or 422)', async () => {
    const axiosInstance = createAxiosInstance(AUTH_TOKEN);
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${largeRunId}/replay`
    );

    // We expect the server to reject this with 400 or 422.
    expect([400, 422]).toContain(response.status);

    expect(response.headers['content-type']).toMatch(/application\/json/i);
    expect(response.data).toHaveProperty('error');
  });

  it('should return 401 or 403 when no auth token is provided', async () => {
    const axiosInstance = createAxiosInstance(); // No token
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${validRunId}/replay`
    );

    // Expect 401 or 403 for missing or invalid token
    expect([401, 403]).toContain(response.status);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check error structure
    expect(response.data).toHaveProperty('error');
    // The error might be "Invalid or Missing API key" or another unauthorized/forbidden error.
  });

  it('should return 401 or 403 for an invalid auth token', async () => {
    const axiosInstance = createAxiosInstance('invalid-token');
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${validRunId}/replay`
    );

    expect([401, 403]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    expect(response.data).toHaveProperty('error');
  });

  it('should handle potential server error (5xx) gracefully', async () => {
    // Forcing a 500 can be tricky, but we can show a test skeleton.
    // In practice, you might set up a scenario that triggers a server error.

    const axiosInstance = createAxiosInstance(AUTH_TOKEN);

    // This is just a demonstration. Adjust if you have a known condition that triggers 500.
    // For example, you might pass some parameter that the server is known to handle incorrectly.
    const response: AxiosResponse = await axiosInstance.post(
      `/api/v1/runs/${validRunId}/replay`,
      {
        // Possibly a known invalid or conflicting payload if the API expects or allows a body.
      }
    );

    // If the server truly returns 500, you can test it like:
    if (response.status >= 500 && response.status < 600) {
      expect(response.status).toBeGreaterThanOrEqual(500);
      expect(response.headers['content-type']).toMatch(/application\/json/i);
      expect(response.data).toHaveProperty('error');
    } else {
      // If no 5xx is returned, at least check that we did not succeed.
      expect(response.status).not.toBe(200);
    }
  });
});
