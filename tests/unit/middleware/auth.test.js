const { User } = require('../../../models/user');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware', () => {
    it('should populate req.user with payload of json webtoken', () => {
        const payload = { 
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true 
        };
        
        const token = new User(payload).generateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {};

        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toMatchObject(payload);
    });
})