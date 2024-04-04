const express = require('express');
const router = express.Router();
const multer = require('multer')();

const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');

const thai_provinces = require('../modules/address/thai_provinces.json');


router.get('/', async (req, res, next) => {
    const appearances = await Appearance.find({});
    const products = await Product.find({});

    const appearance = appearances.map(e => {
        const result = { title: e.title, products: [] };
        for (let p of e.products)
            result.products.push(products.filter(e => e._id.toString() == p._id)[0]);
        return result;
    });

    return res.render('index', { products, appearance });
});

router.get('/tst', async (req, res, next) => {
    return res.render('test');
});

router.get('/checkout', async (req, res, next) => {
    return res.render('checkout', { thai_provinces });
});

router.get('/checkout/:id', async (req, res, next) => {
    return res.render('checkout', {});
});

router.get('/:id', async (req, res, next) => {
    const product = await Product.findOne({ search: req.params.id });
    if (!product) return next('route');

    const products = await Product.find({});
    return res.render('view', { products, product, option: req.query.option });
});

router.get('*', async (req, res, next) => {
    return res.status(404).json({ status: 404, message: 'this page not found' });
});


module.exports = router;
