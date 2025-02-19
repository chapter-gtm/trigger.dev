import axios, { AxiosError, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Jest test suite for GET /api/v1/projects/{projectRef}/envvars/{env}/{name}
 *
 * This suite covers:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Authorization & Authentication
 */
describe('GET /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  const baseURL = process.env.API_BASE_URL;
  const validToken = process.env.API_AUTH_TOKEN;

  // Example valid values (replace with real valid data if available)
  const validProjectRef = 'my-project';
  const validEnv = 'production';
  const validName = 'EXAMPLE_ENV_VAR';

  // Utility function to generate auth header
  const getAuthHeader = (token?: string) => {
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  // Helper function to validate EnvVarValue schema (simplified example)
  const expectEnvVarValueSchema = (data: any) => {
    // According to #/components/schemas/EnvVarValue
    // Adjust checks based on actual schema
    expect(typeof data).toBe('object');
    expect(typeof data.name).toBe('string');
    expect(typeof data.value).toBe('string');
  };

  // Helper function to validate ErrorResponse schema (simplified example)
  const expectErrorResponseSchema = (data: any) => {
    // According to #/components/schemas/ErrorResponse
    // Adjust checks based on actual schema
    expect(typeof data).toBe('object');
    expect(typeof data.message).toBe('string');
  };

  // Happy path test: valid request, valid auth
  it('should return 200 and a valid EnvVarValue for valid path parameters and authorization', async () => {
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${validName}`;

    const response: AxiosResponse = await axios.get(url, {
      headers: {
        ...getAuthHeader(validToken),
      },
    });

    // Response Validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    expectEnvVarValueSchema(response.data);
  });

  // Authorization test: missing or invalid token
  it('should return 401 or 403 when authorization token is missing', async () => {
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${validName}`;
    try {
      await axios.get(url); // No auth header
      // If no error is thrown, force fail
      fail('Expected an unauthorized or forbidden error, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([401, 403]).toContain(axiosError?.response?.status);
      expect(axiosError?.response?.headers['content-type']).toMatch(/application\/json/i);
      expectErrorResponseSchema(axiosError?.response?.data);
    }
  });

  it('should return 401 or 403 when authorization token is invalid', async () => {
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${validName}`;
    try {
      await axios.get(url, {
        headers: {
          ...getAuthHeader('invalid-token'),
        },
      });
      fail('Expected an unauthorized or forbidden error, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([401, 403]).toContain(axiosError?.response?.status);
      expect(axiosError?.response?.headers['content-type']).toMatch(/application\/json/i);
      expectErrorResponseSchema(axiosError?.response?.data);
    }
  });

  // 404 Not Found test
  it('should return 404 if environment variable does not exist', async () => {
    const invalidName = 'NON_EXISTENT_ENV_VAR';
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${invalidName}`;
    try {
      await axios.get(url, {
        headers: {
          ...getAuthHeader(validToken),
        },
      });
      fail('Expected a 404 error, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect(axiosError?.response?.status).toBe(404);
      expect(axiosError?.response?.headers['content-type']).toMatch(/application\/json/i);
      expectErrorResponseSchema(axiosError?.response?.data);
    }
  });

  // 400 or 422 test: invalid path parameters (e.g., empty projectRef)
  it('should return 400 or 422 if required path parameters are invalid or empty', async () => {
    const invalidProjectRef = '';
    const url = `${baseURL}/api/v1/projects/${invalidProjectRef}/envvars/${validEnv}/${validName}`;
    try {
      await axios.get(url, {
        headers: getAuthHeader(validToken),
      });
      fail('Expected a 400 or 422 error, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([400, 422]).toContain(axiosError?.response?.status);
      expect(axiosError?.response?.headers['content-type']).toMatch(/application\/json/i);
      expectErrorResponseSchema(axiosError?.response?.data);
    }
  });

  // Edge Case: Very long env var name
  it('should handle a very long name parameter (max length or beyond)', async () => {
    const longName = 'ENV_VAR_' + 'X'.repeat(1000); // Example large name
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${longName}`;
    try {
      await axios.get(url, {
        headers: getAuthHeader(validToken),
      });
      // If the endpoint allows large names and returns a valid response,
      // you may adjust your expectations accordingly.
      // For demonstration, assume it might fail with 400/404.
      fail('Expected a 400/404 error for an extremely long name, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      // Could be 400 (invalid), 404 (not found), or some other error
      expect([400, 404, 422]).toContain(axiosError?.response?.status);
      expect(axiosError?.response?.headers['content-type']).toMatch(/application\/json/i);
      expectErrorResponseSchema(axiosError?.response?.data);
    }
  });

  // Additional test for unexpected server error (simulate if possible)
  // This is typically not straightforward to trigger programmatically.
  // For real testing, you might mock the server or use a test double.
  // We'll just outline the test structure.
  it('should handle server errors gracefully (5xx)', async () => {
    // This test is more illustrative; you might force a 5xx by hitting an invalid route
    // or using a mocking tool, rather than an actual environment.
    const url = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}/trigger-500-error`;
    try {
      await axios.get(url, {
        headers: getAuthHeader(validToken),
      });
      fail('Expected a 5xx error, but request succeeded.');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        expect(axiosError.response.status).toBeGreaterThanOrEqual(500);
        expect(axiosError.response.status).toBeLessThan(600);
        expect(axiosError.response.headers['content-type']).toMatch(/application\/json/i);
      } else {
        // If no response is returned, it might be a network error or something else.
        // We can still fail the test or handle accordingly.
        fail('Did not receive a valid server response for 5xx test.');
      }
    }
  });
});
