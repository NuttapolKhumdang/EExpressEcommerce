const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');
const { Order, Address } = require('../models/Order');

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');


router.get('/', async (req, res, next) => {
    const appearances = await Appearance.find({});
    const products = await Product.find({ deleted: false, });

    const appearance = appearances.map(e => {
        const result = { title: e.title, products: [] };
        for (let p of e.products)
            result.products.push(products.filter(e => e._id.toString() == p._id)[0]);
        return result;
    });

    return res.render('index', { account: req?.user, products, appearance });
});

router.get('/tst', async (req, res, next) => {
    return res.render('test');
});

router.get('/checkout', async (req, res, next) => {
    return res.render('checkout', { account: req?.user, thai_provinces });
});

router.get('/checkout/:id', async (req, res, next) => {
    return res.render('checkout', { account: req?.user, });
});

router.get('/:id', async (req, res, next) => {
    const product = await Product.findOne({ search: req.params.id, deleted: false });
    if (!product) return next('route');

    const products = await Product.find({ deleted: false });
    return res.render('view', { account: req?.user, products, product, option: req.query.option });
});

router.all('*', async (req, res, next) => {
    // return res.status(404).json({ account: req?.user, status: 404, message: 'this page not found' });
    return res.status(404).render('errors/404', { account: req?.user });
});


module.exports = router;
