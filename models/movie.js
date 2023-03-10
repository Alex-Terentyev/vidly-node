const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema ({
    title:{
        type: String,
        minlength: 5,
        maxlength: 255,
        required: true,
        trim: true
    },
    genre:{
        type: genreSchema,
        required: true
    },
    numberInStock:{
        type: Number, 
        min: 0,
        max: 100,
        default: 1
    },
    dailyRentalRate:{
        type: Number, 
        min: 0,
        max: 10,
        default: 0
    },
}));

function validateMovie(movie){
    const schema = Joi.object({
        title: Joi.string().required().min(5).max(50),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(1).max(10),
        dailyRentalRate: Joi.number().min(0).max(10)

    });

    return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;