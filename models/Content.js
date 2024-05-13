const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SEOContentSchema = new Schema({
    "index.title": String,
    "index.keyword": Array,
    "index.descriptions": String,
}, {
    timestamps: true,
});

const SEOContentModel = mongoose.model('SEOContent', SEOContentSchema);

module.exports = {
    SEOContent: SEOContentModel,
}