import BaseService from '@resolvers/BaseService'
import coach from '@models/coach.model'
import { ICoach } from '@schema/entity.types'
import { askQuestionLevel, coachTypes } from '@utils/const'
import passwordHasher from '@utils/passwordHasher'
import classModel from '@models/schedule/classes.models'
import sessionModel from '@models/schedule/session/sessions.model'

export default class CoachService
implements BaseService<CoachRR.Request, CoachRR.Response>
{
	// constructor(
	// 	private readonly studentsService?:StudentsService
	// ){}

	async create(data: CoachRR.Request): Promise<ICoach> {
		const hashPassword = await passwordHasher.hash(
			'Admin@123',
      process.env.SALT!
		)

		const result = data.coachType.every((value) => coachTypes.includes(value))
		if (!result) {
			throw new Error(`
			following options allowed,
			${coachTypes.toLocaleString()}
		`)
		}
		const askQuestionLevelResult = data.askQuestionLevel.every((value) =>
			askQuestionLevel.includes(value)
		)
		if (!askQuestionLevelResult) {
			throw new Error(`
			following options allowed,
			${askQuestionLevel.toLocaleString()}
		`)
		}
		const user = await coach.findOne({ emailAddress: data.emailAddress })

		if (user) {
			throw new Error('email with user already exists')
		}

		const newData = await coach.create({ ...data, password: hashPassword })
		newData.save()

		return newData
	}

	async fetchAll(): Promise<CoachRR.Response[]> {
		const response = await coach.find()
		return response
	}

	async fetchById(id: string): Promise<CoachRR.Response> {
		return await coach.findOne({ _id: id })
	}

	async fetchByEmail(email: string): Promise<CoachRR.Response> {
		return await coach.findOne({ emailAddress: email })
	}

	async deleteById(id: string): Promise<any> {
		return await coach.deleteOne({ _id: id })
	}

	async update(
		data: CoachRR.Request & { _id: string }
	): Promise<CoachRR.Response> {
		const updatedData: { [key: string]: any } = {}

		if (!data._id.match(/^[0-9a-fA-F]{24}$/)) {
			throw new Error('Invalid ID')
		}

		const existingUser = await coach.findOne({ _id: data._id })
		if (!existingUser) {
			throw new Error('User not found')
		}

		if (data.coachType) {
			const result = data.coachType.every((value) => coachTypes.includes(value))

			if (!result) {
				throw new Error(`
			following options allowed,
			${coachTypes.toLocaleString()}
		`)
			}
		}

		if (data?.askQuestionLevel) {
			const askQuestionLevelResult = data?.askQuestionLevel?.every((value) =>
				askQuestionLevel?.includes(value)
			)

			if (!askQuestionLevelResult) {
				throw new Error(`
				following options allowed,
				${askQuestionLevel.toLocaleString()}
			`)
			}
		}

		if (data.emailAddress) {
			const user = await coach.findOne({ emailAddress: data.emailAddress })
			if (user && !user._id) {
				throw new Error('No Coach Found')
			}
			if (user && user._id.toString() !== data._id) {
				throw new Error('Email address is already in use')
			}
		}

		Object.entries(data)?.map((entry) => {
			const key = entry[0]
			const value = entry[1]
			if (key !== '_id') {
				updatedData[key] = value
			}
		})

		return await coach.findOneAndUpdate({ _id: data._id }, updatedData)
	}

	async resetPassword(_id: string, password: string,currentPassword: string): Promise<boolean> {
		const coachData = await coach.findOne({ _id: _id })
		if (!coachData) {
			throw new Error('no coach found')
		}

		const passwordVerification = await passwordHasher.verify(
			currentPassword,
			coachData.password
		)

		if (passwordVerification === false) {
			throw new Error('Invalid password')
		}

		const hashPassword = await passwordHasher.hash(password, process.env.SALT!)
		await coach.findOneAndUpdate({ _id: _id }, { password: hashPassword })
		return true
	}

	
}

export namespace CoachRR {
  export type Request = Omit<ICoach, '_id' | 'password'>
  export type Response = ICoach | null
}
