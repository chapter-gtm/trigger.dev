import axios, { AxiosInstance } from 'axios';
import { AxiosResponse } from 'axios';

/**
 * Jest test suite for GET /api/v3/runs/{runId}
 *
 * Environment variables:
 * - API_BASE_URL: Base URL of the API (e.g. https://api.example.com)
 * - API_AUTH_TOKEN: Authentication token (can be public or secret key)
 * - API_PUBLIC_TOKEN: (Optional) Another token to test public-key behavior.
 *
 * Note: This test suite demonstrates various scenarios for input validation,
 * response validation, response headers, edge cases, and authentication.
 * Replace the placeholder run IDs with real or mock values for your actual testing.
 */

describe('GET /api/v3/runs/{runId}', () => {
  let client: AxiosInstance;

  const baseURL = process.env.API_BASE_URL;
  const secretToken = process.env.API_AUTH_TOKEN; // Presumed secret key
  const publicToken = process.env.API_PUBLIC_TOKEN; // Optionally used for public-key tests

  // Placeholder run IDs. Replace these with actual/valid IDs for integration tests.
  const validRunId = 'valid-run-id';
  const nonExistentRunId = 'non-existent-run-id';
  const invalidRunId = '!!!'; // Malformed run ID

  beforeAll(() => {
    // Create an axios instance with baseURL
    client = axios.create({
      baseURL,
      timeout: 15000, // 15 seconds
      validateStatus: () => true, // Let us handle the status code checks in tests.
    });
  });

  /**
   * Helper to make the GET request.
   * @param runId The run ID to retrieve.
   * @param token The authorization token.
   */
  const getRun = async (runId: string, token?: string): Promise<AxiosResponse> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return client.get(`/api/v3/runs/${runId}`, {
      headers,
    });
  };

  /********************************************************************************
   * 1. INPUT VALIDATION TESTS
   ********************************************************************************/

  it('should return 400 or 422 for invalid run ID format', async () => {
    // For an obviously invalid runId, the API may respond with 400 or 422.
    const response = await getRun(invalidRunId, secretToken);

    // Check that the status is either 400 or 422
    expect([400, 422]).toContain(response.status);

    // Optionally check the error message structure
    if (response.status === 400 || response.status === 422) {
      expect(response.data).toHaveProperty('error');
    }
  });

  it('should return 404 if run does not exist', async () => {
    // The API may respond with 404 if the run is not found.
    const response = await getRun(nonExistentRunId, secretToken);

    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('error', 'Run not found');
  });

  /********************************************************************************
   * 2. RESPONSE VALIDATION
   ********************************************************************************/

  it('should return 200 and match the expected schema for a valid run ID (secret token)', async () => {
    // Assuming the validRunId refers to an existing run.
    const response = await getRun(validRunId, secretToken);

    expect(response.status).toBe(200);
    // Check for presence of required fields in the response.
    // The actual schema keys may differ based on your OpenAPI definitions.
    // For example:
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('status');
    expect(response.data).toHaveProperty('payload');
    expect(response.data).toHaveProperty('output');
    expect(response.data).toHaveProperty('attempts');

    // Additional checks for field types, etc.
    // e.g., expect(typeof response.data.status).toBe('string');
  });

  /********************************************************************************
   * 3. RESPONSE HEADERS VALIDATION
   ********************************************************************************/

  it('should include appropriate response headers for a valid run', async () => {
    const response = await getRun(validRunId, secretToken);

    // Verify status code.
    expect(response.status).toBe(200);

    // Check Content-Type header is application/json.
    expect(response.headers['content-type']).toContain('application/json');

    // Check for other optional headers like Cache-Control or Rate-Limit.
    // Example:
    // expect(response.headers).toHaveProperty('cache-control');
    // expect(response.headers).toHaveProperty('x-ratelimit-limit');
  });

  /********************************************************************************
   * 4. EDGE CASE & LIMIT TESTING
   ********************************************************************************/

  it('should return 401 or 403 if no auth token is provided', async () => {
    // Missing token scenario.
    const response = await getRun(validRunId);

    // The API might return 401 or 403.
    expect([401, 403]).toContain(response.status);

    // Optional: Check error message.
    if (response.status === 401) {
      expect(response.data).toHaveProperty('error', 'Invalid or Missing API key');
    } else if (response.status === 403) {
      // Some APIs might differentiate.
      // Check the error structure if relevant.
    }
  });

  it('should handle extremely large or malformed run ID gracefully', async () => {
    const largeRunId = 'a'.repeat(1000); // A very long run ID.
    const response = await getRun(largeRunId, secretToken);

    // Expecting a client or server validation error.
    expect([400, 422, 404]).toContain(response.status);
  });

  // This test simulates checking no results found scenario, though for GET by ID,
  // a non-existent run might be the typical scenario. Already tested with 404.

  /********************************************************************************
   * 5. AUTHENTICATION & AUTHORIZATION TESTS
   ********************************************************************************/

  it('should omit payload and output when using a public token (if applicable)', async () => {
    // Only run this test if a public token is defined in environment.
    if (!publicToken) {
      console.warn('No public token found. Skipping public-key test.');
      return;
    }

    const response = await getRun(validRunId, publicToken);

    // Expect success with status 200 if the run ID is valid.
    // But the payload and output should be omitted.
    expect(response.status).toBe(200);

    // Expect the presence of other fields.
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('status');

    // The "payload" and "output" fields should be omitted for public key requests.
    expect(response.data).not.toHaveProperty('payload');
    expect(response.data).not.toHaveProperty('output');
  });

  it('should return 401 or 403 for an invalid or expired token', async () => {
    const invalidToken = 'Bearer invalid-or-expired-token';
    const response = await getRun(validRunId, invalidToken);

    // Expect either 401 or 403.
    expect([401, 403]).toContain(response.status);
  });
});
