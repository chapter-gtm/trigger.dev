import axios, { AxiosError, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

// Interface for a successful response
interface UpdateRunMetadataResponse {
  metadata: Record<string, any>;
}

// Interface for an error response
interface ErrorResponse {
  error: string;
}

describe('PUT /api/v1/runs/{runId}/metadata', () => {
  // Helper to create Axios instance with base config
  const createAxiosInstance = (token?: string) => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      validateStatus: () => true, // We will handle status checks in the tests
    });
  };

  const validRunId = '123';
  const nonExistentRunId = '999999';
  
  /**
   * Valid metadata payload to update
   */
  const validMetadataPayload = {
    metadata: {
      key1: 'value1',
      key2: 2,
    },
  };

  /**
   * Creates a very large metadata object for edge-case testing.
   */
  const largeMetadataPayload = {
    metadata: {
      largeKey: 'x'.repeat(10_000),
    },
  };

  describe('Input Validation & Response Validation', () => {
    test('should update run metadata with valid inputs (200)', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);

      const response: AxiosResponse<UpdateRunMetadataResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        validMetadataPayload
      );

      // Expecting successful update
      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('metadata');
      expect(typeof response.data.metadata).toBe('object');

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });

    test('should return 400 or 422 when runId is invalid (string, empty, etc.)', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);
      // Trying a clearly invalid runId
      const invalidRunId = 'abc';

      const response: AxiosResponse<ErrorResponse> = await instance.put(
        `/api/v1/runs/${invalidRunId}/metadata`,
        validMetadataPayload
      );

      expect([400, 422]).toContain(response.status);
      // The response body might contain an "error" field with a relevant message.
      if (response.data) {
        expect(response.data).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });

    test('should return 400 or 422 if metadata payload is invalid (e.g., missing metadata)', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);
      // Invalid payload: missing or empty metadata field
      const invalidPayload = { badField: 'not metadata' };

      const response: AxiosResponse<ErrorResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        invalidPayload
      );

      expect([400, 422]).toContain(response.status);
      if (response.data) {
        expect(response.data).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });

    test('should return 404 if runId does not exist', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);

      const response: AxiosResponse<ErrorResponse> = await instance.put(
        `/api/v1/runs/${nonExistentRunId}/metadata`,
        validMetadataPayload
      );

      // Expecting 404 for run not found
      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });
  });

  describe('Edge Case & Limit Testing', () => {
    test('should handle large payload without errors', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);

      const response: AxiosResponse<UpdateRunMetadataResponse | ErrorResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        largeMetadataPayload
      );

      // Some APIs might handle large payload differently, but assume success is 200
      expect([200, 400, 422]).toContain(response.status);
      // If success, ensure metadata is returned
      if (response.status === 200) {
        const successData = response.data as UpdateRunMetadataResponse;
        expect(successData).toHaveProperty('metadata');
      } else {
        // If not success, check we got an error structure
        const errorData = response.data as ErrorResponse;
        expect(errorData).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });

    test('should handle empty metadata as valid or invalid (depending on API spec)', async () => {
      const instance = createAxiosInstance(API_AUTH_TOKEN);

      // Some APIs accept an empty object, some do not.
      const emptyMetadataPayload = {
        metadata: {},
      };

      const response: AxiosResponse<UpdateRunMetadataResponse | ErrorResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        emptyMetadataPayload
      );

      // Expect success or an input error
      expect([200, 400, 422]).toContain(response.status);
      if (response.status === 200) {
        const successData = response.data as UpdateRunMetadataResponse;
        expect(successData).toHaveProperty('metadata');
      } else {
        const errorData = response.data as ErrorResponse;
        expect(errorData).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });
  });

  describe('Testing Authorization & Authentication', () => {
    test('should return 401 or 403 if API token is missing', async () => {
      const instance = createAxiosInstance(undefined); // no token

      const response: AxiosResponse<ErrorResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        validMetadataPayload
      );

      expect([401, 403]).toContain(response.status);
      if (response.status === 401 || response.status === 403) {
        expect(response.data).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });

    test('should return 401 or 403 if API token is invalid', async () => {
      const instance = createAxiosInstance('invalid-token');

      const response: AxiosResponse<ErrorResponse> = await instance.put(
        `/api/v1/runs/${validRunId}/metadata`,
        validMetadataPayload
      );

      expect([401, 403]).toContain(response.status);
      if (response.status === 401 || response.status === 403) {
        expect(response.data).toHaveProperty('error');
      }

      // Header validation
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });
  });

  // Additional tests could cover server errors or other edge cases (e.g., 500 responses).
});
