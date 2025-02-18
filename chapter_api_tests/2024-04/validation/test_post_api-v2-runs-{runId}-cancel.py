import axios, { AxiosError, AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Comprehensive Jest test suite for the endpoint:
 *   POST /api/v2/runs/{runId}/cancel
 *
 * Requirements:
 *  - Loads base URL from process.env.API_BASE_URL
 *  - Loads auth token from process.env.API_AUTH_TOKEN
 *  - Uses axios for HTTP requests
 *  - Covers:
 *      1) Input Validation
 *      2) Response Validation
 *      3) Response Headers Validation
 *      4) Edge Case & Limit Testing
 *      5) Testing Authorization & Authentication
 *
 * Usage:
 *  - Set environment variables:
 *      API_BASE_URL    => e.g., https://example.com
 *      API_AUTH_TOKEN  => e.g., someValidToken
 *  - Run: npx jest (or npm test / yarn test)
 */

describe('POST /api/v2/runs/{runId}/cancel', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
  const validAuthToken = process.env.API_AUTH_TOKEN || 'VALID_TOKEN';

  /**
   * Creates an axios instance without default Authorization header.
   * Use this for tests that specifically require missing credentials.
   */
  const axiosInstanceWithoutAuth = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // We'll handle status codes manually
  });

  /**
   * Creates an axios instance with a (potentially valid or invalid) auth token.
   * @param token The token to use in the Authorization header.
   */
  function createAxiosInstanceWithToken(token: string) {
    return axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true, // We'll handle status codes manually
    });
  }

  /**
   * Helper to check JSON content-type.
   */
  function expectJsonContentType(response: AxiosResponse) {
    expect(response.headers['content-type']).toMatch(/application\/json/i);
  }

  /**
   * Helper to ensure the response body matches the error schema.
   * We expect an object with at least an 'error' field.
   */
  function expectErrorSchema(body: any) {
    expect(body).toBeDefined();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
  }

  /**
   * Helper to ensure the response body matches the success schema:
   * { id: string }
   */
  function expectSuccessSchema(body: any) {
    expect(body).toBeDefined();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
  }

  let axiosInstanceWithValidToken: ReturnType<typeof createAxiosInstanceWithToken>;
  let axiosInstanceWithInvalidToken: ReturnType<typeof createAxiosInstanceWithToken>;

  beforeAll(() => {
    axiosInstanceWithValidToken = createAxiosInstanceWithToken(validAuthToken);
    axiosInstanceWithInvalidToken = createAxiosInstanceWithToken('INVALID_TOKEN');
  });

  /**
   * 1) Authorization & Authentication Tests
   */
  it('should return 401 or 403 if the Authorization header is missing', async () => {
    const response = await axiosInstanceWithoutAuth.post('/api/v2/runs/someRunId/cancel');
    expect([401, 403]).toContain(response.status);
    expectJsonContentType(response);
    expectErrorSchema(response.data);
  });

  it('should return 401 or 403 if the token is invalid', async () => {
    const response = await axiosInstanceWithInvalidToken.post('/api/v2/runs/someRunId/cancel');
    expect([401, 403]).toContain(response.status);
    expectJsonContentType(response);
    expectErrorSchema(response.data);
  });

  /**
   * 2) Input Validation Tests
   *    - We test different forms of invalid "runId" in the path.
   *    - The API might return 400 or 422 for invalid request.
   */
  it('should return 400 or 422 for an empty runId', async () => {
    const response = await axiosInstanceWithValidToken.post('/api/v2/runs//cancel');
    expect([400, 422]).toContain(response.status);
    if (response.status !== 204) {
      expectJsonContentType(response);
      expectErrorSchema(response.data);
    }
  });

  it('should return 400 or 422 for an invalid runId format', async () => {
    const invalidRunId = '???###';
    const response = await axiosInstanceWithValidToken.post(`/api/v2/runs/${invalidRunId}/cancel`);
    expect([400, 422]).toContain(response.status);
    if (response.status !== 204) {
      expectJsonContentType(response);
      expectErrorSchema(response.data);
    }
  });

  it('should return 400 or 422 for a very large runId', async () => {
    const largeRunId = 'run_' + 'x'.repeat(10000);
    const response = await axiosInstanceWithValidToken.post(`/api/v2/runs/${largeRunId}/cancel`);
    expect([400, 422]).toContain(response.status);
    if (response.status !== 204) {
      expectJsonContentType(response);
      expectErrorSchema(response.data);
    }
  });

  /**
   * 3) Resource Not Found Test (404)
   *    - If the run does not exist, we expect 404.
   */
  it('should return 404 if the runId does not exist', async () => {
    const nonExistentId = 'run_nonexistent_123';
    const response = await axiosInstanceWithValidToken.post(`/api/v2/runs/${nonExistentId}/cancel`);
    expect(response.status).toBe(404);
    expectJsonContentType(response);
    expectErrorSchema(response.data);
    expect(response.data.error).toBe('Run not found');
  });

  /**
   * 4) Successful Cancellation (200)
   *    - For a valid run in progress or if run is already completed,
   *      we expect 200 with { id: string }.
   */
  it('should return 200 and valid JSON schema if the runId is valid and run is cancellable or completed', async () => {
    // Replace "liveRunId" with an actual running or known ID in your environment.
    // If the run is completed, the API states it will have no effect but still succeed.
    const liveRunId = 'run_existing_1234';

    const response = await axiosInstanceWithValidToken.post(`/api/v2/runs/${liveRunId}/cancel`);
    expect(response.status).toBe(200);
    expectJsonContentType(response);
    expectSuccessSchema(response.data);
  });

  /**
   * 5) Verify Response Headers for All Valid Cases
   *    - We already call expectJsonContentType(response) in each test,
   *      but here is an explicit test for 200 case.
   */
  it('should include appropriate headers (Content-Type: application/json) on success', async () => {
    const liveRunId = 'run_existing_5678'; // replace with a valid run

    const response = await axiosInstanceWithValidToken.post(`/api/v2/runs/${liveRunId}/cancel`);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    // Additional headers like Cache-Control, X-RateLimit, etc. can be tested if applicable.
  });
});
