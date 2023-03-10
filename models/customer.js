const Joi = require('joi');
const mongoose = require ('mongoose');

const Customer = mongoose.model('Customer', new mongoose.Schema ({
    name:{
        type: String,
        required: true,
        minlength: 3,
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
}));

function validateCustomer(customer){
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.number().required(),
        isGold: Joi.boolean()
    });
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;