const express = require('express');
const router = express.Router();

const { updateAnalytics } = require('../modules/Analytics');


router.get('/data', async (req, res, next) => {
    await updateAnalytics({ clicks: req.query?.__alsx__xu_clx__v_ });
});

module.exports = router;