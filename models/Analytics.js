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

const ClientAccessSchema = new Schema({
    viewpath: String,
    action: Array,
}, {
    timestamps: true,
});
const ClientAccessModel = mongoose.model('ClientAccess', ClientAccessSchema);

const PortalAccessSchema = new Schema({
    portal: String,
    action: Array,

    title: String,
}, {
    timestamps: true,
});

const PortalAccessModel = mongoose.model('PortalAccess', PortalAccessSchema);

module.exports = {
    Analytics: AnalyticsModel,
    ClientAccess: ClientAccessModel,
    PortalAccess: PortalAccessModel,
}