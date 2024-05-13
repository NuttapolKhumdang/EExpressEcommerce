const express = require('express');
const router = express.Router();

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

router.get('/tailwind', async (req, res, next) => {
    const css = await postcss([tailwindcss(), autoprefixer()]).process(
        await fs.promises.readFile(path.join(__dirname, '../', 'public/stylesheets/tailwind.css'), 'utf-8')
    );
    res.setHeader('Content-Type', 'text/css');
    res.end(css.css);
});

router.get('/images/:source/:oid/:filename', async (req, res, next) => {
    const size = {
        w: req.query?.size ?? req.query?.w ?? 2048,
        h: req.query?.size ?? req.query?.h ?? 2048
    }

    try {
        const file = fs.readFileSync(path.join(__dirname, '../', 'resource', req.params.source, 'images', req.params.oid, req.params.filename));
        sharp(file)
            .webp()
            .resize(Number(size.w), Number(size.h), {
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

router.get('/:parent/:filename', async (req, res, next) => {
    try {
        const file = fs.readFileSync(path.join(__dirname, '../', 'resource', req.params.parent, req.params.filename));
        sharp(file)
            .webp()
            .resize(req.query?.size ?? req.query?.w ?? 2048, req.query?.size ?? req.query?.h ?? 2048, {
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

router.all('*', async (req, res, next) => {
    // return res.status(404).json({ account: req?.user, status: 404, message: 'this page not found' });
    return res.status(404).render('error', { render: 'errors/404.html', account: req?.user });
});


module.exports = router;
