const nodemailer = require("nodemailer");
const config = require("config");

// Change to config setting later
const username = config.get("emailUsername");
const adminEmail = config.get("adminEmail");
const password = config.get("password");
const fromEmail = config.get("fromEmail");
const systemEmail = config.get("systemEmail");
const host = config.get("host");
const port = config.get("emailPort");
const secure = config.get("secure");

// const configuration = {
//   // host: "pro.turbo-smtp.com",
//   // port: 465,
//   // secure: true,
//   host: host,
//   port: port,
//   secure: secure, // true for 465, false for other ports
//   auth: {
//     user: systemEmail, // generated ethereal user
//     pass: password // generated ethereal password,
//   }
//   // tls: {
//   //   rejectUnauthorised: true
//   // }
// };
console.log(username);
console.log(password);

const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: username,
    pass: password
  }
});

const footer = `<span>Regards,</span></br>
<b>Storage</b></br>
<b>GoldSilver Central Pte. Ltd.</b></br>
<span style="color:grey;">03 Pickering Street #01-15/16 Nankin Row Singapore 048660</span></br>
<a href=https://www.goldsilvercentral.com.sg>www.goldsilvercentral.com.sg</a></br>
<span>T: +65 6222 9703 | F: +65 6750 4513</span></br>
<a href=https://fb.com/goldsilvercentral>fb.com/goldsilvercentral<a><span style="color:grey;"> | @goldsilverc </span>`;

async function sendPasswordRecovery(origin, client, token) {
  // send mail with defined transport object
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: client.email, // list of receivers
    subject: "Goldsilver Central BSP: Request to reset Password", // Subject line
    html: `
    <p>Dear ${client.name},</p>
    <p>A request has been made to reset the password to your account.</p>
    <p>You may click on the link below to reset your password.</p>
    <a style="font-weight:bold;" href=${origin}/resetPassword/${token}>${origin}/resetPassword/${token}</a></br>
    <p style="color:red; font-weight:bold; text-decoration: underline;">The link can only be used once and will expire after 5 minutes.</p>
    <p>If this was not requested by you, please notify the GoldSilver Central Team immediately.</p>
    <p>Thank you.</p>
    ${footer}`
  });
}

async function sendResetPasswordNotification(client) {
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: adminEmail, // list of receivers
    subject: "Goldsilver Central BSP: Request to reset Password - Successful", // Subject line
    html: `<p>Dear GSC,</p>
    <p>${client.name} password has been reset successfully.</p>
    <p>Thank you.</p>
    ${footer}
    `
  });
}

async function sendClientUpdateNotification(origin, client) {
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: adminEmail, // list of receivers
    subject: "Goldsilver Central BSP: Request to update particulars", // Subject line
    html: `<p>Dear GSC,</p>
    <p>${client.name} has updated their personal information. Please login to approve/reject.</p>
    <a style="font-weight:bold;" href=${origin}/adminAllUsersPage>${origin}/adminAllUsersPage</a></br>
    <p>Thank you.</p>
    ${footer}`
  });
}

async function sendApproval(origin, client) {
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: client.email, // list of receivers
    subject:
      "Goldsilver Central BSP: Request to update particulars - Successful", // Subject line
    html: `<p>Dear ${client.name},</p>
    <p>Thank you for updating your personal information. We have reviewed the information and updated our records accordingly.</p>
    <p>Do let us know if we can be of further assistance.</p>
    <p>Thank you.</p>
    ${footer}`
  });
}

async function sendReject(origin, client) {
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: client.email, // list of receivers
    subject:
      "Goldsilver Central BSP: Request to update particulars - Follow Up", // Subject line
    html: `<p>Dear ${client.name},</p>
    <p>Thank you for updating your personal information. We have reviewed the information and will need to drop you a call to follow up. 
    Do let us know when is a good time to speak to you.</p>
    <p>Do note that your records have not been updated.</p>
    <p>Thank you.</p>
    ${footer}`
  });
}

async function twoFactorAuthorisation(origin, email, token) {
  await transporter.sendMail({
    from: fromEmail, // sender address
    to: email, // list of receivers
    subject: "GoldSilver Central BSP Two-Factor Authorisation", // Subject line
    html: `<p>Hello,</p>
    <p>Greetings from GoldSilver Central!</p>
    <span>One-time Web Link Access</span></br>
    <span>Please click on the link to complete your login.</span></br></br>
    <a style="font-weight:bold;" href=${origin}/login/${token}>${origin}/login/${token}</a></br>
    <p> Please inform us if you notice any discrepancies or require more information and clarification. 
    We would be glad to be of assistance.</p>\
    <p> Thank you and have a great day ahead.</p>
    ${footer}`
  });
}

module.exports = {
  sendPasswordRecovery,
  sendClientUpdateNotification,
  sendApproval,
  sendReject,
  sendResetPasswordNotification,
  twoFactorAuthorisation
};
