const { Analytics } = require('../models/Analytics');

async function updateAnalytics(updateObject) {
    const date = new Date();

    try {
        await Analytics.findOneAndUpdate({ year: date.getFullYear(), month: date.getMonth(), date: date.getDate() }, { $inc: updateObject }, { upsert: true });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

module.exports = {
    updateAnalytics,
}