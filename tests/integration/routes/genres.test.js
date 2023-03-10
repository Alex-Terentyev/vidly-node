const { default: mongoose } = require('mongoose');
const request = require('supertest');
const { Genre } = require('../../../models/genre');
const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');

let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { 
        await server.close();
        await Genre.deleteMany({}); 
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return 200 and the genre, if it is found', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if genre with a given id was not found', async () => {
            const id = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        });

        it('should return 404 if genre id is incorrect', async () => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        });

    });

    describe('POST /', () => {
        //Define happy path, and then in each test we change one parameter that clearly aligns with the name of the test.

        //parameters to test
        let token;
        let name;

        //happy path to execute
        const execute = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        //parameters values for happy path
        beforeEach(() => { 
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if the client is not logged in', async () => {
            token = '';

            const res = await execute();

            expect(res.status).toBe(401);
        });

        it('should return 400 if the genre is less than 5 chars', async () => {
            name = '1234';

            const res = await execute();

            expect(res.status).toBe(400);
        });

        it('should return 400 if the genre is more than 50 chars', async () => {
            name = new Array(52).join('a');

            const res = await execute();

            expect(res.status).toBe(400);
        });

        it('should save genre in db if genre is valid', async () => {
            await execute();

            const genre = Genre.find({ name: 'genre1'});

            expect(genre).toBeTruthy();
        });

        it('should return 200 and genre if the genre is valid', async () => {
            const res = await execute();

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('genre1');
            expect(res.body).toHaveProperty('_id');
        });
    });

    describe('PUT /:id', () => {
        let token;
        let newName;
        let genre;
        let id;
        
        //happy path
        const execute = async () => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: newName })
        }
        beforeEach(async () => {
            genre = new Genre({ name: 'genre1' });
            await genre.save();

            token = new User().generateAuthToken();
            id = genre._id;
            newName = 'updated name';
         });

        afterEach(async() => {
            await Genre.deleteMany({});
        });

        it('should return 401 if user is not authorized', async () => {
            token = '';
            const res = await execute();
            expect(res.status).toBe(401);
        });

        it('should return 400 if edited genre less than 5 chars', async() => {
            newName = '1234';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if edited genre more than 5 chars', async() => {
            newName = new Array(52).join('a');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 404 if the genreId is not valid', async () => {
            id = "1";
            const res = await execute();
            expect(res.status).toBe(404);
        });

        it('should return 404 if the genre was not found', async () => {
            id = new mongoose.Types.ObjectId().toHexString();
            const res = await execute();
            expect(res.status).toBe(404);
        });

        it('should find a genre and update in db if it is valid', async () => {
            await execute();

            const updatedGenre = await Genre.findById(genre._id);

            expect(updatedGenre.name).toBe(newName);
        });

        it('should return 200 and the updated genre if input is valid', async () => {
            const res = await execute();

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(newName);
            expect(res.body).toHaveProperty('_id');
        });



    });

    describe('DELETE /:id', () => {
        let token;
        let genre;
        let id;

        const execute = async () => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ id })  
        }

        beforeEach(async () => {
            genre = await new Genre({ name: 'genre1' }).save();
            token = new User({isAdmin: true}).generateAuthToken();
            id = genre._id;
        });
        afterEach(async() => {
            Genre.deleteMany({});
        })

        it('should return 401 if no token provided', async () => {
            token = '';
            const res = await execute();
            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            token = new User().generateAuthToken();
            const res = await execute();
            expect(res.status).toBe(403);
        });

        it('should return 404 if the genre id is invalid', async () => {
            id = "1";
            const res = await execute();
            expect(res.status).toBe(404);
        });

        it('should return 404 if the genre id is not in db', async () => {
            id = new mongoose.Types.ObjectId().toHexString();
            const res = await execute();
            expect(res.status).toBe(404);
        });

        it('should find the genre in db and delete it from db', async () => {
            await execute();
            const genreInDb = await Genre.findById(id);
            expect(genreInDb).toBeNull();
        });

        it('should return 200 and the deleted object', async () => {
            const res = await execute();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
        });
    });
});