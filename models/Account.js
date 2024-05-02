const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    fullname: String,
    email: String,
    password: String,
    phone: String,

    role: String,
    level: Number,
    access: Array,
    status: {
        type: Boolean,
        default: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    },

    passwordChange: Array,
    activetoken: String,
    token: String,
}, {
    timestamps: true
});

const AccountModel = mongoose.model('Account', AccountSchema);

const ActionSchema = new Schema({
    action: Array,
    id: String,
}, {
    timestamps: true,
});

const ActionModel = mongoose.model('AccountAction', ActionSchema);

module.exports = {
    Account: AccountModel,
    Actions: ActionModel,
}