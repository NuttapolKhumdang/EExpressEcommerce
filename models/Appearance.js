const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppearanceSchema = new Schema({
    title: String,
    products: Array,
    index: Number,
});

const AppearanceModel = mongoose.model('Appearance', AppearanceSchema);
module.exports = AppearanceModel;