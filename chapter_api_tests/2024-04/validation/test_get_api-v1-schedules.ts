import axios, { AxiosResponse } from "axios";
import { describe, it, expect } from "@jest/globals";

/**
 * Comprehensive test suite for GET /api/v1/schedules
 *
 * This suite tests:
 *  1) Input Validation
 *  2) Response Validation
 *  3) Response Headers Validation
 *  4) Edge Case & Limit Testing
 *  5) Authorization & Authentication
 *
 * Environment Variables:
 *  - API_BASE_URL: Base URL for API (e.g., https://example.com)
 *  - API_AUTH_TOKEN: Bearer token for authentication (if required)
 */

describe("GET /api/v1/schedules", () => {
  const baseUrl = process.env.API_BASE_URL;
  const endpoint = "/api/v1/schedules";
  const validAuthToken = process.env.API_AUTH_TOKEN || "";

  /**
   * Helper function to perform GET request
   */
  const getSchedules = async (
    params?: Record<string, unknown>,
    token: string = validAuthToken
  ): Promise<AxiosResponse> => {
    const url = `${baseUrl}${endpoint}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.get(url, { headers, params });
  };

  /**
   * 1) Valid request without query params
   *    - Expect 200 response code
   *    - Validate basic response structure
   */
  it("should return 200 and valid response schema when called without query params", async () => {
    const response = await getSchedules();
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");

    // Basic schema checks (assuming the response data structure)
    expect(response.data).toHaveProperty("items");
    expect(Array.isArray(response.data.items)).toBe(true);
    // Add any further schema validations if known
  });

  /**
   * 1a) Valid request WITH query params (page & perPage as integers)
   *    - Expect 200 response code
   *    - Validate basic response structure & check pagination
   */
  it("should accept valid integer query params for page and perPage", async () => {
    const response = await getSchedules({ page: 1, perPage: 5 });
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");

    // Check for pagination fields if the API returns them
    expect(response.data).toHaveProperty("page");
    expect(typeof response.data.page).toBe("number");
    expect(response.data).toHaveProperty("perPage");
    expect(typeof response.data.perPage).toBe("number");
  });

  /**
   * 2) Invalid page parameter type
   *    - Expect 400 or 422
   */
  it("should return 400 or 422 for invalid 'page' type (e.g., string)", async () => {
    try {
      await getSchedules({ page: "invalid-string" });
      // If the request does NOT throw an error, fail the test
      fail("Expected a 400/422 error, but request succeeded.");
    } catch (error: any) {
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        // In case of network or other errors, fail explicitly
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });

  /**
   * 3) Invalid perPage parameter type
   *    - Expect 400 or 422
   */
  it("should return 400 or 422 for invalid 'perPage' type (e.g., string)", async () => {
    try {
      await getSchedules({ perPage: "invalid-string" });
      fail("Expected a 400/422 error, but request succeeded.");
    } catch (error: any) {
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });

  /**
   * 4) Boundary values for page/perPage
   *    - e.g., page = 0, perPage = 0, negative numbers, very large numbers
   *    - The API may respond with 400, 422, or some boundary handling
   */
  it("should handle boundary values for 'page' and 'perPage'", async () => {
    // Example boundary: negative page
    try {
      await getSchedules({ page: -1 });
      fail("Expected a 400/422 error for negative page, but request succeeded.");
    } catch (error: any) {
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
    // Example boundary: extremely large perPage
    try {
      const largePerPageRes = await getSchedules({ perPage: 999999 });
      // If the API allows large values, ensure it still returns 200 or error
      expect([200, 400, 422]).toContain(largePerPageRes.status);
    } catch (error: any) {
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });

  /**
   * 5) Unauthorized request
   *    - Expect 401 or 403 without valid token
   */
  it("should return 401 or 403 if token is invalid or missing", async () => {
    // Test with no token
    try {
      await getSchedules({}, "");
      fail("Expected 401/403 error, but request succeeded.");
    } catch (error: any) {
      if (error.response) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
    // Test with malformed token
    try {
      await getSchedules({}, "Bearer malformed.token");
      fail("Expected 401/403 error, but request succeeded.");
    } catch (error: any) {
      if (error.response) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });

  /**
   * 6) Empty data scenario (e.g., requesting a page that does not exist)
   *    - The API might return an empty array/list
   *    - Expect 200 with empty results array or similar
   */
  it("should handle empty data scenario gracefully", async () => {
    // For example, a page far beyond possible results
    const response = await getSchedules({ page: 9999999 });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.items)).toBe(true);
    // If no results, we expect an empty array
    if (response.data.items.length !== 0) {
      // If not empty, the test might still pass if the API returns data, 
      // but we can check for general correctness.
      // This depends on how your API handles out-of-range pages.
      expect(response.data.page).toBeGreaterThanOrEqual(1);
    }
  });

  /**
   * 7) Response headers validation for successful requests
   *    - Expect content-type to be application/json
   */
  it("should return correct response headers on success", async () => {
    const response = await getSchedules();
    expect(response.headers["content-type"]).toContain("application/json");
    // Add any additional relevant headers checks if needed, e.g., Cache-Control, X-RateLimit
  });

  /**
   * 8) Large page/perPage value or other stress tests
   *    - This test can help ensure the API handles large queries
   */
  it("should handle large pagination query without server error", async () => {
    try {
      const response = await getSchedules({ page: 10000, perPage: 10000 });
      // We just expect it not to crash; check for 200 or possibly 400/422 if the API restricts it.
      expect([200, 400, 422]).toContain(response.status);
    } catch (error: any) {
      // If an internal server error arises, we can detect it here.
      if (error.response) {
        if (error.response.status === 500) {
          fail("Server error (500) occurred, which suggests an unhandled edge case.");
        } else {
          expect([400, 422]).toContain(error.response.status);
        }
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });
});
