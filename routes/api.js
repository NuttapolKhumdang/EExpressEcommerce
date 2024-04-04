const express = require('express');
const router = express.Router();

const { Promotion, Address, Order, OrderStatus } = require('../models/Order');
const { Product } = require('../models/Product');
const Appearance = require('../models/Appearance');

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

router.get('/address', async (req, res, next) => {
    return res.json({ status: 200, message: 'OK', thai_provinces, thai_amphures, thai_tambons });
});

router.get('/product', async (req, res, next) => {
    const query = {};
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
    .post(async (req, res, next) => {
        const promo = new Promotion(req.body);
        await promo.save();

        return res.json({ status: 201, message: 'created', promo });
    })
    .put(async (req, res, next) => {
        let promo;
        try {
            promo = await Promotion.findByIdAndUpdate(req.params.code, req.body);
        } catch (e) {
            return res.json({ status: 500, message: 'something went wrong' });
        }

        return res.json({ status: 201, message: 'updated', promo });
    })
    .delete(async (req, res, next) => {
        let promo;
        try {
            promo = await Promotion.findByIdAndUpdate(req.params.code, { deleted: true });
        } catch (e) {
            return res.json({ status: 500, message: 'something went wrong' });
        }
        return res.json({ status: 204, message: 'deleted' });
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
        } catch (e) {
            console.error(e);
            return res.json({ status: 500, message: 'something wrong with database' });
        }

        return res.json({ status: 201, message: 'OK', body: req.body });
    })
    .put(async (req, res, next) => {
        try {
            const order = await Order.findByIdAndUpdate(req.params.cart, req.body);
            return res.json({ status: 200, message: 'OK', order });
        } catch (e) {
            console.error(e);
            return res.json({ status: 500, message: 'something wrong with database' });
        }
    });

router.route('/managers/shop/appearance')
    .get(async (req, res, next) => {
        const appearance = await Appearance.find({});
        return res.json({ status: 200, message: 'OK', appearance });
    })
    .post(async (req, res, next) => {
        const appearance = new Appearance(req.body);
        await appearance.save();
        return res.json({ status: 200, message: 'OK', appearance });
    })
    .put(async (req, res, next) => {
        const appearance = await Appearance.findByIdAndUpdate(req.body.id, req.body);
        return res.json({ status: 200, message: 'OK', appearance });
    });

module.exports = router;
