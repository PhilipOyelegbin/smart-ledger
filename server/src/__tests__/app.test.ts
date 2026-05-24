import request from "supertest";
import { createApp } from "../app";

describe("App health endpoint", () => {
  it("returns a healthy response", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("SmartLedger API is healthy");
  });
});
