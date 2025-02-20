import axios, { AxiosInstance, AxiosResponse } from 'axios';

describe('PUT /api/v1/runs/:runId/metadata', () => {
  let client: AxiosInstance;
  // Adjust these IDs based on your actual data/environment
  const validRunId = '12345'; // Replace with a known valid run ID if available
  const invalidRunId = 'abc'; // Example of an invalid run ID
  const nonExistentRunId = '99999'; // Example of a run ID that doesn't exist

  beforeAll(() => {
    const baseURL = process.env.API_BASE_URL || '';
    const token = process.env.API_AUTH_TOKEN || '';

    // Create an Axios instance with baseURL and authorization header
    client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // validateStatus allows us to receive non-2xx responses without throwing
      validateStatus: () => true,
    });
  });

  it('should update run metadata with a valid payload (200)', async () => {
    const payload = {
      metadata: { exampleKey: 'exampleValue' },
    };

    // Make the PUT request with a valid runId and valid payload
    const response: AxiosResponse = await client.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // Check for expected 200 response
    expect(response.status).toBe(200);
    // Validate response headers
    expect(response.headers['content-type']).toMatch(/application\\/json/);
    // Validate response body schema
    expect(response.data).toHaveProperty('metadata');
    expect(typeof response.data.metadata).toBe('object');
  });

  it('should return 401 or 403 for unauthorized or forbidden request', async () => {
    // Create a client with no/invalid token
    const unauthorizedClient = axios.create({
      baseURL: process.env.API_BASE_URL || '',
      validateStatus: () => true,
    });

    const payload = {
      metadata: { exampleKey: 'exampleValue' },
    };

    const response: AxiosResponse = await unauthorizedClient.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // The API might return 401 or 403
    expect([401, 403]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\\/json/);
    expect(response.data).toHaveProperty('error');
  });

  it('should return 400 or 422 for invalid payload (e.g., metadata is not an object)', async () => {
    const payload = {
      metadata: 'this_should_be_an_object', // Invalid type
    };

    const response: AxiosResponse = await client.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // The API may return 400 or 422
    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\\/json/);
    expect(response.data).toHaveProperty('error');
  });

  it('should return 400 or 422 when the request body is empty', async () => {
    const response: AxiosResponse = await client.put(`/api/v1/runs/${validRunId}/metadata`, {});

    // The API may return 400 or 422
    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\\/json/);
    expect(response.data).toHaveProperty('error');
  });

  it('should return 400 if runId is invalid format', async () => {
    const payload = {
      metadata: { exampleKey: 'exampleValue' },
    };

    const response: AxiosResponse = await client.put(`/api/v1/runs/${invalidRunId}/metadata`, payload);

    // Depending on the API, it might return 400 or 404
    expect([400, 404]).toContain(response.status);
    if (response.status === 400) {
      // Validate error response
      expect(response.headers['content-type']).toMatch(/application\\/json/);
      expect(response.data).toHaveProperty('error');
      // Check one of the allowed error messages
      expect(response.data.error).toMatch(/Invalid or missing run ID|Invalid metadata/);
    }
    if (response.status === 404) {
      expect(response.headers['content-type']).toMatch(/application\\/json/);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toBe('Task Run not found');
    }
  });

  it('should return 404 if run does not exist', async () => {
    const payload = {
      metadata: { exampleKey: 'exampleValue' },
    };

    const response: AxiosResponse = await client.put(`/api/v1/runs/${nonExistentRunId}/metadata`, payload);

    // Some APIs may return 400 if runId is invalid, or 404 if not found
    expect([400, 404]).toContain(response.status);
    if (response.status === 404) {
      expect(response.headers['content-type']).toMatch(/application\\/json/);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toBe('Task Run not found');
    }
  });

  it('should handle large payload gracefully', async () => {
    // Create a large metadata object to test boundary/limit scenarios
    const largeMetadata: Record<string, string> = {};
    for (let i = 0; i < 10000; i++) {
      largeMetadata[`key${i}`] = `value${i}`;
    }

    const payload = { metadata: largeMetadata };

    const response: AxiosResponse = await client.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // Could be 200 if successful, 400/413 if too large, etc.
    expect([200, 400, 413]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\\/json/);
  });

  it('should return 401 if missing authorization header', async () => {
    // Create a client with no auth header
    const noAuthClient = axios.create({
      baseURL: process.env.API_BASE_URL || '',
      validateStatus: () => true,
    });

    const payload = {
      metadata: { exampleKey: 'exampleValue' },
    };

    const response: AxiosResponse = await noAuthClient.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // The API might return 401 or 403
    expect([401, 403]).toContain(response.status);
    expect(response.headers['content-type']).toMatch(/application\\/json/);
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toMatch(/Invalid or Missing API key/);
  });

  it('should handle unexpected server errors (500) gracefully', async () => {
    // There's no guaranteed way to trigger a 500, but we can try unusual payloads
    const payload = {
      metadata: { triggerServerError: true },
    };

    const response: AxiosResponse = await client.put(`/api/v1/runs/${validRunId}/metadata`, payload);

    // If 500 occurs, validate the error body
    if (response.status === 500) {
      expect(response.headers['content-type']).toMatch(/application\\/json/);
      expect(response.data).toHaveProperty('error');
    } else {
      // Otherwise we expect some valid status like 200, 400, or 422
      expect([200, 400, 422].includes(response.status)).toBe(true);
    }
  });
});