const express = require('express');
const router = express.Router();

const { updateAnalytics, updatePortal } = require('../modules/Analytics');
const { ClientAccess } = require('../models/Analytics');


router.get('/data', async (req, res, next) => {
    if (req.query?.__alsx__at_qrx__v_) await updatePortal(req.query.__alsx__at_qrx__v_);
    if (req.query?.__alsx__xu_clx__v_) await updateAnalytics({ clicks: req.query?.__alsx__xu_clx__v_ });

    return res.end();
});

router.get('/cd', async (req, res, next) => {
    return res.json(await ClientAccess.find());
});

module.exports = router;