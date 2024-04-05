
const Access = {
    //* Product
    PRODUCT: {
        ADD: 'PRODUCT_ADD',
        INFOMATION: 'PRODUCT_INFOMATION',
        MODIFY: 'PRODUCT_MODIFY',
    },

    //* Orders
    ORDER: {
        OVERVIEW: 'ORDER_OVERVIEW',
        INFOMATION: 'ORDER_INFOMATION',
        MODIFY: 'ORDER_MODIFY'
    },

    //* Customer
    CUSTOMER: {
        INFOMATION: 'CUSTOMER_INFOMATION',
        CONTACT: 'CUSTOMER_CONTACT',
    },

    //* Sale
    MAKET: {
        ANALYSIS: 'MAKET_ANALYSIS',
    },

    SHOP: {
        MODIFY: 'SHOP_MODIFY',
    },

    //* Account
    ACCOUNT: {
        ADD: 'ACCOUNT_ADD',
        INFOMATION: 'ACCOUNT_INFOMATION',
        MODIFY: 'ACCOUNT_MODIFY',
        REMOVE: 'ACCOUNT_REMOVE',
    }
};

const AccountRole = {
    ALL: {
        Role: 'ALL',
        Name: 'ผู้ใช้สูงสุด',
        Access: [
            Access.ACCOUNT.ADD,
            Access.ACCOUNT.INFOMATION,
            Access.ACCOUNT.MODIFY,
            Access.ACCOUNT.REMOVE,
            Access.CUSTOMER.CONTACT,
            Access.CUSTOMER.INFOMATION,
            Access.MAKET.ANALYSIS,
            Access.ORDER.INFOMATION,
            Access.ORDER.MODIFY,
            Access.ORDER.OVERVIEW,
            Access.PRODUCT.ADD,
            Access.PRODUCT.INFOMATION,
            Access.PRODUCT.MODIFY,
            Access.SHOP.MODIFY,
        ]
    },
    ADMINISTRATOR: {
        Role: 'ADMINISTRATOR',
        Name: 'ผู้ดูแลระบบ',
        Access: [
            Access.ACCOUNT.INFOMATION,
            Access.ACCOUNT.MODIFY,
            Access.PRODUCT.INFOMATION,
            Access.PRODUCT.MODIFY,
            Access.MAKET.ANALYSIS,
            Access.ORDER.OVERVIEW,
        ]
    },
    SALESPERSON: {
        Role: 'SALESPERSON',
        Name: 'พนักงานขาย',
        Access: [
            Access.CUSTOMER.CONTACT,
            Access.CUSTOMER.INFOMATION,
            Access.ORDER.INFOMATION,
            Access.ORDER.MODIFY,
            Access.ORDER.OVERVIEW,
        ]
    },
    WAREHOUSE_WORKER: {
        Role: 'WAREHOUSE_WORKER',
        Name: 'พนักงานคลังสินค้า',
        Access: [
            Access.ORDER.INFOMATION,
            Access.PRODUCT.INFOMATION,
            Access.CUSTOMER.INFOMATION
        ]
    },
    MARKETER: {
        Role: 'MARKETER',
        Name: 'นักการตลาด',
        Access: [
            Access.MAKET.ANALYSIS,
            Access.PRODUCT.INFOMATION,
        ]
    },
    CUSTOMER_SERVICE_REPRESENTATIVE: {
        Role: 'CUSTOMER_SERVICE_REPRESENTATIVE',
        Name: 'ฝ่ายบริการลูกค้า',
        Access: [
            Access.CUSTOMER.CONTACT,
            Access.CUSTOMER.INFOMATION,
            Access.ORDER.OVERVIEW,
            Access.ORDER.INFOMATION,
        ]
    }
}

module.exports = {
    Rights: Access,
    AccountRole,
}