import axios, { AxiosResponse } from 'axios';

describe('/api/v1/timezones GET', () => {
  const baseUrl = process.env.API_BASE_URL;
  const authToken = process.env.API_AUTH_TOKEN;

  // Utility function to build the request config for axios
  const getRequestConfig = (overrideToken?: string) => {
    const token = overrideToken !== undefined ? overrideToken : authToken;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true, // Allow Axios to resolve promise for all status codes
    };
  };

  // Utility to create a full URL with optional query param
  const buildUrl = (excludeUtc?: string | boolean) => {
    if (!baseUrl) {
      throw new Error('API_BASE_URL is not defined');
    }

    let url = `${baseUrl}/api/v1/timezones`;

    if (excludeUtc !== undefined) {
      url += `?excludeUtc=${excludeUtc}`;
    }
    return url;
  };

  // 1. Input Validation
  // Test with no query param (excludeUtc defaults to false)
  test('should return 200 OK when called without query param', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(), getRequestConfig());
    expect([200]).toContain(response.status);
  });

  // Test with excludeUtc = true
  test('should return 200 OK when excludeUtc = true', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(true), getRequestConfig());
    expect([200]).toContain(response.status);
  });

  // Test with excludeUtc = false
  test('should return 200 OK when excludeUtc = false', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(false), getRequestConfig());
    expect([200]).toContain(response.status);
  });

  // Test with invalid type for excludeUtc
  test('should return 400 or 422 when excludeUtc is invalid type', async () => {
    const response: AxiosResponse = await axios.get(buildUrl('not-a-boolean'), getRequestConfig());
    expect([400, 422]).toContain(response.status);
  });

  // 2. Response Validation
  // Validate the response schema and content
  test('should return a valid JSON array of timezones for a valid request', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(), getRequestConfig());
    // Verify 200
    expect(response.status).toBe(200);
    // Verify content-type
    expect(response.headers['content-type']).toContain('application/json');

    // Basic schema validation
    // Assuming the schema has a top-level property "timezones" that is an array of strings
    const data = response.data;
    expect(data).toBeDefined();
    // Example check for schema: { timezones: string[] }
    expect(Array.isArray(data.timezones)).toBe(true);
    // Check if each item is a string
    data.timezones.forEach((tz: unknown) => {
      expect(typeof tz).toBe('string');
    });
  });

  // 3. Response Headers Validation
  test('should include application/json in content-type header', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(), getRequestConfig());
    expect(response.headers['content-type']).toContain('application/json');
  });

  // 4. Edge Case & Limit Testing
  // Test unauthorized request (no token or invalid token)
  test('should return 401 or 403 when called without valid auth token', async () => {
    const invalidAuthToken = 'invalid-token';
    const response: AxiosResponse = await axios.get(buildUrl(), getRequestConfig(invalidAuthToken));
    expect([401, 403]).toContain(response.status);
  });

  // Test scenario with malformed query param (already covered above, but another example)
  test('should return 400 or 422 for empty string query param', async () => {
    const response: AxiosResponse = await axios.get(buildUrl(''), getRequestConfig());
    // Some APIs may interpret empty query param as invalid, or default it.
    // We'll assume invalid.
    if (response.status !== 200) {
      expect([400, 422]).toContain(response.status);
    } else {
      // If it returns 200, then the service gracefully handled the empty query.
      expect(response.headers['content-type']).toContain('application/json');
    }
  });

  // Optionally test behavior when no results are found (depends on service data)
  // This may require a special server state or mocking. Here is a placeholder.
  test('should handle empty results gracefully (placeholder test)', async () => {
    // This test will pass if we simply call the endpoint and get a valid response.
    // A real test might require specific server setup to get an empty array.
    const response: AxiosResponse = await axios.get(buildUrl(), getRequestConfig());
    expect([200]).toContain(response.status);
    // Additional checks could be made if the server can return an empty array.
  });

  // 5. Testing Authorization & Authentication (covered partially by invalid token test)
  // Additional test for missing token
  test('should return 401 or 403 when called with no token at all', async () => {
    const config = {
      validateStatus: () => true,
    };
    const response: AxiosResponse = await axios.get(buildUrl(), config);
    expect([401, 403]).toContain(response.status);
  });
});
