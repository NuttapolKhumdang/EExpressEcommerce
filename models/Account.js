const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    fullname: String,
    email: String,
    password: String,
    phone: String,

    role: String,
    access: Array,
}, {
    timestamps: true
});

const AccountModel = mongoose.model('Account', AccountSchema);

module.exports = {
    Account: AccountModel,
}