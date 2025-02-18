import axios, { AxiosInstance, AxiosError } from 'axios';\nimport { describe, it, expect, beforeAll } from '@jest/globals';\n\ndescribe('GET /api/v1/projects/{projectRef}/runs - List project runs', () => {\n  let client: AxiosInstance;\n  const validProjectRef = 'my-valid-project';\n  const invalidProjectRef = 'non-existing-project';\n\n  beforeAll(() => {\n    // Create an Axios instance with the base URL and authorization header.\n    // These values are loaded from environment variables (API_BASE_URL and API_AUTH_TOKEN).\n    client = axios.create({\n      baseURL: process.env.API_BASE_URL,\n      headers: {\n        Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`\n      }\n    });\n  });\n\n  it('should return 200 and a valid response when called with correct parameters', async () => {\n    const params = {\n      env: 'production',\n      status: 'success',\n      limit: 5\n    };\n\n    const response = await client.get(`/api/v1/projects/${validProjectRef}/runs`, { params });\n\n    // 1. Response status and headers\n    expect(response.status).toBe(200);\n    expect(response.headers['content-type']).toContain('application/json');\n\n    // 2. Basic validation of the response body\n    //    This should match #/components/schemas/ListRunsResult in principle.\n    expect(response.data).toHaveProperty('runs');\n    expect(Array.isArray(response.data.runs)).toBe(true);\n  });\n\n  it('should return 400 (or 422) for invalid query parameter type (e.g., limit=abc)', async () => {\n    const params = { limit: 'abc' };\n\n    try {\n      await client.get(`/api/v1/projects/${validProjectRef}/runs`, { params });\n      throw new Error('Request should have failed due to invalid parameter type');\n    } catch (error) {\n      const axiosError = error as AxiosError;\n      if (axiosError.response) {\n        // The API could return 400 or 422 for invalid request payloads.\n        expect([400, 422]).toContain(axiosError.response.status);\n      } else {\n        throw error;\n      }\n    }\n  });\n\n  it('should return 401 (or 403) if no auth token is provided', async () => {\n    const unauthClient = axios.create({\n      baseURL: process.env.API_BASE_URL\n    });\n\n    try {\n      await unauthClient.get(`/api/v1/projects/${validProjectRef}/runs`);\n      throw new Error('Request should have failed due to missing token');\n    } catch (error) {\n      const axiosError = error as AxiosError;\n      if (axiosError.response) {\n        // The API may return 401 or 403 in these cases.\n        expect([401, 403]).toContain(axiosError.response.status);\n      } else {\n        throw error;\n      }\n    }\n  });\n\n  it('should return 404 if the projectRef does not exist', async () => {\n    try {\n      await client.get(`/api/v1/projects/${invalidProjectRef}/runs`);\n      throw new Error('Request should have failed due to invalid projectRef');\n    } catch (error) {\n      const axiosError = error as AxiosError;\n      if (axiosError.response) {\n        expect(axiosError.response.status).toBe(404);\n      } else {\n        throw error;\n      }\n    }\n  });\n\n  it('should return an empty list if no runs are found', async () => {\n    // Provide parameters that are unlikely to match any run\n    const params = { status: 'does-not-exist-123' };\n    const response = await client.get(`/api/v1/projects/${validProjectRef}/runs`, { params });\n\n    expect(response.status).toBe(200);\n    expect(response.data).toHaveProperty('runs');\n    expect(response.data.runs.length).toBe(0);\n  });\n\n  it('should handle cursor pagination parameters correctly', async () => {\n    // Example of testing pagination-related parameters (cursorPagination).\n    const params = { limit: 1 };\n    const response = await client.get(`/api/v1/projects/${validProjectRef}/runs`, { params });\n\n    expect(response.status).toBe(200);\n    expect(Array.isArray(response.data.runs)).toBe(true);\n    // Here, you might also check for 'nextCursor', 'prevCursor', etc., if defined in the schema.\n  });\n\n  it('should return 400 (or 422) for malformed or out-of-range date filters', async () => {\n    // Assuming runsFilterWithEnv allows date filters, e.g. createdAtBefore, createdAtAfter.\n    const params = { createdAtBefore: 'not-a-date' };\n\n    try {\n      await client.get(`/api/v1/projects/${validProjectRef}/runs`, { params });\n      throw new Error('Request should have failed due to invalid date');\n    } catch (error) {\n      const axiosError = error as AxiosError;\n      if (axiosError.response) {\n        // The API could return 400 or 422 for invalid request payloads.\n        expect([400, 422]).toContain(axiosError.response.status);\n      } else {\n        throw error;\n      }\n    }\n  });\n});\n