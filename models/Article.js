const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: String,
    description: String,
    content: Array,
    search: String,
    static: String,

    public: Boolean,
    deleted: Boolean,

    forproduct: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const ArticleModel = mongoose.model('Article', ArticleSchema);

module.exports = {
    Article: ArticleModel
}