import axios, { AxiosError } from "axios";
import "dotenv/config";

const baseUrl = process.env.API_BASE_URL;
// If your token must be prefixed with "Bearer ", include that in the header below.
// Otherwise, adjust accordingly.
const authToken = process.env.API_AUTH_TOKEN;

/**
 * Jest test suite for the PUT /api/v1/runs/{runId}/metadata endpoint.
 * Covers:
 * 1. Input Validation (missing/invalid runId, metadata, etc.)
 * 2. Response Validation (status codes, response body, etc.)
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Auth & Permission Testing
 */
describe("PUT /api/v1/runs/{runId}/metadata", () => {
  // Sample IDs and payloads for testing
  const validRunId = "123";
  const nonExistentRunId = "999999";
  const invalidRunId = "invalid!@#";

  const validMetadataPayload = {
    metadata: {
      description: "This is a valid metadata description",
      additionalData: "Some additional info"
    }
  };

  // Missing "metadata" object
  const invalidMetadataPayload = {
    invalidField: "wrongField"
  };

  // Empty metadata object (edge case)
  const emptyMetadataPayload = {
    metadata: {}
  };

  // Large metadata payload
  const largeMetadataPayload = {
    metadata: {
      largeField: "x".repeat(10000) // 10k characters
    }
  };

  // Helper function to build URL
  const buildUrl = (runId: string) => {
    return `${baseUrl}/api/v1/runs/${runId}/metadata`;
  };

  // 1) Successful update with valid runId & payload
  it("should update run metadata with valid ID & valid payload (expect 200)", async () => {
    const url = buildUrl(validRunId);
    try {
      const response = await axios.put(url, validMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("metadata");
      expect(typeof response.data.metadata).toBe("object");
      expect(response.headers["content-type"]).toContain("application/json");
    } catch (error) {
      // For a valid scenario, we should not get here
      throw error;
    }
  });

  // 2) Invalid run ID (should return 400 or 422)
  it("should return 400 or 422 for invalid runId", async () => {
    const url = buildUrl(invalidRunId);
    try {
      await axios.put(url, validMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      fail("Expected a 400 or 422 error, but the request succeeded.");
    } catch (err) {
      const error = err as AxiosError;
      expect(error.response).toBeDefined();
      expect([400, 422]).toContain(error.response?.status);
      expect(error.response?.data).toHaveProperty("error");
      expect(error.response?.headers["content-type"]).toContain("application/json");
    }
  });

  // 3) Missing or invalid metadata in body (should return 400 or 422)
  it("should return 400 or 422 for missing/invalid metadata", async () => {
    const url = buildUrl(validRunId);
    try {
      await axios.put(url, invalidMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      fail("Expected a 400 or 422 error, but the request succeeded.");
    } catch (err) {
      const error = err as AxiosError;
      expect(error.response).toBeDefined();
      expect([400, 422]).toContain(error.response?.status);
      expect(error.response?.data).toHaveProperty("error");
      expect(error.response?.headers["content-type"]).toContain("application/json");
    }
  });

  // 4) Empty metadata object (valid edge case if the server allows it)
  // Depending on API specs, this might be valid or invalid.
  // Adjust expectation accordingly.
  it("should handle empty metadata object (expect possibly 200 or 400/422)", async () => {
    const url = buildUrl(validRunId);
    try {
      const response = await axios.put(url, emptyMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      // If it is valid, we expect 200
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("metadata");
      expect(typeof response.data.metadata).toBe("object");
      expect(response.headers["content-type"]).toContain("application/json");
    } catch (err) {
      const error = err as AxiosError;
      // If the API doesn't allow empty metadata, check for 400 or 422
      expect([400, 422]).toContain(error.response?.status);
      expect(error.response?.data).toHaveProperty("error");
      expect(error.response?.headers["content-type"]).toContain("application/json");
    }
  });

  // 5) Missing or invalid authentication (should return 401 or 403)
  it("should return 401 or 403 when auth token is missing or invalid", async () => {
    const url = buildUrl(validRunId);
    try {
      await axios.put(url, validMetadataPayload, {
        headers: {
          // Authorization intentionally omitted
          "Content-Type": "application/json"
        }
      });
      fail("Expected a 401 or 403 error, but the request succeeded.");
    } catch (err) {
      const error = err as AxiosError;
      expect(error.response).toBeDefined();
      expect([401, 403]).toContain(error.response?.status);
      expect(error.response?.data).toHaveProperty("error");
      expect(error.response?.headers["content-type"]).toContain("application/json");
    }
  });

  // 6) Non-existent run ID (should return 404)
  it("should return 404 if the runId does not exist", async () => {
    const url = buildUrl(nonExistentRunId);
    try {
      await axios.put(url, validMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      fail("Expected a 404 error, but the request succeeded.");
    } catch (err) {
      const error = err as AxiosError;
      expect(error.response).toBeDefined();
      expect(error.response?.status).toBe(404);
      expect(error.response?.data).toHaveProperty("error");
      expect(error.response?.headers["content-type"]).toContain("application/json");
    }
  });

  // 7) Large payload test (edge case)
  it("should handle large metadata payload", async () => {
    const url = buildUrl(validRunId);
    try {
      const response = await axios.put(url, largeMetadataPayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      // Depending on API limits, adjust expected outcome
      // Assuming successful acceptance here:
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("metadata");
      expect(typeof response.data.metadata).toBe("object");
      expect(response.headers["content-type"]).toContain("application/json");
    } catch (err) {
      const error = err as AxiosError;
      // If the payload is too large, we might expect a 413 or 400
      // or a server-specific error code.
      // For demonstration, we handle it similarly:
      expect([400, 413, 422, 500]).toContain(error.response?.status);
      if (error.response) {
        expect(error.response.headers["content-type"]).toContain("application/json");
      }
    }
  });
});
