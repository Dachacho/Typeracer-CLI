import request from "supertest";
import app from "../../../app.ts";
import { describe, it, expect } from "vitest";

describe("Room Controller", () => {
  it("should create a room", async () => {
    const res = await request(app).post("/room").send({ username: "testuser" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("textId");
  });

  it("should join a room", async () => {
    const createRes = await request(app)
      .post("/room")
      .send({ username: "hostuser" });

    const roomId = createRes.body.id;

    const joinRes = await request(app)
      .post("/room/join")
      .send({ roomId, username: "guestuser" });

    expect(joinRes.statusCode).toBe(201);
    expect(joinRes.body).toHaveProperty("id");
    expect(joinRes.body).toHaveProperty("username", "guestuser");
    expect(joinRes.body).toHaveProperty("roomId", roomId);
  });
});
