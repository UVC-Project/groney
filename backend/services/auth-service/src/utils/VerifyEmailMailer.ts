import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendVerifyEmail(email: string, token: string) {
	const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

	await transporter.sendMail({
		from: `"Green Schoolyard" <${process.env.SMTP_FROM}>`,
		to: email,
		subject: 'Verify your email address',
		html: `
			<p>Welcome to Green Schoolyard 🌱</p>
			<p>Please verify your email by clicking the link below:</p>
			<p>
				<a href="${verifyUrl}">${verifyUrl}</a>
			</p>
			<p>This link expires in 24 hours.</p>
		`,
	});
}
