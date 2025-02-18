import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file if present

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const token = process.env.API_AUTH_TOKEN || 'YOUR_DEFAULT_TOKEN';

/**
 * This test suite validates the POST /api/v1/tasks/{taskIdentifier}/trigger endpoint.
 * It checks:
 * 1. Input Validation (required params, correct data types, boundary/edge cases, invalid inputs => 400/422)
 * 2. Response Validation (status codes, response body schema)
 * 3. Response Headers (Content-Type, etc.)
 * 4. Edge Cases & Limit Testing (large payloads, boundary values, etc.)
 * 5. Authorization & Authentication (valid/invalid tokens => 401/403)
 */
describe('POST /api/v1/tasks/:taskIdentifier/trigger', () => {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true, // Let us handle status codes in tests
  });

  // Helper function to simplify post requests
  const triggerTask = async (
    taskIdentifier: string,
    payload: Record<string, any> | undefined = {}
  ): Promise<AxiosResponse> => {
    return client.post(`/api/v1/tasks/${taskIdentifier}/trigger`, payload);
  };

  // 1. Test valid input and expect a 200 response
  it('should trigger a task successfully with valid identifier and payload', async () => {
    // Replace "validTaskIdentifier" with a known valid identifier
    const validTaskIdentifier = '1234';
    // This sample payload would conform to the expected schema if required.
    // If your OpenAPI schema requires other fields, update accordingly.
    const validPayload = {
      // Example field(s), adjust to match your schema
      // description: 'Optional description',
    };

    const response = await triggerTask(validTaskIdentifier, validPayload);

    // Expect a successful response (usually 200)
    expect([200]).toContain(response.status);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check response body (assuming the schema contains certain fields)
    // Example: if TriggerTaskResponse has a "success" boolean and a "message" string
    // Adjust to match your real schema
    expect(response.data).toHaveProperty('success');
    expect(typeof response.data.success).toBe('boolean');
    if (typeof response.data.message !== 'undefined') {
      expect(typeof response.data.message).toBe('string');
    }
  });

  // 2. Test invalid/missing parameters and expect 400 or 422
  it('should return 400 or 422 when the request payload is invalid', async () => {
    // Replace "validTaskIdentifier" with a known valid identifier
    const validTaskIdentifier = '1234';

    // Example of an invalid payload that doesn't conform to the schema
    // e.g., sending wrong data types
    const invalidPayload = {
      invalidField: 999, // Suppose the schema does not allow this field or requires a string
    };

    const response = await triggerTask(validTaskIdentifier, invalidPayload);

    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check the error response structure if applicable
    // e.g., expecting error code, message
    // Adjust to match your ErrorResponse schema
    expect(response.data).toHaveProperty('error');
    expect(typeof response.data.error).toBe('string');
  });

  // 3. Test required parameter in the path (taskIdentifier) is missing or invalid
  it('should return 400 or 404 if the taskIdentifier is invalid', async () => {
    // We can use an empty string or a malformed ID
    const invalidTaskIdentifier = '';

    const response = await triggerTask(invalidTaskIdentifier);

    // Some APIs may treat empty path params as missing => 400 or 404
    expect([400, 404]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check error message if available
    expect(response.data).toHaveProperty('error');
  });

  // 4. Test 401 or 403 for unauthorized/forbidden
  it('should return 401 or 403 if the request is made without valid authorization', async () => {
    // Create a client without proper authorization header
    const unauthorizedClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        // Omit Authorization
      },
      validateStatus: () => true,
    });

    // Helper function for unauthorized test
    const triggerUnauthorizedTask = async (
      taskIdentifier: string,
      payload: Record<string, any> | undefined = {}
    ): Promise<AxiosResponse> => {
      return unauthorizedClient.post(
        `/api/v1/tasks/${taskIdentifier}/trigger`,
        payload
      );
    };

    const response = await triggerUnauthorizedTask('1234');

    // Expect 401 or 403 for unauthorized or forbidden
    expect([401, 403]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    if (response.data) {
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
    }
  });

  // 5. Test 404 if the resource is not found
  it('should return 404 if the taskIdentifier does not exist', async () => {
    // Provide a taskIdentifier that is known to be non-existent
    const nonExistentTaskIdentifier = 'non-existing-task-id';

    const response = await triggerTask(nonExistentTaskIdentifier);

    // Expect 404 if the resource is not found
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Check the error response structure
    expect(response.data).toHaveProperty('error');
    expect(typeof response.data.error).toBe('string');
  });

  // 6. Test large payloads or edge case payload
  it('should handle large payload and return appropriate response', async () => {
    // If your endpoint supports or requires a request body, we test a large/edge payload.
    // Adjust field names to match your schema.
    const largePayload = {
      data: 'X'.repeat(10000), // 10k characters
    };

    // Replace "validTaskIdentifier" with a known valid identifier
    const validTaskIdentifier = '1234';
    const response = await triggerTask(validTaskIdentifier, largePayload);

    // Typically it should still return 200 if the payload is valid, or 400/422 if too large.
    expect([200, 400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // If success, check output structure; if error, check error structure
    if (response.status === 200) {
      expect(response.data).toHaveProperty('success');
    } else {
      expect(response.data).toHaveProperty('error');
    }
  });

  // 7. Test handling of server errors (simulate if possible)
  //    In practice, this might require mocking or special test setup.
  //    For completeness, we outline a test that checks 500 response.
  it('should handle internal server errors (500) gracefully', async () => {
    // This test is more theoretical unless you have a way to force a 500.
    // One approach is to send a payload known to cause a server error. Adjust accordingly.

    const maybeServerErrorPayload = {
      // Some known values that cause an error in your system (if you have them)
      causeServerCrash: true, // Example, not a real field
    };

    // Replace "validTaskIdentifier" with a valid identifier
    const validTaskIdentifier = '1234';

    const response = await triggerTask(validTaskIdentifier, maybeServerErrorPayload);

    // 500 might be the expected status if a server error occurs
    // Some APIs might respond with 400 in these cases, but we assume 500 for an internal error
    expect([500, 400]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    if (response.data) {
      expect(response.data).toHaveProperty('error');
    }
  });
});
