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

  it("should submit a players result", async () => {
    const textRes = await request(app).get("/text");
    expect(textRes.statusCode).toBe(200);

    const payload = {
      username: "testuser",
      textId: textRes.body.id,
      userInput: textRes.body.content,
      timeTaken: 60,
    };

    const res = await request(app).post("/finish").send(payload);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("wpm");
    expect(res.body).toHaveProperty("accuracy");
  });

  it("should get a global leaderboard", async () => {
    const res = await request(app).get("/leaderboard");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    //check only the first one as it seems to be enough
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("username");
      expect(res.body[0]).toHaveProperty("wpm");
      expect(res.body[0]).toHaveProperty("accuracy");
    }
  });
});
