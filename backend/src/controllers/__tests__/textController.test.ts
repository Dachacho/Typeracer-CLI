import request from "supertest";
import app from "../../../app.js";
import { describe, it, expect } from "vitest";

describe("Text Controller", () => {
  it("should return a random text", async () => {
    const res = await request(app).get("/text");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("content");
  });
});
