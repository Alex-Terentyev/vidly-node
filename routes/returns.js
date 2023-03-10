const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
// const validateObjectId = require('../middleware/validateObjectId');


router.post('/', [auth, validate(validateReturn)],  async (req, res) => {
        
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('rental not found');

    if (rental.dateReturned) return res.status(400).send('return is already processed');

    rental.return();
    await rental.save();

    await Movie.findByIdAndUpdate(req.body.movieId, 
        { $inc: { numberInStock: 1 } });

    res.send(rental);
});

function validateReturn (request) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });
    return schema.validate(request);
}

module.exports = router;