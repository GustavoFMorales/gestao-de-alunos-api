import request from "supertest";
import app from "../../src/app.js";
import { expect } from "chai";
import postLogin from "../fixtures/postLogin.json" with { type: "json" };
import * as sinon from "sinon";
import authService from "../../src/services/auth.service.js";

describe("Login", () => {
  it("login deve retornar 200 quando o usuario e senha forem corretos", async () => {
    const bodyLogin = structuredClone(postLogin);
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);
    expect(response.status).to.equal(200);
    expect(response.body.token).to.be.a("string");
    expect(response.body.usuario.id).to.equal("admin-principal");
    expect(response.body.usuario.nome).to.equal("Administrador do Sistema");
    expect(response.body.usuario.email).to.equal("admin@escola.com");
  });
  it("login deve retornar 400 quando o e-mail não for informado", async () => {
    const bodyLogin = structuredClone(postLogin);
    bodyLogin.email = "";
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal(
      'Os campos "email" e "senha" são obrigatórios.',
    );
  });
  it("login deve retornar 400 quando a senha não for informada", async () => {
    const bodyLogin = structuredClone(postLogin);
    bodyLogin.senha = "";
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal(
      'Os campos "email" e "senha" são obrigatórios.',
    );
  });
  it("login deve retornar 401 quando a senha informada for incorreta", async () => {
    const bodyLogin = structuredClone(postLogin);
    bodyLogin.senha = "123456";
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);

    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal("E-mail ou senha inválidos.");
  });
  it("login deve retornar 401 quando o e-mail informado for incorreto", async () => {
    const bodyLogin = structuredClone(postLogin);
    bodyLogin.email = "teste@teste.com";
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);

    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal("E-mail ou senha inválidos.");
  });
  it("login deve retornar 500 quando algo der problema de conexão com o banco de dados", async () => {
    const authServiceMock = sinon.stub(authService, "login");
    authServiceMock.throws(new Error("Teste Erro 500!!"));
    const bodyLogin = structuredClone(postLogin);
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);
    expect(response.status).to.equal(500);
    sinon.restore();
  });
});
