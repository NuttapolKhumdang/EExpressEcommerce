const express = require('express');
const router = express.Router();
const multer = require('multer')();

const passport = require('passport');
const bcrypt = require('bcrypt');

const { Account } = require('../models/Account');
const Access = require('../modules/Access');
const { Rights, AccountRole } = require('../modules/AccessRights');

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

router.get('/', Access(false), (req, res, next) => {
    return res.render('managers', { render: 'managers/home.html', account: req.user, });
});

// ?? Shop
router.get('/shop/appearance', Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
    const products = await Product.find();
    return res.render('managers', { render: 'managers/shop-appearance.html', account: req.user, products, });
});

router.get('/shop/promos', Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
    const promos = await Promotion.find({ deleted: false });
    return res.render('managers', { render: 'managers/shop-promos.html', account: req.user, promos });
});

router.get('/shop/promos/:id', Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
    let promo;
    if (req.params.id !== 'add') promo = await Promotion.findById(req.params.id);
    return res.render('managers', { render: 'managers/shop-promos-add.html', account: req.user, promo });
});

// ?? Products
router.get('/product', Access([Rights.PRODUCT.INFOMATION, Rights.PRODUCT.MODIFY]), async (req, res, next) => {
    const products = await Product.find({});
    return res.render('managers', { render: 'managers/product.html', account: req.user, products });
});

router.get('/product/create', Access([Rights.PRODUCT.MODIFY,]), async (req, res, next) => {
    const category = await Category.find({});
    return res.render('managers', { render: 'managers/product-create.html', account: req.user, category });
});

router.get('/product/:id', Access([Rights.PRODUCT.INFOMATION, Rights.PRODUCT.MODIFY,]), async (req, res, next) => {
    const category = await Category.find({});
    const product = await Product.findOne({ search: req.params.id });
    return res.render('managers', { render: 'managers/product-create.html', account: req.user, product, category });
});

// ?? Orders
router.get('/orders', Access([Rights.ORDER.INFOMATION, Rights.ORDER.MODIFY, Rights.ORDER.OVERVIEW]), async (req, res, next) => {
    const orders = await Order.find({ status: OrderStatus.PROCESSING });
    return res.render('managers', { render: 'managers/orders-order.html', account: req.user, orders, OrderStatus, OrderStatusName });
});

router.get('/orders/history', Access([Rights.ORDER.INFOMATION, Rights.ORDER.MODIFY]), async (req, res, next) => {
    let query = {
        status: { $ne: OrderStatus.PROCESSING }
    };

    if (req.query?.status) query = {
        status: { $ne: OrderStatus.PROCESSING },
        status: req.query?.status,
    };

    const orders = await Order.find(query);
    return res.render('managers', { render: 'managers/orders-order.html', account: req.user, orders, OrderStatus, OrderStatusName, filter: true });
});

router.get('/order/:id', Access([Rights.ORDER.INFOMATION, Rights.ORDER.MODIFY]), async (req, res, next) => {
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
            thai_provinces, thai_amphures, thai_tambons, OrderStatus, OrderStatusName,
            account: req.user,
        });
    } catch (e) {
        return next('route');
    }
});


// ?? Account
router.get('/account', Access([Rights.ACCOUNT.INFOMATION, Rights.ACCOUNT.MODIFY,]), async (req, res, next) => {
    const accounts = await Account.find();
    return res.render('managers', { render: 'managers/account-manage.html', account: req.user, accounts, AccountRole });
});

router.route('/account/add')
    .get(Access([Rights.ACCOUNT.INFOMATION, Rights.ACCOUNT.MODIFY,]), (req, res, next) => {
        return res.render('managers', { render: 'managers/account-add.html', account: req.user, AccountRole });
    })
    .post(Access([Rights.ACCOUNT.MODIFY], true), async (req, res, next) => {
        if (!req.body.fullname || !req.body.email || !req.body.role) return res.json({ status: 400, message: 'data incomplete' });

        const account = new Account({
            fullname: req.body.fullname,
            email: req.body.email,
            role: req.body.role,
            access: AccountRole[req.body.role].Access,
        });

        await account.save();
        return res.json({ status: 200, account })
    });

router.route('/account/:id')
    .get(Access([Rights.ACCOUNT.INFOMATION, Rights.ACCOUNT.MODIFY,]), async (req, res, next) => {
        try {
            const profile = await Account.findById(req.params.id);
            return res.render('managers', { render: 'managers/account-view.html', account: req.user, profile, AccountRole, Rights });
        } catch {
            return next('route');
        }
    })
    .put(Access([Rights.ACCOUNT.MODIFY]), async (req, res, next) => {
        try {
            const profile = await Account.findByIdAndUpdate(req.params.id, req.body);
            return res.json({ status: 200, message: 'OK', profile });
        } catch {
            return res.json({ status: 500, message: 'something wrong with database' });
        }
    });

// ?? Authenticate
router.route('/login')
    .get((req, res, next) => {
        return res.render('managers', { render: 'managers/account-login.html', });
    })
    .post(passport.authenticate('local', {
        successRedirect: '/managers',
        failureRedirect: '/managers',
    }), (req, res, next) => {
        return res.redirect('/');
    });


module.exports = router;
