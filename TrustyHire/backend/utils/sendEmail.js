const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create the transporter (Connect to Ethereal)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: '"TrustyHire Support" <noreply@trustyhire.com>',
        to: options.email,
        subject: options.subject,
        html: options.message, // Using HTML for the clickable link
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;