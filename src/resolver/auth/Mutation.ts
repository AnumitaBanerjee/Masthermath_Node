import mail from '@utils/mail'
import { encryptId, generateNewPassword, generateResetEmailContent, sendEmail } from './Utils'
import AuthServices, { loginRR } from './module.service'
import parents from '@models/parents.model'
import { randomUUID } from 'crypto'
import PasswordResetLogsModel from '@models/passwordResetLogs.model'
import coachModel from '@models/coach.model'
import usermodel from '@models/users.modal'
import passwordHasher from '@utils/passwordHasher'
import { websiteUrl } from '@resolvers/utils'

const parentLogin = async (
	_: any,
	args: loginRR.Request
): Promise<loginRR.Response> => {
	const services = new AuthServices()
	return await services.login(args)
}

const coachLogin = async (
	_: any,
	args: loginRR.Request
): Promise<loginRR.Response> => {
	const services = new AuthServices()
	return await services.loginCoach(args)
}
const userLogin = async (
	_: any,
	args: loginRR.Request
): Promise<loginRR.Response> => {
	const services = new AuthServices()
	return await services.loginUser(args)
}


const forgotPassByMail = async (
	_: any,
	args: { email: string, type: string }
): Promise<any> => {
	try {
		if (!args.type) {
			throw new Error('Please pass the type')
		}
		if (!args.email) {
			throw new Error('Please pass the email')
		}
		if (args.type === 'Parent') {
			const getId = await parents.findOne({ email: args.email })
			if (!getId) {
				throw new Error('no parent found') 
			}
			if (getId) {
				const resetToken = randomUUID() // Generate a reset token using randomUUID()
				const resetTokenExpiry = Date.now() + 3600000 // Token expires in 1 hour
				await mail.send({
					from: 'anumita.banerjee@indusnet.co.in',
					// to: args.email,
					to: 'test.banerjee@indusnet.co.in',
					subject: 'Reset Password',
					htmlBody: `
			Dear user,
			<h1>Welcome to MasterMaths!</h1>
			Please click the following link to reset your password:
			Reset Password: ${websiteUrl}/Parent/NewPassword/${resetToken}/Parent
			If you did not request this password reset, please ignore this email.
			Best regards,
			MasterMaths Team`,
				})
				getId.resetToken = resetToken
				getId.resetTokenExpiry = resetTokenExpiry
				await getId.save()
				return true
			}
		
		} 
		if (args.type === 'Coach') {
			const getId = await coachModel.findOne({ emailAddress: args.email })
			if (!getId) {
				throw new Error('no coach found') 
			}
			if (getId) {
				const resetToken = randomUUID() // Generate a reset token using randomUUID()
				const resetTokenExpiry = Date.now() + 3600000 // Token expires in 1 hour
				await mail.send({
					from: 'anumita.banerjee@indusnet.co.in',
					to: 'anumita.banerjee@indusnet.co.in',
					// to: args.email,
					subject: 'Reset Password',
					htmlBody: `
			Dear user,
			<h1>Welcome to MasterMaths!</h1>
			Please click the following link to reset your password:
			Reset Password: ${websiteUrl}/Coach/NewPassword/${resetToken}/Coach
			If you did not request this password reset, please ignore this email.
			Best regards,
			MasterMaths Team`,
				})
				getId.resetToken = resetToken
				getId.resetTokenExpiry = resetTokenExpiry
			
				await getId.save()
				return true
			}
		} 
		if (args.type === 'Staff') {
			const getId = await usermodel.findOne({ email: args.email })
			if (!getId) {
				throw new Error('User not found') 
			}
			if (getId) {
				const resetToken = randomUUID() // Generate a reset token using randomUUID()
				const resetTokenExpiry = Date.now() + 3600000 // Token expires in 1 hour
				await mail.send({
					from: 'anumita.banerjee@indusnet.co.in',
					// to: args.email,
					to: args.email,
					subject: 'Reset Password',
					htmlBody: `
			Dear user,
			<h1>Welcome to MasterMaths!</h1>
			Please click the following link to reset your password:
			Reset Password: ${websiteUrl}/Staff/NewPassword/${resetToken}/Staff
			If you did not request this password reset, please ignore this email.
			Best regards,
			MasterMaths Team`,
				})
				
				getId.resetToken = resetToken
				getId.resetTokenExpiry = resetTokenExpiry
				await getId.save()
				return true
			}
		}
		
		if (args.type === 'Admin') {
			const getId = await usermodel.findOne({ email: args.email })
			if (!getId) {
				throw new Error('User not found') 
			}
			if (getId) {
				const resetToken = randomUUID() // Generate a reset token using randomUUID()
				const resetTokenExpiry = Date.now() + 3600000 // Token expires in 1 hour
				await mail.send({
					from: 'anumita.banerjee@indusnet.co.in',
					// to: args.email,
					to: 'sutapa.majumder@indusnet.co.in',
					subject: 'Reset Password',
					htmlBody: `
			Dear user,
			<h1>Welcome to MasterMaths!</h1>
			Please click the following link to reset your password:
			Reset Password: ${websiteUrl}/Admin/NewPassword/${resetToken}/Admin
			If you did not request this password reset, please ignore this email.
			Best regards,
			MasterMaths Team`,
				})
				
				getId.resetToken = resetToken
				getId.resetTokenExpiry = resetTokenExpiry
				await getId.save()
				return true
			}
		} 
		
		return false
	} catch (error) {
		throw new Error('Failed to send reset password email' + error) // You can handle this error in your resolver or mutation handling code
	}
}

const resetPasswordByToken = async (
	_: any,
	args: { resetToken: string,password: string, type: string }
): Promise<any> => {
	try {
		if (args.type === 'Parent') {
			const parent = await parents.findOne({ resetToken:args.resetToken, resetTokenExpiry: { $gt: Date.now() } })

			if (!parent) {
				throw new Error('Invalid or expired token')
			}

			// Generate a new password if newPassword parameter is not provided
			const updatedPassword = args.password || generateNewPassword()
			const updatedPasswordHased = await passwordHasher.hash(
				updatedPassword,
        process.env.SALT!
			)
			parent.password = updatedPasswordHased
			parent.resetToken = ''
			parent.resetTokenExpiry = 0
			await parent.save()
			return true
		} 
		if (args.type === 'Coach') {
			const coach = await coachModel.findOne({ resetToken:args.resetToken, resetTokenExpiry: { $gt: Date.now() } })
			
			if (!coach) {
				throw new Error('Invalid or expired token')
			}

			// Generate a new password if newPassword parameter is not provided
			const updatedPassword = args.password || generateNewPassword()
			const updatedPasswordHased = await passwordHasher.hash(
				updatedPassword,
        process.env.SALT!
			)
			coach.password = updatedPasswordHased
			coach.resetToken = ''
			coach.resetTokenExpiry = 0
			await coach.save()
			return true
		} 
		if (args.type === 'Staff') {
			const staff = await usermodel.findOne({ resetToken:args.resetToken, resetTokenExpiry: { $gt: Date.now() } })

			if (!staff) {
				throw new Error('Invalid or expired token')
			}

			// Generate a new password if newPassword parameter is not provided
			const updatedPassword = args.password || generateNewPassword()
			const updatedPasswordHased = await passwordHasher.hash(
				updatedPassword,
        process.env.SALT!
			)
			staff.password = updatedPasswordHased
			staff.resetToken = ''
			staff.resetTokenExpiry = 0
			await staff.save()
			return true
		} 
		
		return false
	} catch (error) {
		console.error('Error resetting password :', error)
		throw new Error('Failed to reset password '+error) // You can handle this error in your resolver or mutation handling code
	}
}

const resetParentPassword = async (
	_: any,
	args: { id: string; newPassword: string }
): Promise<any> => {
	const services = new AuthServices()
	return await services.resetParentPassword(args.id, args.newPassword)
}

export {
	parentLogin,
	resetParentPassword,
	coachLogin,
	userLogin,
	forgotPassByMail,
	resetPasswordByToken
}
