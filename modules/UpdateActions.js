const { Actions } = require('../models/Account');

async function UpdateAction(id, action, info = {}) {
    id = String(id);
    try {
        await Actions.findOneAndUpdate({ id }, { $push: { action: { action, info, timestamp: new Date() } } });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const Action = {
    SESSION: {
        LOGIN: 'SESSION_LOGIN',
        LOGOUT: 'SESSION_LOGOUT',
        ACTIVE_INVITE: 'SESSION_ACTIVE_INVITE',
    },

    PRODUCT: {
        CREATE: 'PRODUCT_CREATE',
        OVERVIEW: 'PRODUCT_OVERVIEW',
        INFOMATION: 'PRODUCT_INFOMATION',
        MODIFY: 'PRODUCT_MODIFY',
        REMOVE: 'PRODUCT_REMOVE',
    },

    ORDER: {
        OVERVIEW: 'ORDER_OVERVIEW',
        INFOMATION: 'ORDER_INFOMATION',
        MODIFY: 'ORDER_MODIFY'
    },

    CUSTOMER: {
        OVERVIEW: 'CUSTOMER_OVERVIEW',
        INFOMATION: 'CUSTOMER_INFOMATION',
        CONTACT: 'CUSTOMER_CONTACT',
    },

    MAKET: {
        ANALYSIS: 'MAKET_ANALYSIS',
    },

    PROMOTION: {
        ADD: 'PROMOTION_ADD',
        UPDATE: 'PROMOTION_UPDATE',
        REMOVE: 'PROMOTION_REMOVE',
    },

    SHOP: {
        CREATE: 'SHOP_CREATE',
        MODIFY: 'SHOP_MODIFY',
        OVERVIEW: 'SHOP_OVERVIEW',
        REMOVE: 'SHOP_REMOVE',
    },

    ACCOUNT: {
        ADD: 'ACCOUNT_ADD',
        OVERVIEW: 'ACCOUNT_OVERVIEW',
        INFOMATION: 'ACCOUNT_INFOMATION',
        MODIFY: 'ACCOUNT_MODIFY',
        REMOVE: 'ACCOUNT_REMOVE',
    },

    PROFILE: {
        PASSWORD_CHANGE: 'PROFILE_PASSWORD_CHANGE',
        RECOVERY: 'PROFILE_RECOVERY',
    }
}
module.exports = { UpdateAction, Action };