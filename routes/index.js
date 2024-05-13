const express = require('express');
const router = express.Router();

const Appearance = require('../models/Appearance');
const { Article } = require('../models/Article');
const { Product, Category } = require('../models/Product');
const { Order, Address } = require('../models/Order');

const { articleMapContent } = require('../modules/Utils');

router.get('/tst', async (req, res, next) => { // !! test route
    return res.render('test');
});

router.get('/', async (req, res, next) => {
    const appearances = await Appearance.find({});
    const products = await Product.find({ deleted: false, });
    const categories = await Category.find({ search: true });

    const appearance = appearances.map(e => {
        const result = { title: e.title, products: [] };
        for (let p of e.products)
            result.products.push(products.filter(e => e._id.toString() == p._id)[0]);
        return result;
    });

    return res.render('index', { account: req?.user, products, appearance, categories });
});


router.get('/search', async (req, res, next) => {
    const filter = { $text: { $search: req.query.search }, deleted: false, };
    if (!req?.query?.search) return res.redirect('/');
    if (req?.query?.category) filter['category'] = req.query.category;

    try {
        const categories = await Category.find({ search: true });
        const products = await Product.find(filter);
        return res.render('search', { account: req?.user, products, categories });
    } catch (e) {
        console.error(e);
        return res.redirect('/');
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findOne({ search: req.params.id, deleted: false });
        if (!product) return next('route');
        const article = await Article.findOne({ forproduct: product._id.toString() });
        const content = articleMapContent(article?.content);

        const categories = await Category.find({ search: true });
        const products = await Product.aggregate([
            { $match: { category: product.category, deleted: false } },
            { $sample: { size: 8 } }
        ]);

        return res.render('view', { account: req?.user, categories, products, product, option: req.query.option, article, content });
    } catch (e) {
        console.error(e);
        return next('route');
    }
});


module.exports = router;
