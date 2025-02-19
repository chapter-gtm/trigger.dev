import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { fail } from '@jest/expect';

dotenv.config();

/**
 * Jest test suite for POST /api/v1/projects/{projectRef}/envvars/{env}
 * This suite covers:
 * 1) Input Validation
 * 2) Response Validation
 * 3) Response Headers Validation
 * 4) Edge Case & Limit Testing
 * 5) Authorization & Authentication Testing
 */
describe('POST /api/v1/projects/{projectRef}/envvars/{env}', () => {
  const baseURL = process.env.API_BASE_URL;
  const token = process.env.API_AUTH_TOKEN;

  // Project/Env path parameters used for the tests
  const validProjectRef = 'my-project';
  const validEnv = 'development';

  // Construct the endpoint using the environment variables
  const endpoint = `${baseURL}/api/v1/projects/${validProjectRef}/envvars/${validEnv}`;

  describe('Input Validation', () => {
    it('should create an environment variable with a valid payload (expect 200)', async () => {
      const payload = {
        envKey: 'MY_TEST_VAR',
        envValue: 'some value'
      };

      const response: AxiosResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Accept 200 as success
      expect([200]).toContain(response.status);
      // Basic response shape check
      expect(response.data).toHaveProperty('success');
      // Content-Type check
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return 400 or 422 when required fields are missing', async () => {
      const invalidPayload = {};

      try {
        await axios.post(endpoint, invalidPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail with 400 or 422, but it succeeded.');
      } catch (error: any) {
        const response = error.response;
        expect([400, 422]).toContain(response.status);
        expect(response.data).toHaveProperty('error');
        expect(response.headers['content-type']).toContain('application/json');
      }
    });

    it('should return 400 or 422 for invalid data types', async () => {
      const invalidPayload = {
        envKey: 123,
        envValue: true
      };

      try {
        await axios.post(endpoint, invalidPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail with 400 or 422, but it succeeded.');
      } catch (error: any) {
        const response = error.response;
        expect([400, 422]).toContain(response.status);
        expect(response.data).toHaveProperty('error');
      }
    });
  });

  describe('Response Validation', () => {
    it('should match the successful response schema on 200', async () => {
      const payload = {
        envKey: 'ANOTHER_VAR',
        envValue: 'another value'
      };

      const response: AxiosResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check status
      expect([200]).toContain(response.status);
      // Basic shape check
      expect(response.data).toHaveProperty('success');
      expect(typeof response.data.success).toBe('boolean');
    });

    it('should handle resource not found (404)', async () => {
      // Force a 404 by using an unknown projectRef
      const invalidEndpoint = `${baseURL}/api/v1/projects/unknownProject/envvars/${validEnv}`;

      try {
        await axios.post(invalidEndpoint, { envKey: 'test', envValue: 'test' }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail with 404, but it succeeded.');
      } catch (error: any) {
        const { response } = error;
        expect(response.status).toBe(404);
        expect(response.data).toHaveProperty('error');
      }
    });
  });

  describe('Response Headers Validation', () => {
    it('should return application/json Content-Type on success', async () => {
      const payload = {
        envKey: 'HEADER_VAR',
        envValue: 'header value'
      };

      const response: AxiosResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Edge Case & Limit Testing', () => {
    it('should handle very large payloads gracefully', async () => {
      const largeValue = 'a'.repeat(5000);
      const payload = {
        envKey: 'LARGE_VAR',
        envValue: largeValue
      };

      const response: AxiosResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Depending on your service, it might accept or reject large data.
      // We'll allow 200 (success) or 400/422 if it rejects large input.
      expect([200, 400, 422]).toContain(response.status);
    });

    it('should return 401 or 403 if no authorization token is provided', async () => {
      const payload = {
        envKey: 'AUTH_TEST',
        envValue: 'test'
      };

      try {
        await axios.post(endpoint, payload);
        fail('Expected request to fail with 401 or 403, but it succeeded.');
      } catch (error: any) {
        const { response } = error;
        expect([401, 403]).toContain(response.status);
      }
    });

    it('should return 500 or appropriate error on server error simulation (if applicable)', async () => {
      // Simulate a scenario that might cause a server error.
      // If there's no direct route for server error, you can mock or skip.
      const brokenPayload = {
        envKey: null,
        envValue: 'test'
      };

      try {
        await axios.post(endpoint, brokenPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail with 5xx, but it succeeded.');
      } catch (error: any) {
        const { response } = error;
        // Some APIs may return 400/422 for null fields instead of 5xx.
        expect([500, 400, 422]).toContain(response.status);
      }
    });
  });

  describe('Testing Authorization & Authentication', () => {
    it('should succeed with a valid token', async () => {
      const payload = {
        envKey: 'VALID_TOKEN_TEST',
        envValue: 'token test'
      };

      const response: AxiosResponse = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect([200]).toContain(response.status);
    });

    it('should fail with 401 or 403 when token is invalid', async () => {
      const invalidToken = 'invalid.token.value';
      const payload = {
        envKey: 'INVALID_TOKEN_TEST',
        envValue: 'token test'
      };

      try {
        await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail with 401 or 403, but it succeeded.');
      } catch (error: any) {
        const { response } = error;
        expect([401, 403]).toContain(response.status);
      }
    });
  });
});
