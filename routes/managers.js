const express = require('express');
const router = express.Router();

const passport = require('passport');
const bcrypt = require('bcrypt');

const Access = require('../modules/Access');
const { Account, Actions } = require('../models/Account');
const { Rights, AccountRole } = require('../modules/AccessRights');
const { Mailer } = require('../modules/Mailer');

const { UpdateAction, Action } = require('../modules/UpdateActions');
const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

const { Product, Category } = require('../models/Product');
const { Address, Promotion, Order, OrderStatus, OrderStatusName } = require('../models/Order');

router.get('/', Access(false), (req, res, next) => {
    return res.render('managers', { render: 'managers/profile-personal.html', account: req.user, AccountRole, Rights });
});

// ?? Shop
router.get('/shop/appearance', Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
    const products = await Product.find({ deleted: false });
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
    const products = await Product.find({ deleted: false });
    await UpdateAction(req.user._id, Action.PRODUCT.OVERVIEW);
    return res.render('managers', { render: 'managers/product.html', account: req.user, products });
});

router.get('/product/create', Access([Rights.PRODUCT.ADD]), async (req, res, next) => {
    const category = await Category.find({});
    return res.render('managers', { render: 'managers/product-create.html', account: req.user, category });
});

router.get('/product/:id', Access([Rights.PRODUCT.INFOMATION]), async (req, res, next) => {
    const category = await Category.find({});
    const product = await Product.findOne({ search: req.params.id, deleted: false });
    await UpdateAction(req.user._id, Action.PRODUCT.INFOMATION, { _id: product._id.toString() });

    return res.render('managers', { render: 'managers/product-create.html', account: req.user, product, category });
});

// ?? Orders
router.get('/orders', Access([Rights.ORDER.INFOMATION, Rights.ORDER.OVERVIEW]), async (req, res, next) => {
    const orders = await Order.find({ status: { $nin: [OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.REFUNDING] } });
    return res.render('managers', { render: 'managers/orders-order.html', account: req.user, orders, OrderStatus, OrderStatusName });
});

router.get('/orders/history', Access([Rights.ORDER.INFOMATION]), async (req, res, next) => {
    let query = {
        status: { $in: [OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.REFUNDING] }
    };

    if (req.query?.status) query = {
        status: req.query?.status
    };

    const orders = await Order.find(query);
    return res.render('managers', { render: 'managers/orders-order.html', account: req.user, orders, OrderStatus, OrderStatusName, filter: true });
});

router.get('/order/:id', Access([Rights.ORDER.INFOMATION]), async (req, res, next) => {
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

        await UpdateAction(req.user._id, Action.ORDER.INFOMATION, { _id: order._id.toString() });

        return res.render('managers', {
            render: 'managers/orders-view.html', order, products, address, promotion,
            thai_provinces, thai_amphures, thai_tambons, OrderStatus, OrderStatusName,
            account: req.user,
        });
    } catch (e) {
        return next('route');
    }
});


// ?? Profile 
router.get('/profile', Access(false), async (req, res, next) => {
    return res.render('managers', { render: 'managers/profile-personal.html', account: req.user, AccountRole, Rights });
});

router.route('/profile/security')
    .get(Access(false), async (req, res, next) => {
        const actions = await Actions.findOne({ id: req.user._id.toString() });
        return res.render('managers', { render: 'managers/profile-security.html', account: req.user, actions, Action });
    });

router.route('/profile/security/password')
    .get(Access(false), async (req, res, next) => {
        return res.render('managers', { render: 'managers/profile-security-password.html', account: req.user, q: req.query });
    })
    .post(Access(false), async (req, res, next) => {
        if (bcrypt.compareSync(req.body.pw0, req.user.password)) {
            await Account.findByIdAndUpdate(req.user._id, {
                password: bcrypt.hashSync(req.body.pw1, 10),
                $push: {
                    passwordChange: {
                        pwd: req.user.password,
                        timestamp: new Date(),
                    }
                }
            });

            await UpdateAction(req.user._id, Action.PROFILE.PASSWORD_CHANGE);
            return res.redirect('/managers');
        } else return res.redirect('/managers/profile/security/password?message=รหัสผ่านไม่ถูกต้อง');
    });

// ?? Account
router.get('/account', Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
    const accounts = await Account.find({ status: true, deleted: false });
    return res.render('managers', { render: 'managers/account-manage.html', account: req.user, accounts, AccountRole });
});

router.get('/account/inactive', Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
    const accounts = await Account.find({ status: false, deleted: false });
    return res.render('managers', { render: 'managers/account-manage.html', account: req.user, accounts, AccountRole, heading: 'บัญชีที่ถูกปิดใช้งาน' });
});

router.get('/account/deleted', Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
    const accounts = await Account.find({ deleted: true });
    return res.render('managers', { render: 'managers/account-manage.html', account: req.user, accounts, AccountRole, heading: 'บัญชีที่ลบแล้ว' });
});

router.route('/account/add')
    .get(Access([Rights.ACCOUNT.ADD]), (req, res, next) => {
        return res.render('managers', { render: 'managers/account-add.html', account: req.user, AccountRole });
    })
    .post(Access([Rights.ACCOUNT.ADD], true), async (req, res, next) => {
        if (!req.body.fullname || !req.body.email || !req.body.role) return res.json({ status: 400, message: 'data incomplete' });

        const account = new Account({
            fullname: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            access: AccountRole[req.body.role].Access,
            status: true,
            deleted: false,
        });

        await account.save();

        Mailer('account_new.html', {
            recive: account.email,
            subject: 'คุณได้รับสิทธิ์ในการจัดการเว็ปไซต์ Express',
        }, {
            account: { _id: account._id.toString() },
            account,
        });

        await UpdateAction(req.user._id, Action.ACCOUNT.ADD, { _id: account._id.toString(), account });
        return res.redirect('/managers/account');
    });

router.route('/account/invite')
    .get(async (req, res, next) => {
        if (!req.query.id) return res.status(404).render('errors/404');

        const profile = await Account.findById(req.query.id);
        if (!profile) return res.status(404).render('errors/404');
        else if (profile?.password) return res.redirect('/managers');

        return res.render('managers', { render: 'managers/account-invite.html', profile, AccountRole, Rights });
    })
    .post(async (req, res, next) => {
        if (!req.query.id) return res.render('errors/404');
        if (!req.body.password || !req.body.passwore || req.body.password !== req.body.passwore)
            return res.status(400).render('errors/400');

        await Account.findByIdAndUpdate(req.query.id, {
            password: bcrypt.hashSync(req.body.password, 10),
        });

        const action = new Actions({ id: req.query.id, });
        await action.save();

        await UpdateAction(req.query.id, Action.SESSION.ACTIVE_INVITE);
        return res.redirect('/managers/');
    });

router.route('/account/:id')
    .get(Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
        try {
            const profile = await Account.findById(req.params.id);
            const actions = await Actions.findOne({ id: profile._id.toString() });
            await UpdateAction(req.user._id, Action.ACCOUNT.INFOMATION, { _id: req.params.id });
            return res.render('managers', { render: 'managers/account-view.html', account: req.user, profile, actions, AccountRole, Rights });
        } catch {
            return next('route');
        }
    })
    .put(Access([Rights.ACCOUNT.MODIFY]), async (req, res, next) => {
        if (req.params.id === req.user._id.toString()) return res.status(403).json({ status: 403, message: 'คุณไม่สามารถเปลี่ยนการตั้งต่าสิทธิ์การเข้าถึงของคุณเองได้' });

        try {
            const profile = await Account.findByIdAndUpdate(req.params.id, req.body);
            await UpdateAction(req.user._id, Action.ACCOUNT.MODIFY, { _id: req.params.id, update: req.body });

            return res.json({ status: 200, message: 'OK', profile });
        } catch {
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    })
    .delete(Access([Rights.ACCOUNT.REMOVE]), async (req, res, next) => {
        try {
            const profile = await Account.findByIdAndUpdate(req.params.id, { deleted: true });
            await UpdateAction(req.user._id, Action.ACCOUNT.REMOVE, { _id: req.params.id });

            return res.json({ status: 200, message: 'OK', profile });
        } catch {
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    });

// ?? Authenticate
router.route('/login')
    .get((req, res, next) => {
        if (req.isAuthenticated()) return res.redirect('/managers');
        return res.render('managers', { render: 'managers/account-login.html', });
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/managers',
    }), async (req, res, next) => {
        if (!req.user.status) return req.logout({}, (err) => { return res.status(403).render('errors/account-inactive.html') });
        if (req.user.deleted) return req.logout({}, (err) => { return res.status(403).render('errors/account-deleted.html') });

        await UpdateAction(req.user._id, Action.SESSION.LOGIN);
        return res.redirect('/managers');
    });

router.route('/logout')
    .get(async (req, res, next) => {
        const id = req?.user?._id.toString();
        if (!id) return res.redirect('/');

        req.logout({}, async (err) => {
            if (err) {
                console.error("logout", err);
                return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
            }

            await UpdateAction(id, Action.SESSION.LOGOUT);
            return res.redirect('/');
        });
    });

module.exports = router;
