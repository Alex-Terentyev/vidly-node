const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');
let server;
const jwt = require('jsonwebtoken');
const config = require('config');

describe('auth middleware', () => {
    let token;
    //Happy Path
    const execute = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    }

    beforeEach(() => {
        server = require('../../index');
        token = new User().generateAuthToken();
    });
    afterEach(async () => { 
        await Genre.deleteMany({});
        await server.close(); 
    });

    it('should return 401 if no token provided', async () => {
        token = '';

        const res = await execute();

        expect(res.status).toBe(401);
    });

    it('should return 400 if the token is invalid', async () => {
        token = 'abc';

        const res = await execute();

        expect(res.status).toBe(400);
    });

    it('should return 200, if token is correct', async() => {
        const res = await execute();
        expect(res.status).toBe(200);
    })
});