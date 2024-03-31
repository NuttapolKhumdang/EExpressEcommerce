const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: String,
    description: String,
    category: String,

    options: Array,
    images: Array,

    search: String,

    'price.MIN': Number,
    'price.MAX': Number,
    'price.EQA': Boolean,
}, {
    timestamp: true,
});

const ProductModel = mongoose.model('Product', ProductSchema);

const CategorySchema = new Schema({
    id: String,
    title: String,
    Quantity: Number,
});

const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = {
    Product: ProductModel,
    Category: CategoryModel,
}