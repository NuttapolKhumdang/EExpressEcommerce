require('dotenv').config();
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const insecurePrototype = allowInsecurePrototypeAccess(handlebars);

const thai_provinces = require('../modules/address/thai_provinces.json');
const thai_amphures = require('../modules/address/thai_amphures.json');
const thai_tambons = require('../modules/address/thai_tambons.json');

const { Order, Address } = require('../models/Order');
const { Product, Category } = require('../models/Product');

let smtpTransport = require('nodemailer-smtp-transport');

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

smtpTransport = nodemailer.createTransport(smtpTransport({
    service: process.env.MAILSENDER_SERVICE,
    host: process.env.MAILSENDER_HOST,
    secure: process.env.MAILSENDER_SECURE,
    port: process.env.MAILSENDER_PORT,
    auth: {
        user: process.env.MAILSENDER_USER,
        pass: process.env.MAILSENDER_PASS
    }
}));

function sendMailTemplate(template, options, replacements) {
    readHTMLFile(path.join(__dirname, '../', 'mails', template), function (err, html) {
        if (err) return console.error('error reading file', err);

        const template = insecurePrototype.compile(html);
        const htmlToSend = template(replacements);

        const mailOptions = {
            from: 'EExpress <noreply@nuttapolkhumdang.work>',
            to: options.recive,
            subject: options.subject,
            html: htmlToSend,
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) console.error(error);
        });
    });
}

async function sendOrderCheckout(order, address) {
    const products = [];

    for (let p of order.product) {
        const product = await Product.findById(p.id);
        const option = product.options.filter(e => e.id == p.option)[0];
        products.push({ product, option, quantity: p.quantity });
    }

    const addresses = {
        province: thai_provinces.filter(e => e.id == address.province)[0],
        district: thai_amphures.filter(e => e.id == address.district)[0],
        subdistrict: thai_tambons.filter(e => e.id == address.subdistrict)[0],
    }

    sendMailTemplate('checkout_report.html', {
        recive: order.email,
        subject: 'รายละเอียดคำสั่งซื้อหมายเลข ' + order._id.toString(),
    }, { order, products, address, addresses });
}

module.exports = {
    readHTMLFile,
    Mailer: sendMailTemplate,
    MailCheckout: sendOrderCheckout,
};