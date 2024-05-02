const express = require('express');
const router = express.Router();

const { updateAnalytics, updatePortal } = require('../modules/Analytics');
const { ClientAccess } = require('../models/Analytics');


router.get('/data', async (req, res, next) => {
    if (req.query?.portal) await updatePortal({ portal: req.query.portal, ip: req.ip });
    if (req.query?.__alsx__xu_clx__v_) await updateAnalytics({ clicks: req.query?.__alsx__xu_clx__v_ });

    return res.end();
});

router.get('/cd', async (req, res, next) => {
    return res.json(await ClientAccess.find());
});

module.exports = router;