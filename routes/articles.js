const express = require('express');
const router = express.Router();

const { Article } = require('../models/Article');
const parseSearch = require('../modules/ParseSearch');

router.get('/', async (req, res, next) => {
    return res.render('articles', { render: 'articles/reader.html' });
});

router.get('/new', async (req, res, next) => {
    const article = new Article();
    await article.save();
    return res.redirect('/article/writer/' + article._id.toString());
});

router.get('/r/:id', async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    return res.json(article);
});

router.route('/writer/:id')
    .get(async (req, res, next) => {
        try {
            const article = await Article.findById(req.params.id);
            return res.render('writer', { title: article.title, article });
        } catch (e) { console.error(e); return next('route') };
    })
    .put(async (req, res, next) => {
        if (req?.body?.title) req.body.search = parseSearch(req.body.title);

        try {
            await Article.findByIdAndUpdate(req.params.id, req.body);
            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(404).json({ status: 404, message: 'document not found' });
        }
    });

router.get('/:search', async (req, res, next) => {
    try {
        const article = await Article.findOne({ search: req.params.search });
        return res.render('articles', { render: 'articles/reader.html', title: article.title, article, });
    } catch (e) { console.error(e); return next('route'); };
});

module.exports = router;