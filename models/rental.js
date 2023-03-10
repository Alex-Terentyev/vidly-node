const Joi = require('joi');
const dayjs = require('dayjs');
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name:{
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            phone:{
                type: Number,
                required: true
            },
            isGold:{
                type: Boolean,
                default: false
            }
        }),
        required: true
    },

    movie:{
        type: new mongoose.Schema ({
            title:{
                type: String,
                minlength: 5,
                maxlength: 255,
                required: true,
                trim: true
            },
            dailyRentalRate:{
                type: Number, 
                min: 0,
                max: 10,
                default: 0
            },
        }),
        required: true
    },
    dateOut:{
        type: Date,
        default: Date.now
    },
    
    dateReturned:{
        type: Date
    },

    rentalFee:{
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function (customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId
    });
}

rentalSchema.methods.return = function () {
    this.dateReturned = new Date();

    const rentalDays = dayjs().diff(this.dateOut, 'days');
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });

    return schema.validate(rental);
}



exports.Rental = Rental;
exports.validate = validateRental;