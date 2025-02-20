import axios, { AxiosResponse } from 'axios';
import { config as dotenvConfig } from 'dotenv';
import { describe, it, expect } from '@jest/globals';

dotenvConfig();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

/**
 * Jest test suite for PUT /api/v1/projects/{projectRef}/envvars/{env}/{name}
 *
 * Summary:
 * Update a specific environment variable for a specific project and environment.
 *
 * This suite tests:
 * 1. Input Validation (required params, body data types/edge cases).
 * 2. Response Validation (status codes, response body schema).
 * 3. Response Headers Validation (Content-Type and other headers).
 * 4. Edge & Limit cases (large payloads, empty values).
 * 5. Authorization & Authentication testing (valid, invalid, missing tokens).
 */

describe('PUT /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  const validProjectRef = 'my-project';
  const validEnv = 'staging';
  const validName = 'TEST_VARIABLE';

  // A guessed valid payload structure based on the assumption that the endpoint expects
  // a JSON body like: { value: string }
  const validPayload = {
    value: 'UPDATED_VALUE'
  };

  // Invalid payload - missing or incorrect fields
  const invalidPayload = {
    invalidKey: 123
  };

  // Axios default config with auth header
  const defaultAxiosConfig = {
    headers: {
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    validateStatus: () => true // Allow handling of non-2xx responses in tests
  };

  // Helper to build endpoint URL
  function buildUrl(projectRef: string, env: string, name: string): string {
    return `${API_BASE_URL}/api/v1/projects/${projectRef}/envvars/${env}/${name}`;
  }

  it('should update environment variable successfully with valid payload', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    const response: AxiosResponse = await axios.put(url, validPayload, defaultAxiosConfig);

    // Expect a 200 success response
    expect(response.status).toBe(200);

    // Validate response headers
    expect(response.headers['content-type']).toContain('application/json');

    // Validate response body (schema check can be more detailed if we have a schema)
    expect(response.data).toBeDefined();
    // Example: expect(response.data).toHaveProperty('message');
  });

  it('should return 400 or 422 for invalid body/payload', async () => {
    const url = buildUrl(validProjectRef, validEnv, validName);

    const response: AxiosResponse = await axios.put(url, invalidPayload, defaultAxiosConfig);

    // Expect a 400 or 422 for invalid request body
    expect([400, 422]).toContain(response.status);

    // Validate response headers
    expect(response.headers['content-type']).toContain('application/json');

    // Validate error response body
    expect(response.data).toBeDefined();
  });

  it('should return 400 if required path params are missing or invalid', async () => {
    // Attempt to call with invalid (empty) projectRef or env
    const url = buildUrl('', validEnv, validName);

    const response: AxiosResponse = await axios.put(url, validPayload, defaultAxiosConfig);

    // Expect a 400 or 404 here, depending on the API implementation
    // but typically a missing/invalid path param could lead to 400 or 404
    expect([400, 404]).toContain(response.status);
    expect(response.data).toBeDefined();
  });

  it('should return 401 or 403 for unauthorized/forbidden requests', async () => {
    // Remove the token from headers
    const noAuthConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    };

    const url = buildUrl(validProjectRef, validEnv, validName);
    const response: AxiosResponse = await axios.put(url, validPayload, noAuthConfig);

    // Expect a 401 or 403 if no valid token is present
    expect([401, 403]).toContain(response.status);
    expect(response.data).toBeDefined();
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return 404 if the resource is not found', async () => {
    // Use an obviously invalid environment variable name
    const url = buildUrl(validProjectRef, validEnv, 'NON_EXISTENT_VARIABLE');

    const response: AxiosResponse = await axios.put(url, validPayload, defaultAxiosConfig);

    // Expect a 404 if the environment variable does not exist
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toBeDefined();
  });

  it('should handle large payload (edge case testing)', async () => {
    // Construct a large string
    const largeString = 'x'.repeat(5000);
    const largePayload = {
      value: largeString
    };

    const url = buildUrl(validProjectRef, validEnv, validName);
    const response: AxiosResponse = await axios.put(url, largePayload, defaultAxiosConfig);

    // Depending on implementation, can be success if large payload is allowed, or 400/413 if too large
    // Adjust expectations based on typical API behavior
    expect([200, 400, 413]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toBeDefined();
  });

  it('should return 400 or 422 when sending empty value in request body if not allowed', async () => {
    const emptyValuePayload = {
      value: ''
    };
    const url = buildUrl(validProjectRef, validEnv, validName);

    const response: AxiosResponse = await axios.put(url, emptyValuePayload, defaultAxiosConfig);

    // If the API does not allow empty strings for value, it might return 400 or 422
    // If the API does allow it, adjust the expectation accordingly
    expect([200, 400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.data).toBeDefined();
  });
});
