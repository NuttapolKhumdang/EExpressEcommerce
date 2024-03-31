const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    address: String,
    subdistrict: String,
    district: String,
    province: String,
    country: String,
    postalCode: String,
    phone: String,
}, {
    timestamps: true,
});

// const BillSchema = new Schema({
//     subtotal: Number,
//     shipping: Number,
//     taxes: Number,
//     discount: Number,
//     total: Number,
// }, {
//     timestamps: true
// });

const OrderSchema = new Schema({
    fullname: String,
    email: String,

    address: String,
    product: Array,
    promotion: String,

    'bill.subtotal': Number,
    'bill.shipping': Number,
    'bill.taxes': Number,
    'bill.discount': Number,
    'bill.total': Number,

    status: {
        type: String,
        default: 'pending'
    },
    update: Array,
}, {
    timestamps: true,
});

const PromotionSchema = new Schema({
    title: String,
    code: String,
    discount: Number,
    discountByPercen: Boolean, // Fixed Or Percen;
    minimumPrice: Number,
    maximumDiscount: Number,

    active: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    usage: Array,
}, {
    timestamps: true,
});

const AddressModel = mongoose.model('Address', AddressSchema);
// const BillModel = mongoose.model('Bill', BillSchema);
const OrderModel = mongoose.model('Order', OrderSchema);
const PromotionModel = mongoose.model('Promotion', PromotionSchema);

module.exports = {
    Address: AddressModel,
    // Bill: BillModel,
    Order: OrderModel,
    Promotion: PromotionModel,
    OrderStatus: {
        // Ordering Status
        // Additional Status
        PENDING_PAYMENT: 'PENDING_PAYMENT',
        PAID: 'PAID',
        PROCESSING: 'PROCESSING',
        SHIPPED: 'SHIPPED',
        IN_TRANSIT: 'IN_TRANSIT',
        DELIVERED: 'DELIVERED',
        CANCELLED: 'CANCELLED',
        PENDING_REVIEW: 'PENDING_REVIEW',
        PREPARING: 'PREPARING',
        DELIVERY_FAILED: 'DELIVERY_FAILED',
        RETURNED: 'RETURNED',
        REFUNDING: 'REFUNDING',
    },
    OrderStatusName: {
        PENDING_PAYMENT: "รอการชำระเงิน",
        PAID: "ชำระเงินแล้ว",
        PROCESSING: "รอการจัดส่ง",
        SHIPPED: "จัดส่งแล้ว",
        IN_TRANSIT: "กำลังขนส่ง",
        DELIVERED: "สำเร็จ",
        CANCELLED: "ยกเลิก",
        PENDING_REVIEW: "รอตรวจสอบ",
        PREPARING: "กำลังเตรียมสินค้า",
        DELIVERY_FAILED: "จัดส่งไม่สำเร็จ",
        RETURNED: "สินค้าตีกลับ",
        REFUNDING: "คืนเงิน",
    }
}

/*
ก่อนการสั่งซื้อ:
Available: (มีสินค้า) สินค้ามีพร้อมสำหรับการสั่งซื้อ
Out of stock: (สินค้าหมด) สินค้าหมดชั่วคราว
Pre-order: (สินค้าพรีออเดอร์) สินค้าต้องสั่งซื้อล่วงหน้า
Backorder: (สินค้ารอเติม) สินค้ารอเติมสต๊อก

หลังการสั่งซื้อ:
Pending payment: (รอการชำระเงิน) รอให้ลูกค้าชำระเงิน
Paid: (ชำระเงินแล้ว) ลูกค้าชำระเงินเรียบร้อยแล้ว
Processing: (รอการจัดส่ง) รอจัดส่งสินค้า
Shipped: (จัดส่งแล้ว) สินค้าถูกจัดส่งเรียบร้อยแล้ว
In transit: (กำลังขนส่ง) สินค้ากำลังอยู่ในระหว่างการขนส่ง
Delivered: (สำเร็จ) ลูกค้าได้รับสินค้าเรียบร้อยแล้ว
Cancelled: (ยกเลิก) รายการสั่งซื้อถูกยกเลิก

สถานะเพิ่มเติม:
Pending review: (รอตรวจสอบ) รอตรวจสอบการชำระเงิน
Preparing: (กำลังเตรียมสินค้า) กำลังเตรียมสินค้าเพื่อจัดส่ง
Delivery failed: (จัดส่งไม่สำเร็จ) สินค้าจัดส่งไม่สำเร็จ
Returned: (สินค้าตีกลับ) สินค้าถูกตีกลับ
Refunding: (คืนเงิน) กำลังดำเนินการคืนเงิน

คำศัพท์เพิ่มเติม:
Order ID: หมายเลขคำสั่งซื้อ
Tracking number: หมายเลขพัสดุ
Shipping company: บริษัทขนส่ง
*/