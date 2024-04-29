const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Access = require('../modules/Access');
const { Rights } = require('../modules/AccessRights');

const { Product, Category } = require('../models/Product');
const { UpdateAction, Action } = require('../modules/UpdateActions');

const Image = require('../modules/Images');
const ParseSearch = require('../modules/ParseSearch');


router.get('/id/:id', async (req, res, next) => res.json(await Product.findOne({ search: req.params.id, deleted: false })));
router.route('/:id')
    .post(Access([Rights.PRODUCT.ADD]), Image.upload.array('images'), async (req, res, next) => {
        const _id = new mongoose.Types.ObjectId();
        const filepath = path.join(__dirname, '../', 'resource', 'products', 'images', _id.toString());
        if (!fs.existsSync(filepath)) fs.mkdirSync(filepath, { recursive: true });

        const images = [];

        const isDuplicate = await Product.findOne({ search: ParseSearch(req.body.name) });
        if (isDuplicate) {
            return res.json({ status: 409, message: "ชื้อสินค้านี้ถูกใช้แล้ว" });
        }

        for (let i = 0; i < req.files.length; i++) {
            const upload = new Image.Resize(filepath);
            const filename = await upload.save(req.files[i].buffer);
            images.push(filename);
        }

        let category = req.body.category;
        if (category == "category-new") {
            if (!req.body.newcategory) return res.json({ status: 400, message: "ประเภทสินค้าไม่ถูกต้อง" });
            const newcategory = new Category({
                title: req.body.newcategory,
                quantity: 1,
            });

            await newcategory.save();
            category = newcategory._id.toString();
        } else {
            try {
                await Category.findByIdAndUpdate(category, { $inc: { quantity: 1 } });
            } catch (e) {
                console.error(e);
                return res.json({ status: 500, message: "ประเภทสินค้าไม่ถูกต้อง" });
            }
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
            _id,
            images,
            search,
            options,
            price,
            category,

            name: req.body.name,
            description: req.body.description,
            deleted: false,
        });

        await product.save();
        await UpdateAction(req.user._id, Action.PRODUCT.CREATE, { _id: product._id.toString() });
        return res.json({ status: 200, message: 'ok', product });
    })

    .put(Access([Rights.PRODUCT.MODIFY]), Image.upload.array('images'), async (req, res, next) => {
        const original = await Product.findOne({ search: req.params.id });
        const images = [];
        if (req.files.length !== 0) {
            const filepath = path.join(__dirname, '../', 'resource', 'products', 'images', original._id.toString());
            if (!fs.existsSync(filepath)) fs.mkdirSync(filepath, { recursive: true });

            for (let i = 0; i < req.files.length; i++) {
                const upload = new Image.Resize(filepath);
                const filename = await upload.save(req.files[i].buffer);
                images.push(filename);
            }
        }

        let category = req.body.category;
        if (original.category !== category) {
            try {
                await Category.findByIdAndUpdate(original.category, { $inc: { quantity: -1 } });
            } catch (e) {
                console.error(e);
                return res.json({ status: 500, message: "ประเภทสินค้าไม่ถูกต้อง" });
            }
        }

        if (category == "category-new") {
            if (!req.body.newcategory) return res.json({ status: 400, message: "ประเภทสินค้าไม่ถูกต้อง" });
            const newcategory = new Category({
                title: req.body.newcategory,
                Quantity: 1,
            });

            await newcategory.save();
            category = newcategory._id.toString();
        } else {
            await Category.findByIdAndUpdate(category, { $inc: { quantity: 1 } });
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
            category,

            images: images.length !== 0 ? images : original.images,
            name: req.body.name,
            description: req.body.description,
            deleted: false,
        });

        await UpdateAction(req.user._id, Action.PRODUCT.MODIFY, { _id: product._id.toString() });
        return res.json({ status: 200, message: 'ok', search });
    })

    .delete(Access([Rights.PRODUCT.REMOVE]), async (req, res, next) => {
        await Product.findByIdAndUpdate(req.params.id, { deleted: true });
        return res.json({ status: 204, status: 'OK' });
    });

module.exports = router;