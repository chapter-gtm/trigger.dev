import axios, { AxiosInstance } from 'axios';
import { describe, it, expect } from '@jest/globals';

// NOTE: Ensure you have set API_BASE_URL and API_AUTH_TOKEN in your environment
// For example:
//   export API_BASE_URL=https://your-api.com
//   export API_AUTH_TOKEN=someAuthToken

const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';

// Helper function to create an axios instance with or without auth token.
const createClient = (withAuth: boolean = true): AxiosInstance => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (withAuth && process.env.API_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.API_AUTH_TOKEN}`;
  }

  return axios.create({
    baseURL,
    headers,
    validateStatus: () => true, // Allow us to handle all status codes in tests
  });
};

describe('POST /api/v1/tasks/batch - Batch trigger tasks', () => {
  const endpoint = '/api/v1/tasks/batch';

  it('should trigger tasks successfully with a valid payload (200)', async () => {
    const client = createClient();

    // A minimal valid payload, adjust fields to match your actual schema.
    // Example: tasks is an array of objects describing tasks to trigger.
    const validPayload = {
      tasks: [
        {
          taskId: 'task-123',
          // Additional fields as required by the schema
        },
      ],
    };

    const response = await client.post(endpoint, validPayload);

    // Check status code
    expect(response.status).toBe(200);

    // Check response headers
    expect(response.headers['content-type']).toContain('application/json');

    // Check response body structure
    // Adjust assertions to match your actual response schema.
    expect(typeof response.data).toBe('object');
    // e.g., expect(response.data).toHaveProperty('success', true);
  });

  it('should trigger tasks successfully with the maximum allowed payload (up to 500 items)', async () => {
    const client = createClient();

    // Create an array of 500 items
    const tasksArray = Array.from({ length: 500 }, (_, i) => ({ taskId: `task-${i}` }));
    const payload = { tasks: tasksArray };

    const response = await client.post(endpoint, payload);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    // Check basic structure
    expect(typeof response.data).toBe('object');
  });

  it('should return an error (400 or 422) if more than 500 tasks are sent', async () => {
    const client = createClient();

    // 501 tasks
    const tasksArray = Array.from({ length: 501 }, (_, i) => ({ taskId: `task-${i}` }));
    const payload = { tasks: tasksArray };

    const response = await client.post(endpoint, payload);

    const acceptableStatuses = [400, 422];
    expect(acceptableStatuses).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return an error (400 or 422) for an invalid payload structure', async () => {
    const client = createClient();

    // Invalid payload might be missing required fields or have wrong types.
    // Example: missing tasks array or sending null.
    const invalidPayload = { tasks: null };

    const response = await client.post(endpoint, invalidPayload);

    const acceptableStatuses = [400, 422];
    expect(acceptableStatuses).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return an error (400 or 422) for an empty tasks array if that is invalid', async () => {
    const client = createClient();

    // Check how your API handles an empty array.
    const invalidPayload = { tasks: [] };

    const response = await client.post(endpoint, invalidPayload);

    // Depending on your API spec, it may return 200 if empty arrays are allowed.
    // Assume here it expects at least one item.
    const acceptableStatuses = [400, 422];
    expect(acceptableStatuses).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should not allow unauthorized requests (401 or 403)', async () => {
    // Create client without auth
    const client = createClient(false);

    // Minimal valid payload
    const payload = {
      tasks: [{ taskId: 'unauthorized-test' }],
    };

    const response = await client.post(endpoint, payload);

    const unauthorizedStatuses = [401, 403];
    expect(unauthorizedStatuses).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should handle a not found scenario (404) when the endpoint is incorrect', async () => {
    // Sometimes you may want to test 404 by using a variant of the endpoint.
    // For demonstration, we intentionally add a random suffix.

    const client = createClient();
    const invalidEndpoint = `${endpoint}/non-existent`;

    // Minimal valid payload
    const payload = {
      tasks: [{ taskId: 'test-404' }],
    };

    const response = await client.post(invalidEndpoint, payload);

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should correctly handle server errors (500) if the API triggers internal errors', async () => {
    // This test is only valid if you have a way to trigger 500 errors.
    // You might do that by sending some special payload that the server cannot handle.

    const client = createClient();

    // Potentially a payload that triggers a server error.
    // Adjust this to your application scenario.
    const payload = {
      tasks: [{ taskId: 'trigger-500', causeServerError: true }],
    };

    const response = await client.post(endpoint, payload);

    // We check if it returned 500 if the server encountered an internal error.
    // If your system does not produce 500 with standard testing, skip or adapt.
    if (response.status === 500) {
      expect(response.headers['content-type']).toContain('application/json');
    } else {
      // If no 500, ensure we at least get another valid error code.
      const acceptableStatuses = [200, 400, 422, 401, 403, 404];
      expect(acceptableStatuses).toContain(response.status);
    }
  });
});
