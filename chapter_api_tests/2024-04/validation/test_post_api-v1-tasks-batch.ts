import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

describe('POST /api/v1/tasks/batch', () => {
  /**
   * Helper function to create a valid tasks payload.
   * @param count - Number of tasks to generate.
   */
  function createValidPayload(count = 1) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push({
        taskId: `task-${i}`,
        data: {
          foo: `bar-${i}`
        }
      });
    }
    return { tasks };
  }

  /**
   * Create a client instance with authentication.
   * We set validateStatus to always return true,
   * so we can handle the status codes directly in the tests.
   */
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${API_AUTH_TOKEN}`
    },
    validateStatus: () => true
  });

  it('should return 401 or 403 if auth token is missing', async () => {
    // No Authorization header here
    const response = await axios.post(`${API_BASE_URL}/api/v1/tasks/batch`, createValidPayload(), {
      validateStatus: () => true
    });

    // Expecting 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status);
  });

  it('should return 200 for a valid payload', async () => {
    const response = await client.post('/api/v1/tasks/batch', createValidPayload());

    // Expecting successful response
    expect(response.status).toBe(200);

    // Validate the response headers
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Validate the response body structure (basic check)
    expect(response.data).toBeDefined();
    // Additional checks can be performed here, e.g.:
    // expect(response.data).toHaveProperty('results');
  });

  it('should return 400 or 422 for an empty payload', async () => {
    const response = await client.post('/api/v1/tasks/batch', {});

    // Expecting 400 Bad Request or 422 Unprocessable Entity
    expect([400, 422]).toContain(response.status);
  });

  it('should return 400 or 422 when tasks exceed 500', async () => {
    // Create a payload with 501 tasks
    const response = await client.post('/api/v1/tasks/batch', createValidPayload(501));

    // Expecting 400 Bad Request or 422 Unprocessable Entity
    expect([400, 422]).toContain(response.status);
  });

  it('should return 400 or 422 for invalid data type in payload', async () => {
    // Here the tasks property is a string instead of an array
    const invalidPayload = {
      tasks: 'invalid'
    };

    const response = await client.post('/api/v1/tasks/batch', invalidPayload);

    // Expecting 400 Bad Request or 422 Unprocessable Entity
    expect([400, 422]).toContain(response.status);
  });

  it('should return 404 for non-existing endpoint', async () => {
    // Hitting a non-existing path to check for 404
    const response = await client.post('/api/v1/nonexisting', createValidPayload());
    expect(response.status).toBe(404);
  });

  it('should return 401 or 403 if auth token is invalid', async () => {
    // Create a client with an invalid token
    const clientWithInvalidToken = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: 'Bearer invalid_token'
      },
      validateStatus: () => true
    });

    const response = await clientWithInvalidToken.post('/api/v1/tasks/batch', createValidPayload());

    // Expecting 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status);
  });

  it('should handle an empty tasks array (0 tasks)', async () => {
    // Depending on the API's design, 0 tasks might be valid or invalid
    const payload = { tasks: [] };
    const response = await client.post('/api/v1/tasks/batch', payload);

    // The status could be 200 (if empty is valid) or 400/422 if not
    expect([200, 400, 422]).toContain(response.status);
  });

  it('should include the correct response headers for valid requests', async () => {
    const response = await client.post('/api/v1/tasks/batch', createValidPayload());

    // Check the Content-Type header
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Additional header checks can go here
    // For example:
    // expect(response.headers).toHaveProperty('cache-control');
  });
});
