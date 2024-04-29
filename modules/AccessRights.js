
const Access = {
    //* Product
    PRODUCT: {
        ADD: 'PRODUCT_ADD',
        INFOMATION: 'PRODUCT_INFOMATION',
        MODIFY: 'PRODUCT_MODIFY',
        REMOVE: 'PRODUCT_REMOVE',
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
        ANALYTICS: 'MAKET_ANALYTICS',
        ACCESS: 'MAKET_ACCESS',
        PORTAL: 'MAKET_PORTAL',
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
        Level: 0,
        Access: [
            Access.ACCOUNT.ADD,
            Access.ACCOUNT.INFOMATION,
            Access.ACCOUNT.MODIFY,
            Access.ACCOUNT.REMOVE,
            Access.CUSTOMER.CONTACT,
            Access.CUSTOMER.INFOMATION,
            Access.MAKET.ANALYTICS,
            Access.MAKET.ACCESS,
            Access.MAKET.PORTAL,
            Access.ORDER.INFOMATION,
            Access.ORDER.MODIFY,
            Access.ORDER.OVERVIEW,
            Access.PRODUCT.ADD,
            Access.PRODUCT.INFOMATION,
            Access.PRODUCT.MODIFY,
            Access.PRODUCT.REMOVE,
            Access.SHOP.MODIFY,
        ]
    },
    ADMINISTRATOR: {
        Role: 'ADMINISTRATOR',
        Name: 'ผู้ดูแลระบบ',
        Level: 1,
        Access: [
            Access.ACCOUNT.ADD,
            Access.ACCOUNT.INFOMATION,
            Access.ACCOUNT.MODIFY,
            Access.ACCOUNT.REMOVE,
            Access.PRODUCT.ADD,
            Access.PRODUCT.INFOMATION,
            Access.PRODUCT.MODIFY,
            Access.PRODUCT.REMOVE,
            Access.MAKET.ANALYTICS,
            Access.MAKET.ACCESS,
            Access.MAKET.PORTAL,
            Access.ORDER.OVERVIEW,
        ]
    },
    SALESPERSON: {
        Role: 'SALESPERSON',
        Name: 'พนักงานขาย',
        Level: 2,
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
        Level: 2,
        Access: [
            Access.ORDER.INFOMATION,
            Access.PRODUCT.INFOMATION,
            Access.CUSTOMER.INFOMATION
        ]
    },
    MARKETER: {
        Role: 'MARKETER',
        Name: 'นักการตลาด',
        Level: 2,
        Access: [
            Access.MAKET.ANALYTICS,
            Access.PRODUCT.INFOMATION,
        ]
    },
    CUSTOMER_SERVICE_REPRESENTATIVE: {
        Role: 'CUSTOMER_SERVICE_REPRESENTATIVE',
        Name: 'ฝ่ายบริการลูกค้า',
        Level: 3,
        Access: [
            Access.CUSTOMER.CONTACT,
            Access.CUSTOMER.INFOMATION,
            Access.ORDER.OVERVIEW,
            Access.ORDER.INFOMATION,
        ]
    }
}

/** Level Descriptions
 * ? Level 0: Security Administrator
 * * Description: Has full access to control all user accounts and system configurations, including permissions for sensitive content. Can view, modify, and delete any sensitive information.
 *
 * ? Level 1: System Administrator
 * * Description: Can manage user accounts and enforce access controls, but with limitations set by the Security Administrator. May have restricted access to certain highly sensitive content.
 * 
 * ? Level 2: Data Steward/Owner
 * * Description: Manages specific data sets or applications containing sensitive content. Can grant or revoke access to authorized users within their area of responsibility.

 * ? Level 3: Authorized User
 * * Description: Granted access to specific sensitive content based on their job function and a need-to-know basis. May have view-only or limited edit permissions.
 * 
 * ? Level 4: Guest/Basic User
 * * Description: Has minimal access and cannot view or modify sensitive content.
 */

module.exports = {
    Rights: Access,
    AccountRole,
}