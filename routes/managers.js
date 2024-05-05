require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');

const passport = require('passport');
const bcrypt = require('bcrypt');

const Access = require('../modules/Access');
const { Rights, AccountRole } = require('../modules/AccessRights');
const { Mailer } = require('../modules/Mailer');
const { Months, fdiffp, token } = require('../modules/Utils');

const { UpdateAction, Action } = require('../modules/UpdateActions');
const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

const { Analytics, ClientAccess, PortalAccess } = require('../models/Analytics');
const { parseAccessAnalytics } = require('../modules/Analytics');
const { Account, Actions } = require('../models/Account');
const { Product, Category } = require('../models/Product');
const { Address, Promotion, Order, OrderStatus, OrderStatusName } = require('../models/Order');
const { SEOContent } = require('../models/Content');
const { Article } = require('../models/Article');

router.get('/', Access(false), (req, res, next) => {
    return res.render('managers', { render: 'managers/profile-personal.html', account: req.user, AccountRole, Rights });
});

// ?? Articles
router.route('/articles')
    .get(Access(Rights.ARTICLE.OVERVIEW), async (req, res, next) => {
        const articles = await Article.find({});
        return res.render('managers', { render: 'managers/articles.html', account: req.user, articles });
    })
    .post(Access(Rights.ARTICLE.WRITE), async (req, res, next) => {
        const article = new Article();
        await article.save();
        return res.redirect('/article/writer/' + article._id.toString());
    });

// ?? SEO Content
router.route('/seo-optimize')
    .get(async (req, res, next) => {
        const seoContent = await SEOContent.find();

        return res.render('managers', {
            render: 'managers/seo-content.html', account: req.user,
            seoContent,
        });
    })
    .post(async (req, res, next) => {
        if (!req.body?.descriptions) return res.status(400).json({ status: 400, message: 'ต้องการคำอธิบาย' });

        try {
            const seoContent = new SEOContent({
                index: {
                    title: req.body?.title,
                    descriptions: req.body?.descriptions,
                    keyword: req.body?.keyword.split(', '),
                }
            });

            await seoContent.save();
            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'server error' });
        };
    })
    .put(async (req, res, next) => {
        if (!req.body?.id || !req.body?.descriptions) return res.status(400).json({ status: 400, message: 'ข้อมูลไม่ถูกต้อง' });

        try {
            await SEOContent.findByIdAndUpdate(req.body?.id, {
                index: {
                    title: req.body?.title,
                    descriptions: req.body?.descriptions,
                    keyword: req.body?.keyword.split(',').map(e => e.trim()),
                }
            });

            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'server error' });
        };
    });

// ?? Analytics
router.get('/analytics/insights', Access([Rights.MAKET.ANALYTICS]), async (req, res, next) => {
    const date = new Date();
    const analytics = await Analytics.find({ year: date.getFullYear() });
    const revenue = {};
    const clicks = {};
    const orders = {};
    const conversion = {};
    const sales = {};

    const all = {
        revenue: 0,
        clicks: 0,
        orders: 0,
        conversion: 0,
        sales: 0,
    }

    analytics.forEach(e => {
        if (!revenue[e.year]) revenue[e.year] = {};
        if (!revenue[e.year][e.month]) revenue[e.year][e.month] = e.revenue ?? 0;
        else revenue[e.year][e.month] += e.revenue ?? 0;

        if (!clicks[e.year]) clicks[e.year] = {};
        if (!clicks[e.year][e.month]) clicks[e.year][e.month] = e.clicks ?? 0;
        else clicks[e.year][e.month] += e.clicks ?? 0;

        if (!orders[e.year]) orders[e.year] = {};
        if (!orders[e.year][e.month]) orders[e.year][e.month] = e.orders ?? 0;
        else orders[e.year][e.month] += e.orders ?? 0;

        if (!conversion[e.year]) conversion[e.year] = {};
        if (!conversion[e.year][e.month]) conversion[e.year][e.month] = e.conversion ?? 0;
        else conversion[e.year][e.month] += e.conversion ?? 0;

        if (!sales[e.year]) sales[e.year] = {};
        if (!sales[e.year][e.month]) sales[e.year][e.month] = e.sales ?? 0;
        else sales[e.year][e.month] += e.sales ?? 0;

        all.revenue += e.revenue ?? 0;
        all.clicks += e.clicks ?? 0;
        all.orders += e.orders ?? 0;
        all.conversion += e.conversion ?? 0;
        all.sales += e.sales ?? 0;
    });

    return res.render('managers', {
        render: 'managers/analytics-insights.html', account: req.user,

        all,
        revenue,
        clicks,
        orders,
        conversion,
        sales,

        trend: {
            revenue: fdiffp(revenue),
            clicks: fdiffp(clicks),
            orders: fdiffp(orders),
            conversion: fdiffp(conversion),
            sales: fdiffp(sales),
        },

        Months,
        date: new Date(),
    });
});

router.get('/analytics/access', Access([Rights.MAKET.ANALYTICS]), async (req, res, next) => {
    if (req.query?.view) {
        try {

            const clientAccess = await ClientAccess.findOne({ viewpath: req.query?.view });
            return res.render('managers', {
                render: 'managers/analytics-client-details.html', account: req.user,
                access: clientAccess,
            });
        } catch (e) {
            console.error(e);
            return next('route');
        }
    }

    const clientAccess = await ClientAccess.find();
    const { result, all, total } = parseAccessAnalytics(clientAccess, 'viewpath');
    return res.render('managers', {
        render: 'managers/analytics-access.html', account: req.user,
        all, result, total, Months, date: new Date(),
    });
});

router.route('/analytics/portal')
    .get(async (req, res, next) => {
        if (req.query?.view) {
            const portalAccess = await PortalAccess.findOne({ portal: req.query.view });

            return res.render('managers', {
                render: 'managers/analytics-client-details.html', account: req.user,
                access: portalAccess,
            });
        }

        const portalAccess = await PortalAccess.find();
        const { result, all, total } = parseAccessAnalytics(portalAccess, 'portal');

        return res.render('managers', {
            render: 'managers/analytics-portal.html', account: req.user,
            all, result, total, Months, date: new Date(), portals: portalAccess,
        });
    })
    .post(async (req, res, next) => {
        const dirpath = path.join(__dirname, '../', 'resource', 'portal');
        if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath, { recursive: true });

        const portalkey = (function (ln) {
            let result = "";
            for (let i = 0; i < ln; i++) result += (Math.random() * 16 | 0).toString(16);
            return result;
        })(32);

        try {
            const qrdata = await qrcode.toBuffer(process.env.SITE_DOMAIN + '/?portal=' + portalkey, {
                type: 'png',
                errorCorrectionLevel: 'H',
            });

            fs.writeFileSync(path.join(dirpath, portalkey), qrdata);

            const portal = new PortalAccess({
                portal: portalkey,
                title: req.body.title,
            });

            await portal.save();
            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'server die' });
        }
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
    try {
        const category = await Category.find({});
        const product = await Product.findOne({ search: req.params.id, deleted: false });
        await UpdateAction(req.user._id, Action.PRODUCT.INFOMATION, { _id: product._id.toString() });

        return res.render('managers', { render: 'managers/product-create.html', account: req.user, product, category });
    } catch (e) {
        console.error(e);
        return next('route');
    }
});

router.get('/product/:id/detail', Access([Rights.PRODUCT.MODIFY]), async (req, res, next) => {

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
    .get(Access([Rights.PROFILE.MODIFY_PASSWORD]), async (req, res, next) => {
        return res.render('managers', { render: 'managers/profile-security-password.html', account: req.user, q: req.query });
    })
    .post(Access([Rights.PROFILE.MODIFY_PASSWORD], true), async (req, res, next) => {
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

router.route('/account/init')
    .get(async (req, res, next) => {
        const accounts = await Account.find().limit(1);
        if (accounts.length > 0) return res.redirect('/managers');
        return res.render('managers', { render: 'managers/account-init.html', AccountRole });
    })
    .post(async (req, res, next) => {
        const accounts = await Account.find().limit(1);
        if (accounts.length > 0) return res.status(401).json({ status: 401, message: 'please continue with an existing account' });

        const account = new Account({
            fullname: 'ผู้ใช้สูงสุด',
            email: req.body.email,
            role: AccountRole.ALL.Role,
            level: AccountRole.ALL.Level,
            access: AccountRole.ALL.Access,
            status: true,
            deleted: false,
        });

        await account.save();

        Mailer('account_new.html', {
            recive: account.email,
            subject: 'คุณได้รับการเพิ่มบัญชีใน Express',
        }, {
            account: { _id: account._id.toString() },
            account,
        });

        return res.redirect('/managers/account');
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
            level: AccountRole[req.body.role].Level,
            access: AccountRole[req.body.role].Access,
            status: true,
            deleted: false,
        });

        await account.save();

        Mailer('account_new.html', {
            recive: account.email,
            subject: 'คุณได้รับการเพิ่มบัญชีใน Express',
        }, {
            account: { _id: account._id.toString() },
            account,
        });

        await UpdateAction(req.user._id, Action.ACCOUNT.ADD, { _id: account._id.toString(), account });
        return res.redirect('/managers/account');
    });

router.route('/account/direct/add')
    .get(Access(false), (req, res, next) => {
        return res.render('managers', { render: 'managers/account-direct-add.html', account: req?.user, AccountRole });
    })
    .post(Access([Rights.ACCOUNT.ADD]), async (req, res, next) => {
        if (!req.body.fullname || !req.body.role) return res.status(400).redirect('/managers/account/direct/add?error=ข้อมูลไม่ถูกต้อง');
        const accountPWtoken = token(64);
        const account = new Account({
            fullname: req.body.fullname,
            email: token(12),
            password: bcrypt.hashSync(accountPWtoken, 10),
            token: accountPWtoken,

            role: req.body.role,
            level: AccountRole[req.body.role].Level,
            access: AccountRole[req.body.role].Access,
            status: true,
            deleted: false,
        });

        await account.save();

        const action = new Actions({ id: account._id, });
        await action.save();

        await UpdateAction(req.user._id, Action.ACCOUNT.ADD, { _id: account._id.toString(), account });
        return res.redirect('/managers/account/' + account._id.toString());
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

router.get('/account/action/:id', Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
    try {
        const profile = await Account.findById(req.params.id);
        const actions = await Actions.findOne({ id: profile._id.toString() });
        return res.render('managers', { render: 'managers/account-history.html', account: req.user, profile, actions, AccountRole, Rights });
    } catch (e) {
        console.error(e);
        return next('route');
    }
});

router.route('/account/recovery') // ?? Unauthorize end-point
    .get(async (req, res, next) => {
        if (req.isAuthenticated()) return res.redirect('/managers');
        return res.render('managers', { render: 'managers/recovery.html', action: req?.query?.action, query: req?.query });
    })
    .post(async (req, res, next) => {
        try {
            await Account.findOneAndUpdate({ email: req.body.email }, { activetoken: token(32) });
            const account = await Account.findOne({ email: req.body.email });

            Mailer('account_recovery.html', {
                recive: account.email,
                subject: 'กู้คืนบัญชีของคุณ',
            }, {
                account,
            });

            return res.redirect('/managers/account/recovery?action=continue');
        } catch (e) {
            return res.redirect('/managers/login?error=เกิดข้อผิดพลาด');
        }
    })
    .put(async (req, res, next) => {
        try {
            const account = await Account.findOne({ email: req.query?.email });
            if (account.activetoken !== req.query?.token) return res.json({ status: 401, message: 'token unaccepte' });

            await Account.findByIdAndUpdate(account._id, {
                password: bcrypt.hashSync(req.body.password, 10),
                $push: {
                    passwordChange: {
                        pwd: account.password,
                        timestamp: new Date(),
                    }
                },
                activetoken: null,
            });

            await UpdateAction(account._id, Action.PROFILE.RECOVERY);
            return res.json({ status: 200, message: 'OK' });
        } catch (e) {
            console.error(e);
            return res.status(400).json({ status: 400, message: 'เกิดข้อผิดพลาด' });
        }
    });

router.route('/account/:id')
    .get(Access([Rights.ACCOUNT.INFOMATION]), async (req, res, next) => {
        try {
            const profile = await Account.findById(req.params.id);
            await UpdateAction(req.user._id, Action.ACCOUNT.INFOMATION, { _id: req.params.id });
            return res.render('managers', { render: 'managers/account-view.html', account: req.user, profile, AccountRole, Rights });
        } catch {
            return next('route');
        }
    })
    .put(Access([Rights.ACCOUNT.MODIFY], true), async (req, res, next) => {
        try {
            const account = await Account.findById(req.params.id);
            if (req.params.id === req.user._id.toString()) return res.status(403).json({ status: 403, message: 'คุณไม่สามารถเปลี่ยนการตั้งค่าสิทธิ์การเข้าถึงของคุณเองได้' });
            if (req.user.level > account.level) return res.status(403).json({ status: 403, message: 'คุณไม่สามารถเปลี่ยนการตั้งค่าสิทธิ์ของบัญชีที่ระดับสูงกว่าได้' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }

        try {
            const profile = await Account.findByIdAndUpdate(req.params.id, req.body);
            await UpdateAction(req.user._id, Action.ACCOUNT.MODIFY, { _id: req.params.id, update: req.body });

            return res.json({ status: 200, message: 'OK', profile });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    })
    .delete(Access([Rights.ACCOUNT.REMOVE], true), async (req, res, next) => {
        try {
            const profile = await Account.findByIdAndUpdate(req.params.id, { deleted: true });
            await UpdateAction(req.user._id, Action.ACCOUNT.REMOVE, { _id: req.params.id });

            return res.json({ status: 200, message: 'OK', profile });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    });


// ?? Authenticate
router.route('/login')
    .get((req, res, next) => {
        if (req.isAuthenticated()) return res.redirect('/managers');
        return res.render('managers', { render: 'managers/account-login.html', message: req.query?.message, error: req.query?.error });
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/managers/login?error=อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    }), async (req, res, next) => {
        if (!req.user.status) return req.logout({}, (err) => { return res.status(403).render('error', { render: 'errors/account-inactive.html' }) });
        if (req.user.deleted) return req.logout({}, (err) => { return res.status(403).render('error', { render: 'errors/account-deleted.html' }) });

        await UpdateAction(req.user._id, Action.SESSION.LOGIN);
        return res.redirect('/managers');
    });

router.route('/login/direct')
    .get((req, res, next) => {
        if (req.isAuthenticated()) return req.logout({}, (err) => { });
        if (!req.query?.token || !req.query.account) return res.redirect('/managers/login?error=Token ยืนยันตัวตนไม่ถูกต้อง');

        return res.render('direct-auth', { query: req?.query });
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/managers/login?error=การยืนยันตัวตนไม่ถูกต้อง',
    }), async (req, res, next) => {
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

router.get('/*', Access(false), (req, res, next) => {
    return res.redirect('/managers');
});

module.exports = router;
