import request from "supertest";
import app from "../src/app.js";
import { expect } from "chai";
import postLogin from "../fixtures/postLogin.json" with { type: "json" };


describe("Login", () => {
  it("login deve retornar 200 quando o usuario e senha forem corretos", async () => {
    const bodyLogin = structuredClone(postLogin)
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);
    expect(response.status).to.equal(200);
    expect(response.body.token).to.be.a('string');
    expect(response.body.usuario.id).to.equal('admin-principal');
    expect(response.body.usuario.nome).to.equal('Administrador do Sistema');
  });
});
