import request from "supertest";
import { expect } from "chai";
import { obterToken, obterTokenExpirado } from "../helpers/autentication.js";
import postCadastraAluno from "../fixtures/postCadastraAluno.json" with { type: "json" };
import alunoCadastrado from "../fixtures/alunoCadastrado.json" with { type: "json" };
import { config } from "dotenv";
config();

describe("Alunos", () => {
  let token;
  let bodyCadastraAluno;
  beforeEach(async () => {
    token = await obterToken(process.env.EMAIL_ADMIN, process.env.SENHA_ADMIN);
    bodyCadastraAluno = structuredClone(postCadastraAluno);
    const sufixo = Date.now();
    bodyCadastraAluno.email = `paola.${sufixo}@gmail.com`;
    bodyCadastraAluno.matricula = `${sufixo}`;
  });
  describe("POST/alunos", () => {
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
      expect(response.body).to.have.all.keys(
        "id",
        "nome",
        "email",
        "matricula",
        "role",
        "createdAt",
        "updatedAt",
      );
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
    const camposObrigatorios = ["nome", "email", "matricula", "senha"];
    camposObrigatorios.forEach((campo) => {
      it(`deve negar cadastro quando o campo ${campo} não for preenchido`, async () => {
        const bodyAlunoCadastrado = structuredClone(alunoCadastrado);
        bodyAlunoCadastrado[campo] = "";

        const response = await request(process.env.BASE_URL)
          .post("/api/admin/alunos")
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .send(bodyAlunoCadastrado);
        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal(
          'Os campos "nome", "email", "matricula" e "senha" são obrigatórios.',
        );
      });
    });
    it("deve negar cadastro do aluno com token ausente", async () => {
      token = "";
      const bodyAlunoCadastrado = structuredClone(alunoCadastrado);
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyAlunoCadastrado);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação não informado.",
      );
    });
    it("deve negar cadastro do usuário quando o token for inválido", async () => {
      token = process.env.TOKEN_INVALIDO;
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastraAluno);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação inválido ou expirado.",
      );
    });
    it("deve negar cadastro do usuário quando o token estiver expirado", async () => {
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${obterTokenExpirado()}`)
        .send(bodyCadastraAluno);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação inválido ou expirado.",
      );
    });
    it("deve negar o cadastro do aluno quando o usuário não tiver permissão", async () => {
      token = await obterToken(
        process.env.EMAIL_ALUNO,
        process.env.SENHA_ALUNO,
      );
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastraAluno);

      expect(response.status).to.equal(403);
      expect(response.body.error).to.equal(
        "Você não tem permissão para acessar este recurso.",
      );
    });
    it("deve cadastrar aluno com dados válidos e verificar se a senha não esta retornnado no body", async () => {
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyCadastraAluno);

      expect(response.status).to.equal(201);
      expect(response.body).to.not.have.property("senha");
    });
    it("deve ignorar os campos role e id enviados pelo cliente no cadastro", async () => {
      const bodyComPrivilegio = {
        ...bodyCadastraAluno,
        role: "admin",
        id: "id-forjado-pelo-cliente",
      };

      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(bodyComPrivilegio);

      expect(response.status).to.equal(201);
      expect(response.body.role).to.equal("aluno");
      expect(response.body.id).to.not.equal("id-forjado-pelo-cliente");
    });
    it("deve negar cadastro do aluno quando o token estiver expirado", async () => {
      const response = await request(process.env.BASE_URL)
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${obterTokenExpirado()}`)
        .send(bodyCadastraAluno);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação inválido ou expirado.",
      );
    });
  });
  describe("GET/alunos", () => {
    it("deve retornar 200 para listagem de alunos", async () => {
      const response = await request(process.env.BASE_URL)
        .get("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body[0]).to.have.all.keys(
        "id",
        "nome",
        "email",
        "matricula",
        "role",
        "createdAt",
        "updatedAt",
      );
      expect(response.body[0]).to.not.have.property("senha");
    });
    it("deve retornar 401 quando o token estiver ausente", async () => {
      token = "";
      const response = await request(process.env.BASE_URL)
        .get("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação não informado.",
      );
    });
    it("deve retornar 401 quando o token estiver invalido", async () => {
      const response = await request(process.env.BASE_URL)
        .get("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${process.env.SENHA_ALUNO}`);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação inválido ou expirado.",
      );
    });
    it("deve retornar 401 quando o token estiver expirado", async () => {
      const response = await request(process.env.BASE_URL)
        .get("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${obterTokenExpirado()}`);

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal(
        "Token de autenticação inválido ou expirado.",
      );
    });
    it('deve retornar 403 quando o usuário não tiver permissão para listar os alunos', async () =>{
      token = await obterToken(process.env.EMAIL_ALUNO, process.env.SENHA_ALUNO);
      const response = await request(process.env.BASE_URL)
       .get('/api/admin/alunos')
       .set('Content-Type', 'application/json')
       .set('Authorization', `Bearer ${token}`)
      
      expect(response.status).to.equal(403);
      expect(response.body.error).to.equal('Você não tem permissão para acessar este recurso.');
    })
  });
});
