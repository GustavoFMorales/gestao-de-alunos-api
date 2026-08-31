import request from "supertest";
import { expect } from "chai";
import postLogin from "../fixtures/postLogin.json" with { type: "json" };
import { config } from "dotenv";
config();

describe("Login", () => {
  it("login deve retornar 200 quando o usuario e senha forem corretos", async () => {
    const bodyLogin = structuredClone(postLogin);
    const response = await request(process.env.BASE_URL)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(bodyLogin);
    expect(response.status).to.equal(200);
    expect(response.body.token).to.be.a("string");
    expect(response.body.usuario.id).to.equal("admin-principal");
    expect(response.body.usuario.nome).to.equal("Administrador do Sistema");
    expect(response.body.usuario.email).to.equal("admin@escola.com");
  });
  const camposObrigatorios = ["email", "senha"];
  camposObrigatorios.forEach((campo) => {
    it(`login deve retornar 400 qunado o/a ${campo} não for infomadp`, async () => {
      const bodyLogin = structuredClone(postLogin);
      bodyLogin[campo] = "";
      const response = await request(process.env.BASE_URL)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send(bodyLogin);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal(
        'Os campos "email" e "senha" são obrigatórios.',
      );
    });
  });

  const credenciaisInvalidas = [
    {
      campo: "email",
      valor: "teste@teste.com",
      descricao: "o e-mail informado for incorreto",
    },
    {
      campo: "senha",
      valor: "123456",
      descricao: "a senha informada for incorreta",
    },
  ];
  credenciaisInvalidas.forEach(({ campo, valor, descricao }) => {
    it(`login deve retornar 401 quando ${descricao}`, async () => {
      const bodyLogin = structuredClone(postLogin);
      bodyLogin[campo] = valor;

      const response = await request(process.env.BASE_URL)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send(bodyLogin);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal("E-mail ou senha inválidos.");
    });
  });
});
