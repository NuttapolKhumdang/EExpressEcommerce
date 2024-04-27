const express = require('express');
const router = express.Router();

const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');
const { Order, Address } = require('../models/Order');

router.get('/tst', async (req, res, next) => { // !! test route
    return res.render('test');
});

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

router.get('/:id', async (req, res, next) => {
    const product = await Product.findOne({ search: req.params.id, deleted: false });
    if (!product) return next('route');

    const products = await Product.find({ deleted: false });
    return res.render('view', { account: req?.user, products, product, option: req.query.option });
});


module.exports = router;
