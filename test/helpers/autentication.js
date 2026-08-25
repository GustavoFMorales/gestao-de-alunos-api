import request from 'supertest';
import { config } from "dotenv";
config();
import postLogin from "../fixtures/postLogin.json" with {type: 'json'};

export const obterToken = async () => {
    let token;
    const bodyLogin = structuredClone(postLogin);
    const response = await request(process.env.BASE_URL)
     .post('/api/auth/login')
     .set('Content-Type', 'application/json')
     .send(bodyLogin)
     token = response.body.token
     return token
}

export default {obterToken}