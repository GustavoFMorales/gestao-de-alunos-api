import request from "supertest";
import app from "../src/app.js";
import { expect } from "chai";

describe("Login", () => {
  it("login deve retornar 200 quando o usuario e senha forem corretos", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({
        email: "admin@escola.com",
        senha: "admin123",
      });
    expect(response.status).to.equal(200);
  });
});
