import { faker } from '@faker-js/faker/locale/pt_BR';

export const gerarAluno = (sobrescritas = {}) => ({
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    matricula: faker.string.numeric(8),
    senha: faker.internet.password({length:8}),
    ...sobrescritas
});
