import usermodel from '@models/users.modal'
import parentsmodel from '@models/parents.model'
import CoachService from '@resolvers/coach/module.service'
import ParentsService from '@resolvers/parents/module.service'
import JwtGenerator from '@utils/jwtGenerator'
import PasswordHasher from '@utils/passwordHasher'
import { generateNewPassword } from './Utils'

interface IAuthService {
  login(data: loginRR.Request): Promise<loginRR.Response>
}

export default class AuthServices implements IAuthService {
	async login(data: loginRR.Request): Promise<loginRR.Response> {
		const parentService = new ParentsService()

		const searchForParent = await parentService.fetchByEmail(data.email)

		if (searchForParent === null) {
			throw new Error('Invalid email or password')
		}

		const passwordVerification = await PasswordHasher.verify(
			data.password,
			searchForParent.password
		)

		if (passwordVerification === false) {
			throw new Error('Invalid email or password')
		}

		const token = JwtGenerator.sign({
			_id: searchForParent._id,
			phone: '',
			address: '',
			image: '',
			paymentCusId: '',
			wid: '',
			resetToken:'',
			resetTokenExpiry:0,
		})

		return Promise.resolve(token)
	}

	async CheckAuth(token: string) {
		if (token === undefined) {
			throw new Error('Please pass a token')
		}

		const parentService = new ParentsService()
		token = token.split(' ')[1]
		const jwtPayload = JwtGenerator.verify(token)

		const checkForUser = await parentService.fetchById(jwtPayload._id)

		if (checkForUser === null) {
			throw new Error('No Such User Exisits')
		}

		return jwtPayload._id
	}

	async loginCoach(data: loginRR.Request): Promise<loginRR.Response> {
		const coachService = new CoachService()

		const searchForCoach = await coachService.fetchByEmail(data.email)

		if (searchForCoach === null) {
			throw new Error('Invalid email')
		}

		const passwordVerification = await PasswordHasher.verify(
			data.password,
			searchForCoach.password
		)

		if (passwordVerification === false) {
			throw new Error('Invalid email')
		}

		const token = JwtGenerator.sign({
			_id: searchForCoach._id,
			phone: '',
			address: '',
			image: '',
			paymentCusId: '',
			wid: '',
			resetToken:'',
			resetTokenExpiry:0,
		})

		return Promise.resolve(token)
	}

	async loginUser(data: loginRR.Request): Promise<loginRR.Response> {
		const coachService = await usermodel
			.findOne({ email: data.email })
			.populate('staffRole')
		if (coachService === null) {
			throw new Error('Invalid email')
		}

		const passwordVerification = await PasswordHasher.verify(
			data.password,
			coachService.password
		)

		if (passwordVerification === false) {
			throw new Error('Invalid password')
		}

		const token = JwtGenerator.sign({
			_id: coachService._id,
			phone: '',
			address: '',
			image: '',
			paymentCusId: '',
			wid: '',
			resetToken:'',
			resetTokenExpiry:0,
		})

		return Promise.resolve({...token,role: coachService.staffRole.length > 0 ? coachService.staffRole[0] : null})
	}

	async CheckAuthUser(token: string) {
		if (token === undefined) {
			throw new Error('Please pass a token')
		}

		token = token.split(' ')[1]
		const jwtPayload = JwtGenerator.verify(token)

		const checkForUser = await usermodel.findOne({ _id: jwtPayload._id })
		// console.log('token',checkForUser)

		if (checkForUser === null) {
			throw new Error('No Such User Exisits')
		}

		return jwtPayload._id
	}

	async CheckAuthCoach(token: string) {
		if (token === undefined) {
			throw new Error('Please pass a token')
		}

		const coachService = new CoachService()
		token = token.split(' ')[1]
		const jwtPayload = JwtGenerator.verify(token)

		const checkForUser = await coachService.fetchById(jwtPayload._id)
		// console.log('token',checkForUser)

		if (checkForUser === null) {
			throw new Error('No Such User Exisits')
		}

		return jwtPayload._id
	}

	async resetParentPassword(id: string, newPassword: string) {
		try {
			const parent = await parentsmodel.findOne({ _id:id })

			if (!parent) {
				throw new Error('Parent not found')
			}

			// Generate a new password if newPassword parameter is not provided
			const updatedPassword = newPassword || generateNewPassword()
			const updatedPasswordHased = await PasswordHasher.hash(
				updatedPassword,
        process.env.SALT!
			)

			parent.password = updatedPasswordHased
			await parent.save()

			return true
		} catch (error: any) {
			throw new Error(error)
		}
	}
}

export namespace loginRR {
  export type Request = { email: string; password: string }
  export type Response = Promise<{ token: string; refreshToken: string, role?: any }>
}
