const auth = require('../middleware/auth');
const { Customer, validate: validator } = require('../models/customer')
const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');

    res.send(customers);
});

router.post('/', [auth, validate(validator)], async (req, res) => {

    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });

    await customer.save();
    res.send(customer);
});

router.put('/:id', [auth, validate(validator)], async (req, res) => {

    const customer = await Customer.findByIdAndUpdate(req.params.id, 
        {
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold
        }, 
        { new: true }
    );
    if(!customer) return res.status(404).send('There is no such customer');

    res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('customer not found or has been already deleted');

    res.send(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).send('No such customer');

    res.send(customer);
});

module.exports = router;