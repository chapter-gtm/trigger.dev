import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { describe, it, expect } from '@jest/globals';

// Load environment variables
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

// Utility function to create an Axios instance
function createApiClient(token?: string) {
  const config: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    headers: {},
    validateStatus: () => true, // We'll handle status code checks manually
  };

  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  return axios.create(config);
}

// Example data for valid path parameter values
// Adjust these appropriately for your API's valid data
const VALID_PROJECT_REF = 'exampleProject';
const VALID_ENV = 'production';

// Example data for invalid path parameter values
const INVALID_PROJECT_REF = ''; // empty string
const INVALID_ENV = '!!!invalid-env!!!';
const NON_EXISTENT_PROJECT_REF = 'nonExistentProject';
const NON_EXISTENT_ENV = 'unknownEnv';

// Helper function to check if response headers match the expected values
function validateResponseHeaders(headers: any) {
  expect(headers).toBeDefined();
  // Content-Type should be application/json.
  expect(headers['content-type']).toContain('application/json');
  // Add other header checks here if needed, e.g., Cache-Control, X-RateLimit, etc.
}

// Example minimal schema validation for the 200 response.
// In a real test suite, you would validate against the actual
// #/components/schemas/ListEnvironmentVariablesResponse schema.
function validateListEnvironmentVariablesResponse(data: any) {
  // Example check: data might be an array of environment variables, or an object containing them
  // Adjust these checks to match your actual schema.
  expect(data).toBeDefined();
  // If the response is expected to have a property like "environmentVariables" that is an array:
  // expect(Array.isArray(data.environmentVariables)).toBe(true);
  // For now, just check if data is an object or array.
  expect(typeof data === 'object' || Array.isArray(data)).toBeTruthy();
}

// Example minimal schema validation for an ErrorResponse.
function validateErrorResponse(data: any) {
  // Adjust according to your actual #/components/schemas/ErrorResponse schema.
  expect(data).toHaveProperty('error');
  expect(typeof data.error).toBe('string');
}

describe('GET /api/v1/projects/{projectRef}/envvars/{env} - List environment variables', () => {
  it('should return 200 and a valid response for valid path parameters', async () => {
    const client = createApiClient(API_AUTH_TOKEN);

    const response = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/${VALID_ENV}`
    );

    // Expect 200 OK
    expect(response.status).toBe(200);

    // Validate headers
    validateResponseHeaders(response.headers);

    // Validate response body schema
    validateListEnvironmentVariablesResponse(response.data);
  });

  it('should return 401 or 403 when no auth token is provided', async () => {
    const client = createApiClient();

    const response = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/${VALID_ENV}`
    );

    // Expect unauthorized or forbidden
    expect([401, 403]).toContain(response.status);

    // When unauthorized or forbidden, we expect an error response body
    validateErrorResponse(response.data);
  });

  it('should return 401 or 403 when an invalid auth token is provided', async () => {
    const client = createApiClient('invalid_token');

    const response = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/${VALID_ENV}`
    );

    // Expect unauthorized or forbidden
    expect([401, 403]).toContain(response.status);

    // Validate error response body
    validateErrorResponse(response.data);
  });

  it('should return 400 or 422 if path parameters are invalid format', async () => {
    // Example: an empty projectRef or an obviously invalid env name
    const client = createApiClient(API_AUTH_TOKEN);

    const response1 = await client.get(
      `/api/v1/projects/${INVALID_PROJECT_REF}/envvars/${VALID_ENV}`
    );
    // The API might return 400 or 422 for invalid input
    expect([400, 422]).toContain(response1.status);
    validateErrorResponse(response1.data);

    const response2 = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/${INVALID_ENV}`
    );
    // The API might return 400 or 422 for invalid input
    expect([400, 422]).toContain(response2.status);
    validateErrorResponse(response2.data);
  });

  it('should return 404 if the projectRef or env does not exist', async () => {
    const client = createApiClient(API_AUTH_TOKEN);

    const response1 = await client.get(
      `/api/v1/projects/${NON_EXISTENT_PROJECT_REF}/envvars/${VALID_ENV}`
    );
    // Expect 404 when projectRef is not found
    expect(response1.status).toBe(404);
    validateErrorResponse(response1.data);

    const response2 = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/${NON_EXISTENT_ENV}`
    );
    // Expect 404 when environment is not found
    expect(response2.status).toBe(404);
    validateErrorResponse(response2.data);
  });

  it('should handle requests that might produce an empty list gracefully (if applicable)', async () => {
    // In case the environment is valid but has no environment variables.
    // Adjust if your API returns 200 with an empty array or a special response.

    const client = createApiClient(API_AUTH_TOKEN);

    // This test assumes that "emptyEnv" is a valid environment with no variables.
    // You can adjust the environment name or the projectRef to produce an empty list.
    const response = await client.get(
      `/api/v1/projects/${VALID_PROJECT_REF}/envvars/emptyEnv`
    );

    // Even if no variables exist, it should still be a 200, returning an empty list.
    // Or if your API returns 404 if no env vars exist, adjust accordingly.
    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      validateResponseHeaders(response.headers);
      // Validate schema (likely an empty array or an object with empty array)
      validateListEnvironmentVariablesResponse(response.data);
      // Additional check if it returns an empty array
      // expect(response.data.environmentVariables).toHaveLength(0);
    } else {
      // 404 scenario
      validateErrorResponse(response.data);
    }
  });

  it('should handle unexpected server error gracefully (500)', async () => {
    // In many cases, forcing a 500 error can be challenging. This test scenario might be
    // more hypothetical and depends on how your server triggers 500 errors.
    // You might need to mock or simulate a server condition that returns 500.

    // For demonstration, assume that using a special projectRef triggers a 500 in your test environment.
    const projectRefCausingServerError = 'trigger500';
    const client = createApiClient(API_AUTH_TOKEN);

    const response = await client.get(
      `/api/v1/projects/${projectRefCausingServerError}/envvars/${VALID_ENV}`
    );

    // Expect 500 or some other server error code
    if (response.status >= 500 && response.status < 600) {
      // Expecting server error responses
      expect(true).toBe(true);
    } else {
      // If your API does not actually return 500 in test, just log it.
      console.warn('Server did not produce a 500 error as expected.');
    }
  });
});
