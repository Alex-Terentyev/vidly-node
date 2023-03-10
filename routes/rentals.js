const auth = require('../middleware/auth');
const express = require('express');
const { Mongoose, default: mongoose } = require('mongoose');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const { Rental, validate } = require('../models/rental');
const router = express.Router();

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer');

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie');

    if (movie.numberInStock === 0) return res.status(400).send('Movie is out of stock');

    let rental = new Rental({
        customer:{
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },

        movie:{
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    
    const movieLog = movie;

    try{
        rental = await rental.save();
        await movie.updateOne( {$inc: {numberInStock: -1}} );
        res.send(rental);
    } catch (err) {
        // await session.abortTransaction();
        movie = movieLog;
        movie.save();
        rental.deleteOne();

        console.log('error:' + err.message);
        res.status(500).send('Internal error');
    }
    
    // const transcriptionOptions = [];

    // try {
    //     const transResult =  await session.withTransaction ( async () => {

    //         rental = await rental.save({ session });

    //         movie.numberInStock--;
    //         movie.save( {session} );
    //         //  if (some error) {
    //         //      await sesstion.abortTransaction();
    //         //      console.log('Error occured...');
    //         //      return;
    //         //  }

    //         // res.send(rental)
    //         return;
    //     });

    //     if (transResult) res.send('Rental was successfully done', rental);
    //     else res.status(500).send('Reservation was aborted');

    // } catch (err) {
    //     res.status(500).send('There was an internal error');
    // } finally {
    //     await session.endSession();
    // } 
});

module.exports = router;