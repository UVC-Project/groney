// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "132f44a394fcd2",
//     pass: "c98e703d22cdef"
//   }
// });

// export async function sendVerifyEmail(to: string, token: string) {
//   const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;

//   await transporter.sendMail({
//     from: `"Groeny Support" <support@groeny.com>`,
//     to,
//     subject: 'Verify your Groeny teacher account',
//     html: `
//       <p>Welcome to Groeny!</p>
//       <p>Please verify your teacher account by clicking the link below:</p>
//       <a href="${verifyUrl}">${verifyUrl}</a>
//       <p>This link expires in 24 hours.</p>
//     `,
//   });
// }
