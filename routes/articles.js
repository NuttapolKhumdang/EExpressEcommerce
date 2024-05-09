const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const { upload, Resize } = require('../modules/Images');
const { Article } = require('../models/Article');
const parseSearch = require('../modules/ParseSearch');

const Access = require('../modules/Access');
const { Rights, AccountRole } = require('../modules/AccessRights');

router.get('/', async (req, res, next) => {
    const article = await Article.find({ public: true });
    return res.render('articles', { article });
});

// ?? Upload Article's Image
router.post('/image/:id', Access(Rights.ARTICLE.WRITE, true), upload.single('image'), async (req, res, next) => {
    const filepath = path.join(__dirname, '../', 'resource', 'articles', 'images', req.params.id);
    if (!fs.existsSync(filepath)) fs.mkdirSync(filepath, { recursive: true });

    const upload = new Resize(filepath);
    const filename = await upload.save(req.file.buffer);

    return res.json({ status: 201, message: 'OK', filename });
});

router.route('/writer/:id')
    .get(Access(Rights.ARTICLE.WRITE), async (req, res, next) => {
        try {
            const article = await Article.findById(req.params.id);
            return res.render('writer', { title: article.title, article });
        } catch (e) { console.error(e); return next('route') };
    })
    .put(Access(Rights.ARTICLE.WRITE, true), async (req, res, next) => {
        if (req?.body?.title) req.body.search = parseSearch(req.body.title);

        try {
            await Article.findByIdAndUpdate(req.params.id, req.body);
            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(404).json({ status: 404, message: 'document not found' });
        }
    });

router.get('/object/:search', Access(Rights.ARTICLE.OVERVIEW, Rights.ARTICLE.WRITE, true), async (req, res, next) => {
    try {
        const article = await Article.findOne({ search: req.params.search });
        return res.json(article);
    } catch (e) {
        console.error(e);
        return next('route');
    };
});

router.get('/static/:search', async (req, res, next) => {
    try {
        const article = await Article.findOne({ static: req.params.search });
        return res.redirect('/article/' + article.search);
    } catch (e) {
        console.error(e);
        return next('route');
    };
});

router.get('/:search', async (req, res, next) => {
    try {
        const article = await Article.findOne({ search: req.params.search, deleted: false });
        if (!article || article.length == 0) return next('route');
        const content = article.content.map(e => {
            if (e.text.startsWith("[TABLE]")) {
                let table = [];
                let tname = "";

                for (let l of e.text.split("\n")) {
                    let r, tag, rawChild;

                    if (l.startsWith("[TABLE]")) {
                        tname = l.split("[TABLE]")[1];
                        continue;
                    }

                    if (l.startsWith("[HEAD]")) {
                        rawChild = l.split("[HEAD]")[1].split(",");
                        tag = 'TH';
                    }
                    else {
                        rawChild = l.split(",");
                        tag = 'TD';
                    }

                    if (!tag) continue;
                    r = {
                        tag,
                        child: rawChild.map(e => e.trim()),
                    }
                    table.push(r);
                }
                return { tag: 'TABLE', table, tname };
            } else return e;
        });

        return res.render('article', { render: 'articles/reader.html', title: article.title, article, content });
    } catch (e) {
        console.error(e);
        return next('route');
    };
});

module.exports = router;