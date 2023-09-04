import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

declare module 'nodemailer'

// Encrypt the ID with a token
async function encryptId(id: string, token: string) {
	const salt = await bcrypt.genSalt(10)
	const hashedToken = await bcrypt.hash(token, salt)
	const encryptedId = await bcrypt.hash(id.toString(), hashedToken)
	return encryptedId
}

// decrypt the ID with a token
async function decryptId(encryptedId: string, token: string) {
	const hashedToken = await bcrypt.hash(token, 10)
	const match = await bcrypt.compare(encryptedId, hashedToken)
	if (match) {
		return parseInt(encryptedId, 10)
	} else {
		throw new Error('Invalid token')
	}
}

async function generateResetEmailContent(resetToken: string) {
	// Generate the email content with the reset token
	const emailContent = `Dear user,
    
    Please click the following link to reset your password:
    Reset Password: https://example.com/reset-password?token=${resetToken}
    
    If you did not request this password reset, please ignore this email.
    
    Best regards,
    Your App Team`

	return emailContent
}

function generateNewPassword() {
	const length = 8 // Length of the generated password
	const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let newPassword = ''

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		newPassword += characters.charAt(randomIndex)
	}

	return newPassword
}

// Create a transporter using your SMTP settings
const transporter = nodemailer.createTransport({
	host: 'smtp.postmarkapp.com',
	port: 587,
	secure: false, // Set to true if using SSL/TLS
	auth: {
		user: '32ac43045e287971ec4b489b57e865743fd6fa0430527581fd66250104386bf7c1a1fca6',
		pass: '32ac43045e287971ec4b489b57e865743fd6fa0430527581fd66250104386bf7c1a1fca6',
	},
})

// Function to send an email
async function sendEmail(to: any, subject: string, body: string) {
	try {
		// Send the email
		await transporter.sendMail({
			from: 'reply@masterMaths.com',
			to,
			subject,
			text: body,
		})

		console.log('Email sent successfully')
	} catch (error) {
		console.error('Error sending email:', error)
		throw new Error('Failed to send email')
	}
}

export {
	sendEmail,
	generateNewPassword,
	generateResetEmailContent,
	decryptId,
	encryptId,
}
