import request from "supertest";
import { expect } from "chai";
import { obterToken } from "../helpers/autentication.js";
import postCadastraAluno from "../fixtures/postCadastraAluno.json" with { type: "json" };
import postLogin from "../fixtures/postLogin.json" with { type: "json" };
import alunoCadastrado from "../fixtures/alunoCadastrado.json" with { type: "json" };
import { config } from "dotenv";
config();

describe("Alunos", () => {
  let token;
  let bodyCadastraAluno;
  beforeEach(async () => {
    token = await obterToken();
    bodyCadastraAluno = structuredClone(postCadastraAluno);
    const sufixo = Date.now();
    bodyCadastraAluno.email = `paola.${sufixo}@gmail.com`;
    bodyCadastraAluno.matricula = `${sufixo}`;
  });
  it("deve cadastrar um aluno quando ele informa dados válidos", async () => {
    const response = await request(process.env.BASE_URL)
      .post("/api/admin/alunos")
      .set("Content-type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(bodyCadastraAluno);

    expect(response.status).to.equal(201);
    expect(response.body.nome).to.equal(bodyCadastraAluno.nome);
    expect(response.body.email).to.equal(bodyCadastraAluno.email);
    expect(response.body.matricula).to.equal(bodyCadastraAluno.matricula);
  });
  it("deve negar o cadastro de um aluno quando ele já existe", async () => {
    const bodyAlunoCadastrado = structuredClone(alunoCadastrado);
    const response = await request(process.env.BASE_URL)
      .post("/api/admin/alunos")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(bodyAlunoCadastrado);

    expect(response.status).to.equal(409);
    expect(response.body.error).to.equal(
      "Já existe um aluno cadastrado com essa matrícula ou e-mail.",
    );
  });
});
