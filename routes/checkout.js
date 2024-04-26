const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Appearance = require('../models/Appearance');
const { Product, Category } = require('../models/Product');
const { Order, Address, Promotion, OrderStatus, OrderStatusName } = require('../models/Order');

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

router.get('/', async (req, res, next) => {
    return res.render('checkout', { render: 'checkout/checkout.html', title: 'Checkout', account: req?.user, thai_provinces });
});

router.get('/finish', async (req, res, next) => {
    if (!req.query?.id || !req.query?.token) return res.redirect('/');
    return res.render('checkout', { render: 'checkout/finish.html', title: 'Checkout', account: req?.user, id: req.query?.id, token: req.query?.token, component: true });
});

router.get('/detail/:id', async (req, res, next) => {
    if (!req.query?.token) return res.render('error', { render: 'errors/401.html' });

    try {
        const order = await Order.findById(req.params.id);
        if (order.token !== req.query.token) return res.render('error', { render: 'errors/401.html' });

        const address = await Address.findById(order.address);
        const promotion = await Promotion.findById(order.promotion);
        const products = [];

        for (let p of order.product) {
            const product = await Product.findById(p.id);
            const option = product.options.filter(e => e.id == p.option)[0];
            products.push({ product, option, quantity: p.quantity });
        }

        return res.render('checkout', {
            render: 'checkout/detail.html', title: 'รายละเอียดคำสั่งซื้อ',
            order, products, address, promotion,
            thai_provinces, thai_amphures, thai_tambons, OrderStatus, OrderStatusName,
            account: req?.user, component: true,
        });
    } catch (e) {
        console.error(e);
        return next('route');
    }
});


module.exports = router;
