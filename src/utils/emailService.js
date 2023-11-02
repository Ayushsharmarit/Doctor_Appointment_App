const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', 
  port: 587, 
  secure: false, 
  auth: {
    user: 'email@example.com', 
    pass: 'email_password',
  },
});


function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'your_email@example.com', // Your email address
    to: to, // Recipient's email address
    subject: subject,
    text: text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      }
      resolve(info);
    });
  });
}

module.exports = { sendEmail };
