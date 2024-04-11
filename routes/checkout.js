const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');
const { Order, Address } = require('../models/Order');

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

router.get('/', async (req, res, next) => {
    return res.render('checkout', { render: 'checkout/checkout.html', title: 'Checkout', account: req?.user, thai_provinces });
});

router.get('/finish', async (req, res, next) => {
    return res.render('checkout', { render: 'checkout/finish.html', title: 'Thank you for using our service', account: req?.user, component: true });
});

router.get('/checkout/details/:id', async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    const address = await Address.findById(order.address);
    const products = [];

    for (let p of order.product) {
        const product = await Product.findById(p.id);
        const option = product.options.filter(e => e.id == p.option)[0];
        products.push({ product, option, quantity: p.quantity });
    }

    const addresses = {
        province: thai_provinces.filter(e => e.id == address.province)[0],
        district: thai_amphures.filter(e => e.id == address.district)[0],
        subdistrict: thai_tambons.filter(e => e.id == address.subdistrict)[0],
    }

    return res.render('checkout', { render: 'checkout/detail.html', account: req?.user, order, address, products, addresses, component: true });
});


module.exports = router;
