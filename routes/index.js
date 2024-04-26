const express = require('express');
const router = express.Router();

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');
const { Order, Address } = require('../models/Order');

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');


router.get('/tst', async (req, res, next) => { // !! test route
    return res.render('test');
});


router.get('/style.css', async (req, res, next) => {
    const css = await postcss([tailwindcss(), autoprefixer()]).process(
        await fs.promises.readFile(path.join(__dirname, '../', 'public/stylesheets/tailwind.css'), 'utf-8')
    );
    res.setHeader('Content-Type', 'text/css');
    res.end(css.css);
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

router.get('/static/:filename', async (req, res, next) => {
    try {
        const file = fs.readFileSync(path.join(__dirname, '../', 'resource', 'static', req.params.filename));
        sharp(file)
            .webp()
            .resize(512, 512, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toBuffer()
            .then(data => res.type('png').send(data));
    } catch (e) {
        console.error(e);
        return next('route');
    }
});

router.get('/images/:source/:oid/:filename', async (req, res, next) => {
    try {
        const file = fs.readFileSync(path.join(__dirname, '../', 'resource', req.params.source, 'images', req.params.oid, req.params.filename));
        sharp(file)
            .webp()
            .resize(1200, 1200, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toBuffer()
            .then(data => res.type('png').send(data));
    } catch (e) {
        console.error(e);
        return next('route');
    }
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
