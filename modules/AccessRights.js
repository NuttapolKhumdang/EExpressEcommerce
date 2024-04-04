
const Access = {
    //* Product
    PRODUCT: {
        ALL: 'PRODUCT_ALL',
        INFOMATION: 'PRODUCT_IMFOMATION',
        MODIFY: 'PRODUCT_MODIFY',
    },

    //* Orders
    ORDER: {
        ALL: 'ORDER_ALL',
        OVERVIEW: 'ORDER_OVERVIEW',
        INFOMATION: 'ORDER_INFOMATION',
        MODIFY: 'ORDER_MODIFY'
    },

    //* Customer
    CUSTOMER: {
        ALL: 'CUSTOMER_ALL',
        INFOMATION: 'CUSTOMER_INFOMATION',
        CONTACT: 'CUSTOMER_CONTACT',
    },

    //* Sale
    MAKET: {
        ALL: 'MAKET_ALL',
        ANALYSIS: 'MAKET_ANALYSIS',
    },

    SHOP: {
        ALL: 'SHOP_ALL',
        MODIFY: 'SHOP_MODIFY',
    },

    //* Account
    ACCOUNT: {
        ALL: 'ACCOUNT_ALL',
        INFOMATION: 'ACCOUNT_INFOMATION',
        MODIFY: 'ACCOUNT_MODIFY',
    }
};

const AccountRole = {
    ALL: {
        Role: 'ALL',
        Name: 'ผู้ใช้สูงสุด',
        Access: [
            Access.ACCOUNT.ALL,
            Access.CUSTOMER.ALL,
            Access.MAKET.ALL,
            Access.ORDER.ALL,
            Access.PRODUCT.ALL,
            Access.SHOP.ALL
        ]
    },
    ADMINISTRATOR: {
        Role: 'ADMINISTRATOR',
        Name: 'ผู้ดูแลระบบ',
        Access: [
            Access.ACCOUNT.ALL,
            Access.PRODUCT.ALL,
            Access.MAKET.ALL,
            Access.ORDER.OVERVIEW,
        ]
    },
    SALESPERSON: {
        Role: 'SALESPERSON',
        Name: 'พนักงานขาย',
        Access: [
            Access.CUSTOMER.ALL,
            Access.ORDER.ALL
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
            Access.MAKET.ALL,
            Access.PRODUCT.INFOMATION,
        ]
    },
    CUSTOMER_SERVICE_REPRESENTATIVE: {
        Role: 'CUSTOMER_SERVICE_REPRESENTATIVE',
        Name: 'ฝ่ายบริการลูกค้า',
        Access: [
            Access.CUSTOMER.ALL,
            Access.ORDER.OVERVIEW,
            Access.ORDER.INFOMATION,
        ]
    }
}

module.exports = {
    Rights: Access,
    AccountRole,
}