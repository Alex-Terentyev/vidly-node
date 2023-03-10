const { Customer } = require('../../../models/customer');
const { User } = require('../../../models/user');
const request = require('supertest');
let server;

describe('/api/customers', () => {
    let customer;
    let token;

    beforeEach(async () => {
        server = require('../../..');
        token = new User().generateAuthToken();

        customer = new Customer({
            name: '12345',
            phone: 12345
        });
        await customer.save();
    });

    afterEach(async () => {
        await Customer.deleteMany({});
        server.close();
    });

    describe('/POST /', () => {
        it('should return 400 if input is invalid', async () => {
            const res = await request(server)
                .post('/api/customers')
                .set('x-auth-token', token)
                .send({ name: '12', phone: 12345});

            expect(res.status).toBe(400);
        });
    });

    describe('/PUT /:id', () => {
        it('should return 400 if input is invalid', async () => {
            const res = await request(server)
                .put('/api/customers/' + customer._id)
                .set('x-auth-token', token)
                .send({ name: '12', phone: 12345});

            expect(res.status).toBe(400);
        });
    });
});