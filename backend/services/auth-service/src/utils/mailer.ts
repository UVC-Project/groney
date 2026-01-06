import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
	port: parseInt(process.env.SMTP_PORT || "2525"),
	auth: {
		user: process.env.SMTP_USER || "132f44a394fcd2",
		pass: process.env.SMTP_PASS || "c98e703d22cdef"
	}
});

export async function sendResetPasswordEmail(to: string, token: string) {
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

	await transporter.sendMail({
		from: `"Groeny Support" <${process.env.SMTP_USER}>`,
		to,
		subject: 'Reset your Groeny password',
		html: `
			<p>Hello,</p>
			<p>You requested to reset your password.</p>
			<p>
				Click the link below to reset your password (valid for 15 minutes):
			</p>
			<p>
				<a href="${resetUrl}">${resetUrl}</a>
			</p>
			<p>If you did not request this, please ignore this email.</p>
		`
	});
}
