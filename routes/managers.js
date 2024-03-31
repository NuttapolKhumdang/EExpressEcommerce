const express = require('express');
const router = express.Router();
const multer = require('multer')();

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

const ProductObject = require('../models/Product');
const Product = ProductObject.Product;
const Category = ProductObject.Category;

const OrderObject = require('../models/Order');
const Address = OrderObject.Address;
const Promotion = OrderObject.Promotion;
const Order = OrderObject.Order;
const OrderStatus = OrderObject.OrderStatus;
const OrderStatusName = OrderObject.OrderStatusName;

router.get('/', (req, res, next) => {
    return res.render('managers', { render: 'managers/home.html' });
});

// ?? Shop
router.get('/shop/promos', async (req, res, next) => {
    const promos = await Promotion.find({ deleted: false });
    return res.render('managers', { render: 'managers/shop-promos.html', promos });
});

router.get('/shop/promos/:id', async (req, res, next) => {
    let promo;
    if (req.params.id !== 'add') promo = await Promotion.findById(req.params.id);
    return res.render('managers', { render: 'managers/shop-promos-add.html', promo });
});

// ?? Products
router.get('/product', async (req, res, next) => {
    const products = await Product.find({});
    return res.render('managers', { render: 'managers/product.html', products });
});

router.get('/product/create', async (req, res, next) => {
    const category = await Category.find({});
    return res.render('managers', { render: 'managers/product-create.html', category });
});

router.get('/product/:id', async (req, res, next) => {
    const category = await Category.find({});
    const product = await Product.findOne({ search: req.params.id });
    return res.render('managers', { render: 'managers/product-create.html', product, category });
});

// ?? Orders
router.get('/orders', async (req, res, next) => {
    const query = {};
    if (req.query?.status) query["status"] = req.query?.status;

    const orders = await Order.find(query);
    return res.render('managers', { render: 'managers/orders-order.html', orders, OrderStatus, OrderStatusName });
});

router.get('/order/:id', async (req, res, next) => {
    try {
        const products = [];
        const order = await Order.findById(req.params.id);
        const address = await Address.findById(order.address);
        const promotion = await Promotion.findById(order.promotion);

        for (let p of order.product) {
            const product = await Product.findById(p.id);
            const option = product.options.filter(e => e.id == p.option)[0];
            products.push({ product, option, quantity: p.quantity });
        }

        return res.render('managers', {
            render: 'managers/orders-view.html', order, products, address, promotion,
            thai_provinces, thai_amphures, thai_tambons, OrderStatus, OrderStatusName
        });
    } catch (e) {
        return next('route');
    }
});

module.exports = router;
