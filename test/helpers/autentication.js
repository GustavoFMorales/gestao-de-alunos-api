import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

export const obterToken = async (email, senha) => {
    let token;
    const response = await request(process.env.BASE_URL)
     .post('/api/auth/login')
     .set('Content-Type', 'application/json')
     .send({
        email: email,
        senha: senha
     })
     token = response.body.token
     return token
}

export const obterTokenExpirado = () =>
    jwt.sign(
        { sub: 'admin-principal', role: 'admin', nome: 'Administrador do Sistema' },
        process.env.JWT_SECRET || 'segredo-dev-gestao-de-alunos',
        { expiresIn: '-1h' }
    );

export default { obterToken, obterTokenExpirado }
