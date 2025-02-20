import axios, { AxiosInstance, AxiosError } from "axios";

describe("POST /api/v1/schedules", () => {
  let api: AxiosInstance;
  const validPayload = {
    name: "Test Schedule",
    type: "IMPERATIVE",
    startAt: "2023-10-10T10:00:00Z",
    endAt: "2023-10-10T12:00:00Z"
  };

  beforeAll(() => {
    const baseURL = process.env.API_BASE_URL || "http://localhost:3000";
    const token = process.env.API_AUTH_TOKEN || "";

    api = axios.create({
      baseURL,
      headers: {
        Authorization: "Bearer " + token
      }
    });
  });

  test("should create a schedule with valid payload (200)", async () => {
    const response = await api.post("/api/v1/schedules", validPayload);
    expect(response.status).toBe(200);
    // Check headers
    expect(response.headers["content-type"]).toContain("application/json");
    // Check response body
    expect(response.data).toMatchObject({
      name: validPayload.name,
      type: validPayload.type,
      startAt: validPayload.startAt,
      endAt: validPayload.endAt
    });
    expect(response.data).toHaveProperty("id");
    expect(response.data).toHaveProperty("createdAt");
    expect(response.data).toHaveProperty("updatedAt");
  });

  test("should return 400 or 422 when required fields are missing", async () => {
    const invalidPayload = {};
    try {
      await api.post("/api/v1/schedules", invalidPayload);
      fail("Expected to throw an error for missing required fields");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  test("should return 400 or 422 when fields have invalid data types", async () => {
    const invalidPayload = {
      name: 1234, // Should be string
      type: "IMPERATIVE",
      startAt: "2023-10-10T10:00:00Z",
      endAt: "2023-10-10T12:00:00Z"
    };
    try {
      await api.post("/api/v1/schedules", invalidPayload);
      fail("Expected to throw an error for invalid data type");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  test("should return 401 or 403 when unauthorized or forbidden", async () => {
    const noAuthApi = axios.create({
      baseURL: process.env.API_BASE_URL || "http://localhost:3000"
      // No authorization header
    });

    try {
      await noAuthApi.post("/api/v1/schedules", validPayload);
      fail("Expected to throw an error for unauthorized request");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  test("should handle large payload gracefully", async () => {
    const largeName = "A".repeat(10000);
    const largePayload = {
      ...validPayload,
      name: largeName
    };

    try {
      const response = await api.post("/api/v1/schedules", largePayload);
      // The API might handle large input in various ways, e.g. success or error
      expect([200, 400, 422]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.data).toHaveProperty("id");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // For a large payload, we might also see other errors like 413 or 500
        expect([400, 413, 422, 500]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  test("should return 400 or 422 for malformed JSON", async () => {
    // We'll simulate a malformed request by sending an invalid JSON string
    try {
      const response = await api.request({
        method: "POST",
        url: "/api/v1/schedules",
        data: "invalid_json",
        headers: {
          "Content-Type": "application/json"
        }
      });
      fail("Expected to throw an error for malformed JSON");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });
});