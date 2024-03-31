const express = require('express');
const router = express.Router();
const path = require('path');

const ProductObject = require('../models/Product');
const Product = ProductObject.Product;
const Category = ProductObject.Category;

const Image = require('../modules/Images');
const ParseSearch = require('../modules/ParseSearch');


router.get('/id/:id', async (req, res, next)=> res.json(await Product.findOne({search: req.params.id})));
router.route('/:id')
    .post(Image.upload.array('images'), async (req, res, next) => {
        const filepath = path.join(__dirname, '../', 'public', 'images');
        const images = [];

        const isDuplicate = await Product.findOne({ search: ParseSearch(req.body.name) });
        if (isDuplicate) {
            return res.json({ status: 409, message: "duplicate product name" });
        }

        for (let i = 0; i < req.files.length; i++) {
            const upload = new Image.Resize(filepath);
            const filename = await upload.save(req.files[i].buffer);
            images.push(filename);
        }

        let category = req.body.category;
        if (category == "category-new") {
            const newcategory = new Category({
                title: req.body.newcategory,
                Quantity: 1,
            });

            await newcategory.save();
            category = newcategory._id.toString();
        }


        const search = ParseSearch(req.body.name);
        const options = JSON.parse(req.body.options);
        const price = {
            MIN: options[0].price,
            MAX: options[0].price,
            EQA: false,
        };

        for (let option of options) {
            if (Number(option.price) < Number(price.MIN)) price.MIN = option.price;
            if (Number(option.price) > Number(price.MAX)) price.MAX = option.price;
        }

        if (price.MIN == price.MAX) price.EQA = true;

        const product = new Product({
            images,
            search,
            options,
            price,

            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
        });

        await product.save();
        return res.json({ status: 200, message: 'ok', product });
    })

    .put(Image.upload.array('images'), async (req, res, next) => {
        const original = await Product.findOne({ search: req.params.id });

        let category = req.body.category;
        if (category == "category-new") {
            const newcategory = new Category({
                title: req.body.newcategory,
                Quantity: 1,
            });

            await newcategory.save();
            category = newcategory._id.toString();

            await Category.findByIdAndUpdate(original.category, { $inc: { Quantity: -1 } });
        }

        const search = ParseSearch(req.body.name);
        const options = JSON.parse(req.body.options);
        const price = {
            MIN: options[0].price,
            MAX: options[0].price,
            EQA: false,
        };

        for (let option of options) {
            if (Number(option.price) < Number(price.MIN)) price.MIN = option.price;
            if (Number(option.price) > Number(price.MAX)) price.MAX = option.price;
        }

        if (price.MIN == price.MAX) price.EQA = true;

        const product = await Product.findByIdAndUpdate(original._id, {
            search,
            options,
            price,

            name: req.body.name,
            description: req.body.description,
            category: category,
        });

        return res.json({ status: 200, message: 'ok', product, search });
    });

module.exports = router;