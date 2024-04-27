const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalyticsSchema = new Schema({
    year: Number,
    month: Number,
    date: Number,

    revenue: Number,
    clicks: Number,
    orders: Number,
    conversion: Number,
    sales: Number,
});

const AnalyticsModel = mongoose.model('Analytics', AnalyticsSchema);

module.exports = {
    Analytics: AnalyticsModel,
}