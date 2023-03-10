// Post  /api/returns {customerId, movieId}

// Return 401 if client is not logged in
// Return 400 if customer Id is not provided
// Return 400 if movie id is not provided
// return 404 if there is no rental
// return 400 if rental has been already processed
// return 200 if request is valid
// set the return date
// calculate rental fee
// increase stock of the movie
// return the rental

const { Rental } = require('../../../models/rental');
const { User } = require('../../../models/user');
const { Movie } = require('../../../models/movie');
const { Genre } = require('../../../models/genre');
const mongoose = require('mongoose');
const request = require('supertest');
const dayjs = require('dayjs');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    //Happy Path
    const execute = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId})
    }

    beforeEach(async () => {
        server = require('../../../index');
        
        customerId = new mongoose.Types.ObjectId().toHexString();
        movieId = new mongoose.Types.ObjectId().toHexString();
        token = new User().generateAuthToken();

        movie = new Movie({ 
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: new Genre({name: '12345'}),
            numberInStock: 10,
        });

        await movie.save();

        rental = new Rental({
            customer:{
                _id: customerId,
                name:'12345',
                phone:'12345',
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });

        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});

    });

    it('should return 401, if the user is not logged in', async () => {
        token = '';

        const res = await execute();

        expect(res.status).toBe(401);
    });

    it('should return 400, if customerId is not provided', async () => {
        customerId = "";

        const res = await execute();

        expect(res.status).toBe(400);
    });

    it('should return 400, if movieId is not provided', async () => {
        movieId = "";

        const res = await execute();

        expect(res.status).toBe(400);
    });

    it('should return 404, if no rental found for the customer/movie', async () => {
        await Rental.deleteMany({});

        const res = await execute();

        expect(res.status).toBe(404);
    });

    it('should return 400, if the rental has been already returned', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await execute();

        expect(res.status).toBe(400);
    });

    it('should return 200 if the request is valid', async () => {
        const res = await execute();
        expect(res.status).toBe(200);
    });

    it('should set a return date if input is valid', async () => {
        await execute();

        const rentalInDb = await Rental.findById(rental._id);
        const timeDifference = new Date() - rentalInDb.dateReturned; 

        expect(rentalInDb.dateReturned).toBeDefined();
        expect(timeDifference).toBeLessThan(10*1000);
    });

    it('should calculate rentalFee', async () => {
        rental.dateOut = dayjs().add(-7, 'days').toDate();
        await rental.save();

        await execute();

        const { rentalFee } = await Rental.findById(rental._id);
        
        expect(rentalFee).toBe(2*7);
    });

    it('should increase the stock', async() => {
        await execute();
        const { numberInStock } = await Movie.findById(movieId);
        
        expect(numberInStock).toBe(10 + 1);
    });

    it('should return rental in the body of response', async () => {
        const res = await execute();

        const rentalInDb = await Rental.findById(rental._id);

        expect(Object.keys(res.body))
            .toEqual(expect.arrayContaining([
                'dateOut', 'dateReturned', '_id', 'movie', 'customer', 'rentalFee'
            ]));
    });
});