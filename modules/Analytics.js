const { Analytics, ClientAccess, PortalAccess } = require('../models/Analytics');

async function updateAnalytics(updateObject) {
    try {
        const date = new Date();
        await Analytics.findOneAndUpdate({ year: date.getFullYear(), month: date.getMonth(), date: date.getDate() }, { $inc: updateObject }, { upsert: true });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function updatePortal({ portal, ip } = e) {
    try {
        await PortalAccess.findOneAndUpdate({ portal }, { $push: { action: { timestamp: new Date(), ip } } }, { upsert: true });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function clientAccess() {
    const ignoreViewpath = [
        'images',
        'tailwind',
        'javascripts',
        'analytics',
        // 'managers',
    ];

    return async (req, res, next) => {
        const base = req.path.toString().split('/')[1];
        if (ignoreViewpath.includes(base)) return next();

        const viewpath = req.originalUrl.split('?')[0];
        await ClientAccess.findOneAndUpdate({ viewpath }, { $push: { action: { ip: req.ip, timestamp: new Date() }, } }, { upsert: true });
        return next();
    }
}

function parseAccessAnalytics(AccessObject, mkey) {
    const result = {};
    let all = {};
    let total = 0;

    AccessObject.forEach(e => {
        const k = e[mkey];
        if (!result[k]) result[k] = {};
        if (!all[k]) all[k] = 0;

        e.action.forEach(action => {
            const timestamp = new Date(action);

            const year = timestamp.getFullYear();
            const month = timestamp.getMonth();
            // const date = timestamp.getDate();

            if (!result[k][year]) result[k][year] = {};
            if (!result[k][year][month]) result[k][year][month] = 1;
            else result[k][year][month]++;

            all[k]++;
            total++;
        });
    });

    const entries = Object.entries(all);

    // Sort the array by view in descending order (largest to smallest)
    entries.sort((a, b) => b[1] - a[1]);

    // Optional: Create a new object with the sorted order
    all = entries.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    return { result, total, all };
}

module.exports = {
    updateAnalytics,
    updatePortal,
    clientAccess,
    parseAccessAnalytics,
}