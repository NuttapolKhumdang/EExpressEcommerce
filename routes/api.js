const express = require('express');
const router = express.Router();

const { Promotion, Address, Order, OrderStatus } = require('../models/Order');
const { Product } = require('../models/Product');
const Appearance = require('../models/Appearance');
const { updateAnalytics } = require('../modules/Analytics');

const { Rights, AccountRole } = require('../modules/AccessRights');
const { UpdateAction, Action } = require('../modules/UpdateActions');
const { MailCheckout } = require('../modules/Mailer');

const Access = require('../modules/Access');
const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

router.get('/address', async (req, res, next) => {
    return res.json({ status: 200, message: 'OK', thai_provinces, thai_amphures, thai_tambons });
});

router.get('/account/access', Access([Rights.ACCOUNT.MODIFY]), async (req, res, next) => {
    return res.json({ status: 200, message: 'OK', Rights, AccountRole });
});

router.get('/product', async (req, res, next) => {
    const query = { deleted: false };
    if (req.query.id) query["_id"] = req.query.id;
    if (req.query.q) query["$text"] = { $search: req.query.q };

    const result = await Product.find(query).limit(10);
    return res.json({ status: 200, message: 'OK', result });
});

router.route('/promocode/:code')
    .get(async (req, res, next) => {
        const promo = await Promotion.findOne({ code: req.params.code, active: true, deleted: false });
        return res.json({ status: 200, message: 'promocode', promo });
    })
    .post(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        const promo = new Promotion(req.body);
        await promo.save();

        await UpdateAction(req.user._id, Action.PROMOTION.ADD, { _id: promo._id.toString(), promo });
        return res.json({ status: 201, message: 'created', promo });
    })
    .put(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        let promo;
        try {
            promo = await Promotion.findByIdAndUpdate(req.params.code, req.body);
        } catch (e) {
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }

        await UpdateAction(req.user._id, Action.PROMOTION.UPDATE, { _id: promo._id.toString(), promo });

        return res.json({ status: 201, message: 'updated', promo });
    })
    .delete(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        let promo;
        try {
            promo = await Promotion.findByIdAndUpdate(req.params.code, { deleted: true });
        } catch (e) {
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }

        await UpdateAction(req.user._id, Action.PROMOTION.REMOVE, { _id: promo._id.toString(), promo });
        return res.status(204).json({ status: 204, message: 'deleted' });
    });


router.route('/checkout/:cart')
    .post(async (req, res, next) => {
        if (req.params.cart != "new") next('route');

        const _address = req.body?.address;
        const _product = req.body?.product;
        const _promotion = req.body?.promotion;

        const fullname = ''.concat(_address.fname, ' ', _address.lname);

        const _bill = {};
        const product = [];

        const token = (function () {
            let s = '';
            for (let i = 0; i < 128; i++) s += (Math.random() * 16 | 0).toString(16);
            return s;
        })();

        _product.forEach(e => {
            _bill['subtotal'] = Number(_bill['subtotal'] ?? 0) + (Number(e?.option?.price ?? 0) * e.quantity);
            _p = {
                id: e.product.id,
                option: e.option.id,
                quantity: e.quantity
            };
            product.push(_p);
        });

        if (_promotion) {
            _bill['discount'] = _promotion.discountByPercen ? (_promotion?.discount / 100) * _bill['subtotal'] : _promotion?.discount;
        }
        else _bill['discount'] = 0;
        _bill['shipping'] = 0;
        _bill['taxes'] = 0;
        _bill['total'] = (_bill['subtotal'] - _bill['discount']) + _bill['shipping'];

        try {
            const address = new Address(_address);
            const order = new Order({
                token,
                fullname,
                product,

                address: address._id.toString(),
                email: _address.email,
                promotion: _promotion?._id,

                bill: _bill,
                status: OrderStatus.PROCESSING,
                update: [
                    {
                        status: OrderStatus.PENDING_PAYMENT,
                        timestamp: new Date(),
                    },
                    {
                        status: OrderStatus.PAID,
                        timestamp: new Date(),
                    },
                    {
                        status: OrderStatus.PROCESSING,
                        timestamp: new Date(),
                    },
                ]
            });

            if (_promotion) {
                await Promotion.findByIdAndUpdate(_promotion._id, { $push: { usage: { order: order._id.toString(), timestamp: new Date() } } });
            }

            await address.save();
            await order.save();

            await MailCheckout(order, address);
            await updateAnalytics({ revenue: _bill.total, orders: 1, sales: product.length });
            return res.status(201).json({ status: 201, message: 'OK', order: order._id.toString(), token, });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    })
    .put(Access([Rights.ORDER.MODIFY], true), async (req, res, next) => {
        try {
            const order = await Order.findByIdAndUpdate(req.params.cart, req.body);
            await UpdateAction(req.user._id, Action.ORDER.MODIFY, { _id: order._id.toString(), update: req.body });
            return res.json({ status: 200, message: 'OK', order });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: 500, message: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้งในภายหลัง' });
        }
    });

router.route('/managers/shop/appearance')
    .get(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        const appearance = await Appearance.find({});
        return res.json({ status: 200, message: 'OK', appearance });
    })
    .post(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        const appearance = new Appearance(req.body);
        await appearance.save();
        await UpdateAction(req.user._id, Action.SHOP.CREATE, { _id: appearance._id.toString(), appearance });
        return res.json({ status: 200, message: 'OK', appearance });
    })
    .put(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        const appearance = await Appearance.findByIdAndUpdate(req.body.id, req.body);
        await UpdateAction(req.user._id, Action.SHOP.MODIFY, { _id: appearance._id.toString(), appearance });
        return res.json({ status: 200, message: 'OK', appearance });
    })
    .delete(Access([Rights.SHOP.MODIFY]), async (req, res, next) => {
        const appearance = await Appearance.findByIdAndDelete(req.body.id);
        await UpdateAction(req.user._id, Action.SHOP.REMOVE, { _id: appearance._id.toString(), appearance });
        return res.json({ status: 200, message: 'OK', appearance });
    });

module.exports = router;
