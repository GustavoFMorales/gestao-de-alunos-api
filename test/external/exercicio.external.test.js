import request from "supertest";
import { expect } from "chai";
import { obterToken, obterTokenExpirado } from "../helpers/autentication.js";
import { gerarAluno } from "../factories/aluno.factory.js";
import { gerarMateria } from "../factories/materia.factory.js";
import alunoCadastrado from "../fixtures/alunoCadastrado.json" with { type: "json" };
import { config } from "dotenv";
config();

describe("Exercicios em aula", () => {
  let token;
  let bodyCadastroAluno;
  let bodyCadastroMateria;
  beforeEach(async () => {
    token = await obterToken(process.env.EMAIL_ADMIN, process.env.SENHA_ADMIN);
    bodyCadastroAluno = gerarAluno();
    bodyCadastroMateria = gerarMateria()
  });
  describe("POST/login", () => {
    it("deve retornar 200 quando o login for efetuado com credenciais válidas", async () => {
      const response = await request(process.env.BASE_URL)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({
          email: process.env.EMAIL_ADMIN,
          senha: process.env.SENHA_ADMIN,
        });
      expect(response.status).to.equal(200);
    });
  });
  describe("POST/disciplinas", () => {
    it("deve retornar 201 quando a disciplina foi registrada com sucesso", async () => {
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/disciplinas")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastroMateria);

      expect(response.status).to.equal(201);
    });
  });
  describe("Diciplina - Aluno", () => {
    it("deve retornar 201 quando o aluno for cadastrado em uma disciplina", async () => {
      const aluno = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastroAluno);

      const disciplina = await request(process.env.BASE_URL)
        .post("/api/admin/disciplinas")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastroMateria);

      const response = await request(process.env.BASE_URL)
        .post(`/api/admin/disciplinas/${disciplina.body.id}/matriculas`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ alunoId: aluno.body.id });

      expect(response.status).to.equal(201);
      expect(response.body.alunoId).to.equal(aluno.body.id);
      expect(response.body.disciplinaId).to.equal(disciplina.body.id);
      expect(response.body.dataMatricula).to.be.a("string");
    });
  });
});
