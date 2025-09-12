import request from "supertest";
import app from "../../../app.ts";
import { describe, it, expect } from "vitest";

describe("Room Controller", () => {
  it("should create the room", async () => {
    const res = await request(app).post("/room").send({ username: "testuser" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("textId");
  });

  it("should join the room", async () => {
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

  it("should start the room", async () => {
    const createRes = await request(app)
      .post("/room")
      .send({ username: "hostuser" });

    const roomId = createRes.body.id;

    const startRes = await request(app).post("/room/start").send({ roomId });
    expect(startRes.body).toHaveProperty("id");
    expect(startRes.body).toHaveProperty("status", "started");
    expect(startRes.body).toHaveProperty("textId");
  });

  it("should finish the room", async () => {
    const createRes = await request(app)
      .post("/room")
      .send({ username: "hostuser" });

    const roomId = createRes.body.id;

    await request(app)
      .post("/room/join")
      .send({ roomId, username: "guestuser" });

    await request(app).post("/room/start").send({ roomId });

    const roomRes = await request(app).get(`/room/${roomId}`);
    const textContent = roomRes.body.text.content;

    const finishRes = await request(app).post("/room/finish").send({
      username: "guestuser",
      roomId,
      userInput: textContent,
      timeTaken: 60,
    });

    expect(finishRes.statusCode).toBe(201);
    expect(finishRes.body).toHaveProperty("id");
    expect(finishRes.body).toHaveProperty("username", "guestuser");
    expect(finishRes.body).toHaveProperty("wpm");
    expect(finishRes.body).toHaveProperty("accuracy");
  });

  it("should return list of rooms", async () => {
    const res = await request(app).get("/rooms");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      for (const room of res.body) {
        expect(room).toHaveProperty("id");
        expect(room).toHaveProperty("status");
        expect(room).toHaveProperty("textId");
        expect(["waiting", "started", "finished"]).toContain(room.status);
      }
    }
  });

  it("should return a room by given id", async () => {
    const createRes = await request(app)
      .post("/room")
      .send({ username: "host user" });

    const roomId = createRes.body.id;

    const res = await request(app).get(`/room/${roomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("textId");
  });

  it("should return a room leaderboard", async () => {
    const createRes = await request(app)
      .post("/room")
      .send({ username: "hostuser" });
    const roomId = createRes.body.id;

    await request(app)
      .post("/room/join")
      .send({ roomId, username: "guestuser" });

    await request(app).post("/room/start").send({ roomId });

    const roomRes = await request(app).get(`/room/${roomId}`);
    const textContent = roomRes.body.text.content;

    await request(app).post("/room/finish").send({
      username: "guestuser",
      roomId,
      userInput: textContent,
      timeTaken: 60,
    });

    await request(app).post("/room/finish").send({
      username: "hostuser",
      roomId,
      userInput: textContent,
      timeTaken: 60,
    });

    const leaderboardRes = await request(app).get(
      `/room/${roomId}/leaderboard`
    );

    expect(leaderboardRes.statusCode).toBe(200);
    expect(Array.isArray(leaderboardRes.body)).toBe(true);
    if (leaderboardRes.body.length > 0) {
      for (const entry of leaderboardRes.body) {
        expect(entry).toHaveProperty("id");
        expect(entry).toHaveProperty("username");
        expect(entry).toHaveProperty("wpm");
        expect(entry).toHaveProperty("accuracy");
      }
    }
  });
});
