require('dotenv').config();
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
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
    service:process.env.MAILSENDER_SERVICE,
    host: process.env.MAILSENDER_HOST,
    secure: process.env.MAILSENDER_SECURE,
    port: process.env.MAILSENDER_PORT,
    auth: {
        user: process.env.MAILSENDER_USER,
        pass: process.env.MAILSENDER_PASS
    }
}));

function sendMailTemplate(template, options,  replacements) {
    readHTMLFile(path.join(__dirname, '../', 'mails', template), function (err, html) {
        if (err) {
            console.error('error reading file', err);
            return;
        }
        const template = handlebars.compile(html);
        const htmlToSend = template(replacements);

        const mailOptions = {
            from: options.sender,
            to: options.recive,
            subject: options.subject,
            html: htmlToSend,
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    });
}

module.exports = sendMailTemplate;